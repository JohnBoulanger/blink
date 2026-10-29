import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import JobTabs from "../../../components/JobTabs";
import NegotiationBanner from "../../../components/NegotiationBanner";
import StatusBadge from "../../../components/StatusBadge";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import {
  formatDay,
  formatDuration,
  formatLongDay,
  formatRate,
  formatTimeRange,
  toDateTimeLocal,
} from "../../../utils/format";
import { JOB_STATUS, getStatus } from "../../../utils/status";
import "./style.css";

interface JobDetail {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  salary_min: number;
  salary_max: number;
  start_time: string;
  end_time: string;
  note: string | null;
  worker: { id: number; first_name: string; last_name: string } | null;
}

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export default function BusinessJobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { hasActiveNeg } = useNegotiation();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // inline edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    salary_min: "",
    salary_max: "",
    start_time: "",
    end_time: "",
    note: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // delete / no-show state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${jobId}`)
      .then((res) => {
        setJob(res.data);
        // seed edit form from current values
        setEditForm({
          salary_min: String(res.data.salary_min),
          salary_max: String(res.data.salary_max),
          start_time: toDateTimeLocal(res.data.start_time),
          end_time: toDateTimeLocal(res.data.end_time),
          note: res.data.note ?? "",
        });
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Shift not found.");
        } else {
          setError("Failed to load shift.");
        }
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleEditSave(e: React.SyntheticEvent) {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");

    const salaryMin = parseFloat(editForm.salary_min);
    const salaryMax = parseFloat(editForm.salary_max);

    if (isNaN(salaryMin) || salaryMin < 0) {
      setEditError("Minimum salary must be a non-negative number.");
      setEditSaving(false);
      return;
    }
    if (isNaN(salaryMax) || salaryMax < salaryMin) {
      setEditError("Maximum salary must be ≥ minimum salary.");
      setEditSaving(false);
      return;
    }
    if (new Date(editForm.end_time) <= new Date(editForm.start_time)) {
      setEditError("End time must be after start time.");
      setEditSaving(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        salary_min: salaryMin,
        salary_max: salaryMax,
        start_time: new Date(editForm.start_time).toISOString(),
        end_time: new Date(editForm.end_time).toISOString(),
      };
      // only include note if non-empty
      if (editForm.note.trim()) payload.note = editForm.note.trim();

      const res = await api.patch(`/businesses/me/jobs/${jobId}`, payload);
      const updated = res.data;
      // merge updated fields back into the job
      setJob((prev) => (prev ? { ...prev, ...updated } : prev));
      // re-seed edit form so reopening edit shows current values
      setEditForm({
        salary_min: String(updated.salary_min ?? salaryMin),
        salary_max: String(updated.salary_max ?? salaryMax),
        start_time: toDateTimeLocal(updated.start_time ?? editForm.start_time),
        end_time: toDateTimeLocal(updated.end_time ?? editForm.end_time),
        note: updated.note ?? "",
      });
      setEditing(false);
    } catch (err) {
      setEditError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Save failed." : "Save failed."
      );
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    setActionError("");
    try {
      await api.delete(`/businesses/me/jobs/${jobId}`);
      navigate("/business/jobs");
    } catch (err) {
      setActionError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Delete failed." : "Delete failed."
      );
      setConfirmDelete(false);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleNoShow() {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.patch(`/jobs/${jobId}/no-show`);
      setJob((prev) => (prev ? { ...prev, status: res.data.status } : prev));
    } catch (err) {
      setActionError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Action failed." : "Action failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="BusinessJobDetail page-enter">
        <BackLink to="/business/jobs">Your shifts</BackLink>
        <p className="error-message" role="alert">
          {error}
        </p>
      </div>
    );
  }
  if (!job) return null;

  const isOpen = job.status === "open";
  // delete is only valid on open/expired jobs with no active negotiations
  const isDeletable = (job.status === "open" || job.status === "expired") && !hasActiveNeg;
  // no-show is available when job is filled and we're currently in the shift window
  const now = Date.now();
  const canNoShow =
    job.status === "filled" &&
    now >= new Date(job.start_time).getTime() &&
    now <= new Date(job.end_time).getTime();
  const status = getStatus(JOB_STATUS, job.status);
  const duration = formatDuration(job.start_time, job.end_time);
  const hasActions = (isOpen && !editing) || (isDeletable && !editing) || canNoShow;

  // edit, delete and no-show sit beside the title
  const actions = hasActions ? (
    <div className="bjd-actions">
      {isOpen && !editing && (
        <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
          Edit shift
        </button>
      )}

      {isDeletable &&
        !editing &&
        (confirmDelete ? (
          <div className="bjd-confirm" role="group" aria-label="Confirm delete">
            <span>Delete this shift?</span>
            <button type="button" className="btn-secondary" onClick={() => setConfirmDelete(false)}>
              Keep
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        ) : (
          <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        ))}

      {/* no-show: mark worker as no-show during the shift window */}
      {canNoShow && (
        <button
          type="button"
          className="btn-secondary"
          onClick={handleNoShow}
          disabled={actionLoading}
        >
          {actionLoading ? "Processing…" : "Mark no-show"}
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="BusinessJobDetail page-enter">
      <BackLink to="/business/jobs">Your shifts</BackLink>

      <header className="bjd-header">
        <div className="bjd-heading">
          <div className="bjd-title-row">
            <h1>{job.position_type.name}</h1>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </div>
          <p className="bjd-meta tabular">
            {formatLongDay(job.start_time)} · {formatTimeRange(job.start_time, job.end_time)}
          </p>
        </div>
        {actions}
      </header>

      {actionError && (
        <p className="error-message" role="alert">
          {actionError}
        </p>
      )}

      <JobTabs jobId={job.id} />

      {/* active negotiation shortcut */}
      {hasActiveNeg && (
        <NegotiationBanner
          to="/business/negotiations/me"
          text="You have a 15-minute window open with a professional."
          action="View negotiation"
        />
      )}

      <div className="bjd-main">
        {/* static details — hidden when editing */}
        {!editing && (
          <>
            <section className="bjd-section" aria-labelledby="bjd-shift-title">
              <h2 id="bjd-shift-title">Shift</h2>
              <div className="bjd-when">
                <div>
                  <span className="bjd-when-label">Start</span>
                  <span className="bjd-when-time tabular">
                    {timeFormat.format(new Date(job.start_time))}
                  </span>
                  <span className="bjd-when-day tabular">{formatDay(job.start_time)}</span>
                </div>
                <div>
                  <span className="bjd-when-label">End</span>
                  <span className="bjd-when-time tabular">
                    {timeFormat.format(new Date(job.end_time))}
                  </span>
                  <span className="bjd-when-day tabular">{formatDay(job.end_time)}</span>
                </div>
              </div>
              {duration && <p className="bjd-text tabular">{duration}</p>}
            </section>

            <section className="bjd-section" aria-labelledby="bjd-rate-title">
              <h2 id="bjd-rate-title">Rate</h2>
              <p className="bjd-rate tabular">
                <strong>{formatRate(job.salary_min, job.salary_max)}</strong> /hr
              </p>
            </section>

            {job.worker && (
              <section className="bjd-section" aria-labelledby="bjd-worker-title">
                <h2 id="bjd-worker-title">Filled by</h2>
                <p className="bjd-text bjd-worker">
                  {job.worker.first_name} {job.worker.last_name}
                </p>
              </section>
            )}

            <section className="bjd-section" aria-labelledby="bjd-note-title">
              <h2 id="bjd-note-title">Notes for professionals</h2>
              {job.note ? (
                <p className="bjd-note">{job.note}</p>
              ) : (
                <p className="bjd-text">No notes added.</p>
              )}
            </section>
          </>
        )}

        {/* inline edit form — open jobs only */}
        {editing && (
          <form onSubmit={handleEditSave} className="bjd-edit-form" aria-labelledby="bjd-edit">
            <h2 id="bjd-edit">Edit shift</h2>
            {editError && (
              <p className="error-message" role="alert">
                {editError}
              </p>
            )}

            <div className="bjd-edit-grid">
              <div className="form-field">
                <label htmlFor="bjd-salary-min">Minimum rate ($/hr)</label>
                <input
                  id="bjd-salary-min"
                  name="salary_min"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={editForm.salary_min}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="bjd-salary-max">Maximum rate ($/hr)</label>
                <input
                  id="bjd-salary-max"
                  name="salary_max"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={editForm.salary_max}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="bjd-start">Start time</label>
                <input
                  id="bjd-start"
                  name="start_time"
                  type="datetime-local"
                  value={editForm.start_time}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="bjd-end">End time</label>
                <input
                  id="bjd-end"
                  name="end_time"
                  type="datetime-local"
                  value={editForm.end_time}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-field bjd-edit-wide">
                <label htmlFor="bjd-note">Notes for professionals</label>
                <textarea
                  id="bjd-note"
                  name="note"
                  value={editForm.note}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="bjd-edit-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setEditError("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={editSaving}>
                {editSaving && <span className="btn-spinner" aria-hidden="true" />}
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
