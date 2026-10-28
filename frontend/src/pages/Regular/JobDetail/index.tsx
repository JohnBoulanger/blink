import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import { getClinicDirectory, hasLocation, type ClinicSummary } from "../../../utils/clinics";
import {
  formatDay,
  formatDuration,
  formatLongDay,
  formatRate,
  formatTimeRange,
} from "../../../utils/format";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BackLink from "../../../components/BackLink";
import ClinicPhoto from "../../../components/ClinicPhoto";
import MapEmbed from "../../../components/MapEmbed";
import StatusBadge from "../../../components/StatusBadge";
import { JOB_STATUS, getStatus } from "../../../utils/status";
import "./style.css";

interface JobDetail {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  business: { id: number; business_name: string };
  note: string;
  salary_min: number;
  salary_max: number;
  start_time: string;
  end_time: string;
  worker: { id: number } | null;
}

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export default function JobDetail() {
  const { jobId } = useParams();
  const location = useLocation();
  const { hasActiveNeg } = useNegotiation();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // null = unknown/not expressed, true = interested, false = withdrawn
  const [interested, setInterested] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [clinic, setClinic] = useState<ClinicSummary | undefined>(undefined);

  // the search page passes the card's photo so the header matches it
  const photoIndex = (location.state as { photoIndex?: number } | null)?.photoIndex;

  // fetch job and seed interest state from server in parallel
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [jobRes, interestsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get("/users/me/interests?limit=200"),
        ]);
        setJob(jobRes.data);
        // check if this job appears in the user's interest list
        const match = (interestsRes.data.results ?? []).find(
          (i: { job: { id: number } }) => i.job.id === Number(jobId)
        );
        // only set to true if found; otherwise leave as null (show express-interest)
        if (match) setInterested(true);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            setError("You need an approved qualification for this position to view this job.");
          } else if (err.response?.status === 404) {
            setError("Job not found.");
          } else {
            setError("Failed to load job.");
          }
        } else {
          setError("Failed to load job.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  // address and map come from the public clinic list; both are optional
  const businessId = job?.business.id;
  useEffect(() => {
    if (businessId === undefined) return;
    let cancelled = false;
    getClinicDirectory()
      .then((map) => {
        if (!cancelled) setClinic(map.get(businessId));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // toggle interest — drive state from server response
  async function handleInterest(value: boolean) {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.patch(`/jobs/${jobId}/interested`, { interested: value });
      // use server-confirmed value rather than local optimism
      setInterested(res.data.candidate?.interested ?? value);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          setActionError("You already have an active negotiation — resolve it first.");
        } else {
          setActionError(err.response?.data?.error || "Action failed.");
        }
      } else {
        setActionError("Action failed.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="JobDetail page-enter">
        <BackLink to="/jobs">Back to shifts</BackLink>
        <p className="error-message">{error}</p>
      </div>
    );
  }
  if (!job) return null;

  const isOpen = job.status === "open";
  const status = getStatus(JOB_STATUS, job.status);
  const rate = formatRate(job.salary_min, job.salary_max);
  const duration = formatDuration(job.start_time, job.end_time);
  const located = hasLocation(clinic) ? clinic : null;

  // the interest action, shared by the side card and the phone bottom bar
  const action = isOpen ? (
    <>
      {interested === null && (
        <button
          className="btn-primary jd-action"
          onClick={() => handleInterest(true)}
          disabled={actionLoading}
        >
          {actionLoading && <span className="btn-spinner" aria-hidden="true" />}
          {actionLoading ? "Submitting…" : "I'm interested"}
        </button>
      )}
      {interested === true && (
        <button
          className="btn-secondary jd-action"
          onClick={() => handleInterest(false)}
          disabled={actionLoading}
        >
          {actionLoading && <span className="btn-spinner" aria-hidden="true" />}
          {actionLoading ? "Withdrawing…" : "Withdraw interest"}
        </button>
      )}
    </>
  ) : null;

  const interestStatus = !isOpen ? (
    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
  ) : interested === true ? (
    <StatusBadge tone="success">Interest submitted</StatusBadge>
  ) : interested === false ? (
    <StatusBadge tone="ended">Interest withdrawn</StatusBadge>
  ) : null;

  const errorLine = actionError ? (
    <p className="jd-error" role="alert">
      {actionError}
    </p>
  ) : null;

  const negotiationLink = hasActiveNeg ? (
    <Link to="/negotiations/me" className="btn-ghost jd-neg-link">
      View active negotiation
    </Link>
  ) : null;

  return (
    <div className={`JobDetail page-enter${isOpen ? " jd-has-bar" : ""}`}>
      <BackLink to="/jobs">Back to shifts</BackLink>

      <ClinicPhoto businessId={job.business.id} photoIndex={photoIndex} className="jd-photo" />

      <div className="jd-layout">
        <div className="jd-main">
          <header className="jd-header">
            <div className="jd-title-row">
              <h1>{job.position_type.name}</h1>
              {!isOpen && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
            </div>
            <p className="jd-clinic">
              <Link to={`/businesses/${job.business.id}`} className="jd-clinic-link">
                {job.business.business_name}
              </Link>
              {clinic?.postal_address && (
                <span className="jd-address">{clinic.postal_address}</span>
              )}
            </p>
          </header>

          <section className="jd-section" aria-labelledby="jd-shift-title">
            <h2 id="jd-shift-title">One shift on {formatLongDay(job.start_time)}</h2>
            <p className="jd-meta tabular">
              {formatTimeRange(job.start_time, job.end_time)}
              {duration && ` · ${duration}`}
            </p>
          </section>

          <section className="jd-section" aria-labelledby="jd-req-title">
            <h2 id="jd-req-title">Requirements</h2>
            <p className="jd-meta">
              An approved qualification for {job.position_type.name}. Yours is approved.
            </p>
          </section>

          {job.note && (
            <section className="jd-section" aria-labelledby="jd-note-title">
              <h2 id="jd-note-title">Notes from the clinic</h2>
              <p className="jd-note">{job.note}</p>
            </section>
          )}

          {located && (
            <section className="jd-section jd-map" aria-labelledby="jd-map-title">
              <h2 id="jd-map-title">Where you will work</h2>
              <p className="jd-meta">{located.postal_address}</p>
              <MapEmbed lat={located.location.lat} lon={located.location.lon} zoom={15} />
            </section>
          )}
        </div>

        {/* desktop: sticky booking card */}
        <aside className="jd-card" aria-label="Rate and interest">
          <p className="jd-rate tabular">
            <strong>{rate}</strong> /hr
          </p>
          <div className="jd-when">
            <div>
              <span className="jd-when-label">Start</span>
              <span className="jd-when-time tabular">
                {timeFormat.format(new Date(job.start_time))}
              </span>
              <span className="jd-when-day tabular">{formatDay(job.start_time)}</span>
            </div>
            <div>
              <span className="jd-when-label">End</span>
              <span className="jd-when-time tabular">
                {timeFormat.format(new Date(job.end_time))}
              </span>
              <span className="jd-when-day tabular">{formatDay(job.end_time)}</span>
            </div>
          </div>
          {errorLine}
          {action}
          {interestStatus && <div className="jd-status">{interestStatus}</div>}
          {isOpen && interested === null && (
            <p className="jd-hint">
              If the clinic is also interested, either side can start a 15-minute live negotiation.
            </p>
          )}
          {negotiationLink}
        </aside>
      </div>

      {/* phones: the card becomes a bottom bar */}
      {isOpen && (
        <div className="jd-bar" aria-label="Rate and interest" role="region">
          {errorLine}
          <div className="jd-bar-row">
            <div className="jd-bar-info">
              <p className="jd-bar-rate tabular">
                <strong>{rate}</strong> /hr
              </p>
              {interestStatus ?? (
                <p className="jd-bar-when tabular">
                  {formatDay(job.start_time)}
                  {duration && ` · ${duration}`}
                </p>
              )}
            </div>
            {action}
          </div>
          {negotiationLink}
        </div>
      )}
    </div>
  );
}
