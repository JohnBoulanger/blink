import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import FileUpload from "../../../components/FileUpload";
import StatusBadge from "../../../components/StatusBadge";
import "./style.css";

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  postal_address: string;
  birthday: string;
  biography: string;
  avatar: string | null;
  resume: string | null;
  available: boolean;
  suspended: boolean;
}

interface ApprovedQual {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  updatedAt: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [approvedQuals, setApprovedQuals] = useState<ApprovedQual[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<"avatar" | "resume" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState("");

  // form state — separate from profile to allow cancel-style editing
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    postal_address: "",
    birthday: "",
    biography: "",
  });

  const avatarRef = useRef<HTMLInputElement | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // load profile and approved qualifications on mount
  useEffect(() => {
    async function load() {
      try {
        const [profileRes, qualsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/qualifications/me", { params: { limit: 50 } }),
        ]);
        const p = profileRes.data as UserProfile;
        setProfile(p);
        setForm({
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          phone_number: p.phone_number ?? "",
          postal_address: p.postal_address ?? "",
          birthday: p.birthday ? p.birthday.slice(0, 10) : "",
          biography: p.biography ?? "",
        });
        // only show approved qualifications on the profile
        setApprovedQuals(
          (qualsRes.data.results as ApprovedQual[]).filter((q) => q.status === "approved")
        );
      } catch {
        // profile load failure handled by the null check below
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // save editable profile fields — only send fields with a value
  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      // filter out empty strings so the backend doesn't reject a blank-field save
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      if (Object.keys(payload).length === 0) {
        setSaveError("Please fill in at least one field.");
        return;
      }
      const res = await api.patch("/users/me", payload);
      setProfile((prev) => (prev ? { ...prev, ...res.data } : prev));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Save failed." : "Save failed."
      );
    } finally {
      setSaving(false);
    }
  }

  // upload avatar or resume
  async function handleFileUpload(type: "avatar" | "resume", file: File) {
    setUploadLoading(type);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.put(`/users/me/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => (prev ? { ...prev, [type]: res.data[type] } : prev));
    } catch (err) {
      setUploadError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Upload failed." : "Upload failed."
      );
    } finally {
      setUploadLoading(null);
    }
  }

  // toggle availability
  async function handleAvailability(value: boolean) {
    setAvailLoading(true);
    setAvailError("");
    try {
      await api.patch("/users/me/available", { available: value });
      setProfile((prev) => (prev ? { ...prev, available: value } : prev));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setAvailError("You need at least one approved qualification to set yourself as available.");
      } else {
        setAvailError("Failed to update availability.");
      }
    } finally {
      setAvailLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p className="error-message">Failed to load profile.</p>;

  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`;

  return (
    <div className="UserProfile page-enter">
      <h1>Profile</h1>

      <div className="up-layout">
        {/* profile card */}
        <section className="up-card" aria-labelledby="up-name">
          <div className="up-identity">
            {profile.avatar ? (
              <img src={`${backendUrl}${profile.avatar}`} alt="" className="up-avatar" />
            ) : (
              <span className="up-avatar up-avatar-initials" aria-hidden="true">
                {initials}
              </span>
            )}
            <div className="up-identity-text">
              <h2 id="up-name">
                {profile.first_name} {profile.last_name}
              </h2>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={avatarRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("avatar", file);
                }}
              />
              <button
                type="button"
                className="btn-ghost btn-sm up-photo-button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadLoading === "avatar"}
              >
                {uploadLoading === "avatar" ? "Uploading…" : "Change photo"}
              </button>
            </div>
          </div>

          <dl className="up-contact">
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd className="tabular">{profile.phone_number || "Not added"}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{profile.postal_address || "Not added"}</dd>
            </div>
          </dl>

          {/* availability toggle */}
          <div className="up-availability">
            <div className="up-availability-text">
              <span className="up-availability-label" id="up-avail-label">
                Available for shifts
              </span>
              {profile.suspended ? (
                <StatusBadge tone="ended">Account suspended</StatusBadge>
              ) : profile.available ? (
                <StatusBadge tone="success">Available</StatusBadge>
              ) : (
                <StatusBadge tone="ended">Unavailable</StatusBadge>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.available}
              aria-labelledby="up-avail-label"
              className="up-switch"
              onClick={() => handleAvailability(!profile.available)}
              disabled={availLoading || profile.suspended}
            >
              <span className="up-switch-thumb" aria-hidden="true" />
            </button>
          </div>
          {availError && (
            <p className="up-error" role="alert">
              {availError}
            </p>
          )}

          {uploadError && (
            <p className="up-error" role="alert">
              {uploadError}
            </p>
          )}

          {/* resume */}
          <FileUpload
            title="Resume"
            accept="application/pdf"
            fileUrl={profile.resume ? `${backendUrl}${profile.resume}` : null}
            fileLabel="View resume (PDF)"
            emptyLabel="No resume uploaded"
            replaceLabel="Replace"
            uploadLabel="Upload PDF"
            busy={uploadLoading === "resume"}
            onSelect={(file) => handleFileUpload("resume", file)}
          />

          {/* approved qualifications */}
          <div className="up-quals">
            <h3>Approved qualifications</h3>
            {approvedQuals.length === 0 ? (
              <p className="up-quals-empty">
                None yet. <Link to="/qualifications">Add a qualification</Link> to get started.
              </p>
            ) : (
              <ul className="up-quals-list">
                {approvedQuals.map((q) => (
                  <li key={q.id}>{q.position_type.name}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* editable fields form */}
        <form onSubmit={handleSave} className="up-form" aria-labelledby="up-form-title">
          <h2 id="up-form-title">Edit details</h2>

          {saveError && <p className="error-message">{saveError}</p>}
          {saveSuccess && (
            <p className="success-message" role="status">
              Profile saved.
            </p>
          )}

          <div className="up-form-grid">
            <div className="form-field">
              <label htmlFor="up-first-name">First name</label>
              <input
                id="up-first-name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First name"
                autoComplete="given-name"
              />
            </div>
            <div className="form-field">
              <label htmlFor="up-last-name">Last name</label>
              <input
                id="up-last-name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last name"
                autoComplete="family-name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="up-phone">Phone number</label>
              <input
                id="up-phone"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Phone number"
                autoComplete="tel"
              />
            </div>

            <div className="form-field">
              <label htmlFor="up-birthday">Birthday</label>
              <input
                id="up-birthday"
                name="birthday"
                type="date"
                value={form.birthday}
                onChange={handleChange}
              />
            </div>

            <div className="form-field up-form-wide">
              <label htmlFor="up-address">Postal address</label>
              <input
                id="up-address"
                name="postal_address"
                value={form.postal_address}
                onChange={handleChange}
                placeholder="Postal address"
                autoComplete="street-address"
              />
            </div>

            <div className="form-field up-form-wide">
              <label htmlFor="up-bio">Biography</label>
              <textarea
                id="up-bio"
                name="biography"
                value={form.biography}
                onChange={handleChange}
                placeholder="Tell clinics a bit about yourself..."
                rows={4}
              />
            </div>
          </div>

          <div className="up-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <span className="btn-spinner" aria-hidden="true" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
