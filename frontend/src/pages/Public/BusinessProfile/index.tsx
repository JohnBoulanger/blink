import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import ClinicPhoto from "../../../components/ClinicPhoto";
import ClinicMap from "../../../components/ClinicMap";
import { formatRate, formatShiftWhen } from "../../../utils/format";
import useDemoLogin from "../Landing/useDemoLogin";
import type { PublicShift } from "../Landing/types";
import "./style.css";

interface BusinessData {
  id: number;
  business_name: string;
  email: string;
  phone_number: string;
  postal_address: string;
  location?: { lat: number; lon: number };
  avatar?: string;
  biography?: string;
}

export default function PublicBusinessProfile() {
  const { businessId } = useParams();
  const { isAuthenticated, role } = useAuth();
  const demo = useDemoLogin();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // upcoming open shifts from the public list, filtered to this clinic
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [openingId, setOpeningId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      setLoading(true);
      try {
        const response = await api.get(`/businesses/${businessId}`);
        setBusiness(response.data);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to load business"
            : "Failed to load business"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [businessId]);

  // the shift list is optional, so a failure leaves the section out
  useEffect(() => {
    let cancelled = false;
    api
      .get("/jobs/public")
      .then((res) => {
        if (cancelled) return;
        const all = res.data.results as PublicShift[];
        setShifts(all.filter((s) => s.business.id === Number(businessId)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // opening a shift signs in as the demo professional, as on the landing page
  function openShift(e: React.MouseEvent, id: number) {
    e.preventDefault();
    setOpeningId(id);
    demo.enter("regular", `/jobs/${id}`);
  }

  if (loading) return <LoadingSpinner />;

  if (error || !business) {
    return (
      <div className="PublicBusinessProfile page-enter">
        <BackLink to="/businesses">All clinics</BackLink>
        <p className="error-message" role="alert">
          {error || "Business not found"}
        </p>
      </div>
    );
  }

  // build avatar url from backend
  const avatarUrl = business.avatar
    ? `${import.meta.env.VITE_BACKEND_URL ?? ""}${business.avatar}`
    : null;
  const located =
    business.location && business.location.lat !== 0 && business.location.lon !== 0
      ? business.location
      : null;
  const signsInAsDemo = !isAuthenticated || role !== "regular";

  return (
    <div className="PublicBusinessProfile page-enter">
      <BackLink to="/businesses">All clinics</BackLink>

      <ClinicPhoto
        businessId={business.id}
        businessName={business.business_name}
        className="pbp-photo"
      />

      <div className="pbp-layout">
        <div className="pbp-main">
          <header className="pbp-header">
            {avatarUrl && <img src={avatarUrl} alt="" className="pbp-avatar" />}
            <div className="pbp-heading">
              <h1>{business.business_name}</h1>
              <p className="pbp-address">{business.postal_address}</p>
            </div>
          </header>

          {business.biography && (
            <section className="pbp-section" aria-labelledby="pbp-about-title">
              <h2 id="pbp-about-title">About</h2>
              <p className="pbp-bio">{business.biography}</p>
            </section>
          )}

          {shifts.length > 0 && (
            <section className="pbp-section" aria-labelledby="pbp-shifts-title">
              <div className="pbp-section-head">
                <h2 id="pbp-shifts-title">Upcoming open shifts</h2>
                {signsInAsDemo && (
                  <p className="pbp-section-note">
                    Opening a shift signs you in as Alice, a demo professional.
                  </p>
                )}
              </div>
              {demo.error && (
                <p className="error-message" role="alert">
                  {demo.error}
                </p>
              )}
              {/* the clinic is the page, so rows leave out its name and photo */}
              <ul className="pbp-shifts">
                {shifts.map((shift) => {
                  const opening = demo.pending !== null && openingId === shift.id;
                  return (
                    <li key={shift.id}>
                      <Link
                        to={`/jobs/${shift.id}`}
                        className="pbp-shift-row"
                        onClick={(e) => openShift(e, shift.id)}
                        aria-busy={opening}
                      >
                        <span className="pbp-shift-main">
                          <span className="pbp-shift-title">{shift.position_type.name}</span>
                          <span className="pbp-shift-meta tabular">
                            {formatShiftWhen(shift.start_time, shift.end_time)}
                          </span>
                        </span>
                        <span className="pbp-shift-rate tabular">
                          {formatRate(shift.salary_min, shift.salary_max)}
                          <span className="pbp-shift-rate-unit"> /hr</span>
                        </span>
                        {opening ? (
                          <span className="btn-spinner pbp-shift-spinner" aria-hidden="true" />
                        ) : (
                          <svg
                            className="pbp-shift-chevron"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M9 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {located && (
            <section className="pbp-section" aria-labelledby="pbp-map-title">
              <h2 id="pbp-map-title">Where the clinic is</h2>
              <p className="pbp-text">{business.postal_address}</p>
              <ClinicMap
                pins={[
                  {
                    id: business.id,
                    lat: located.lat,
                    lon: located.lon,
                    title: business.business_name,
                    card: {
                      businessId: business.id,
                      businessName: business.business_name,
                      lines: [business.postal_address],
                      to: `/businesses/${business.id}`,
                      linkLabel: "View clinic",
                    },
                  },
                ]}
                variant="dot"
                label={`Map of ${business.business_name}`}
                touchPan={false}
                className="pbp-map"
              />
            </section>
          )}
        </div>

        {/* contact card */}
        <aside className="pbp-card" aria-label="Contact">
          <h2 className="pbp-card-title">Contact</h2>
          <dl className="detail-list pbp-contact">
            <div>
              <dt>Phone</dt>
              <dd className="tabular">{business.phone_number}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{business.email}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{business.postal_address}</dd>
            </div>
          </dl>
          {business.location && (
            // secondary link to google maps for directions
            <a
              href={`https://www.google.com/maps?q=${business.location.lat},${business.location.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary pbp-directions"
            >
              Get directions
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 17L17 7M9 7h8v8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="visually-hidden"> (opens Google Maps in a new tab)</span>
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
