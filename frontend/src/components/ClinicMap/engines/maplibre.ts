import {
  AttributionControl,
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapEngine } from "../engine";

// the bundler moves the worker, so tell maplibre where it ended up
setWorkerUrl(workerUrl);

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const engine: MapEngine = {
  kind: "maplibre",
  createMap: (options) => new Map({ ...options, style: STYLE_URL }),
  Marker,
  Popup,
  LngLatBounds,
  NavigationControl,
  AttributionControl,
};
