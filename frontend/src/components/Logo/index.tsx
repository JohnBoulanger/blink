import { Link } from "react-router-dom";
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

function Mark({ size, blink, blinkKey }: { size: number; blink: LogoBlink; blinkKey: number }) {
  const playOnce = blink === "once" && blinkKey > 0;
  const motion = blink === "loop" ? " Logo-loop" : playOnce ? " Logo-once" : "";
  return (
    <svg
      // remounting restarts the single blink
      key={playOnce ? blinkKey : "mark"}
      className={`Logo-mark${motion}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <g className="Logo-upper">
        <path d="M6 36 Q32 4 58 36" stroke="#222222" strokeWidth="7" />
      </g>
      <g className="Logo-lower">
        <path d="M6 28 Q32 60 58 28" stroke="#1f6f4a" strokeWidth="7" />
        <path
          d="M21.6 41.4 L18.1 48.6 M32 44 L32 52 M42.4 41.4 L45.9 48.6"
          stroke="#1f6f4a"
          strokeWidth="5"
        />
      </g>
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
