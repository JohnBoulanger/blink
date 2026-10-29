import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import api from "../../../utils/api";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CountdownTimer from "../../../components/CountdownTimer";
import StatusBadge from "../../../components/StatusBadge";
import Logo from "../../../components/Logo";
import Illustration from "../../../components/Illustration";
import { formatRate, formatShiftWhen, formatTime } from "../../../utils/format";
import "./style.css";

// role-appropriate fallback links
const JOBS_LINK: Record<string, string> = { business: "/business/jobs", regular: "/my-jobs" };
const BROWSE_LINK: Record<string, string> = { business: "/business/jobs", regular: "/jobs" };

interface NegotiationData {
  id: number;
  status: string;
  expiresAt: string;
  job: {
    id: number;
    position_type: { name: string };
    // business may be omitted when the viewer is the business itself
    business?: { business_name: string };
    salary_min: number;
    salary_max: number;
    start_time: string;
    end_time: string;
  };
  user: { id: number; first_name: string; last_name: string };
  decisions: { candidate: string | null; business: string | null };
}

interface ChatMessage {
  negotiation_id: number;
  sender: { role: string; id: number };
  text: string;
  createdAt: string;
}

export default function Negotiation() {
  const { user, token, role } = useAuth();
  const { setHasActiveNeg } = useNegotiation();
  // safe cast — guard undefined case
  const myId = (user as Record<string, unknown> | null)?.id as number | undefined;

  const [negotiation, setNegotiation] = useState<NegotiationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  // seconds until negotiation expires
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // guards the zero-time re-fetch so it fires once per expiry
  const expiryRefetchedRef = useRef(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // fetch current negotiation
  useEffect(() => {
    async function loadNegotiation() {
      try {
        const res = await api.get<(NegotiationData & { messages?: ChatMessage[] }) | null>(
          "/negotiations/me"
        );
        // null means no active negotiation
        if (!res.data) {
          setNotFound(true);
          setHasActiveNeg(false);
          return;
        }
        setNegotiation(res.data);
        // seed chat history from persisted messages
        if (res.data.messages?.length) {
          setMessages(res.data.messages);
        }
        // clear any stale state from strict-mode double-mount
        else {
          setMessages([]);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
          setHasActiveNeg(false);
        }
      } finally {
        setLoading(false);
      }
    }
    loadNegotiation();
  }, [setHasActiveNeg]);

  // primitive fields so effects only re-run when these change, not on every decision update
  const negId = negotiation?.id;
  const negStatus = negotiation?.status;
  const negExpiresAt = negotiation?.expiresAt;

  // countdown timer — ticks every second while negotiation is active
  useEffect(() => {
    if (negStatus !== "active") {
      setSecondsLeft(null);
      return;
    }

    expiryRefetchedRef.current = false;

    function tick() {
      const msLeft = new Date(negExpiresAt!).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.floor(msLeft / 1000)));
      // re-fetch once after expiry so status updates
      if (msLeft <= 0 && !expiryRefetchedRef.current) {
        expiryRefetchedRef.current = true;
        api
          .get<NegotiationData | null>("/negotiations/me")
          .then((res) => {
            // null, or a stale active record past its expiry, means it expired
            if (
              !res.data ||
              (res.data.status === "active" && new Date(res.data.expiresAt).getTime() <= Date.now())
            ) {
              setNegotiation((prev) => (prev ? { ...prev, status: "failed" } : prev));
              setHasActiveNeg(false);
              return;
            }
            setNegotiation(res.data);
            if (res.data.status !== "active") setHasActiveNeg(false);
          })
          .catch(() => {});
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [negId, negStatus, negExpiresAt, setHasActiveNeg]);

  // connect socket when negotiation is loaded
  useEffect(() => {
    if (negId === undefined || !token) return;

    // allow polling fallback for production environments where websocket
    // upgrades may not be available immediately
    const socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // receive chat messages (deduplicate by createdAt+sender to handle strict-mode double-mount)
    socket.on("negotiation:message", (msg: ChatMessage) => {
      if (msg.negotiation_id === negId) {
        setMessages((prev) => {
          const isDupe = prev.some(
            (m) =>
              m.createdAt === msg.createdAt && m.sender.id === msg.sender.id && m.text === msg.text
          );
          return isDupe ? prev : [...prev, msg];
        });
      }
    });

    // server notifies negotiation started (update decisions/status)
    socket.on("negotiation:started", () => {
      api
        .get<NegotiationData | null>("/negotiations/me")
        .then((res) => {
          if (res.data) setNegotiation(res.data);
        })
        .catch(() => {});
    });

    // other party made a decision — update state immediately without polling
    socket.on(
      "negotiation:updated",
      (data: {
        id: number;
        status: string;
        decisions: { candidate: string | null; business: string | null };
      }) => {
        setNegotiation((prev) =>
          prev ? { ...prev, status: data.status, decisions: data.decisions } : prev
        );
        if (data.status !== "active") setHasActiveNeg(false);
      }
    );

    // socket-level errors
    socket.on("negotiation:error", (data: { message: string }) => {
      setDecisionError(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [negId, token, backendUrl, setHasActiveNeg]);

  // auto-scroll to bottom when messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  // send a chat message via socket
  function handleSend(e: React.SyntheticEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !negotiation || !socketRef.current) return;
    socketRef.current.emit("negotiation:message", {
      negotiation_id: negotiation.id,
      text,
    });
    setInput("");
  }

  // accept or decline the negotiation
  async function handleDecision(decision: "accept" | "decline") {
    if (!negotiation) return;
    setDecisionLoading(true);
    setDecisionError("");
    try {
      const res = await api.patch("/negotiations/me/decision", {
        negotiation_id: negotiation.id,
        decision,
      });
      const updated = { ...negotiation, status: res.data.status, decisions: res.data.decisions };
      setNegotiation(updated);
      // sync global active-neg state
      if (res.data.status !== "active") setHasActiveNeg(false);
    } catch (err) {
      setDecisionError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Action failed." : "Action failed."
      );
    } finally {
      setDecisionLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (notFound) {
    const jobsTo = JOBS_LINK[role ?? "regular"] ?? "/my-jobs";
    return (
      <div className="Negotiation page-enter">
        <h1>Negotiation</h1>
        <div className="neg-empty">
          <Illustration name="clock15" size={104} className="empty-illustration" />
          <p className="neg-empty-title">No active negotiation</p>
          <p>
            When you and the other side are both interested in a shift, either of you can open a
            15-minute negotiation. It appears here.
          </p>
          <Link to={jobsTo} className="btn-secondary">
            {role === "business" ? "Go to your shifts" : "Go to my shifts"}
          </Link>
        </div>
      </div>
    );
  }

  if (!negotiation) return null;

  // determine which decision slot is "mine" based on role, not id comparison
  // negotiation.user is always the candidate; business has its own slot
  const iAmCandidate = role === "regular";
  const myDecision = iAmCandidate
    ? negotiation.decisions.candidate
    : negotiation.decisions.business;

  const isActive = negotiation.status === "active";
  const isSuccess = negotiation.status === "success";
  const isFailed = negotiation.status === "failed";

  // the business name is omitted when the viewer is the business itself
  const ownBusinessName = (user as Record<string, unknown> | null)?.business_name as
    | string
    | undefined;
  const clinicName = negotiation.job.business?.business_name ?? ownBusinessName ?? "The clinic";
  const proName = `${negotiation.user.first_name} ${negotiation.user.last_name}`;
  const otherName = iAmCandidate ? clinicName : proName;
  const theirShortName = iAmCandidate ? "the clinic" : negotiation.user.first_name;

  function decisionBadge(decision: string | null) {
    if (decision === "accept") return <StatusBadge tone="success">Accepted</StatusBadge>;
    if (decision === "decline") return <StatusBadge tone="ended">Declined</StatusBadge>;
    return isActive ? (
      <StatusBadge tone="pending">Deciding</StatusBadge>
    ) : (
      <StatusBadge tone="ended">No decision</StatusBadge>
    );
  }

  const clinicDecision = negotiation.decisions.business;
  const proDecision = negotiation.decisions.candidate;
  const doneLink = iAmCandidate ? "/my-jobs" : "/business/jobs";

  return (
    <div className="Negotiation page-enter">
      <header className="neg-header">
        <h1>Negotiation</h1>
        <p className="neg-subtitle">
          {negotiation.job.position_type.name} · {clinicName}
        </p>
      </header>

      <div className="neg-room">
        {/* chat */}
        <section className="neg-chat" aria-label="Chat">
          <header className="neg-chat-head">
            <span className="neg-avatar" aria-hidden="true">
              {otherName.charAt(0).toUpperCase()}
            </span>
            <span className="neg-chat-who">
              <strong>{otherName}</strong>
              <span>{negotiation.job.position_type.name}</span>
            </span>
          </header>

          <div className="neg-messages">
            <p className="neg-system">Negotiation opened. Both sides were interested.</p>
            {messages.length === 0 && (
              <p className="neg-no-messages">No messages yet. Say hello to start.</p>
            )}
            <ol className="neg-message-list" aria-label="Messages">
              {messages.map((msg, i) => {
                const isMine = myId !== undefined && msg.sender.id === myId;
                // stable key: use timestamp + sender id + fallback index
                const key = `${msg.negotiation_id}-${msg.sender.id}-${msg.createdAt}-${i}`;
                return (
                  <li key={key} className={`neg-message ${isMine ? "mine" : "theirs"}`}>
                    <span className="visually-hidden">{isMine ? "You" : otherName}:</span>
                    <p className="msg-text">{msg.text}</p>
                    <time className="msg-time tabular" dateTime={msg.createdAt}>
                      {formatTime(msg.createdAt)}
                    </time>
                  </li>
                );
              })}
            </ol>
            <div ref={messagesEndRef} />
          </div>

          {/* message input — only when active */}
          {isActive ? (
            <form onSubmit={handleSend} className="neg-composer">
              <label htmlFor="neg-input" className="visually-hidden">
                Message
              </label>
              <input
                id="neg-input"
                type="text"
                placeholder="Write a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="neg-send"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          ) : (
            <p className="neg-composer-closed">The chat is closed.</p>
          )}
        </section>

        {/* deal card */}
        <section className="neg-deal" aria-label="Shift terms and decision">
          <div className="neg-deal-head">
            <div>
              <p className="neg-rate tabular">
                <strong>
                  {formatRate(negotiation.job.salary_min, negotiation.job.salary_max)}
                </strong>{" "}
                /hr
              </p>
              <p className="neg-when tabular">
                {formatShiftWhen(negotiation.job.start_time, negotiation.job.end_time)}
              </p>
            </div>
            {isActive && <StatusBadge tone="live">Live</StatusBadge>}
            {isSuccess && <StatusBadge tone="success">Confirmed</StatusBadge>}
            {isFailed && <StatusBadge tone="ended">Ended</StatusBadge>}
          </div>

          {/* countdown timer — shown while active */}
          {isActive && secondsLeft !== null && (
            <div className="neg-timer">
              <CountdownTimer seconds={secondsLeft} label="Time remaining" size="lg" />
            </div>
          )}

          <dl className="neg-parties">
            <div className="neg-party">
              <dt>
                {clinicName}
                {!iAmCandidate && <span className="neg-you"> (you)</span>}
              </dt>
              <dd>{decisionBadge(clinicDecision)}</dd>
            </div>
            <div className="neg-party">
              <dt>
                {proName}
                {iAmCandidate && <span className="neg-you"> (you)</span>}
              </dt>
              <dd>{decisionBadge(proDecision)}</dd>
            </div>
          </dl>

          {/* accept / decline — only shown when active and undecided */}
          {isActive && !myDecision && (
            <div className="neg-actions-wrap">
              {decisionError && (
                <p className="neg-error" role="alert">
                  {decisionError}
                </p>
              )}
              <div className="neg-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleDecision("decline")}
                  disabled={decisionLoading}
                >
                  Decline
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleDecision("accept")}
                  disabled={decisionLoading}
                >
                  {decisionLoading && <span className="btn-spinner" aria-hidden="true" />}
                  Accept shift
                </button>
              </div>
            </div>
          )}

          {isActive && myDecision && (
            <p className="neg-waiting" role="status">
              {myDecision === "accept"
                ? `You accepted. Waiting for ${theirShortName}.`
                : "You declined."}
            </p>
          )}

          {/* outcome */}
          {isSuccess && (
            <div className="neg-result" role="status">
              <div className="neg-confirmed">
                <Logo blink="once" blinkKey={1} size={40} wordmark={false} />
                <div>
                  <p className="neg-result-title">Shift confirmed</p>
                  <p>Both sides accepted. The shift is filled.</p>
                </div>
              </div>
              <Link to={doneLink} className="btn-secondary neg-result-link">
                {iAmCandidate ? "View my shifts" : "View your shifts"}
              </Link>
            </div>
          )}
          {isFailed && (
            <div className="neg-result" role="status">
              <div>
                <p className="neg-result-title">Negotiation ended</p>
                <p>No match this time. The chat and decisions are closed.</p>
              </div>
              <Link
                to={BROWSE_LINK[role ?? "regular"] ?? "/jobs"}
                className="btn-secondary neg-result-link"
              >
                {iAmCandidate ? "Browse more shifts" : "Back to your shifts"}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
