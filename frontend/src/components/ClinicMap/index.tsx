import { lazy, Suspense } from "react";
import "./style.css";

// the map library is large, so it loads only when a page draws a map
const MapCanvas = lazy(() => import("./MapCanvas"));

// the small card a pin opens on the map
export interface MapCard {
  businessId: number;
  businessName: string;
  lines: string[];
  // hourly rate, shift maps only
  rate?: string;
  to: string;
  linkLabel: string;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface MapPin {
  id: number;
  lat: number;
  lon: number;
  // price pill text; dot pins leave it out
  label?: string;
  // accessible name, and the name shown when a dot is hovered
  title: string;
  card: MapCard;
}

export interface ClinicMapProps {
  pins: MapPin[];
  // price pills for shifts, dots for clinics
  variant: "price" | "dot";
  activeId?: number | null;
  onActiveChange?: (id: number | null) => void;
  label: string;
  // singular and plural noun for cluster bubbles
  clusterNoun?: [string, string];
  // one-finger panning on touch screens; off where the page scrolls past the map
  touchPan?: boolean;
  // space in px kept clear around the pins when the map frames them; default 56 on each side
  fitPadding?: { top: number; right: number; bottom: number; left: number };
  className?: string;
}

export default function ClinicMap(props: ClinicMapProps) {
  return (
    <div className={`ClinicMap ${props.className ?? ""}`} role="region" aria-label={props.label}>
      <Suspense fallback={<div className="clinic-map-canvas" aria-hidden="true" />}>
        <MapCanvas {...props} />
      </Suspense>
    </div>
  );
}
