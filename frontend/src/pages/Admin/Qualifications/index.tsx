import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import StatusBadge from "../../../components/StatusBadge";
import SearchPill from "../../../components/SearchPill";
import ErrorBanner from "../../../components/ErrorBanner";
import { QUAL_STATUS, getStatus } from "../../../utils/status";
import "./style.css";

interface QualSummary {
  id: number;
  status: string;
  user: { id: number; first_name: string; last_name: string };
  position_type: { id: number; name: string };
  updatedAt: string;
}

interface QualDetail {
  id: number;
  status: string;
  note: string | null;
  document: string | null;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    biography: string | null;
  };
  position_type: { id: number; name: string; description: string };
  updatedAt: string;
}

// status filter chips, in review order
const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "submitted", label: "In review" },
  { value: "revised", label: "Resubmitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "created", label: "Not submitted" },
];

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// statuses the admin can transition to from a given current status
function adminActions(status: string): string[] {
  if (status === "submitted" || status === "revised") return ["approved", "rejected"];
  return [];
}

export default function AdminQualifications() {
  const [quals, setQuals] = useState<QualSummary[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // expanded detail panel
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<QualDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [actionPending, setActionPending] = useState(false);

  const limit = 10;
  const debouncedKeyword = useDebounce(keyword, 300);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // track previous filter values to detect changes and reset page atomically
  const prevFiltersRef = useRef({ debouncedKeyword, statusFilter });

  // fetch qualifications — resets to page 1 when filters change to avoid stale-page fetches
  useEffect(() => {
    let activePage = page;
    const prev = prevFiltersRef.current;
    if (prev.debouncedKeyword !== debouncedKeyword || prev.statusFilter !== statusFilter) {
      prevFiltersRef.current = { debouncedKeyword, statusFilter };
      activePage = 1;
      setPage(1);
    }

    async function fetchQuals() {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, unknown> = { page: activePage, limit };
        if (debouncedKeyword) params.keyword = debouncedKeyword;
        // pass status to backend for accurate server-side filtering and pagination
        if (statusFilter) params.status = statusFilter;
        const res = await api.get("/qualifications", { params });
        setQuals(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load qualifications."
            : "Failed to load qualifications."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchQuals();
  }, [page, debouncedKeyword, statusFilter]);

  // toggle expand row — fetch detail if newly opening
  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setActionNote("");
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setDetailError("");
    setActionNote("");
    setDetailLoading(true);
    try {
      const res = await api.get(`/qualifications/${id}`);
      setDetail(res.data);
    } catch (err) {
      setDetailError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to load qualification details."
          : "Failed to load qualification details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  // approve or reject a qualification
  async function handleAction(qualId: number, newStatus: "approved" | "rejected") {
    setActionPending(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (actionNote.trim()) body.note = actionNote.trim();
      const res = await api.patch(`/qualifications/${qualId}`, body);

      // update summary list in place
      setQuals((prev) =>
        prev.map((q) => (q.id === qualId ? { ...q, status: res.data.status } : q))
      );
      // update expanded detail
      setDetail((prev) =>
        prev ? { ...prev, status: res.data.status, note: res.data.note } : prev
      );
      setActionNote("");
    } catch (err) {
      setDetailError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Action failed." : "Action failed."
      );
    } finally {
      setActionPending(false);
    }
  }

  const totalPages = Math.ceil(count / limit);

  // the review panel under an expanded row
  function renderDetail() {
    if (detailLoading) return <LoadingSpinner />;
    if (!detail) {
      return detailError ? (
        <p className="error-message" role="alert">
          {detailError}
        </p>
      ) : null;
    }
    const status = getStatus(QUAL_STATUS, detail.status);
    const canReview = adminActions(detail.status).length > 0;
    return (
      <div className="aq-review">
        <div className="aq-review-info">
          <div className="aq-doc">
            <span className="aq-doc-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 3v5h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="aq-doc-text">
              <span className="aq-doc-title">Credential document</span>
              {detail.document ? (
                <a
                  href={`${backendUrl}${detail.document}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aq-doc-link"
                >
                  Open document (PDF)
                </a>
              ) : (
                <span className="aq-doc-empty">No document uploaded</span>
              )}
            </span>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Professional</dt>
              <dd>
                {detail.user.first_name} {detail.user.last_name}
                <span className="aq-sub">{detail.user.email}</span>
              </dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>
                {detail.position_type.name}
                <span className="aq-sub">{detail.position_type.description}</span>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
              </dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd className="tabular">{dateTimeFormat.format(new Date(detail.updatedAt))}</dd>
            </div>
            {detail.note && (
              <div>
                <dt>Note</dt>
                <dd>{detail.note}</dd>
              </div>
            )}
            {detail.user.biography && (
              <div>
                <dt>Biography</dt>
                <dd className="aq-bio">{detail.user.biography}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* approve/reject actions */}
        {canReview ? (
          <div className="aq-decision">
            {detailError && (
              <p className="error-message" role="alert">
                {detailError}
              </p>
            )}
            <div className="form-field">
              <label htmlFor={`aq-note-${detail.id}`}>
                Note to the professional <span className="aq-optional">(optional)</span>
              </label>
              <textarea
                id={`aq-note-${detail.id}`}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="aq-decision-btns">
              <button
                type="button"
                className="btn-secondary"
                disabled={actionPending}
                onClick={() => handleAction(detail.id, "rejected")}
              >
                Reject
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={actionPending}
                onClick={() => handleAction(detail.id, "approved")}
              >
                {actionPending && <span className="btn-spinner" aria-hidden="true" />}
                Approve
              </button>
            </div>
          </div>
        ) : (
          <p className="aq-decided">
            {detail.status === "created"
              ? "The professional has not submitted this request yet."
              : "This request has been reviewed. A new review opens when the professional resubmits."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="AdminQualifications page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Credential review</h1>
          <p className="page-subtitle" aria-live="polite">
            {loading
              ? "Loading requests…"
              : `${count} qualification request${count !== 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

      <div className="aq-controls">
        <SearchPill
          value={keyword}
          onChange={setKeyword}
          label="Search qualifications"
          placeholder="Search by name or email"
        />
        <div className="aq-status-filters" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              className="chip"
              aria-pressed={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {loading ? (
        <LoadingSpinner />
      ) : quals.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No requests match these filters</p>
          <p>When a professional submits a credential, it appears here for review.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table-stack aq-table">
              <thead>
                <tr>
                  <th scope="col">Professional</th>
                  <th scope="col">Position</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col">
                    <span className="visually-hidden">Review</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {quals.map((q) => {
                  const open = expandedId === q.id;
                  const status = getStatus(QUAL_STATUS, q.status);
                  const panelId = `aq-panel-${q.id}`;
                  return (
                    <Fragment key={q.id}>
                      <tr className={open ? "aq-row-open" : undefined}>
                        <td className="cell-primary">
                          {q.user.first_name} {q.user.last_name}
                        </td>
                        <td data-label="Position">{q.position_type.name}</td>
                        <td data-label="Status">
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td className="cell-secondary" data-label="Updated">
                          {dateFormat.format(new Date(q.updatedAt))}
                        </td>
                        <td className="cell-actions">
                          <button
                            type="button"
                            className="btn-secondary btn-sm aq-toggle"
                            onClick={() => toggleExpand(q.id)}
                            aria-expanded={open}
                            aria-controls={open ? panelId : undefined}
                            aria-label={`${open ? "Close" : adminActions(q.status).length ? "Review" : "View"} ${q.user.first_name} ${q.user.last_name}, ${q.position_type.name}`}
                          >
                            {open ? "Close" : adminActions(q.status).length ? "Review" : "View"}
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className="aq-detail-row">
                          <td colSpan={5} id={panelId}>
                            {renderDetail()}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
