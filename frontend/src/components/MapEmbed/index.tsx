import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

// custom svg pin marker in harbor blue
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#5C8DC5"/>
    <circle cx="14" cy="14" r="6" fill="#fff"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

// openstreetmap standard tiles
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// syncs map view when lat/lon/zoom props change (MapContainer ignores prop updates)
function MapUpdater({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], zoom);
  }, [map, lat, lon, zoom]);
  return null;
}

interface MapEmbedProps {
  lat: number;
  lon: number;
  zoom?: number;
}

// embeds a leaflet map centered on the given coordinates
export default function MapEmbed({ lat, lon, zoom = 15 }: MapEmbedProps) {
  return (
    <div className="map-embed">
      <MapContainer
        center={[lat, lon]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="map-container"
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
        <Marker position={[lat, lon]} icon={pinIcon} />
        <MapUpdater lat={lat} lon={lon} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
