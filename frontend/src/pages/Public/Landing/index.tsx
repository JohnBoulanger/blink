import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../../utils/api";
import Hero from "./Hero";
import ShiftCards from "./ShiftCards";
import HowItWorks from "./HowItWorks";
import NegotiationDemo from "./NegotiationDemo";
import ClinicDirectory from "./ClinicDirectory";
import DemoEntry from "./DemoEntry";
import type { Clinic, PositionType } from "./types";
import "./style.css";

// the public list is paginated, so walk every page
async function fetchAllClinics(): Promise<{ clinics: Clinic[]; count: number }> {
  const clinics: Clinic[] = [];
  const limit = 50;
  let page = 1;
  let count = 0;
  while (true) {
    const res = await api.get("/businesses", {
      params: { page, limit, sort: "business_name", order: "asc" },
    });
    count = res.data.count;
    clinics.push(...(res.data.results as Clinic[]));
    if (page * limit >= count) break;
    page += 1;
  }
  return { clinics, count };
}

export default function Landing() {
  const location = useLocation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicCount, setClinicCount] = useState<number | null>(null);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // roles are optional for the search, so a failure leaves "Any role" only
    const roles = api
      .get("/position-types", { params: { limit: 100 } })
      .then((res) => {
        if (!cancelled) setPositionTypes(res.data.results as PositionType[]);
      })
      .catch(() => undefined);
    const directory = fetchAllClinics()
      .then((data) => {
        if (cancelled) return;
        setClinics(data.clinics);
        setClinicCount(data.count);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    Promise.all([roles, directory]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // honour section links such as /#how-it-works coming from other pages
  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ block: location.hash === "#demo" ? "center" : "start" });
  }, [location.hash]);

  return (
    <div className="Landing">
      <Hero clinics={clinics} positionTypes={positionTypes} loading={loading} />

      <ShiftCards clinics={clinics} />

      <HowItWorks />

      <section className="landing-negotiation" aria-labelledby="negotiation-title">
        <div className="container">
          <div className="section-head">
            <div className="section-title-row">
              <h2 id="negotiation-title">See a negotiation</h2>
              <span className="demo-tag">Demo</span>
            </div>
            <p>
              A clinic and a professional get one 15-minute window to agree. Accept the shift to see
              how it ends.
            </p>
          </div>
          <NegotiationDemo />
        </div>
      </section>

      <section className="landing-clinics" id="clinics" aria-labelledby="clinics-title">
        <div className="container">
          <div className="section-head section-head-split">
            <div>
              <h2 id="clinics-title">Clinics on Blink</h2>
              <p>
                {clinicCount !== null
                  ? `${clinicCount} optometry clinics across Toronto post shifts here.`
                  : "Optometry clinics across Toronto post shifts here."}
              </p>
            </div>
            <Link to="/businesses" className="section-link">
              Browse all clinics
            </Link>
          </div>
          <ClinicDirectory clinics={clinics} loading={loading} error={error} />
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="cta-title">
        <div className="container cta-inner">
          <div className="cta-copy">
            <h2 id="cta-title">See Blink from every side.</h2>
            <p>
              Demo data resets on restart. Password for every account:{" "}
              <span className="cta-password">123123</span>.
            </p>
            <p className="cta-signin">
              Prefer a specific account? <Link to="/login">Sign in manually</Link>.
            </p>
          </div>
          <DemoEntry />
        </div>
      </section>
    </div>
  );
}
