import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../../utils/api";
import { formatDay, formatRate, formatShiftWhen } from "../../../../utils/format";
import useMediaQuery from "../../../../hooks/useMediaQuery";
import ShiftCard from "../../../../components/ShiftCard";
import ClinicMap, { type MapPin } from "../../../../components/ClinicMap";
import useDemoLogin from "../useDemoLogin";
import type { Clinic, PublicShift } from "../types";
import "./style.css";

// the "Show map" pill covers the foot of the strip: 24px offset, 44px tall, plus 24px clear
const STRIP_PADDING = { top: 40, right: 56, bottom: 92, left: 56 };

interface ShiftCardsProps {
  // clinic locations, joined on the client to place each shift
  clinics: Clinic[];
}

export default function ShiftCards({ clinics }: ShiftCardsProps) {
  const { enter, pending, error: loginError } = useDemoLogin();
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);
  // the shift highlighted by a hovered card or pill
  const [activeId, setActiveId] = useState<number | null>(null);
  const narrow = useMediaQuery("(max-width: 900px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const showMapRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  // one price pill per shift at its clinic
  const pins = useMemo<MapPin[]>(() => {
    const byId = new Map(clinics.map((c) => [c.id, c]));
    return shifts.flatMap((shift) => {
      const clinic = byId.get(shift.business.id);
      if (!clinic?.location || clinic.location.lat === 0 || clinic.location.lon === 0) return [];
      const rate = formatRate(shift.salary_min, shift.salary_max);
      return [
        {
          id: shift.id,
          lat: clinic.location.lat,
          lon: clinic.location.lon,
          label: rate,
          title: `${shift.business.business_name}, ${shift.position_type.name}, ${formatDay(shift.start_time)}, ${rate} per hour`,
          card: {
            businessId: shift.business.id,
            businessName: shift.business.business_name,
            lines: [shift.position_type.name, formatShiftWhen(shift.start_time, shift.end_time)],
            rate,
            to: `/jobs/${shift.id}`,
            linkLabel: "View shift",
            onOpen: (e: React.MouseEvent<HTMLAnchorElement>) => openShift(e, shift.id),
          },
        },
      ];
    });
    // openShift only reads stable setters and the demo login
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shifts, clinics]);

  // the full-screen map on phones: lock the page and close on escape
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  // the strip and its button mount again after the sheet closes, then take focus back
  function closeSheet() {
    setSheetOpen(false);
    requestAnimationFrame(() => showMapRef.current?.focus());
  }

  useEffect(() => {
    if (!narrow) setSheetOpen(false);
  }, [narrow]);

  const hasMap = !loading && !failed && pins.length > 0;
  const map = (className: string, touchPan: boolean, fitPadding?: typeof STRIP_PADDING) => (
    <ClinicMap
      pins={pins}
      variant="price"
      activeId={activeId}
      onActiveChange={setActiveId}
      clusterNoun={["shift", "shifts"]}
      label="Map of open shifts"
      touchPan={touchPan}
      fitPadding={fitPadding}
      className={className}
    />
  );

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
        {shifts.map((shift) => (
          <li key={shift.id}>
            <ShiftCard
              shift={shift}
              to={`/jobs/${shift.id}`}
              onClick={(e) => openShift(e, shift.id)}
              opening={pending !== null && openingId === shift.id}
              active={activeId === shift.id}
              onActiveChange={(on) =>
                setActiveId((current) => (on ? shift.id : current === shift.id ? null : current))
              }
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
        <div className={`shift-layout${hasMap && !narrow ? " has-map" : ""}`}>
          <div className="shift-list">
            {hasMap && narrow && !sheetOpen && (
              <div className="shift-strip">
                {map("shift-strip-map", false, STRIP_PADDING)}
                <button
                  type="button"
                  ref={showMapRef}
                  className="shift-strip-button"
                  onClick={() => setSheetOpen(true)}
                >
                  Show map
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5m6-11v13.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
            {body}
          </div>
          {hasMap && !narrow && <div className="shift-map-col">{map("shift-map", true)}</div>}
        </div>
      </div>

      {hasMap && narrow && sheetOpen && (
        <div
          className="shift-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shift-sheet-title"
        >
          <div className="shift-sheet-bar">
            <h2 id="shift-sheet-title">Open shifts this week</h2>
            <button
              type="button"
              ref={closeRef}
              className="btn-secondary btn-sm"
              onClick={closeSheet}
            >
              Close map
            </button>
          </div>
          {map("shift-sheet-map", true)}
        </div>
      )}
    </section>
  );
}
