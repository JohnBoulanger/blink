import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import StatusBadge from "../../../components/StatusBadge";
import { formatRate, formatShiftWhen } from "../../../utils/format";
import { JOB_STATUS, getStatus } from "../../../utils/status";
import "./style.css";

interface PositionType {
  id: number;
  name: string;
}

interface Job {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  salary_min: number;
  salary_max: number;
  start_time: string;
  end_time: string;
  worker: { id: number; first_name?: string; last_name?: string } | null;
}

// all possible job statuses
const ALL_STATUSES = ["open", "filled", "expired", "cancelled", "completed"];

export default function BusinessJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filter state
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>(["open", "filled"]);
  const [sortOrder, setSortOrder] = useState("desc");

  const limit = 10;
  const debouncedPosition = useDebounce(positionFilter, 200);

  // load position types for filter dropdown
  useEffect(() => {
    api
      .get("/position-types")
      .then((res) => setPositionTypes(res.data.results ?? res.data))
      .catch((err) =>
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load shifts."
            : "Failed to load shifts."
        )
      );
  }, []);

  // fetch business's jobs
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, unknown> = {
          page,
          limit,
          sort: "start_time",
          order: sortOrder,
        };
        // send status as array so backend receives separate values (comma-joined causes 500)
        if (statusFilters.length > 0) params.status = statusFilters;
        if (debouncedPosition) params.position_type_id = debouncedPosition;

        const res = await api.get("/businesses/me/jobs", { params });
        setJobs(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load shifts."
            : "Failed to load shifts."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [page, debouncedPosition, statusFilters, sortOrder]);

  // reset to page 1 when filters change
  const prevFiltersRef = useRef({ debouncedPosition, statusFilters, sortOrder });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.debouncedPosition !== debouncedPosition ||
      prev.statusFilters !== statusFilters ||
      prev.sortOrder !== sortOrder
    ) {
      prevFiltersRef.current = { debouncedPosition, statusFilters, sortOrder };
      setPage(1);
    }
  }, [debouncedPosition, statusFilters, sortOrder]);

  // toggle a single status in the multi-select filter
  function toggleStatus(s: string) {
    setStatusFilters((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const totalPages = Math.ceil(count / limit);

  let body: React.ReactNode;
  if (loading) {
    body = (
      <ul className="bjobs-list" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="bjobs-skeleton">
            <span className="bjobs-skeleton-line bjobs-skeleton-line-wide" />
            <span className="bjobs-skeleton-line" />
          </li>
        ))}
      </ul>
    );
  } else if (error) {
    body = (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  } else if (jobs.length === 0) {
    body = (
      <div className="empty-state">
        <p className="empty-state-title">No shifts match these filters</p>
        <p>Pick other statuses above, or post a new shift for professionals to find.</p>
        <Link to="/business/jobs/new" className="btn-primary">
          Post a shift
        </Link>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="bjobs-list">
          {jobs.map((job) => {
            const status = getStatus(JOB_STATUS, job.status);
            return (
              <li key={job.id}>
                <Link to={`/business/jobs/${job.id}`} className="bjob-row">
                  <span className="bjob-main">
                    <span className="bjob-title">{job.position_type.name}</span>
                    <span className="bjob-meta tabular">
                      {formatShiftWhen(job.start_time, job.end_time)}
                    </span>
                  </span>
                  <span className="bjob-worker">
                    {job.worker ? (
                      <>
                        <span className="bjob-worker-label">Filled by </span>
                        {job.worker.first_name} {job.worker.last_name}
                      </>
                    ) : (
                      <span className="bjob-worker-none">No one hired yet</span>
                    )}
                  </span>
                  <span className="bjob-rate tabular">
                    {formatRate(job.salary_min, job.salary_max)}
                    <span className="bjob-rate-unit"> /hr</span>
                  </span>
                  <span className="bjob-status">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </span>
                  <svg
                    className="bjob-chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div className="BusinessJobs page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Your shifts</h1>
          <p className="page-subtitle" aria-live="polite">
            {loading ? "Loading shifts…" : `${count} shift${count !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link to="/business/jobs/new" className="btn-primary">
          Post a shift
        </Link>
      </header>

      {/* filter / sort controls */}
      <div className="bjobs-controls">
        <div className="bjobs-status-filters" role="group" aria-label="Show statuses">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              aria-pressed={statusFilters.includes(s)}
              onClick={() => toggleStatus(s)}
            >
              {getStatus(JOB_STATUS, s).label}
            </button>
          ))}
        </div>

        <div className="bjobs-sort-row" role="group" aria-label="Filter and sort shifts">
          <label className="pill-select">
            <span className="visually-hidden">Position type</span>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className={positionFilter ? "is-set" : ""}
            >
              <option value="">All position types</option>
              {positionTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </label>

          <label className="pill-select">
            <span className="visually-hidden">Sort order</span>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Soonest first</option>
              <option value="desc">Latest first</option>
            </select>
          </label>
        </div>
      </div>

      <div aria-busy={loading}>{body}</div>
    </div>
  );
}
