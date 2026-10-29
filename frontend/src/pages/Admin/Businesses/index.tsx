import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import useDebounce from "../../../hooks/useDebounce";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import StatusBadge from "../../../components/StatusBadge";
import SearchPill from "../../../components/SearchPill";
import ErrorBanner from "../../../components/ErrorBanner";
import Select from "../../../components/Select";
import "./style.css";

interface Business {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  phone_number: string;
  activated: boolean;
  verified: boolean;
}

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters + sort
  const [keyword, setKeyword] = useState("");
  const [activatedFilter, setActivatedFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // per-row verify loading
  const [pendingId, setPendingId] = useState<number | null>(null);

  const limit = 10;
  const debouncedKeyword = useDebounce(keyword, 300);

  // track previous filter values to detect changes and reset page atomically
  const prevFiltersRef = useRef({
    debouncedKeyword,
    activatedFilter,
    verifiedFilter,
    sortOrder,
  });

  // fetch businesses — resets to page 1 when filters change to avoid stale-page fetches
  useEffect(() => {
    let activePage = page;
    const prev = prevFiltersRef.current;
    if (
      prev.debouncedKeyword !== debouncedKeyword ||
      prev.activatedFilter !== activatedFilter ||
      prev.verifiedFilter !== verifiedFilter ||
      prev.sortOrder !== sortOrder
    ) {
      prevFiltersRef.current = {
        debouncedKeyword,
        activatedFilter,
        verifiedFilter,
        sortOrder,
      };
      activePage = 1;
      setPage(1);
    }

    async function fetchBusinesses() {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, unknown> = {
          page: activePage,
          limit,
          sort: "business_name",
          order: sortOrder,
        };
        if (debouncedKeyword) params.keyword = debouncedKeyword;
        if (activatedFilter !== "") params.activated = activatedFilter;
        if (verifiedFilter !== "") params.verified = verifiedFilter;

        const res = await api.get("/businesses", { params });
        setBusinesses(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load businesses."
            : "Failed to load businesses."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [page, debouncedKeyword, activatedFilter, verifiedFilter, sortOrder]);

  // toggle verified status for a single business
  async function toggleVerify(biz: Business) {
    setPendingId(biz.id);
    try {
      await api.patch(`/businesses/${biz.id}/verified`, { verified: !biz.verified });
      setBusinesses((prev) =>
        prev.map((b) => (b.id === biz.id ? { ...b, verified: !b.verified } : b))
      );
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to update verification status."
          : "Failed to update verification status."
      );
    } finally {
      setPendingId(null);
    }
  }

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="AdminBusinesses page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Clinics</h1>
          <p className="page-subtitle" aria-live="polite">
            {loading ? "Loading clinics…" : `${count} registered clinic${count !== 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

      <div className="filter-bar" role="group" aria-label="Filter and sort clinics">
        <SearchPill
          value={keyword}
          onChange={setKeyword}
          label="Search clinics"
          placeholder="Search name, owner, email or phone"
        />
        <Select
          variant="pill"
          label="Filter by activation"
          value={activatedFilter}
          onChange={setActivatedFilter}
          active={activatedFilter !== ""}
          options={[
            { value: "", label: "Any activation" },
            { value: "true", label: "Activated" },
            { value: "false", label: "Not activated" },
          ]}
        />
        <Select
          variant="pill"
          label="Filter by verification"
          value={verifiedFilter}
          onChange={setVerifiedFilter}
          active={verifiedFilter !== ""}
          options={[
            { value: "", label: "Any verification" },
            { value: "true", label: "Verified" },
            { value: "false", label: "Unverified" },
          ]}
        />
        <Select
          variant="pill"
          label="Sort order"
          value={sortOrder}
          onChange={setSortOrder}
          options={[
            { value: "asc", label: "Name, A to Z" },
            { value: "desc", label: "Name, Z to A" },
          ]}
        />
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {loading ? (
        <LoadingSpinner />
      ) : businesses.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No clinics match these filters</p>
          <p>Try a shorter search, or reset the activation and verification filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table-stack">
              <thead>
                <tr>
                  <th scope="col">Clinic</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Email</th>
                  <th scope="col">Account</th>
                  <th scope="col">Verification</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz) => (
                  <tr key={biz.id}>
                    <td className="cell-primary">
                      <Link to={`/businesses/${biz.id}`} className="ab-link">
                        {biz.business_name}
                      </Link>
                    </td>
                    <td data-label="Owner">{biz.owner_name}</td>
                    <td className="cell-secondary" data-label="Email">
                      {biz.email}
                    </td>
                    <td data-label="Account">
                      {biz.activated ? (
                        <StatusBadge tone="success">Activated</StatusBadge>
                      ) : (
                        <StatusBadge tone="pending">Not activated</StatusBadge>
                      )}
                    </td>
                    <td data-label="Verification">
                      {biz.verified ? (
                        <StatusBadge tone="success">Verified</StatusBadge>
                      ) : (
                        <StatusBadge tone="pending">Unverified</StatusBadge>
                      )}
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm ab-action"
                        disabled={pendingId === biz.id}
                        onClick={() => toggleVerify(biz)}
                        aria-label={`${biz.verified ? "Unverify" : "Verify"} ${biz.business_name}`}
                      >
                        {pendingId === biz.id ? "Saving…" : biz.verified ? "Unverify" : "Verify"}
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
