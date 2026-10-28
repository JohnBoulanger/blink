import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination";
import StatusBadge from "../../../components/StatusBadge";
import { QUAL_STATUS } from "../../../utils/status";
import "./style.css";

interface PositionType {
  id: number;
  name: string;
  description: string;
}

interface OwnQualification {
  status: string;
  position_type: { id: number };
}

export default function RegularPositionTypes() {
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // the user's own qualification status per position type, when it loads
  const [qualStatus, setQualStatus] = useState<Record<number, string>>({});

  // qualification create state
  const [creating, setCreating] = useState<number | null>(null);
  const [createNote, setCreateNote] = useState("");
  const [createError, setCreateError] = useState<Record<number, string>>({});
  const [createSuccess, setCreateSuccess] = useState<Record<number, boolean>>({});

  const limit = 10;
  const totalPages = Math.ceil(count / limit);

  // show the spinner before the effect below fetches the new page
  function handlePageChange(next: number) {
    setLoading(true);
    setPage(next);
  }

  // fetch position types with pagination
  useEffect(() => {
    api
      .get("/position-types", { params: { page, limit } })
      .then((res) => {
        setPositionTypes(res.data.results ?? res.data);
        setCount(res.data.count ?? 0);
      })
      .catch((err) => {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load position types."
            : "Failed to load position types."
        );
      })
      .finally(() => setLoading(false));
  }, [page]);

  // statuses are extra context, so a failure leaves the request buttons as they are
  useEffect(() => {
    api
      .get("/qualifications/me", { params: { limit: 50 } })
      .then((res) => {
        const map: Record<number, string> = {};
        for (const q of res.data.results as OwnQualification[]) map[q.position_type.id] = q.status;
        setQualStatus(map);
      })
      .catch(() => undefined);
  }, []);

  // submit a new qualification request for a position type
  async function handleCreate(positionTypeId: number) {
    setCreateError((prev) => ({ ...prev, [positionTypeId]: "" }));
    try {
      await api.post("/qualifications", {
        position_type_id: positionTypeId,
        note: createNote,
      });
      setCreateSuccess((prev) => ({ ...prev, [positionTypeId]: true }));
      setCreating(null);
      setCreateNote("");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create qualification."
        : "Failed to create qualification.";
      setCreateError((prev) => ({ ...prev, [positionTypeId]: msg }));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="RegularPositionTypes page-enter">
      <div className="rpt-header">
        <h1>Positions</h1>
        <p className="rpt-subtitle">
          Request a qualification for a position. Once an admin approves it, you appear as a
          candidate for matching shifts.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {positionTypes.length === 0 ? (
        <p className="empty-state">No position types available.</p>
      ) : (
        <>
          <ul className="rpt-list">
            {positionTypes.map((pt) => {
              const own = qualStatus[pt.id];
              const status = own ? QUAL_STATUS[own] : undefined;
              return (
                <li key={pt.id} className="rpt-row">
                  <div className="rpt-row-main">
                    <div className="rpt-row-text">
                      <h2>{pt.name}</h2>
                      {pt.description && <p className="rpt-description">{pt.description}</p>}
                    </div>

                    <div className="rpt-row-side">
                      {createSuccess[pt.id] ? (
                        <span className="rpt-success">
                          <StatusBadge tone="pending">Request submitted</StatusBadge>
                          <Link to="/qualifications">View qualifications</Link>
                        </span>
                      ) : own ? (
                        <span className="rpt-own">
                          <StatusBadge tone={status?.tone ?? "pending"}>
                            {status?.label ?? own}
                          </StatusBadge>
                          <Link to="/qualifications" className="rpt-manage">
                            Manage
                          </Link>
                        </span>
                      ) : (
                        creating !== pt.id && (
                          <button
                            className="btn-secondary btn-sm rpt-request"
                            onClick={() => setCreating(pt.id)}
                          >
                            Request qualification
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* inline create form when this row is selected */}
                  {creating === pt.id && (
                    <div className="rpt-create-form">
                      {createError[pt.id] && <p className="error-message">{createError[pt.id]}</p>}
                      <label className="rpt-note-label" htmlFor={`rpt-note-${pt.id}`}>
                        Note for the reviewer (optional)
                      </label>
                      <textarea
                        id={`rpt-note-${pt.id}`}
                        className="rpt-note-input"
                        placeholder="Optional note for the reviewer..."
                        value={createNote}
                        onChange={(e) => setCreateNote(e.target.value)}
                        rows={2}
                      />
                      <div className="rpt-create-actions">
                        <button className="btn-primary btn-sm" onClick={() => handleCreate(pt.id)}>
                          Submit request
                        </button>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            setCreating(null);
                            setCreateNote("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
