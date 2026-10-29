import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import { formatDay, formatRate } from "../../../utils/format";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import StatusBadge from "../../../components/StatusBadge";
import NegotiationBanner from "../../../components/NegotiationBanner";
import Illustration, { type IllustrationName } from "../../../components/Illustration";
import { JOB_STATUS, getStatus } from "../../../utils/status";
import "./style.css";

// shared job row shape
interface JobEntry {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  business: { id: number; business_name: string };
  salary_min: number;
  salary_max: number;
  start_time: string;
}

interface Interest {
  interest_id: number;
  mutual: boolean;
  job: JobEntry;
}

type Tab = "interests" | "invitations" | "confirmed";

// job status shown as a dot and a label
function JobStatus({ status }: { status: string }) {
  const s = getStatus(JOB_STATUS, status);
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}

// role, clinic, date and rate: the left part of every row
function JobSummary({ job }: { job: JobEntry }) {
  return (
    <>
      <div className="myjob-main">
        <Link to={`/jobs/${job.id}`} className="myjob-title">
          {job.position_type.name}
        </Link>
        <span className="myjob-meta">
          {job.business.business_name}
          <span aria-hidden="true"> · </span>
          <span className="tabular">{formatDay(job.start_time)}</span>
        </span>
      </div>
      <span className="myjob-rate tabular">
        {formatRate(job.salary_min, job.salary_max)}
        <span className="myjob-rate-unit"> /hr</span>
      </span>
    </>
  );
}

function EmptyState({
  illustration,
  title,
  text,
  to,
  action,
}: {
  illustration: IllustrationName;
  title: string;
  text: string;
  to: string;
  action: string;
}) {
  return (
    <div className="myjobs-empty">
      <Illustration name={illustration} size={104} className="empty-illustration" />
      <p className="myjobs-empty-title">{title}</p>
      <p>{text}</p>
      <Link to={to} className="btn-secondary">
        {action}
      </Link>
    </div>
  );
}

