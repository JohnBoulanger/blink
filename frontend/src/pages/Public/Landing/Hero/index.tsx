import { useEffect, useRef } from "react";
import ShiftSearch from "../ShiftSearch";
import DemoLinks from "../DemoLinks";
import type { Clinic, PositionType } from "../types";
import "./style.css";

interface HeroProps {
  clinics: Clinic[];
  positionTypes: PositionType[];
  loading: boolean;
}

// scroll distance over which the eyelid curve flattens
const CLOSE_DISTANCE = 300;

// browsers without scroll-driven animations get a progress variable from a passive listener
function useEyelidFallback(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const supported = typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (supported || reduced) return;

    el.dataset.lid = "js";
    let frame = 0;
    function update() {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / CLOSE_DISTANCE));
      el!.style.setProperty("--lid-progress", progress.toFixed(3));
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      delete el.dataset.lid;
    };
  }, [ref]);
}

export default function Hero({ clinics, positionTypes, loading }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  useEyelidFallback(heroRef);

  return (
    <section className="Hero" ref={heroRef} aria-labelledby="landing-title">
      <div className="hero-lid" aria-hidden="true" />
      <div className="container hero-inner">
        <h1 id="landing-title">
          <span className="hero-line">Clinics and eye care pros,</span>{" "}
          <span className="hero-line">matched in the blink of an eye.</span>
        </h1>
        <p className="hero-subcopy">Verified staff. One live, 15-minute negotiation per shift.</p>
        <ShiftSearch clinics={clinics} positionTypes={positionTypes} loading={loading} />
        <DemoLinks id="demo" />
      </div>
    </section>
  );
}
