import { useId, useState } from "react";
import useDemoLogin from "../useDemoLogin";
import type { Clinic, PositionType } from "../types";
import "./style.css";

interface ShiftSearchProps {
  clinics: Clinic[];
  positionTypes: PositionType[];
  loading: boolean;
}

export default function ShiftSearch({ clinics, positionTypes, loading }: ShiftSearchProps) {
  const { enter, pending, error } = useDemoLogin();
  const [clinicId, setClinicId] = useState("");
  const [roleId, setRoleId] = useState("");
  const hintId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (clinicId) params.set("business_id", clinicId);
    if (roleId) params.set("position_type_id", roleId);
    const query = params.toString();
    enter("regular", query ? `/jobs?${query}` : "/jobs");
  }

  return (
    <div className="ShiftSearch">
      <form
        className="search-bar"
        role="search"
        aria-label="Find shifts"
        aria-describedby={hintId}
        onSubmit={handleSubmit}
      >
        <div className="search-segment">
          <label htmlFor="search-clinic">Clinic</label>
          <select
            id="search-clinic"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? "Loading clinics…" : "Any clinic in Toronto"}</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.business_name}
              </option>
            ))}
          </select>
        </div>
        <span className="search-divider" aria-hidden="true" />
        <div className="search-segment">
          <label htmlFor="search-role">Role</label>
          <select
            id="search-role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? "Loading roles…" : "Any role"}</option>
            {positionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="search-submit"
          disabled={pending !== null}
          aria-busy={pending !== null}
        >
          {pending ? (
            <span className="btn-spinner" aria-hidden="true" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.25" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
            </svg>
          )}
          Find shifts
        </button>
      </form>
      <p id={hintId} className="visually-hidden">
        Searching signs you in as Alice Lin, a demo professional.
      </p>
      {error && (
        <p className="search-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
