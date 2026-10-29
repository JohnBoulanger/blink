import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import ClinicPhoto from "../ClinicPhoto";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import type { ClinicMapProps, MapPin } from ".";
import { loadEngine, type EngineMap, type MapEngine } from "./engine";

const TORONTO: [number, number] = [-79.3832, 43.6532];
// below this zoom, pins closer than the radius merge into one bubble
const CLUSTER_MAX_ZOOM = 15;
const SINGLE_ZOOM = 15;
const STACK_GAP = 34;

interface Group {
  key: string;
  members: MapPin[];
  lng: number;
  lat: number;
  // pills at the same address stack upward so each stays readable
  offsetY: number;
}

// marker elements live outside react; their contents render through portals
class MarkerElements {
  private els = new Map<string, HTMLDivElement>();

  get(key: string) {
    let el = this.els.get(key);
    if (!el) {
      el = document.createElement("div");
      el.className = "map-marker";
      this.els.set(key, el);
    }
    return el;
  }

  find(key: string) {
    return this.els.get(key);
  }

  drop(key: string) {
    this.els.delete(key);
  }
}

function sameSpot(a: MapPin, b: MapPin) {
  return a.lat === b.lat && a.lon === b.lon;
}

// a cluster bubble is wider than the grouping radius, so these sizes catch overlaps it misses
const CLUSTER_WIDTH = 88;
const MARKER_HEIGHT = 34;

function centre(members: MapPin[]) {
  return {
    lng: members.reduce((sum, m) => sum + m.lon, 0) / members.length,
    lat: members.reduce((sum, m) => sum + m.lat, 0) / members.length,
  };
}

// greedy grouping in screen space, recomputed after each zoom
function buildGroups(map: EngineMap, pins: MapPin[], radius: number, pinWidth: number): Group[] {
  const points = pins.map((pin) => ({ pin, pt: map.project([pin.lon, pin.lat]) }));
  const clustering = map.getZoom() < CLUSTER_MAX_ZOOM;
  const used = new Set<number>();
  const sets: MapPin[][] = [];
  points.forEach((seed, i) => {
    if (used.has(i)) return;
    used.add(i);
    const members = [seed.pin];
    if (clustering) {
      points.forEach((other, j) => {
        if (used.has(j)) return;
        if (seed.pt.dist(other.pt) < radius) {
          used.add(j);
          members.push(other.pin);
        }
      });
    }
    sets.push(members);
  });
  // a cluster that would cover a neighbour absorbs it
  const width = (members: MapPin[]) => (members.length > 1 ? CLUSTER_WIDTH : pinWidth);
  let merging = clustering;
  while (merging) {
    merging = false;
    const spots = sets.map((members) => {
      const c = centre(members);
      return map.project([c.lng, c.lat]);
    });
    search: for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        if (sets[i].length === 1 && sets[j].length === 1) continue;
        const overlapX = Math.abs(spots[i].x - spots[j].x) < (width(sets[i]) + width(sets[j])) / 2;
        const overlapY = Math.abs(spots[i].y - spots[j].y) < MARKER_HEIGHT;
        if (overlapX && overlapY) {
          sets[i] = sets[i].concat(sets[j]);
          sets.splice(j, 1);
          merging = true;
          break search;
        }
      }
    }
  }
  const groups: Group[] = sets.map((members) => ({
    key: members.length > 1 ? `c${members.map((m) => m.id).join("-")}` : `p${members[0].id}`,
    members,
    ...centre(members),
    offsetY: 0,
  }));
  // zoomed in, pins at one address fan out vertically
  const singles = groups.filter((g) => g.members.length === 1);
  singles.forEach((g) => {
    const twins = singles.filter((o) => sameSpot(o.members[0], g.members[0]));
    if (twins.length < 2) return;
    const index = twins.indexOf(g);
    g.offsetY = (index - (twins.length - 1) / 2) * -STACK_GAP;
  });
  return groups;
}

