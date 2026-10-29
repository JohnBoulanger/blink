import { useId, useState } from "react";
import Select from "../../../../components/Select";
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
        <Select
          variant="search"
          className="search-segment"
          id="search-clinic"
          label="Clinic"
          value={clinicId}
          onChange={setClinicId}
          disabled={loading}
          options={[
            { value: "", label: loading ? "Loading clinics…" : "Any clinic in Toronto" },
            ...clinics.map((clinic) => ({ value: String(clinic.id), label: clinic.business_name })),
          ]}
        />
        <span className="search-divider" aria-hidden="true" />
        <Select
          variant="search"
          className="search-segment"
          id="search-role"
          label="Role"
          value={roleId}
          onChange={setRoleId}
          disabled={loading}
          options={[
            { value: "", label: loading ? "Loading roles…" : "Any role" },
            ...positionTypes.map((type) => ({ value: String(type.id), label: type.name })),
          ]}
        />
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
