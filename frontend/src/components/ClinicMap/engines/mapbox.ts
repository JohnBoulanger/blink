import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapEngine } from "../engine";

const STYLE_URL = "mapbox://styles/mapbox/standard";

// mapbox standard config: a flat, calm daytime map where the price pills stay the loudest thing
const BASEMAP_CONFIG = {
  lightPreset: "day",
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showRoadLabels: true,
  showPlaceLabels: true,
  showLandmarkIcons: false,
  show3dObjects: false,
  show3dBuildings: false,
  show3dTrees: false,
  show3dLandmarks: false,
  show3dFacades: false,
  showAdminBoundaries: false,
  // neutral land and quiet roads, a natural soft green for parks, a clear pale blue for water
  colorLand: "hsl(40, 14%, 97%)",
  colorBuildings: "hsl(40, 10%, 94%)",
  colorCommercial: "hsl(40, 14%, 95%)",
  colorEducation: "hsl(40, 14%, 95%)",
  colorMedical: "hsl(40, 14%, 95%)",
  colorIndustrial: "hsl(220, 8%, 94%)",
  colorGreenspace: "hsl(110, 30%, 87%)",
  colorWater: "hsl(205, 58%, 86%)",
  colorRoads: "hsl(220, 8%, 88%)",
  colorTrunks: "hsl(220, 7%, 84%)",
  colorMotorways: "hsl(220, 7%, 81%)",
  colorRoadLabels: "hsl(220, 6%, 40%)",
};

export function createEngine(accessToken: string): MapEngine {
  return {
    kind: "mapbox",
    createMap: (options) =>
      // same calls as maplibre for everything the map uses
      new mapboxgl.Map({
        ...options,
        accessToken,
        style: STYLE_URL,
        config: { basemap: BASEMAP_CONFIG },
        projection: "mercator",
        pitch: 0,
        maxPitch: 0,
        logoPosition: "bottom-left",
      }) as unknown as ReturnType<MapEngine["createMap"]>,
    Marker: mapboxgl.Marker as unknown as MapEngine["Marker"],
    Popup: mapboxgl.Popup as unknown as MapEngine["Popup"],
    LngLatBounds: mapboxgl.LngLatBounds as unknown as MapEngine["LngLatBounds"],
    NavigationControl: mapboxgl.NavigationControl as unknown as MapEngine["NavigationControl"],
    AttributionControl: mapboxgl.AttributionControl as unknown as MapEngine["AttributionControl"],
  };
}
