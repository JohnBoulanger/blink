import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import Select from "../../../components/Select";
import { toDateTimeLocal } from "../../../utils/format";
import "./style.css";

interface PositionType {
  id: number;
  name: string;
  description: string;
}

type Field = "position_type_id" | "salary_min" | "salary_max" | "start_time" | "end_time";

export default function BusinessJobCreate() {
  const navigate = useNavigate();
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [ptLoading, setPtLoading] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // a validation error that belongs to one field, shown under it
  const [fieldError, setFieldError] = useState<{ field: Field; message: string } | null>(null);

  const [form, setForm] = useState({
    position_type_id: "",
    salary_min: "",
    salary_max: "",
    start_time: "",
    end_time: "",
    note: "",
  });

  // check business verification status before allowing job creation
  useEffect(() => {
    api
      .get("/businesses/me")
      .then((res) => setVerified(res.data.verified))
      .catch((err) => {
        // fall back to treating the business as unverified on any load error
        setVerified(false);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load profile."
            : "Failed to load profile."
        );
      });
  }, []);

  // load position types for the dropdown
  useEffect(() => {
    api
      .get("/position-types")
      .then((res) => setPositionTypes(res.data.results ?? res.data))
      .catch((err) =>
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load position types."
            : "Failed to load position types."
        )
      )
      .finally(() => setPtLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // aria props and the error line for one field
  function invalidProps(field: Field) {
    return fieldError?.field === field
      ? { "aria-invalid": true as const, "aria-describedby": `jc-${field}-error` }
      : {};
  }

  function errorLine(field: Field) {
    if (fieldError?.field !== field) return null;
    return (
      <p className="field-error" id={`jc-${field}-error`}>
        {fieldError.message}
      </p>
    );
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setFieldError(null);

    const salaryMin = parseFloat(form.salary_min);
    const salaryMax = parseFloat(form.salary_max);

    // client-side validation before hitting the server
    if (!form.position_type_id) {
      setFieldError({ field: "position_type_id", message: "Please select a position type." });
      return;
    }
    if (isNaN(salaryMin) || salaryMin < 0) {
      setFieldError({
        field: "salary_min",
        message: "Minimum salary must be a non-negative number.",
      });
      return;
    }
    if (isNaN(salaryMax) || salaryMax < salaryMin) {
      setFieldError({ field: "salary_max", message: "Maximum salary must be ≥ minimum salary." });
      return;
    }
    if (!form.start_time || !form.end_time) {
      setFieldError({
        field: form.start_time ? "end_time" : "start_time",
        message: "Start and end times are required.",
      });
      return;
    }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      setFieldError({ field: "end_time", message: "End time must be after start time." });
      return;
    }

    // check job start window — start time can't be more than 7 days from now
    const maxStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (new Date(form.start_time) > maxStart) {
      setFieldError({
        field: "start_time",
        message: "Start time cannot be more than 7 days from now.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        position_type_id: parseInt(form.position_type_id),
        salary_min: salaryMin,
        salary_max: salaryMax,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      };
      if (form.note.trim()) payload.note = form.note.trim();

      const res = await api.post("/businesses/me/jobs", payload);
      // redirect to the new job's detail page
      navigate(`/business/jobs/${res.data.id}`);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to create shift."
          : "Failed to create shift."
      );
    } finally {
      setSaving(false);
    }
  }

  // block unverified businesses from posting jobs
  if (verified === false)
    return (
      <div className="BusinessJobCreate page-enter">
        <BackLink to="/business/jobs">Your shifts</BackLink>
        <header className="page-header">
          <div className="page-header-text">
            <h1>Post a shift</h1>
          </div>
        </header>
        <div className="jcreate-gate">
          <p className="jcreate-gate-title">Your clinic is waiting for verification</p>
          <p>
            An admin verifies each clinic before it can post shifts. You can still update your
            profile in the meantime.
          </p>
          <Link to="/business/profile" className="btn-secondary">
            Go to your profile
          </Link>
        </div>
      </div>
    );

  if (ptLoading || verified === null) return <LoadingSpinner />;

  return (
    <div className="BusinessJobCreate page-enter">
      <BackLink to="/business/jobs">Your shifts</BackLink>
      <header className="page-header">
        <div className="page-header-text">
          <h1>Post a shift</h1>
          <p className="page-subtitle">
            Professionals with an approved qualification for the position can find it and say they
            are interested.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="jcreate-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <section className="jcreate-section" aria-labelledby="jc-role-title">
          <h2 id="jc-role-title">Role</h2>
          <div className="form-field">
            <Select
              variant="field"
              label="Position type"
              id="position_type_id"
              name="position_type_id"
              value={form.position_type_id}
              onChange={(value) => setForm((prev) => ({ ...prev, position_type_id: value }))}
              required
              {...invalidProps("position_type_id")}
              options={[
                { value: "", label: "Select a position" },
                ...positionTypes.map((pt) => ({ value: String(pt.id), label: pt.name })),
              ]}
            />
            {errorLine("position_type_id")}
          </div>
        </section>

        <section className="jcreate-section" aria-labelledby="jc-rate-title">
          <h2 id="jc-rate-title">Hourly rate</h2>
          <div className="jcreate-grid">
            <div className="form-field">
              <label htmlFor="salary_min">Minimum ($/hr)</label>
              <input
                id="salary_min"
                name="salary_min"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.salary_min}
                onChange={handleChange}
                placeholder="e.g. 25"
                required
                {...invalidProps("salary_min")}
              />
              {errorLine("salary_min")}
            </div>
            <div className="form-field">
              <label htmlFor="salary_max">Maximum ($/hr)</label>
              <input
                id="salary_max"
                name="salary_max"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.salary_max}
                onChange={handleChange}
                placeholder="e.g. 40"
                required
                {...invalidProps("salary_max")}
              />
              {errorLine("salary_max")}
            </div>
          </div>
        </section>

        <section className="jcreate-section" aria-labelledby="jc-time-title">
          <h2 id="jc-time-title">When</h2>
          <div className="jcreate-grid">
            <div className="form-field">
              <label htmlFor="start_time">Start</label>
              {/* min prevents picking a past start time in the date picker */}
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                min={toDateTimeLocal(new Date())}
                value={form.start_time}
                onChange={handleChange}
                required
                {...invalidProps("start_time")}
              />
              {errorLine("start_time")}
            </div>
            <div className="form-field">
              <label htmlFor="end_time">End</label>
              {/* min mirrors start_time so end can't precede current time */}
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                min={form.start_time || toDateTimeLocal(new Date())}
                value={form.end_time}
                onChange={handleChange}
                required
                {...invalidProps("end_time")}
              />
              {errorLine("end_time")}
            </div>
          </div>
          <p className="field-hint">Shifts must start within the next 7 days.</p>
        </section>

        <section className="jcreate-section" aria-labelledby="jc-note-title">
          <h2 id="jc-note-title">Notes</h2>
          <div className="form-field">
            <label htmlFor="note">
              Notes for professionals <span className="jcreate-optional">(optional)</span>
            </label>
            {/* 500 char limit — backend has no db constraint but keeps payloads sane */}
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Equipment, dress code, parking or anything else to know."
              rows={4}
              maxLength={500}
            />
          </div>
        </section>

        <div className="jcreate-actions">
          <Link to="/business/jobs" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="btn-spinner" aria-hidden="true" />}
            {saving ? "Posting…" : "Post shift"}
          </button>
        </div>
      </form>
    </div>
  );
}