export default function MapCanvas({
  pins,
  variant,
  activeId = null,
  onActiveChange,
  clusterNoun = ["pin", "pins"],
  touchPan = true,
  fitPadding,
}: ClinicMapProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<EngineMap | null>(null);
  // the library behind the map, set once it loads
  const engineRef = useRef<MapEngine | null>(null);
  // bumps after each zoom, since grouping depends on pixel distances
  const [zoomTick, setZoomTick] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const [elements] = useState(() => new MarkerElements());
  const markers = useRef(new Map<string, InstanceType<MapEngine["Marker"]>>());
  const cardEl = useMemo(() => document.createElement("div"), []);
  const popupRef = useRef<InstanceType<MapEngine["Popup"]> | null>(null);
  // the pin that opened the card, so focus can return to it
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const focusCardRef = useRef(false);
  const pinsRef = useRef(pins);
  const fitPaddingRef = useRef(fitPadding);
  useLayoutEffect(() => {
    pinsRef.current = pins;
    fitPaddingRef.current = fitPadding;
  }, [pins, fitPadding]);

  const radius = variant === "price" ? 44 : 22;
  // rough marker width: a rate pill, or the 28px dot target
  const pinWidth = variant === "price" ? 76 : 28;

  // create the map once the library loads
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let teardown: (() => void) | null = null;
    loadEngine().then((engine) => {
      if (cancelled) return;
      engineRef.current = engine;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const instance = engine.createMap({
        container,
        center: TORONTO,
        zoom: 12,
        maxZoom: 18,
        attributionControl: false,
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        dragPan: touchPan || !coarse,
      });
      instance.touchZoomRotate.disableRotation();
      instance.addControl(new engine.NavigationControl({ showCompass: false }), "top-right");
      instance.addControl(new engine.AttributionControl({ compact: false }), "bottom-right");
      // the container can settle after the map starts (lazy chunk, grid column), so follow its size
      const observer = new ResizeObserver(() => instance.resize());
      observer.observe(container);
      instance.on("load", () => {
        instance.resize();
        setMap(instance);
      });
      instance.on("zoomend", () => setZoomTick((t) => t + 1));
      // lets screenshots and tests wait for the tiles
      instance.on("idle", () => container.setAttribute("data-map-idle", "true"));
      instance.on("dataloading", () => container.removeAttribute("data-map-idle"));
      // a click on the map itself closes the card
      instance.on("click", (e) => {
        const target = e.originalEvent.target as Element | null;
        if (!target?.closest(".map-marker, .map-card-popup")) setOpenId(null);
      });
      const placed = markers.current;
      teardown = () => {
        observer.disconnect();
        for (const marker of placed.values()) marker.remove();
        placed.clear();
        popupRef.current = null;
        instance.remove();
        setMap(null);
      };
    });
    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [touchPan]);

  // frame the pins whenever the set of places changes
  const placesKey = pins.map((p) => `${p.lat},${p.lon}`).join("|");
  // a new padding object each render must not refit the map, so compare by value
  const paddingKey = fitPadding ? Object.values(fitPadding).join(",") : "";
  useEffect(() => {
    const engine = engineRef.current;
    if (!map || !engine) return;
    const current = pinsRef.current;
    if (current.length === 0) {
      map.jumpTo({ center: TORONTO, zoom: 12 });
    } else if (current.every((p) => sameSpot(p, current[0]))) {
      map.jumpTo({ center: [current[0].lon, current[0].lat], zoom: SINGLE_ZOOM });
    } else {
      const bounds = new engine.LngLatBounds();
      for (const p of current) bounds.extend([p.lon, p.lat]);
      map.fitBounds(bounds, {
        padding: fitPaddingRef.current ?? 56,
        maxZoom: 14,
        animate: false,
      });
    }
  }, [map, placesKey, paddingKey]);

  const groups = useMemo(
    () => (map ? buildGroups(map, pins, radius, pinWidth) : []),
    // zoomTick re-reads the map's zoom
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, pins, radius, pinWidth, zoomTick]
  );

  // the open card closes when its pin leaves the results
  const openPin = pins.find((p) => p.id === openId) ?? null;

  // place markers for the current groups and drop stale ones
  useEffect(() => {
    const engine = engineRef.current;
    if (!map || !engine) return;
    const live = new Set(groups.map((g) => g.key));
    for (const [key, marker] of markers.current) {
      if (!live.has(key)) {
        marker.remove();
        markers.current.delete(key);
        elements.drop(key);
      }
    }
    for (const g of groups) {
      const el = elements.find(g.key);
      if (!el) continue;
      let marker = markers.current.get(g.key);
      if (!marker) {
        marker = new engine.Marker({ element: el, anchor: "center" })
          .setLngLat([g.lng, g.lat])
          .addTo(map);
        markers.current.set(g.key, marker);
      }
      marker.setLngLat([g.lng, g.lat]);
      marker.setOffset([0, g.offsetY]);
      const raised = g.members.some((m) => m.id === activeId || m.id === openId);
      el.style.zIndex = raised ? "3" : g.members.length > 1 ? "2" : "1";
    }
  }, [map, groups, activeId, openId, elements]);

  // show or move the card
  useEffect(() => {
    const engine = engineRef.current;
    if (!map || !engine) return;
    if (!openPin) {
      popupRef.current?.remove();
      popupRef.current = null;
      return;
    }
    let popup = popupRef.current;
    if (!popup) {
      popup = new engine.Popup({
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        maxWidth: "none",
        anchor: "bottom",
        offset: variant === "price" ? 20 : 14,
        className: "map-card-popup",
      });
      popup.setDOMContent(cardEl);
      popupRef.current = popup;
    }
    popup.setLngLat([openPin.lon, openPin.lat]);
    if (!popup.isOpen()) {
      popup.addTo(map);
      // nudge the map so the whole card sits inside it
      const card = popup.getElement();
      requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        const frame = map.getContainer().getBoundingClientRect();
        const gap = 12;
        const dx =
          Math.min(0, frame.right - gap - box.right) || Math.max(0, frame.left + gap - box.left);
        const dy =
          Math.min(0, frame.bottom - gap - box.bottom) || Math.max(0, frame.top + gap - box.top);
        if (dx || dy) map.panBy([-dx, -dy], { animate: !reducedMotion });
      });
    }
    if (focusCardRef.current) {
      focusCardRef.current = false;
      requestAnimationFrame(() => cardEl.querySelector<HTMLElement>("a")?.focus());
    }
  }, [map, openPin, cardEl, variant, reducedMotion]);

  function closeCard() {
    setOpenId(null);
    triggerRef.current?.focus();
  }

  function openCard(pin: MapPin, e: React.MouseEvent<HTMLButtonElement>) {
    triggerRef.current = e.currentTarget;
    // a keyboard press reports zero clicks; send focus into the card
    focusCardRef.current = e.detail === 0;
    setOpenId((current) => (current === pin.id ? null : pin.id));
  }

  function zoomInto(group: Group) {
    const engine = engineRef.current;
    if (!map || !engine) return;
    const allSame = group.members.every((m) => sameSpot(m, group.members[0]));
    if (allSame) {
      map.easeTo({
        center: [group.lng, group.lat],
        zoom: Math.max(CLUSTER_MAX_ZOOM, map.getZoom() + 1),
        animate: !reducedMotion,
      });
      return;
    }
    const bounds = new engine.LngLatBounds();
    for (const m of group.members) bounds.extend([m.lon, m.lat]);
    map.fitBounds(bounds, { padding: 72, maxZoom: 16, animate: !reducedMotion });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && openId !== null) {
      e.stopPropagation();
      closeCard();
    }
  }

  const hover = (id: number | null) => onActiveChange?.(id);

  return (
    <div className="clinic-map-canvas" ref={containerRef} onKeyDown={onKeyDown}>
      {map &&
        groups.map((g) => {
          const el = elements.get(g.key);
          if (g.members.length > 1) {
            const n = g.members.length;
            const noun = n === 1 ? clusterNoun[0] : clusterNoun[1];
            const active = g.members.some((m) => m.id === activeId);
            return createPortal(
              <button
                type="button"
                className={`map-cluster${active ? " active" : ""}`}
                aria-label={`${n} ${noun} here. Zoom in to see each one.`}
                onClick={() => zoomInto(g)}
              >
                <span className="tabular">{n}</span> {noun}
              </button>,
              el,
              g.key
            );
          }
          const pin = g.members[0];
          const active = pin.id === activeId || pin.id === openId;
          const handlers = {
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => openCard(pin, e),
            onMouseEnter: () => hover(pin.id),
            onMouseLeave: () => hover(null),
            onFocus: () => hover(pin.id),
            onBlur: () => hover(null),
          };
          return createPortal(
            variant === "price" ? (
              <button
                type="button"
                className={`map-pill tabular${active ? " active" : ""}`}
                aria-label={pin.title}
                aria-expanded={openId === pin.id}
                {...handlers}
              >
                {pin.label}
              </button>
            ) : (
              <button
                type="button"
                className={`map-dot${active ? " active" : ""}`}
                aria-label={pin.title}
                aria-expanded={openId === pin.id}
                {...handlers}
              >
                <span className="map-dot-mark" />
                <span className="map-dot-name" aria-hidden="true">
                  {pin.title}
                </span>
              </button>
            ),
            el,
            g.key
          );
        })}
      {openPin &&
        createPortal(
          <div className="map-card">
            <ClinicPhoto
              businessId={openPin.card.businessId}
              businessName={openPin.card.businessName}
              className="map-card-photo"
            />
            <div className="map-card-body">
              <p className="map-card-title">{openPin.card.businessName}</p>
              {openPin.card.lines.map((line) => (
                <p key={line} className="map-card-meta tabular">
                  {line}
                </p>
              ))}
              {openPin.card.rate && (
                <p className="map-card-rate tabular">
                  <strong>{openPin.card.rate}</strong> /hr
                </p>
              )}
              <Link to={openPin.card.to} onClick={openPin.card.onOpen} className="map-card-link">
                {openPin.card.linkLabel}
              </Link>
            </div>
            <button
              type="button"
              className="map-card-close"
              aria-label="Close card"
              onClick={closeCard}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>,
          cardEl
        )}
    </div>
  );
}
