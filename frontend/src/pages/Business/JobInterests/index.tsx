import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import JobTabs from "../../../components/JobTabs";
import NegotiationBanner from "../../../components/NegotiationBanner";
import StatusBadge from "../../../components/StatusBadge";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import "./style.css";

interface InterestRow {
  interest_id: number;
  mutual: boolean;
  user: { id: number; first_name: string; last_name: string };
}

export default function BusinessJobInterests() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { hasActiveNeg, setHasActiveNeg } = useNegotiation();

  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // job status — needed to block negotiation start on filled/expired/cancelled jobs
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [positionName, setPositionName] = useState("");

  // per-row negotiation start loading/error
  const [negLoading, setNegLoading] = useState<number | null>(null);
  const [negError, setNegError] = useState<Record<number, string>>({});

  const limit = 10;

  // fetch job status once so we can block negotiation start when the job isn't open
  useEffect(() => {
    api
      .get(`/jobs/${jobId}`)
      .then((res) => {
        setJobStatus(res.data.status);
        setPositionName(res.data.position_type?.name ?? "");
      })
      .catch(() => {});
  }, [jobId]);

  useEffect(() => {
    async function fetchInterests() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/jobs/${jobId}/interests`, {
          params: { page, limit },
        });
        setInterests(res.data.results);
        setCount(res.data.count);
      } catch {
        setError("Failed to load interests.");
      } finally {
        setLoading(false);
      }
    }
    fetchInterests();
  }, [jobId, page]);

  // start a negotiation from a mutual interest
  async function handleStartNeg(interestId: number) {
    setNegLoading(interestId);
    setNegError((prev) => ({ ...prev, [interestId]: "" }));
    try {
      await api.post("/negotiations", { interest_id: interestId });
      setHasActiveNeg(true);
      navigate("/business/negotiations/me");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          // already exists — navigate there
          setHasActiveNeg(true);
          navigate("/business/negotiations/me");
        } else {
          const msg = err.response?.data?.error || "Failed to start negotiation.";
          setNegError((prev) => ({ ...prev, [interestId]: msg }));
        }
      } else {
        setNegError((prev) => ({ ...prev, [interestId]: "Failed to start negotiation." }));
      }
    } finally {
      setNegLoading(null);
    }
  }

  const totalPages = Math.ceil(count / limit);

  let body: React.ReactNode;
  if (loading) {
    body = <LoadingSpinner />;
  } else if (error) {
    body = (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  } else if (interests.length === 0) {
    body = (
      <div className="empty-state">
        <p className="empty-state-title">No one is interested yet</p>
        <p>Invite available professionals from the candidates list to get things moving.</p>
        <Link to={`/business/jobs/${jobId}/candidates`} className="btn-secondary">
          See candidates
        </Link>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="row-list">
          {interests.map((row) => {
            const name = `${row.user.first_name} ${row.user.last_name}`;
            return (
              <li key={row.interest_id} className="bji-row">
                <span className="initials" aria-hidden="true">
                  {row.user.first_name.charAt(0)}
                  {row.user.last_name.charAt(0)}
                </span>
                <Link
                  to={`/business/jobs/${jobId}/candidates/${row.user.id}`}
                  className="row-title-link"
                >
                  {name}
                </Link>
                <span className="bji-status">
                  {/* mutual = both parties interested, so a negotiation can start */}
                  {row.mutual && jobStatus === "filled" ? (
                    <StatusBadge tone="success">Job filled</StatusBadge>
                  ) : row.mutual ? (
                    <StatusBadge tone="success">Both interested</StatusBadge>
                  ) : (
                    <StatusBadge tone="pending">Waiting for your invite</StatusBadge>
                  )}
                </span>
                <span className="bji-actions">
                  <Link
                    to={`/business/jobs/${jobId}/candidates/${row.user.id}`}
                    className="btn-ghost btn-sm bji-profile-link"
                  >
                    View profile
                  </Link>
                  {/* only allow starting a negotiation on open jobs */}
                  {row.mutual && !hasActiveNeg && jobStatus === "open" && (
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => handleStartNeg(row.interest_id)}
                      disabled={negLoading === row.interest_id}
                      aria-label={`Start negotiation with ${name}`}
                    >
                      {negLoading === row.interest_id ? "Starting…" : "Start negotiation"}
                    </button>
                  )}
                </span>
                {negError[row.interest_id] && (
                  <p className="bji-error" role="alert">
                    {negError[row.interest_id]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div className="BusinessJobInterests page-enter">
      <BackLink to="/business/jobs">Your jobs</BackLink>
      <header className="page-header">
        <div className="page-header-text">
          <h1>Interests</h1>
          <p className="page-subtitle" aria-live="polite">
            {positionName ? `${positionName} · ` : ""}Job #{jobId}
            {!loading && !error && ` · ${count} interested`}
          </p>
        </div>
      </header>

      <JobTabs jobId={jobId ?? ""} />

      {/* active negotiation notice — block starting another */}
      {hasActiveNeg && (
        <NegotiationBanner
          to="/business/negotiations/me"
          text="Finish your live negotiation before you start a new one."
          action="View negotiation"
        />
      )}

      {body}
    </div>
  );
}
