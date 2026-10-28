import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import StatusBadge from "../../../components/StatusBadge";
import { formatLongDay, formatTimeRange } from "../../../utils/format";
import "./style.css";

interface CandidateDetail {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
    resume: string | null;
    biography: string | null;
    // only present when the user is the filled worker
    email?: string;
    phone_number?: string;
    qualification: {
      id: number;
      position_type_id: number;
      document: string | null;
      note: string | null;
      updatedAt: string;
    };
  };
  job: {
    id: number;
    status: string;
    position_type: { id: number; name: string; description: string };
    start_time: string;
    end_time: string;
  };
}

// a read-only document line: file icon, title and a link when the file exists
function DocumentRow({
  title,
  href,
  label,
  empty,
}: {
  title: string;
  href: string | null;
  label: string;
  empty: string;
}) {
  return (
    <div className="bcd-doc">
      <span className="bcd-doc-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="bcd-doc-text">
        <span className="bcd-doc-title">{title}</span>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="bcd-doc-link">
            {label}
          </a>
        ) : (
          <span className="bcd-doc-empty">{empty}</span>
        )}
      </span>
    </div>
  );
}

export default function BusinessCandidateDetail() {
  const { jobId, userId } = useParams();
  const [data, setData] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // whether the business has already invited this candidate
  const [invited, setInvited] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    async function load() {
      try {
        // fetch candidate detail; separately fetch candidates list to get invited flag
        // the candidates list may fail (e.g. job not open) — that's fine, invited defaults false
        const detailRes = await api.get(`/jobs/${jobId}/candidates/${userId}`);
        setData(detailRes.data);

        // best-effort: resolve invited state from list endpoint (not in detail response)
        api
          .get(`/jobs/${jobId}/candidates`, { params: { limit: 200 } })
          .then((candidatesRes) => {
            const match = (candidatesRes.data.results ?? []).find(
              (c: { id: number; invited: boolean }) => c.id === Number(userId)
            );
            if (match) setInvited(match.invited);
          })
          .catch(() => {
            // silently ignore — invited state stays false
          });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Candidate not found.");
        } else if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError(
            err.response?.data?.error ||
              "You don't have permission to view this candidate. The job may no longer be open or you may not own this job."
          );
        } else {
          setError("Failed to load candidate.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId, userId]);

  async function handleInvite(value: boolean) {
    setInviteLoading(true);
    setInviteError("");
    try {
      await api.patch(`/jobs/${jobId}/candidates/${userId}/interested`, { interested: value });
      setInvited(value);
    } catch (err) {
      setInviteError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Action failed." : "Action failed."
      );
    } finally {
      setInviteLoading(false);
    }
  }

  const backTo = `/business/jobs/${jobId}/candidates`;

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="BusinessCandidateDetail page-enter">
        <BackLink to={backTo}>Candidates</BackLink>
        <p className="error-message" role="alert">
          {error}
        </p>
      </div>
    );
  }
  if (!data) return null;

  const { user, job } = data;
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="BusinessCandidateDetail page-enter">
      <BackLink to={backTo}>Candidates</BackLink>

      <div className="bcd-layout">
        <div className="bcd-main">
          {/* candidate header */}
          <header className="bcd-header">
            {user.avatar ? (
              <img src={`${backendUrl}${user.avatar}`} alt="" className="bcd-avatar" />
            ) : (
              <span className="bcd-avatar bcd-avatar-initials" aria-hidden="true">
                {initials}
              </span>
            )}
            <div className="bcd-identity">
              <h1>{fullName}</h1>
              <StatusBadge tone="success">Approved for {job.position_type.name}</StatusBadge>
            </div>
          </header>

          {/* contact info only exposed when this person filled the job */}
          {(user.email || user.phone_number) && (
            <section className="bcd-section" aria-labelledby="bcd-contact-title">
              <h2 id="bcd-contact-title">Contact</h2>
              <dl className="detail-list">
                {user.email && (
                  <div>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                  </div>
                )}
                {user.phone_number && (
                  <div>
                    <dt>Phone</dt>
                    <dd className="tabular">{user.phone_number}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section className="bcd-section" aria-labelledby="bcd-about-title">
            <h2 id="bcd-about-title">About</h2>
            {user.biography ? (
              <p className="bcd-bio">{user.biography}</p>
            ) : (
              <p className="bcd-muted">No biography added.</p>
            )}
          </section>

          <section className="bcd-section" aria-labelledby="bcd-docs-title">
            <h2 id="bcd-docs-title">Documents</h2>
            <div className="bcd-docs">
              <DocumentRow
                title="Resume"
                href={user.resume ? `${backendUrl}${user.resume}` : null}
                label="View resume (PDF)"
                empty="No resume uploaded"
              />
              <DocumentRow
                title={`Qualification: ${job.position_type.name}`}
                href={
                  user.qualification.document ? `${backendUrl}${user.qualification.document}` : null
                }
                label="View qualification document"
                empty="No document uploaded"
              />
            </div>
            {user.qualification.note && (
              <p className="bcd-qual-note">
                <span className="bcd-note-label">Note from the candidate: </span>
                {user.qualification.note}
              </p>
            )}
          </section>
        </div>

        {/* job summary and invite action */}
        <aside className="bcd-card" aria-label="Shift and invitation">
          <div className="bcd-card-job">
            <p className="bcd-card-role">{job.position_type.name}</p>
            <p className="bcd-card-when tabular">
              {formatLongDay(job.start_time)}
              <br />
              {formatTimeRange(job.start_time, job.end_time)}
            </p>
          </div>

          {job.status === "open" ? (
            <div className="bcd-invite">
              {inviteError && (
                <p className="bcd-error" role="alert">
                  {inviteError}
                </p>
              )}
              {invited ? (
                <>
                  <StatusBadge tone="success">Invitation sent</StatusBadge>
                  <button
                    type="button"
                    className="btn-secondary bcd-invite-btn"
                    onClick={() => handleInvite(false)}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? "Withdrawing…" : "Withdraw invite"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-primary bcd-invite-btn"
                    onClick={() => handleInvite(true)}
                    disabled={inviteLoading}
                  >
                    {inviteLoading && <span className="btn-spinner" aria-hidden="true" />}
                    {inviteLoading ? "Sending…" : "Send invitation"}
                  </button>
                  <p className="bcd-hint">
                    If {user.first_name} is also interested, either side can open a 15-minute
                    negotiation.
                  </p>
                </>
              )}
            </div>
          ) : (
            <p className="bcd-hint">Invitations close once the job is no longer open.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
