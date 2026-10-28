import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import ClinicPhoto from "../../../components/ClinicPhoto";
import ClinicMap, { type MapPin } from "../../../components/ClinicMap";
import SearchPill from "../../../components/SearchPill";
import { hasLocation, type ClinicSummary } from "../../../utils/clinics";
import "./style.css";

interface Business extends ClinicSummary {
  email: string;
  phone_number: string;
}

export default function BusinessList() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const keyword = useDebounce(searchInput, 300);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // the clinic highlighted by a hovered card or pin
  const [activeId, setActiveId] = useState<number | null>(null);
  const limit = 10;

  // fetch businesses when debounced filters change
  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, string | number> = {
          page,
          limit,
          sort: "business_name",
          order: sortOrder,
        };
        if (keyword) params.keyword = keyword;
        const response = await api.get("/businesses", { params });
        setBusinesses(response.data.results);
        setCount(response.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load businesses"
            : "Failed to load businesses"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [page, keyword, sortOrder]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [keyword, sortOrder]);

  // one plain pin per clinic on this page
  const pins = useMemo<MapPin[]>(
    () =>
      businesses.flatMap((b) =>
        hasLocation(b)
          ? [
              {
                id: b.id,
                lat: b.location.lat,
                lon: b.location.lon,
                label: "",
                title: b.business_name,
              },
            ]
          : []
      ),
    [businesses]
  );

  const totalPages = Math.ceil(count / limit);

  let results: React.ReactNode;
  if (loading) {
    results = (
      <ul className="bl-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="bl-skeleton">
            <span className="bl-skeleton-photo" />
            <span className="bl-skeleton-line" />
            <span className="bl-skeleton-line bl-skeleton-line-short" />
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
  } else if (businesses.length === 0) {
    results = (
      <div className="empty-state">
        <p className="empty-state-title">No clinics found</p>
        <p>Try a shorter search, such as part of the clinic name.</p>
        {searchInput && (
          <button type="button" className="btn-secondary" onClick={() => setSearchInput("")}>
            Clear search
          </button>
        )}
      </div>
    );
  } else {
    results = (
      <>
        <ul className="bl-grid">
          {businesses.map((b, i) => (
            <li key={b.id}>
              <Link
                to={`/businesses/${b.id}`}
                className={`bl-card${activeId === b.id ? " active" : ""}`}
                onMouseEnter={() => setActiveId(b.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(b.id)}
                onBlur={() => setActiveId(null)}
              >
                <ClinicPhoto businessId={b.id} photoIndex={i} />
                <span className="bl-card-name">{b.business_name}</span>
                <span className="bl-card-meta">{b.postal_address}</span>
                {b.phone_number && <span className="bl-card-meta tabular">{b.phone_number}</span>}
              </Link>
            </li>
          ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div className="BusinessList page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Optometry clinics</h1>
          <p className="page-subtitle" aria-live="polite">
            {loading
              ? "Loading clinics…"
              : `${count} clinic${count !== 1 ? "s" : ""} in Toronto on Blink`}
          </p>
        </div>
      </header>

      {/* search + sort controls */}
      <div className="filter-bar" role="group" aria-label="Search and sort clinics">
        <SearchPill
          value={searchInput}
          onChange={setSearchInput}
          label="Search clinics"
          placeholder="Search clinics"
        />
        <label className="pill-select">
          <span className="visually-hidden">Sort order</span>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Name, A to Z</option>
            <option value="desc">Name, Z to A</option>
          </select>
        </label>
      </div>

      <div className="bl-layout">
        <div className="bl-results" aria-busy={loading}>
          {results}
        </div>
        <aside className="bl-map" aria-label="Map of the clinics on this page">
          <ClinicMap
            pins={pins}
            activeId={activeId}
            onActiveChange={setActiveId}
            onPinClick={(id) => navigate(`/businesses/${id}`)}
            label="Clinic locations"
            className="bl-map-frame"
          />
        </aside>
      </div>
    </div>
  );
}
