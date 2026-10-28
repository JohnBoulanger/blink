import { useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import StatusBadge from "../../../components/StatusBadge";
import SearchPill from "../../../components/SearchPill";
import ErrorBanner from "../../../components/ErrorBanner";
import "./style.css";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  activated: boolean;
  suspended: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [keyword, setKeyword] = useState("");
  const [activatedFilter, setActivatedFilter] = useState("");
  const [suspendedFilter, setSuspendedFilter] = useState("");

  // per-row suspend loading state
  const [pendingId, setPendingId] = useState<number | null>(null);

  const limit = 10;
  const debouncedKeyword = useDebounce(keyword, 300);

  // track previous filter values to detect changes and reset page atomically
  const prevFiltersRef = useRef({ debouncedKeyword, activatedFilter, suspendedFilter });

  // fetch users list — resets to page 1 when filters change to avoid stale-page fetches
  useEffect(() => {
    // detect filter change and reset page inline so only one fetch fires
    let activePage = page;
    const prev = prevFiltersRef.current;
    if (
      prev.debouncedKeyword !== debouncedKeyword ||
      prev.activatedFilter !== activatedFilter ||
      prev.suspendedFilter !== suspendedFilter
    ) {
      prevFiltersRef.current = { debouncedKeyword, activatedFilter, suspendedFilter };
      activePage = 1;
      setPage(1);
    }

    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, unknown> = { page: activePage, limit };
        if (debouncedKeyword) params.keyword = debouncedKeyword;
        if (activatedFilter !== "") params.activated = activatedFilter;
        if (suspendedFilter !== "") params.suspended = suspendedFilter;

        const res = await api.get("/users", { params });
        setUsers(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load users."
            : "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [page, debouncedKeyword, activatedFilter, suspendedFilter]);

  // toggle suspend status for a single user
  async function toggleSuspend(user: User) {
    setPendingId(user.id);
    try {
      await api.patch(`/users/${user.id}/suspended`, { suspended: !user.suspended });
      // update locally — no refetch needed
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, suspended: !u.suspended } : u))
      );
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to update suspension status."
          : "Failed to update suspension status."
      );
    } finally {
      setPendingId(null);
    }
  }

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="AdminUsers page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Users</h1>
          <p className="page-subtitle" aria-live="polite">
            {loading ? "Loading users…" : `${count} professional${count !== 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

      {/* search + filter controls */}
      <div className="filter-bar" role="group" aria-label="Filter users">
        <SearchPill
          value={keyword}
          onChange={setKeyword}
          label="Search users"
          placeholder="Search name, email or phone"
        />
        <label className="pill-select">
          <span className="visually-hidden">Filter by activation</span>
          <select
            value={activatedFilter}
            onChange={(e) => setActivatedFilter(e.target.value)}
            className={activatedFilter ? "is-set" : ""}
          >
            <option value="">Any activation</option>
            <option value="true">Activated</option>
            <option value="false">Not activated</option>
          </select>
        </label>
        <label className="pill-select">
          <span className="visually-hidden">Filter by suspension</span>
          <select
            value={suspendedFilter}
            onChange={(e) => setSuspendedFilter(e.target.value)}
            className={suspendedFilter ? "is-set" : ""}
          >
            <option value="">Any access</option>
            <option value="false">Active only</option>
            <option value="true">Suspended only</option>
          </select>
        </label>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No users match these filters</p>
          <p>Try a shorter search, or reset the activation and access filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Account</th>
                  <th scope="col">Access</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="cell-primary">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="cell-secondary" data-label="Email">
                      {user.email}
                    </td>
                    <td className="cell-secondary" data-label="Phone">
                      {user.phone_number || "Not added"}
                    </td>
                    <td data-label="Account">
                      {user.activated ? (
                        <StatusBadge tone="success">Activated</StatusBadge>
                      ) : (
                        <StatusBadge tone="pending">Not activated</StatusBadge>
                      )}
                    </td>
                    <td data-label="Access">
                      {user.suspended ? (
                        <StatusBadge tone="ended">Suspended</StatusBadge>
                      ) : (
                        <StatusBadge tone="success">Active</StatusBadge>
                      )}
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className={`btn-sm ${user.suspended ? "btn-primary" : "btn-secondary"} au-action`}
                        disabled={pendingId === user.id}
                        onClick={() => toggleSuspend(user)}
                        aria-label={`${user.suspended ? "Unsuspend" : "Suspend"} ${user.first_name} ${user.last_name}`}
                      >
                        {pendingId === user.id
                          ? "Saving…"
                          : user.suspended
                            ? "Unsuspend"
                            : "Suspend"}
                      </button>
                    </td>
                  </tr>
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
