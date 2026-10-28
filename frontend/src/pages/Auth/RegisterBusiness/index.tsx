import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import AuthCard from "../../../components/AuthCard";
import PasswordInput from "../../../components/PasswordInput";
import "./style.css";

type Field = "email" | "postal_address" | "lat" | "lon";

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  // a validation error that belongs to one field, shown under it
  const [fieldError, setFieldError] = useState<{ field: Field; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // form fields matching backend expectations
  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    password: "",
    phone_number: "",
    postal_address: "",
    lat: "",
    lon: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // aria props for a field that has an error
  function invalidProps(field: Field, id: string) {
    return fieldError?.field === field
      ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` }
      : {};
  }

  function errorLine(field: Field, id: string) {
    if (fieldError?.field !== field) return null;
    return (
      <p className="field-error" id={`${id}-error`}>
        {fieldError.message}
      </p>
    );
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setFieldError(null);

    if (!form.postal_address.trim()) {
      setFieldError({ field: "postal_address", message: "Please enter the clinic address." });
      return;
    }

    // validate coordinates
    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFieldError({
        field: "lat",
        message: form.lat ? "Latitude must be between -90 and 90." : "Enter the clinic latitude.",
      });
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setFieldError({
        field: "lon",
        message: form.lon
          ? "Longitude must be between -180 and 180."
          : "Enter the clinic longitude.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/businesses", {
        business_name: form.business_name,
        owner_name: form.owner_name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
        postal_address: form.postal_address,
        location: { lat, lon },
      });
      navigate(`/activate/${response.data.resetToken}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setFieldError({ field: "email", message: "An account with this email already exists." });
        } else {
          setError(err.response?.data?.error || "Registration failed");
        }
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      className="RegisterBusiness"
      wide
      title="Register your clinic"
      subtitle="Post shifts and hire verified eye care professionals."
      footer={
        <>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Are you an optometry professional? <Link to="/register">Join as a professional</Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="auth-form-row">
          <div className="form-field">
            <label htmlFor="rb-business-name">Clinic name</label>
            <input
              id="rb-business-name"
              name="business_name"
              type="text"
              value={form.business_name}
              onChange={handleChange}
              autoComplete="organization"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="rb-owner-name">Owner name</label>
            <input
              id="rb-owner-name"
              name="owner_name"
              type="text"
              value={form.owner_name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="rb-email">Email</label>
          <input
            id="rb-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            {...invalidProps("email", "rb-email")}
          />
          {errorLine("email", "rb-email")}
        </div>

        <div className="form-field">
          <label htmlFor="rb-password">Password</label>
          <PasswordInput
            id="rb-password"
            name="password"
            placeholder=""
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            describedBy="rb-password-hint"
            required
          />
          <p className="field-hint" id="rb-password-hint">
            8–20 characters with an uppercase letter, a lowercase letter, a digit and a symbol.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="rb-phone">Phone number</label>
          <input
            id="rb-phone"
            name="phone_number"
            type="text"
            value={form.phone_number}
            onChange={handleChange}
            autoComplete="tel"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="rb-address">Clinic address</label>
          <input
            id="rb-address"
            name="postal_address"
            type="text"
            value={form.postal_address}
            onChange={handleChange}
            autoComplete="street-address"
            required
            {...invalidProps("postal_address", "rb-address")}
          />
          {errorLine("postal_address", "rb-address")}
        </div>

        <div className="auth-form-row">
          <div className="form-field">
            <label htmlFor="rb-lat">Latitude</label>
            <input
              id="rb-lat"
              name="lat"
              type="number"
              step="any"
              inputMode="decimal"
              value={form.lat}
              onChange={handleChange}
              {...invalidProps("lat", "rb-lat")}
            />
            {errorLine("lat", "rb-lat")}
          </div>
          <div className="form-field">
            <label htmlFor="rb-lon">Longitude</label>
            <input
              id="rb-lon"
              name="lon"
              type="number"
              step="any"
              inputMode="decimal"
              value={form.lon}
              onChange={handleChange}
              {...invalidProps("lon", "rb-lon")}
            />
            {errorLine("lon", "rb-lon")}
          </div>
        </div>
        <p className="field-hint rb-coords-hint">
          Coordinates place your clinic on the map. You can copy them from any online map.
        </p>

        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading && <span className="btn-spinner" aria-hidden="true" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