export default function MyJobs() {
  const navigate = useNavigate();
  const { hasActiveNeg, setHasActiveNeg } = useNegotiation();
  const [tab, setTab] = useState<Tab>("interests");

  // interests state
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsCount, setInterestsCount] = useState(0);
  const [interestsPage, setInterestsPage] = useState(1);

  // invitations state
  const [invitations, setInvitations] = useState<JobEntry[]>([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [invitationsPage, setInvitationsPage] = useState(1);

  // confirmed/past work state — interests where job is filled/completed/cancelled
  const [confirmed, setConfirmed] = useState<Interest[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [confirmedPage, setConfirmedPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [negotiationLoading, setNegotiationLoading] = useState<number | null>(null);
  const limit = 10;

  // fetch whichever tab is active; reset error between tab switches
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (tab === "interests") {
          const res = await api.get("/users/me/interests", {
            params: { page: interestsPage, limit },
          });
          // active interests: jobs still open
          const active = res.data.results.filter((i: Interest) => i.job.status === "open");
          setInterests(active);
          setInterestsCount(active.length);
        } else if (tab === "confirmed") {
          const res = await api.get("/users/me/interests", {
            params: { page: confirmedPage, limit },
          });
          // confirmed/past: filled, completed, or cancelled jobs
          const past = res.data.results.filter((i: Interest) =>
            ["filled", "completed", "cancelled"].includes(i.job.status)
          );
          setConfirmed(past);
          setConfirmedCount(past.length);
        } else {
          const res = await api.get("/users/me/invitations", {
            params: { page: invitationsPage, limit },
          });
          setInvitations(res.data.results);
          setInvitationsCount(res.data.count);
        }
      } catch {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab, interestsPage, invitationsPage, confirmedPage]);

  // start negotiation from a mutual interest
  async function handleStartNegotiation(interestId: number) {
    setNegotiationLoading(interestId);
    try {
      await api.post("/negotiations", { interest_id: interestId });
      setHasActiveNeg(true);
      navigate("/negotiations/me");
    } catch (err) {
      // 409 = negotiation already exists, just navigate there
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setHasActiveNeg(true);
        navigate("/negotiations/me");
      }
    } finally {
      setNegotiationLoading(null);
    }
  }

  const interestsTotalPages = Math.ceil(interestsCount / limit);
  const invitationsTotalPages = Math.ceil(invitationsCount / limit);
  const confirmedTotalPages = Math.ceil(confirmedCount / limit);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "interests", label: "My interests", count: interestsCount },
    { id: "invitations", label: "Invitations", count: invitationsCount },
    { id: "confirmed", label: "Work history", count: confirmedCount },
  ];

  let body: React.ReactNode;
  if (loading) {
    body = <LoadingSpinner />;
  } else if (error) {
    body = <p className="error-message">{error}</p>;
  } else if (tab === "interests") {
    body = (
      <>
        {interests.length === 0 ? (
          <EmptyState
            illustration="glasses"
            title="No interests yet"
            text="Open a shift and press I'm interested. It shows up here while the clinic decides."
            to="/jobs"
            action="Find shifts"
          />
        ) : (
          <ul className="myjobs-list">
            {interests.map((item) => (
              <li key={item.interest_id} className="myjob-row">
                <JobSummary job={item.job} />
                <span className="myjob-status">
                  {item.mutual && item.job.status === "open" && (
                    <StatusBadge tone="success">Both interested</StatusBadge>
                  )}
                  {/* job filled after successful negotiation */}
                  {item.mutual && item.job.status === "filled" && (
                    <StatusBadge tone="success">Job confirmed</StatusBadge>
                  )}
                  {!item.mutual && item.job.status === "open" && (
                    <StatusBadge tone="pending">Waiting for the clinic</StatusBadge>
                  )}
                </span>
                <span className="myjob-action">
                  {/* mutual interest with open job — show negotiation button or in-progress label */}
                  {item.mutual &&
                    item.job.status === "open" &&
                    (hasActiveNeg ? (
                      <Link to="/negotiations/me" className="btn-secondary btn-sm">
                        Negotiation in progress
                      </Link>
                    ) : (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleStartNegotiation(item.interest_id)}
                        disabled={negotiationLoading === item.interest_id}
                      >
                        {negotiationLoading === item.interest_id
                          ? "Starting…"
                          : "Start negotiation"}
                      </button>
                    ))}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          page={interestsPage}
          totalPages={interestsTotalPages}
          onPageChange={setInterestsPage}
        />
      </>
    );
  } else if (tab === "invitations") {
    body = (
      <>
        {invitations.length === 0 ? (
          <EmptyState
            illustration="glasses"
            title="No invitations yet"
            text="Clinics can invite you when you are available and hold an approved qualification."
            to="/profile"
            action="Check your profile"
          />
        ) : (
          <ul className="myjobs-list">
            {invitations.map((job) => (
              <li key={job.id} className="myjob-row">
                <JobSummary job={job} />
                <span className="myjob-status">
                  <JobStatus status={job.status} />
                </span>
                <span className="myjob-action">
                  {/* invitation: user hasn't responded yet — express interest on job detail */}
                  <Link to={`/jobs/${job.id}`} className="btn-secondary btn-sm">
                    View and respond
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          page={invitationsPage}
          totalPages={invitationsTotalPages}
          onPageChange={setInvitationsPage}
        />
      </>
    );
  } else {
    body = (
      <>
        {confirmed.length === 0 ? (
          <EmptyState
            illustration="calendar"
            title="No work history yet"
            text="Shifts you confirm in a negotiation appear here."
            to="/jobs"
            action="Find shifts"
          />
        ) : (
          <ul className="myjobs-list">
            {confirmed.map((item) => (
              <li key={item.interest_id} className="myjob-row">
                <JobSummary job={item.job} />
                <span className="myjob-status">
                  <JobStatus status={item.job.status} />
                </span>
                <span className="myjob-action" />
              </li>
            ))}
          </ul>
        )}
        <Pagination
          page={confirmedPage}
          totalPages={confirmedTotalPages}
          onPageChange={setConfirmedPage}
        />
      </>
    );
  }

  return (
    <div className="MyJobs page-enter">
      <h1>My shifts</h1>

      {/* active negotiation banner */}
      {hasActiveNeg && (
        <NegotiationBanner
          to="/negotiations/me"
          text="You have a 15-minute window open with a clinic."
        />
      )}

      {/* tab switcher */}
      <div className="myjobs-tabs" role="tablist" aria-label="My shifts">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && <span className="tab-count tabular">{t.count}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={tabs.find((t) => t.id === tab)?.label}>
        {body}
      </div>
    </div>
  );
}
