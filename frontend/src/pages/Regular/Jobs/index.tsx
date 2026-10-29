import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { getClinicDirectory, hasLocation, type ClinicSummary } from "../../../utils/clinics";
import { formatDay, formatRate, formatShiftWhen } from "../../../utils/format";
import Pagination from "../../../components/Pagination";
import ShiftCard from "../../../components/ShiftCard";
import ClinicMap, { type MapPin } from "../../../components/ClinicMap";
import "./style.css";

interface PositionType {
  id: number;
  name: string;
}

interface Job {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  business: { id: number; business_name: string; verified?: boolean };
  salary_min: number;
  salary_max: number;
  start_time: string;
  end_time: string;
}

export default function Jobs() {
  // filters can arrive from the landing page search
  const [searchParams, setSearchParams] = useSearchParams();
  const businessFilter = searchParams.get("business_id") ?? "";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [positionFilter, setPositionFilter] = useState(searchParams.get("position_type_id") ?? "");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 10;

  // clinic locations come from the public clinic list, joined on the client
  const [clinics, setClinics] = useState<Map<number, ClinicSummary>>(new Map());
  // the shift highlighted by a hovered card or pill
  const [activeId, setActiveId] = useState<number | null>(null);
  const isPhone = useMediaQuery("(max-width: 768px)");
  const [showMap, setShowMap] = useState(false);

  // debounce the position filter to avoid rapid re-fetches
  const debouncedPosition = useDebounce(positionFilter, 200);

  // load position types for the filter dropdown
  useEffect(() => {
    api
      .get("/position-types")
      .then((res) => setPositionTypes(res.data.results ?? res.data))
      .catch((err) =>
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load jobs"
            : "Failed to load jobs"
        )
      );
  }, []);

  // the map is optional, so a failure leaves the list as it is
  useEffect(() => {
    let cancelled = false;
    getClinicDirectory()
      .then((map) => {
        if (!cancelled) setClinics(map);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // fetch jobs — reset to page 1 when filters change, otherwise use current page
  useEffect(() => {
    // track whether this effect fired due to a filter change vs a page change
    const targetPage = page;

    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          limit,
          sort: "start_time",
          order: sortOrder,
        };
        if (debouncedPosition) params.position_type_id = debouncedPosition;
        if (businessFilter) params.business_id = businessFilter;
        const res = await api.get("/jobs", { params });
        setJobs(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load jobs"
            : "Failed to load jobs"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [page, debouncedPosition, businessFilter, sortOrder]);

  // reset page to 1 when filter/sort changes (separate from fetch to avoid stale page)
  const prevFiltersRef = useRef({ debouncedPosition, businessFilter, sortOrder });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.debouncedPosition !== debouncedPosition ||
      prev.businessFilter !== businessFilter ||
      prev.sortOrder !== sortOrder
    ) {
      prevFiltersRef.current = { debouncedPosition, businessFilter, sortOrder };
      setPage(1);
    }
  }, [debouncedPosition, businessFilter, sortOrder]);

  function clearBusinessFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete("business_id");
    setSearchParams(next);
  }

  // one price pill per shift in the current results, at its clinic
  const pins = useMemo<MapPin[]>(
    () =>
      jobs.flatMap((job) => {
        const clinic = clinics.get(job.business.id);
        if (!hasLocation(clinic)) return [];
        const rate = formatRate(job.salary_min, job.salary_max);
        return [
          {
            id: job.id,
            lat: clinic.location.lat,
            lon: clinic.location.lon,
            label: rate,
            title: `${job.business.business_name}, ${job.position_type.name}, ${formatDay(job.start_time)}, ${rate} per hour`,
            card: {
              businessId: job.business.id,
              businessName: job.business.business_name,
              lines: [job.position_type.name, formatShiftWhen(job.start_time, job.end_time)],
              rate,
              to: `/jobs/${job.id}`,
              linkLabel: "View shift",
            },
          },
        ];
      }),
    [jobs, clinics]
  );

  const totalPages = Math.ceil(count / limit);
  const clinicName =
    clinics.get(Number(businessFilter))?.business_name ??
    jobs[0]?.business.business_name ??
    "Selected clinic";
  const mapVisible = !isPhone || showMap;
  const listVisible = !isPhone || !showMap;

  let results: React.ReactNode;
  if (loading) {
    results = (
      <ul className="jobs-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="jobs-skeleton">
            <span className="jobs-skeleton-photo" />
            <span className="jobs-skeleton-line jobs-skeleton-line-wide" />
            <span className="jobs-skeleton-line" />
            <span className="jobs-skeleton-line jobs-skeleton-line-short" />
          </li>
        ))}
      </ul>
    );
  } else if (error) {
    results = (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  } else if (jobs.length === 0) {
    results = (
      <div className="jobs-empty">
        <p className="jobs-empty-title">No shifts match these filters</p>
        <p>
          {businessFilter || positionFilter
            ? "Try another position type, or clear the filters to see every open shift."
            : "Clinics post new shifts often. Check back soon."}
        </p>
        {(businessFilter || positionFilter) && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setPositionFilter("");
              if (businessFilter) clearBusinessFilter();
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    );
  } else {
    results = (
      <>
        <ul className="jobs-grid">
          {jobs.map((job) => (
            <li key={job.id}>
              <ShiftCard
                shift={job}
                to={`/jobs/${job.id}`}
                active={activeId === job.id}
                onActiveChange={(on) =>
                  setActiveId((current) => (on ? job.id : current === job.id ? null : current))
                }
              />
            </li>
          ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div className="Jobs page-enter page-wide">
      <header className="jobs-header">
        <h1>Find shifts</h1>
        <p className="jobs-subtitle" aria-live="polite">
          {loading
            ? "Loading open shifts…"
            : `${count} open shift${count !== 1 ? "s" : ""}${businessFilter ? ` at ${clinicName}` : ""}`}
        </p>
      </header>

      {/* filter + sort controls */}
      <div className="jobs-controls" role="group" aria-label="Filter and sort shifts">
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

        {businessFilter && (
          <span className="jobs-clinic-chip">
            {clinicName}
            <button type="button" onClick={clearBusinessFilter} aria-label="Clear clinic filter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        )}
      </div>

      <div className={`jobs-layout${isPhone ? " jobs-layout-phone" : ""}`}>
        {listVisible && (
          <div className="jobs-results" aria-busy={loading}>
            {results}
          </div>
        )}

        {mapVisible && (
          <aside className="jobs-map" aria-label="Map of the shifts in these results">
            <ClinicMap
              pins={pins}
              variant="price"
              activeId={activeId}
              onActiveChange={setActiveId}
              clusterNoun={["shift", "shifts"]}
              label="Open shifts on a map"
              touchPan
              className="jobs-map-frame"
            />
            {!loading && jobs.length > 0 && pins.length === 0 && (
              <p className="jobs-map-note">Clinic locations did not load.</p>
            )}
          </aside>
        )}
      </div>

      {isPhone && !loading && !error && jobs.length > 0 && (
        <button
          type="button"
          className="jobs-map-toggle"
          onClick={() => setShowMap((v) => !v)}
          aria-pressed={showMap}
        >
          {showMap ? (
            <>
              Show list
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </>
          ) : (
            <>
              Show map
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5m6-11v13.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
