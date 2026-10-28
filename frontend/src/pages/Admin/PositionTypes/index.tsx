import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import StatusBadge from "../../../components/StatusBadge";
import SearchPill from "../../../components/SearchPill";
import ErrorBanner from "../../../components/ErrorBanner";
import "./style.css";

interface PositionType {
  id: number;
  name: string;
  description: string;
  hidden: boolean;
  num_qualified: number;
}

interface EditForm {
  name: string;
  description: string;
  hidden: boolean;
}

export default function AdminPositionTypes() {
  const [posTypes, setPosTypes] = useState<PositionType[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters + sort
  const [keyword, setKeyword] = useState("");
  const [hiddenFilter, setHiddenFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // inline edit state — keyed by id
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", hidden: false });
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState("");

  // delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  // create form
  const [showCreate, setShowCreate] = useState(false);
  // hidden defaults to false so new position types are visible to users immediately
  const [createForm, setCreateForm] = useState({ name: "", description: "", hidden: false });
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState("");

  const limit = 10;
  const debouncedKeyword = useDebounce(keyword, 300);

  // track previous filter values to detect changes and reset page atomically
  const prevFiltersRef = useRef({ debouncedKeyword, hiddenFilter, sortField, sortOrder });

  // fetch position types — resets to page 1 when filters change to avoid stale-page fetches
  useEffect(() => {
    let activePage = page;
    const prev = prevFiltersRef.current;
    if (
      prev.debouncedKeyword !== debouncedKeyword ||
      prev.hiddenFilter !== hiddenFilter ||
      prev.sortField !== sortField ||
      prev.sortOrder !== sortOrder
    ) {
      prevFiltersRef.current = { debouncedKeyword, hiddenFilter, sortField, sortOrder };
      activePage = 1;
      setPage(1);
    }

    async function fetchPosTypes() {
      setLoading(true);
      setError("");
      try {
        // api uses separate sort keys: send only the active sort field key
        // e.g. { name: "asc" } or { num_qualified: "desc" } — never both at once
        const params: Record<string, unknown> = {
          page: activePage,
          limit,
          [sortField]: sortOrder,
        };
        if (debouncedKeyword) params.keyword = debouncedKeyword;
        if (hiddenFilter !== "") params.hidden = hiddenFilter;

        const res = await api.get("/position-types", { params });
        setPosTypes(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load position types."
            : "Failed to load position types."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchPosTypes();
  }, [page, debouncedKeyword, hiddenFilter, sortField, sortOrder]);

  // open inline edit for a row
  function startEdit(pt: PositionType) {
    setEditingId(pt.id);
    setEditForm({ name: pt.name, description: pt.description, hidden: pt.hidden });
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function saveEdit(id: number) {
    if (!editForm.name.trim() || !editForm.description.trim()) {
      setEditError("Name and description are required.");
      return;
    }
    setEditPending(true);
    setEditError("");
    try {
      const res = await api.patch(`/position-types/${id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        hidden: editForm.hidden,
      });
      setPosTypes((prev) => prev.map((pt) => (pt.id === id ? { ...pt, ...res.data } : pt)));
      setEditingId(null);
    } catch (err) {
      setEditError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to save changes."
          : "Failed to save changes."
      );
    } finally {
      setEditPending(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletePending(true);
    try {
      await api.delete(`/position-types/${id}`);
      setPosTypes((prev) => prev.filter((pt) => pt.id !== id));
      setCount((c) => c - 1);
      setConfirmDeleteId(null);
    } catch (err) {
      // 409 = qualified users or jobs exist — can't delete
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error ||
          "Delete failed. This position type may have linked jobs or qualifications."
        : "Delete failed.";
      setError(msg);
      setConfirmDeleteId(null);
    } finally {
      setDeletePending(false);
    }
  }

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.description.trim()) {
      setCreateError("Name and description are required.");
      return;
    }
    setCreatePending(true);
    setCreateError("");
    try {
      const res = await api.post("/position-types", {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        hidden: createForm.hidden,
      });
      // prepend to list so it's visible immediately
      setPosTypes((prev) => [res.data, ...prev]);
      setCount((c) => c + 1);
      setCreateForm({ name: "", description: "", hidden: false });
      setShowCreate(false);
    } catch (err) {
      setCreateError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to create position type."
          : "Failed to create position type."
      );
    } finally {
      setCreatePending(false);
    }
  }

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="AdminPositionTypes page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Positions</h1>
          <p className="page-subtitle" aria-live="polite">
            {loading ? "Loading positions…" : `${count} position type${count !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          type="button"
          className={showCreate ? "btn-secondary" : "btn-primary"}
          onClick={() => setShowCreate((v) => !v)}
          aria-expanded={showCreate}
        >
          {showCreate ? "Cancel" : "New position"}
        </button>
      </header>

      {/* create form */}
      {showCreate && (
        <form className="apt-create" onSubmit={handleCreate} aria-labelledby="apt-create-title">
          <h2 id="apt-create-title">New position type</h2>
          {createError && (
            <p className="error-message" role="alert">
              {createError}
            </p>
          )}
          <div className="apt-create-grid">
            <div className="form-field">
              <label htmlFor="apt-create-name">Name</label>
              <input
                id="apt-create-name"
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-field apt-create-wide">
              <label htmlFor="apt-create-desc">Description</label>
              <textarea
                id="apt-create-desc"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={2}
                required
              />
            </div>
          </div>
          <div className="apt-form-foot">
            <label className="apt-check">
              <input
                type="checkbox"
                checked={createForm.hidden}
                onChange={(e) => setCreateForm({ ...createForm, hidden: e.target.checked })}
              />
              Hidden from professionals
            </label>
            <button type="submit" className="btn-primary" disabled={createPending}>
              {createPending ? "Creating…" : "Create position"}
            </button>
          </div>
        </form>
      )}

      <div className="filter-bar" role="group" aria-label="Filter and sort positions">
        <SearchPill
          value={keyword}
          onChange={setKeyword}
          label="Search position types"
          placeholder="Search name or description"
        />
        <label className="pill-select">
          <span className="visually-hidden">Filter by visibility</span>
          <select
            value={hiddenFilter}
            onChange={(e) => setHiddenFilter(e.target.value)}
            className={hiddenFilter ? "is-set" : ""}
          >
            <option value="">Any visibility</option>
            <option value="false">Visible</option>
            <option value="true">Hidden</option>
          </select>
        </label>
        <label className="pill-select">
          <span className="visually-hidden">Sort field</span>
          <select
            value={sortField}
            onChange={(e) => {
              setSortField(e.target.value);
              setSortOrder("asc");
            }}
          >
            <option value="name">Sort by name</option>
            <option value="num_qualified">Sort by qualified</option>
          </select>
        </label>
        <label className="pill-select">
          <span className="visually-hidden">Sort order</span>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {loading ? (
        <LoadingSpinner />
      ) : posTypes.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No position types found</p>
          <p>Try a shorter search, or add a new position.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table-stack apt-table">
              <thead>
                <tr>
                  <th scope="col">Position</th>
                  <th scope="col">Visibility</th>
                  <th scope="col" className="cell-num">
                    Qualified
                  </th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {posTypes.map((pt) => (
                  <Fragment key={pt.id}>
                    {editingId === pt.id ? (
                      /* inline edit form */
                      <tr className="apt-edit-row">
                        <td colSpan={4}>
                          <div className="apt-edit">
                            {editError && (
                              <p className="error-message" role="alert">
                                {editError}
                              </p>
                            )}
                            <div className="apt-create-grid">
                              <div className="form-field">
                                <label htmlFor={`apt-edit-name-${pt.id}`}>Name</label>
                                <input
                                  id={`apt-edit-name-${pt.id}`}
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                  }
                                />
                              </div>
                              <div className="form-field apt-create-wide">
                                <label htmlFor={`apt-edit-desc-${pt.id}`}>Description</label>
                                <textarea
                                  id={`apt-edit-desc-${pt.id}`}
                                  value={editForm.description}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, description: e.target.value })
                                  }
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="apt-form-foot">
                              <label className="apt-check">
                                <input
                                  type="checkbox"
                                  checked={editForm.hidden}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, hidden: e.target.checked })
                                  }
                                />
                                Hidden from professionals
                              </label>
                              <div className="apt-edit-btns">
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  disabled={editPending}
                                  onClick={() => saveEdit(pt.id)}
                                >
                                  {editPending ? "Saving…" : "Save"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      /* normal display row */
                      <tr>
                        <td className="cell-primary apt-name-cell">
                          {pt.name}
                          <span className="cell-sub apt-desc">{pt.description}</span>
                        </td>
                        <td data-label="Visibility">
                          {pt.hidden ? (
                            <StatusBadge tone="ended">Hidden</StatusBadge>
                          ) : (
                            <StatusBadge tone="success">Visible</StatusBadge>
                          )}
                        </td>
                        <td className="cell-num" data-label="Qualified">
                          {pt.num_qualified}
                        </td>
                        <td className="cell-actions">
                          {confirmDeleteId === pt.id ? (
                            <span className="cell-actions-inner apt-confirm">
                              <span>Delete this position?</span>
                              <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Keep
                              </button>
                              <button
                                type="button"
                                className="btn-danger btn-sm"
                                disabled={deletePending}
                                onClick={() => handleDelete(pt.id)}
                              >
                                {deletePending ? "Deleting…" : "Delete"}
                              </button>
                            </span>
                          ) : (
                            <span className="cell-actions-inner">
                              <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => startEdit(pt)}
                                aria-label={`Edit ${pt.name}`}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-ghost btn-sm"
                                onClick={() => setConfirmDeleteId(pt.id)}
                                aria-label={`Delete ${pt.name}`}
                              >
                                Delete
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
