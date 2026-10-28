import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import JobTabs from "../../../components/JobTabs";
import StatusBadge from "../../../components/StatusBadge";
import "./style.css";

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  invited: boolean;
}

export default function BusinessCandidates() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // per-candidate invite loading/error
  const [inviteLoading, setInviteLoading] = useState<number | null>(null);
  const [inviteError, setInviteError] = useState<Record<number, string>>({});
  const limit = 10;

  useEffect(() => {
    async function fetchCandidates() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/jobs/${jobId}/candidates`, {
          params: { page, limit },
        });
        setCandidates(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load candidates."
            : "Failed to load candidates."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, [jobId, page]);

  // toggle invite or withdraw directly from the list
  async function handleInvite(userId: number, currentlyInvited: boolean) {
    setInviteLoading(userId);
    setInviteError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.patch(`/jobs/${jobId}/candidates/${userId}/interested`, {
        interested: !currentlyInvited,
      });
      setCandidates((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, invited: !currentlyInvited } : c))
      );
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Action failed."
        : "Action failed.";
      setInviteError((prev) => ({ ...prev, [userId]: msg }));
    } finally {
      setInviteLoading(null);
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
  } else if (candidates.length === 0) {
    body = (
      <div className="empty-state">
        <p className="empty-state-title">No candidates right now</p>
        <p>
          Candidates appear here when they hold an approved qualification for this position and have
          marked themselves available.
        </p>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="row-list">
          {candidates.map((c) => (
            <li key={c.id} className="cand-row">
              <span className="initials" aria-hidden="true">
                {c.first_name.charAt(0)}
                {c.last_name.charAt(0)}
              </span>
              <Link to={`/business/jobs/${jobId}/candidates/${c.id}`} className="row-title-link">
                {c.first_name} {c.last_name}
              </Link>
              <span className="cand-status">
                {c.invited && <StatusBadge tone="success">Invited</StatusBadge>}
              </span>
              <span className="cand-actions">
                <Link
                  to={`/business/jobs/${jobId}/candidates/${c.id}`}
                  className="btn-ghost btn-sm cand-profile-link"
                >
                  View profile
                </Link>
                <button
                  type="button"
                  className={c.invited ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                  onClick={() => handleInvite(c.id, c.invited)}
                  disabled={inviteLoading === c.id}
                  aria-label={`${c.invited ? "Withdraw invitation for" : "Invite"} ${c.first_name} ${c.last_name}`}
                >
                  {inviteLoading === c.id ? "Saving…" : c.invited ? "Withdraw" : "Invite"}
                </button>
              </span>
              {inviteError[c.id] && (
                <p className="cand-error" role="alert">
                  {inviteError[c.id]}
                </p>
              )}
            </li>
          ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div className="BusinessCandidates page-enter">
      <BackLink to="/business/jobs">Your jobs</BackLink>
      <header className="page-header">
        <div className="page-header-text">
          <h1>Candidates</h1>
          <p className="page-subtitle" aria-live="polite">
            Job #{jobId}
            {!loading &&
              !error &&
              ` · ${count} available professional${count !== 1 ? "s" : ""} you can invite`}
          </p>
        </div>
      </header>

      <JobTabs jobId={jobId ?? ""} />

      {body}
    </div>
  );
}
