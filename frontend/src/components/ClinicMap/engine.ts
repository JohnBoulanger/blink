import type {
  AttributionControl,
  LngLatBounds,
  Map as EngineMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";

// mapbox-gl and maplibre-gl share one API for every call the map makes,
// so the maplibre types describe both; these imports are types only
export type { EngineMap };

// options that mean the same thing in both libraries
export interface SharedMapOptions {
  container: HTMLElement;
  center: [number, number];
  zoom: number;
  maxZoom: number;
  attributionControl: false;
  scrollZoom: boolean;
  dragRotate: boolean;
  pitchWithRotate: boolean;
  touchPitch: boolean;
  dragPan: boolean;
}

export interface MapEngine {
  kind: "mapbox" | "maplibre";
  createMap: (options: SharedMapOptions) => EngineMap;
  Marker: typeof Marker;
  Popup: typeof Popup;
  LngLatBounds: typeof LngLatBounds;
  NavigationControl: typeof NavigationControl;
  AttributionControl: typeof AttributionControl;
}

const MAPBOX_TOKEN: string = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

let pending: Promise<MapEngine> | null = null;

// mapbox with a token, maplibre on openfreemap without one; only that library's chunk loads
export function loadEngine() {
  pending ??= MAPBOX_TOKEN
    ? import("./engines/mapbox").then((m) => m.createEngine(MAPBOX_TOKEN))
    : import("./engines/maplibre").then((m) => m.engine);
  return pending;
}
