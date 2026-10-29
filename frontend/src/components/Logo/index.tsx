import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import "./style.css";

export type LogoBlink = "loop" | "once" | "off";

interface LogoProps {
  // loop: blinks every few seconds; once: one blink per blinkKey change; off: still
  blink?: LogoBlink;
  // change this number to replay a single blink when blink is "once"
  blinkKey?: number;
  // mark height in px
  size?: number;
  wordmark?: boolean;
  // renders the logo as a link with the accessible name "Blink home"
  to?: string;
  className?: string;
  onClick?: () => void;
}

// blink a: only the upper lid moves; it closes onto the lower lid, holds and opens
const LID_OPEN = "M6 36 Q32 4 58 36";
const LID_CLOSED = "M6 31 Q32 54 58 31";
// close 160ms, hold 80ms, open 200ms
const BLINK_MS = 440;
const LOOP_MS = 4500;
const ONCE_DELAY_MS = 150;

function Mark({ size, blink, blinkKey }: { size: number; blink: LogoBlink; blinkKey: number }) {
  const lidAnim = useRef<SVGAnimateElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || blink === "off") return;
    // smil restarts on beginElement in chrome, firefox and safari
    const play = () => lidAnim.current?.beginElement();
    if (blink === "loop") {
      const id = window.setInterval(play, LOOP_MS);
      return () => window.clearInterval(id);
    }
    if (blinkKey > 0) {
      const id = window.setTimeout(play, ONCE_DELAY_MS);
      return () => window.clearTimeout(id);
    }
  }, [blink, blinkKey, reducedMotion]);

  return (
    <svg
      className="Logo-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path className="Logo-lower" d="M6 28 Q32 60 58 28" strokeWidth="7" />
      <path
        className="Logo-lower"
        d="M21.6 41.4 L18.1 48.6 M32 44 L32 52 M42.4 41.4 L45.9 48.6"
        strokeWidth="5"
      />
      <path className="Logo-upper" d={LID_OPEN} strokeWidth="7">
        {blink !== "off" && (
          <animate
            ref={lidAnim}
            attributeName="d"
            begin="indefinite"
            dur={`${BLINK_MS}ms`}
            keyTimes="0;0.3636;0.5455;1"
            values={`${LID_OPEN};${LID_CLOSED};${LID_CLOSED};${LID_OPEN}`}
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"
            fill="remove"
          />
        )}
      </path>
    </svg>
  );
}

export default function Logo({
  blink = "loop",
  blinkKey = 0,
  size = 30,
  wordmark = true,
  to,
  className = "",
  onClick,
}: LogoProps) {
  const content = (
    <>
      <Mark size={size} blink={blink} blinkKey={blinkKey} />
      {wordmark && (
        <span className="Logo-wordmark" style={{ fontSize: Math.round(size * 0.82) }}>
          blink
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`Logo ${className}`} aria-label="Blink home" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <span className={`Logo ${className}`} role="img" aria-label="Blink">
      {content}
    </span>
  );
}
