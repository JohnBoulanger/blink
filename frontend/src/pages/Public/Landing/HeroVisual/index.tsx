import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../../../utils/api";
import "./style.css";

interface BusinessLocation {
  id: number;
  business_name: string;
  postal_address: string;
  location: { lat: number; lon: number };
}

// smaller pin svg wrapped in a span so css hover transform works
// (leaflet overrides transform on the outer div, so we scale the inner element)
const SMALL_PIN_HTML = `<span class="hero-marker-pin"><svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 0C4.477 0 0 4.477 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.477 15.523 0 10 0z" fill="#5C8DC5"/>
  <circle cx="10" cy="10" r="4" fill="#fff"/>
</svg></span>`;

// creates a div icon — hover animation targets the inner .hero-marker-pin
function createClinicIcon() {
  return L.divIcon({
    className: "hero-marker",
    html: SMALL_PIN_HTML,
    iconSize: [20, 28],
    iconAnchor: [10, 28],
    tooltipAnchor: [0, -28],
  });
}

// toronto center coordinates
const TORONTO_CENTER: [number, number] = [43.6532, -79.3832];
const DEFAULT_ZOOM = 12;

// fetches all businesses across pages to populate the map
async function fetchAllBusinesses(): Promise<BusinessLocation[]> {
  const all: BusinessLocation[] = [];
  let page = 1;
  const limit = 50;

  // paginate through all results
  while (true) {
    const res = await api.get("/businesses", {
      params: { page, limit, sort: "business_name", order: "asc" },
    });
    const results = res.data.results as BusinessLocation[];
    const validResults = results.filter(
      (b) => b.location && b.location.lat !== 0 && b.location.lon !== 0
    );
    all.push(...validResults);

    // stop when we've fetched all pages
    if (page * limit >= res.data.count) break;
    page += 1;
  }

  return all;
}

// individual marker that navigates to clinic page on click
function ClinicMarker({ clinic }: { clinic: BusinessLocation }) {
  const navigate = useNavigate();
  const icon = useMemo(() => createClinicIcon(), []);

  return (
    <Marker
      position={[clinic.location.lat, clinic.location.lon]}
      icon={icon}
      eventHandlers={{
        click: () => navigate(`/businesses/${clinic.id}`),
      }}
    >
      <Tooltip direction="top" className="hero-marker-tooltip">
        <strong>{clinic.business_name}</strong>
      </Tooltip>
    </Marker>
  );
}

// interactive map of all optometry clinics on the platform
export default function HeroVisual() {
  const [clinics, setClinics] = useState<BusinessLocation[]>([]);

  useEffect(() => {
    fetchAllBusinesses().then(setClinics).catch(() => {
      // silently degrade — hero still shows an empty map
    });
  }, []);

  return (
    <div className="hero-visual" aria-label="Map of optometry clinics in Toronto">
      <div className="hero-map-frame">
        <div className="hero-map-header">
          <span className="hero-map-dot" />
          <span className="hero-map-label">
            {clinics.length > 0
              ? `${clinics.length} clinics across Toronto`
              : "clinic locations"}
          </span>
        </div>
        <MapContainer
          center={TORONTO_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="hero-map-container"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {clinics.map((clinic) => (
            <ClinicMarker key={clinic.id} clinic={clinic} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
