import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ClinicMap from "../../../components/ClinicMap";
import StatusBadge from "../../../components/StatusBadge";
import "./style.css";

interface BusinessProfile {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  phone_number: string | null;
  postal_address: string | null;
  location: { lat: number; lon: number } | null;
  avatar: string | null;
  biography: string | null;
  verified: boolean;
  activated: boolean;
  createdAt: string;
}

const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export default function BusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const avatarRef = useRef<HTMLInputElement | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    api
      .get("/businesses/me")
      .then((res) => setProfile(res.data))
      .catch((err) =>
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load profile."
            : "Failed to load profile."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  // upload avatar directly from profile page
  async function handleAvatarUpload(file: File) {
    setUploadLoading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.put("/businesses/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => (prev ? { ...prev, avatar: res.data.avatar } : prev));
    } catch (err) {
      setUploadError(
        axios.isAxiosError(err) ? err.response?.data?.error || "Upload failed." : "Upload failed."
      );
    } finally {
      setUploadLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  if (!profile) return null;

  // two-letter initials for avatar placeholder
  const initials = profile.business_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hasLocation = Boolean(
    profile.location && profile.location.lat !== 0 && profile.location.lon !== 0
  );

  return (
    <div className="BusinessProfile page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Clinic profile</h1>
          <p className="page-subtitle">This is how professionals see your clinic.</p>
        </div>
        <Link to="/business/profile/edit" className="btn-secondary">
          Edit profile
        </Link>
      </header>

      {/* unverified notice: jobs can't be posted until an admin verifies */}
      {!profile.verified && (
        <div className="bp-notice" role="status">
          <StatusBadge tone="pending">Waiting for verification</StatusBadge>
          <p>
            An admin reviews every new clinic. You can post shifts once your clinic is verified.
          </p>
        </div>
      )}

      <div className="bp-layout">
        {/* identity card */}
        <section className="bp-card" aria-labelledby="bp-name">
          <div className="bp-identity">
            {profile.avatar ? (
              <img src={`${backendUrl}${profile.avatar}`} alt="" className="bp-avatar" />
            ) : (
              <span className="bp-avatar bp-avatar-initials" aria-hidden="true">
                {initials}
              </span>
            )}
            <div className="bp-identity-text">
              <h2 id="bp-name">{profile.business_name}</h2>
              {profile.verified ? (
                <StatusBadge tone="success">Verified clinic</StatusBadge>
              ) : (
                <StatusBadge tone="pending">Unverified</StatusBadge>
              )}
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            hidden
            ref={avatarRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
          />
          <button
            type="button"
            className="btn-ghost btn-sm bp-photo-button"
            onClick={() => avatarRef.current?.click()}
            disabled={uploadLoading}
          >
            {uploadLoading ? "Uploading…" : "Change photo"}
          </button>
          {uploadError && (
            <p className="bp-error" role="alert">
              {uploadError}
            </p>
          )}

          <dl className="detail-list bp-details">
            <div>
              <dt>Owner</dt>
              <dd>{profile.owner_name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd className="tabular">{profile.phone_number || "Not added"}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd className="tabular">{memberSince.format(new Date(profile.createdAt))}</dd>
            </div>
          </dl>
        </section>

        <div className="bp-main">
          <section className="bp-section" aria-labelledby="bp-location-title">
            <h2 id="bp-location-title">Location</h2>
            <p className="bp-text">{profile.postal_address || "No address added."}</p>
            {hasLocation && profile.location && (
              <>
                <ClinicMap
                  pins={[
                    {
                      id: profile.id,
                      lat: profile.location.lat,
                      lon: profile.location.lon,
                      title: profile.business_name,
                      card: {
                        businessId: profile.id,
                        businessName: profile.business_name,
                        lines: [profile.postal_address ?? ""],
                        to: `/businesses/${profile.id}`,
                        linkLabel: "View public page",
                      },
                    },
                  ]}
                  variant="dot"
                  label="Map of your clinic"
                  touchPan={false}
                  className="bp-map"
                />
                <p className="bp-coords tabular">
                  {profile.location.lat.toFixed(4)}, {profile.location.lon.toFixed(4)}
                </p>
              </>
            )}
          </section>

          <section className="bp-section" aria-labelledby="bp-about-title">
            <h2 id="bp-about-title">About</h2>
            {profile.biography ? (
              <p className="bp-bio">{profile.biography}</p>
            ) : (
              <p className="bp-text">No description added.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
