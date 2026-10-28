import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import FileUpload from "../../../components/FileUpload";
import StatusBadge from "../../../components/StatusBadge";
import { QUAL_STATUS, getStatus } from "../../../utils/status";
import "./style.css";

interface Qualification {
  id: number;
  status: string;
  note: string;
  document: string | null;
  position_type: { id: number; name: string };
  updatedAt: string;
}

interface PositionType {
  id: number;
  name: string;
}

// status transitions a regular user can trigger
const ALLOWED_SUBMIT: Record<string, string | null> = {
  created: "submitted",
  rejected: "revised",
  approved: "revised",
  submitted: null,
  revised: null,
};

export default function Qualifications() {
  const { user } = useAuth();
  const userId = String((user as Record<string, unknown>)?.id ?? "");

  const [quals, setQuals] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const limit = 10;

  // create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newPositionId, setNewPositionId] = useState("");
  const [newNote, setNewNote] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // per-qualification action state
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});

  // inline note editing state
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteValue, setEditNoteValue] = useState("");

  // load qualifications from server
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api
      .get("/qualifications/me", { params: { page, limit } })
      .then((res) => {
        setQuals(res.data.results);
        setTotalPages(Math.ceil(res.data.count / limit));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, page]);

  // load position types for the create form
  useEffect(() => {
    api
      .get("/position-types")
      .then((res) => setPositionTypes(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  // create a new qualification
  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);
    try {
      await api.post("/qualifications", {
        position_type_id: parseInt(newPositionId),
        note: newNote,
      });
      // reload from server to get fresh list with the new entry
      const res = await api.get("/qualifications/me", { params: { page: 1, limit } });
      setQuals(res.data.results);
      setTotalPages(Math.ceil(res.data.count / limit));
      setPage(1);
      setShowCreate(false);
      setNewPositionId("");
      setNewNote("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setCreateError("You already have a qualification for this position.");
        } else {
          setCreateError(err.response?.data?.error || "Failed to create qualification.");
        }
      } else {
        setCreateError("Failed to create qualification.");
      }
    } finally {
      setCreateLoading(false);
    }
  }

  // submit or revise a qualification
  async function handleStatusChange(qualId: number, newStatus: string) {
    setActionLoading(qualId);
    setActionError((prev) => ({ ...prev, [qualId]: "" }));
    try {
      const res = await api.patch(`/qualifications/${qualId}`, { status: newStatus });
      setQuals((prev) =>
        prev.map((q) => (q.id === qualId ? { ...q, status: res.data.status } : q))
      );
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Action failed."
        : "Action failed.";
      setActionError((prev) => ({ ...prev, [qualId]: msg }));
    } finally {
      setActionLoading(null);
    }
  }

  // save edited note for a qualification
  async function handleNoteSave(qualId: number) {
    setActionLoading(qualId);
    setActionError((prev) => ({ ...prev, [qualId]: "" }));
    try {
      const res = await api.patch(`/qualifications/${qualId}`, { note: editNoteValue });
      setQuals((prev) => prev.map((q) => (q.id === qualId ? { ...q, note: res.data.note } : q)));
      setEditingNoteId(null);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to save note."
        : "Failed to save note.";
      setActionError((prev) => ({ ...prev, [qualId]: msg }));
    } finally {
      setActionLoading(null);
    }
  }

  // upload document for a qualification
  async function handleDocUpload(qualId: number, file: File) {
    setActionLoading(qualId);
    setActionError((prev) => ({ ...prev, [qualId]: "" }));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.put(`/qualifications/${qualId}/document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQuals((prev) =>
        prev.map((q) => (q.id === qualId ? { ...q, document: res.data.document } : q))
      );
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Upload failed."
        : "Upload failed.";
      setActionError((prev) => ({ ...prev, [qualId]: msg }));
    } finally {
      setActionLoading(null);
    }
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  return (
    <div className="Qualifications page-enter">
      <div className="myquals-header">
        <div className="myquals-heading">
          <h1>Qualifications</h1>
          <p className="myquals-subtitle">
            Upload a PDF for each position and submit it for review. Once an admin approves it, you
            can open and apply to that position's shifts.
          </p>
        </div>
        <button
          className={showCreate ? "btn-secondary" : "btn-primary"}
          onClick={() => setShowCreate(!showCreate)}
          aria-expanded={showCreate}
        >
          {showCreate ? "Cancel" : "Add qualification"}
        </button>
      </div>

      {/* create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="myqual-create-form">
          {createError && <p className="error-message">{createError}</p>}
          <div className="form-field">
            <label htmlFor="myqual-position">Position type</label>
            <select
              id="myqual-position"
              value={newPositionId}
              onChange={(e) => setNewPositionId(e.target.value)}
              required
            >
              <option value="">Select position type</option>
              {positionTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="myqual-note">Note for the reviewer (optional)</label>
            <textarea
              id="myqual-note"
              placeholder="Notes (optional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
          </div>
          <div className="myqual-create-actions">
            <button type="submit" className="btn-primary" disabled={createLoading}>
              {createLoading ? "Creating…" : "Create qualification"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : quals.length === 0 ? (
        <div className="myquals-empty">
          <p className="myquals-empty-title">No qualifications yet</p>
          <p>Add one for each position you want to work. An admin reviews your document.</p>
          {!showCreate && (
            <button className="btn-secondary" onClick={() => setShowCreate(true)}>
              Add qualification
            </button>
          )}
        </div>
      ) : (
        <ul className="myquals-list">
          {quals.map((q) => {
            const nextStatus = ALLOWED_SUBMIT[q.status];
            const status = getStatus(QUAL_STATUS, q.status);
            return (
              <li key={q.id} className="myqual-row">
                <div className="myqual-row-head">
                  <h2>{q.position_type.name}</h2>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </div>

                {/* inline note editing */}
                {editingNoteId === q.id ? (
                  <div className="myqual-note-edit">
                    <label className="visually-hidden" htmlFor={`myqual-note-${q.id}`}>
                      Note
                    </label>
                    <textarea
                      id={`myqual-note-${q.id}`}
                      value={editNoteValue}
                      onChange={(e) => setEditNoteValue(e.target.value)}
                      rows={2}
                      placeholder="Add a note..."
                    />
                    <div className="myqual-note-edit-btns">
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleNoteSave(q.id)}
                        disabled={actionLoading === q.id}
                      >
                        {actionLoading === q.id ? "Saving…" : "Save"}
                      </button>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => setEditingNoteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="myqual-note-row">
                    {q.note && <p className="myqual-note">{q.note}</p>}
                    <button
                      className="btn-ghost btn-sm myqual-note-button"
                      onClick={() => {
                        setEditingNoteId(q.id);
                        setEditNoteValue(q.note || "");
                      }}
                    >
                      {q.note ? "Edit note" : "Add note"}
                    </button>
                  </div>
                )}

                {actionError[q.id] && <p className="error-message">{actionError[q.id]}</p>}

                <div className="myqual-row-actions">
                  {/* document upload */}
                  <FileUpload
                    title="Document"
                    accept="application/pdf"
                    fileUrl={q.document ? `${backendUrl}${q.document}` : null}
                    fileLabel="View document (PDF)"
                    emptyLabel="No document yet"
                    replaceLabel="Replace PDF"
                    uploadLabel="Upload PDF"
                    disabled={actionLoading === q.id}
                    onSelect={(file) => handleDocUpload(q.id, file)}
                  />

                  {/* status transition */}
                  {nextStatus && (
                    <button
                      className={`${q.status === "approved" ? "btn-secondary" : "btn-primary"} myqual-submit`}
                      onClick={() => handleStatusChange(q.id, nextStatus)}
                      disabled={actionLoading === q.id}
                    >
                      {actionLoading === q.id
                        ? "Saving…"
                        : nextStatus === "submitted"
                          ? "Submit for review"
                          : "Mark as revised"}
                    </button>
                  )}
                </div>

                <span className="myqual-updated tabular">
                  Updated {new Date(q.updatedAt).toLocaleDateString()}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
