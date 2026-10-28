import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import "./style.css";

interface ProfileForm {
  business_name: string;
  owner_name: string;
  phone_number: string;
  postal_address: string;
  lat: string;
  lon: string;
}

export default function BusinessProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>({
    business_name: "",
    owner_name: "",
    phone_number: "",
    postal_address: "",
    lat: "",
    lon: "",
  });
  const [error, setError] = useState("");
  // coordinate range errors point at their field
  const [coordError, setCoordError] = useState<{ field: "lat" | "lon"; message: string } | null>(
    null
  );
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // load current profile on mount
  useEffect(() => {
    api
      .get("/businesses/me")
      .then((res) => {
        const d = res.data;
        setForm({
          business_name: d.business_name ?? "",
          owner_name: d.owner_name ?? "",
          phone_number: d.phone_number ?? "",
          postal_address: d.postal_address ?? "",
          lat: d.location?.lat != null ? String(d.location.lat) : "",
          lon: d.location?.lon != null ? String(d.location.lon) : "",
        });
      })
      .catch((err) =>
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load profile."
            : "Failed to load profile."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setCoordError(null);
    setSuccess(false);

    // validate coordinates only if filled (optional on edit)
    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);
    if (form.lat && (isNaN(lat) || lat < -90 || lat > 90)) {
      setCoordError({ field: "lat", message: "Latitude must be between -90 and 90." });
      return;
    }
    if (form.lon && (isNaN(lon) || lon < -180 || lon > 180)) {
      setCoordError({ field: "lon", message: "Longitude must be between -180 and 180." });
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (form.business_name) body.business_name = form.business_name;
      if (form.owner_name) body.owner_name = form.owner_name;
      if (form.phone_number) body.phone_number = form.phone_number;
      if (form.postal_address) body.postal_address = form.postal_address;
      // only send location if both coordinates are valid numbers
      if (!isNaN(lat) && !isNaN(lon) && form.lat && form.lon) {
        body.location = { lat, lon };
      }

      await api.patch("/businesses/me", body);
      setSuccess(true);
      // return to profile view after a short delay
      setTimeout(() => navigate("/business/profile"), 1200);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to save changes."
          : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="BusinessProfileEdit page-enter">
      <BackLink to="/business/profile">Clinic profile</BackLink>
      <header className="page-header">
        <div className="page-header-text">
          <h1>Edit profile</h1>
          <p className="page-subtitle">Fields you leave empty keep their current value.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bpe-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="success-message" role="status">
            Profile updated. Taking you back to your profile…
          </p>
        )}

        <div className="bpe-grid">
          <div className="form-field">
            <label htmlFor="bpe-business-name">Clinic name</label>
            <input
              id="bpe-business-name"
              name="business_name"
              type="text"
              value={form.business_name}
              onChange={handleChange}
              autoComplete="organization"
            />
          </div>

          <div className="form-field">
            <label htmlFor="bpe-owner-name">Owner name</label>
            <input
              id="bpe-owner-name"
              name="owner_name"
              type="text"
              value={form.owner_name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="bpe-phone">Phone number</label>
            <input
              id="bpe-phone"
              name="phone_number"
              type="text"
              value={form.phone_number}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-field bpe-wide">
            <label htmlFor="bpe-address">Clinic address</label>
            <input
              id="bpe-address"
              name="postal_address"
              type="text"
              value={form.postal_address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          <div className="form-field">
            <label htmlFor="bpe-lat">Latitude</label>
            <input
              id="bpe-lat"
              name="lat"
              type="number"
              step="any"
              inputMode="decimal"
              value={form.lat}
              onChange={handleChange}
              aria-invalid={coordError?.field === "lat" || undefined}
              aria-describedby={coordError?.field === "lat" ? "bpe-lat-error" : "bpe-coords-hint"}
            />
            {coordError?.field === "lat" && (
              <p className="field-error" id="bpe-lat-error">
                {coordError.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="bpe-lon">Longitude</label>
            <input
              id="bpe-lon"
              name="lon"
              type="number"
              step="any"
              inputMode="decimal"
              value={form.lon}
              onChange={handleChange}
              aria-invalid={coordError?.field === "lon" || undefined}
              aria-describedby={coordError?.field === "lon" ? "bpe-lon-error" : "bpe-coords-hint"}
            />
            {coordError?.field === "lon" && (
              <p className="field-error" id="bpe-lon-error">
                {coordError.message}
              </p>
            )}
          </div>

          <p className="field-hint bpe-wide" id="bpe-coords-hint">
            Coordinates place your clinic on the map. You can copy them from any online map.
          </p>
        </div>

        <div className="bpe-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/business/profile")}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="btn-spinner" aria-hidden="true" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
