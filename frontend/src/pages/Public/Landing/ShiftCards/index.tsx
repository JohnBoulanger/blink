import { useEffect, useState } from "react";
import api from "../../../../utils/api";
import ShiftCard from "../../../../components/ShiftCard";
import useDemoLogin from "../useDemoLogin";
import type { PublicShift } from "../types";
import "./style.css";

export default function ShiftCards() {
  const { enter, pending, error: loginError } = useDemoLogin();
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/jobs/public")
      .then((res) => {
        if (!cancelled) setShifts(res.data.results as PublicShift[]);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function openShift(e: React.MouseEvent, id: number) {
    e.preventDefault();
    setOpeningId(id);
    enter("regular", `/jobs/${id}`);
  }

  let body: React.ReactNode;
  if (loading) {
    body = (
      <ul className="shift-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="shift-skeleton">
            <span className="skeleton-photo" />
            <span className="skeleton-line skeleton-line-wide" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line-short" />
          </li>
        ))}
      </ul>
    );
  } else if (failed || shifts.length === 0) {
    body = (
      <div className="shift-empty">
        <p className="shift-empty-title">
          {failed ? "Open shifts did not load" : "No open shifts right now"}
        </p>
        <p>
          {failed
            ? "Refresh the page, or open the demo as a professional to see the full list."
            : "Clinics post new shifts often. Check back soon, or open the demo as a clinic and post one."}
        </p>
      </div>
    );
  } else {
    body = (
      <ul className="shift-grid">
        {shifts.map((shift, i) => (
          <li key={shift.id}>
            <ShiftCard
              shift={shift}
              to={`/jobs/${shift.id}`}
              photoIndex={i}
              onClick={(e) => openShift(e, shift.id)}
              opening={pending !== null && openingId === shift.id}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="ShiftCards" aria-labelledby="shifts-title" aria-busy={loading}>
      <div className="container">
        <div className="shift-head">
          <h2 id="shifts-title">Open shifts this week</h2>
          <p>Real shifts from the demo data. Opening one signs you in as Alice, a professional.</p>
        </div>
        {loginError && (
          <p className="shift-error" role="alert">
            {loginError}
          </p>
        )}
        {body}
      </div>
    </section>
  );
}
