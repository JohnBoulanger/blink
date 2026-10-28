import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

export interface MapPin {
  id: number;
  lat: number;
  lon: number;
  // short text on the pin, e.g. a rate range; empty draws a plain map pin
  label: string;
  // tooltip and accessible name
  title: string;
}

interface ClinicMapProps {
  pins: MapPin[];
  activeId?: number | null;
  onActiveChange?: (id: number | null) => void;
  onPinClick?: (id: number) => void;
  label: string;
  className?: string;
}

const TORONTO_CENTER: [number, number] = [43.6532, -79.3832];
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// a teardrop pin for pins without a label; pine marks the active clinic
function dropHtml(active: boolean) {
  const fill = active ? "#1f6f4a" : "#222222";
  return `<span class="clinic-map-drop${active ? " active" : ""}"><svg width="24" height="34" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 0C4.477 0 0 4.477 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.477 15.523 0 10 0z" fill="${fill}"/><circle cx="10" cy="10" r="3.5" fill="#fff"/></svg></span>`;
}

// icons are cached so a hover does not swap the marker element under the cursor
const iconCache = new Map<string, L.DivIcon>();
function pinIcon(label: string, active: boolean) {
  const key = `${label}|${active}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: "clinic-map-marker",
      html: label
        ? `<span class="clinic-map-pin${active ? " active" : ""}">${escapeHtml(label)}</span>`
        : dropHtml(active),
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      tooltipAnchor: [0, label ? -18 : -34],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

// frame the pins whenever the set of clinics changes
function FitToPins({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  // a string key, so a new array with the same pins does not reframe the map
  const key = JSON.stringify(pins.map((p) => [p.lat, p.lon]));
  useEffect(() => {
    const points = JSON.parse(key) as [number, number][];
    if (points.length === 1) map.setView(points[0], 14);
    else if (points.length > 1) map.fitBounds(points, { padding: [48, 48], maxZoom: 14 });
  }, [map, key]);
  return null;
}

// leaflet map of clinics with rate pins; the active pin turns pine
export default function ClinicMap({
  pins,
  activeId = null,
  onActiveChange,
  onPinClick,
  label,
  className = "",
}: ClinicMapProps) {
  return (
    <div className={`ClinicMap ${className}`} role="region" aria-label={label}>
      <MapContainer
        center={TORONTO_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        dragging={!L.Browser.mobile}
        className="clinic-map-canvas"
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
        <FitToPins pins={pins} />
        {pins.map((pin) => {
          const active = activeId === pin.id;
          return (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lon]}
              icon={pinIcon(pin.label, active)}
              title={pin.title}
              alt={pin.title}
              zIndexOffset={active ? 1000 : 0}
              eventHandlers={{
                click: () => onPinClick?.(pin.id),
                mouseover: () => onActiveChange?.(pin.id),
                mouseout: () => onActiveChange?.(null),
              }}
            >
              <Tooltip direction="top" className="clinic-map-tooltip">
                {pin.title}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
