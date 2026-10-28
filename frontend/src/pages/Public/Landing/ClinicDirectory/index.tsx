import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ClinicPhoto from "../../../../components/ClinicPhoto";
import type { Clinic } from "../types";
import "./style.css";

const TORONTO_CENTER: [number, number] = [43.6532, -79.3832];
// cards shown beside the map; the map pins every clinic
const CARD_LIMIT = 6;

// leaflet sets transform on the marker element, so the pin svg sits in an inner span
function pinIcon(active: boolean) {
  const size = active ? [28, 39] : [20, 28];
  const fill = active ? "#1f6f4a" : "#222222";
  return L.divIcon({
    className: "clinic-marker",
    html: `<span class="clinic-marker-pin"><svg width="${size[0]}" height="${size[1]}" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 0C4.477 0 0 4.477 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.477 15.523 0 10 0z" fill="${fill}"/><circle cx="10" cy="10" r="3.5" fill="#fff"/></svg></span>`,
    iconSize: [size[0], size[1]],
    iconAnchor: [size[0] / 2, size[1]],
    tooltipAnchor: [0, -size[1]],
  });
}

const DEFAULT_PIN = pinIcon(false);
const ACTIVE_PIN = pinIcon(true);

// frame every clinic once the data arrives
function FitToClinics({ clinics }: { clinics: Clinic[] }) {
  const map = useMap();
  useEffect(() => {
    const points = clinics
      .filter((c) => c.location)
      .map((c) => [c.location!.lat, c.location!.lon] as [number, number]);
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36] });
  }, [map, clinics]);
  return null;
}

interface ClinicDirectoryProps {
  clinics: Clinic[];
  loading: boolean;
  error: boolean;
}

export default function ClinicDirectory({ clinics, loading, error }: ClinicDirectoryProps) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<number | null>(null);
  const mapped = useMemo(
    () => clinics.filter((c) => c.location && c.location.lat !== 0 && c.location.lon !== 0),
    [clinics]
  );

  let list: React.ReactNode;
  if (loading) {
    list = (
      <ul className="clinic-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="clinic-skeleton">
            <span className="clinic-skeleton-photo" />
            <span className="clinic-skeleton-line" />
          </li>
        ))}
      </ul>
    );
  } else if (error) {
    list = (
      <p className="clinic-list-message">
        The clinic list did not load. <Link to="/businesses">Open the clinic directory</Link>.
      </p>
    );
  } else if (clinics.length === 0) {
    list = <p className="clinic-list-message">No clinics are listed yet.</p>;
  } else {
    list = (
      <ul className="clinic-grid">
        {clinics.slice(0, CARD_LIMIT).map((clinic, i) => (
          <li key={clinic.id}>
            <Link
              to={`/businesses/${clinic.id}`}
              className={`clinic-card${activeId === clinic.id ? " active" : ""}`}
              onMouseEnter={() => setActiveId(clinic.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(clinic.id)}
              onBlur={() => setActiveId(null)}
            >
              <ClinicPhoto businessId={clinic.id} photoIndex={i} />
              <span className="clinic-card-name">{clinic.business_name}</span>
              <span className="clinic-card-address">{clinic.postal_address}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="ClinicDirectory">
      <div className="clinic-list-col">{list}</div>
      <div className="clinic-map-col">
        <div className="clinic-map-frame" role="region" aria-label="Map of clinic locations">
          <MapContainer
            center={TORONTO_CENTER}
            zoom={12}
            scrollWheelZoom={false}
            dragging={!L.Browser.mobile}
            className="clinic-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitToClinics clinics={mapped} />
            {mapped.map((clinic) => (
              <Marker
                key={clinic.id}
                position={[clinic.location!.lat, clinic.location!.lon]}
                icon={activeId === clinic.id ? ACTIVE_PIN : DEFAULT_PIN}
                zIndexOffset={activeId === clinic.id ? 1000 : 0}
                eventHandlers={{
                  click: () => navigate(`/businesses/${clinic.id}`),
                  mouseover: () => setActiveId(clinic.id),
                  mouseout: () => setActiveId(null),
                }}
              >
                <Tooltip direction="top" className="clinic-marker-tooltip">
                  {clinic.business_name}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
