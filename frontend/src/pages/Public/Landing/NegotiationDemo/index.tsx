import { useEffect, useState } from "react";
import CountdownTimer from "../../../../components/CountdownTimer";
import StatusBadge from "../../../../components/StatusBadge";
import Logo from "../../../../components/Logo";
import usePrefersReducedMotion from "../../../../hooks/usePrefersReducedMotion";
import "./style.css";

type Phase = "live" | "accepted" | "declined";

const WINDOW_SECONDS = 15 * 60;
// the demo opens part way through the window
const START_SECONDS = 10 * 60 + 42;

const MESSAGES = [
  {
    mine: false,
    time: "10:02",
    text: "Hi Alice. The shift is Saturday, 9 to 5, mostly pre-testing and frame fittings. Does $30/hr work for you?",
  },
  {
    mine: true,
    time: "10:03",
    text: "Yes, that works. I have two years of pre-test experience and I am comfortable on the OCT.",
  },
  {
    mine: false,
    time: "10:04",
    text: "Great. We accepted on our side. Street parking is on St George.",
  },
  { mine: true, time: "10:04", text: "Thanks. Reading the shift details now." },
];

// self-contained replica of the negotiation room, seeded with demo data
export default function NegotiationDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [phase, setPhase] = useState<Phase>("live");
  const [blinkKey, setBlinkKey] = useState(0);
  const live = phase === "live";

  useEffect(() => {
    if (reducedMotion || !live) return;
    const timer = setInterval(() => {
      setSeconds((s) => (s <= 1 ? WINDOW_SECONDS : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [reducedMotion, live]);

  function accept() {
    setPhase("accepted");
    setBlinkKey((k) => k + 1);
  }

  function replay() {
    setPhase("live");
    setSeconds(START_SECONDS);
  }

  return (
    <div className="NegotiationDemo">
      <section className="negdemo-chat" aria-label="Demo chat">
        <header className="negdemo-chat-head">
          <span className="negdemo-avatar" aria-hidden="true">
            B
          </span>
          <span className="negdemo-chat-who">
            <strong>Bahen Vision Clinic</strong>
            <span>Optometric Assistant (Level 1)</span>
          </span>
        </header>
        <ol className="negdemo-messages" aria-label="Messages">
          {MESSAGES.map((msg, i) => (
            <li key={i} className={`negdemo-msg ${msg.mine ? "mine" : "theirs"}`}>
              <span className="visually-hidden">
                {msg.mine ? "Alice Lin" : "Bahen Vision Clinic"}:
              </span>
              <p>{msg.text}</p>
              <time className="tabular">{msg.time}</time>
            </li>
          ))}
        </ol>
        <p className="negdemo-composer">Messages are read-only in this demo.</p>
      </section>

      <section className="negdemo-deal" aria-label="Shift terms and decision">
        <div className="negdemo-deal-head">
          <div>
            <p className="negdemo-rate tabular">
              <strong>$25–35</strong> /hr
            </p>
            <p className="negdemo-when tabular">Sat · 9:00 AM–5:00 PM</p>
          </div>
          {live && <StatusBadge tone="live">Live</StatusBadge>}
          {phase === "accepted" && <StatusBadge tone="success">Confirmed</StatusBadge>}
          {phase === "declined" && <StatusBadge tone="ended">Ended</StatusBadge>}
        </div>

        <div className="negdemo-timer">
          {live ? (
            <CountdownTimer
              seconds={reducedMotion ? START_SECONDS : seconds}
              label="Time remaining"
              size="lg"
            />
          ) : (
            <CountdownTimer
              seconds={phase === "accepted" ? seconds : 0}
              label={phase === "accepted" ? "Clock stopped" : "Time remaining"}
              size="lg"
              stopped
            />
          )}
        </div>

        <dl className="negdemo-parties">
          <div className="negdemo-party">
            <dt>Bahen Vision Clinic</dt>
            <dd>
              <StatusBadge tone="success">Accepted</StatusBadge>
            </dd>
          </div>
          <div className="negdemo-party">
            <dt>
              Alice Lin <span className="negdemo-you">(you)</span>
            </dt>
            <dd>
              {phase === "accepted" ? (
                <StatusBadge tone="success">Accepted</StatusBadge>
              ) : phase === "declined" ? (
                <StatusBadge tone="ended">Declined</StatusBadge>
              ) : (
                <StatusBadge tone="pending">Deciding</StatusBadge>
              )}
            </dd>
          </div>
        </dl>

        {live ? (
          <div className="negdemo-actions">
            <button type="button" className="btn-secondary" onClick={() => setPhase("declined")}>
              Decline
            </button>
            <button type="button" className="btn-primary" onClick={accept}>
              Accept shift
            </button>
          </div>
        ) : (
          <div className="negdemo-result" role="status">
            {phase === "accepted" ? (
              <div className="negdemo-confirmed">
                <Logo blink="once" blinkKey={blinkKey} size={36} wordmark={false} />
                <div>
                  <p className="negdemo-result-title">Shift confirmed</p>
                  <p>Both sides accepted. The shift is filled.</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="negdemo-result-title">Negotiation ended</p>
                <p>You declined. The shift goes back to the open list.</p>
              </div>
            )}
            <button type="button" className="btn-ghost negdemo-replay" onClick={replay}>
              Replay the demo
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
