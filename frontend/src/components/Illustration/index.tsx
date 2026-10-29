import type { ReactNode } from "react";
import "./style.css";

export type IllustrationName =
  | "storefront"
  | "verified-id"
  | "clock15"
  | "glasses"
  | "phoropter"
  | "eye-chart"
  | "calendar"
  | "clinic-pin";

interface IllustrationProps {
  name: IllustrationName;
  // rendered width and height in px
  size?: number;
  className?: string;
}

// 96 px grid, 3 px round stroke; ink draws the shape, the brand colour marks one detail
const DRAWINGS: Record<IllustrationName, ReactNode> = {
  storefront: (
    <>
      <g className="illus-ink">
        <path d="M16 22 H80 L84 34 H12 Z" />
        <path d="M18 42 V80 H78 V42" />
        <path d="M54 80 V56 H70 V80" />
        <path d="M26 52 H46 V68 H26 Z" />
        <path d="M8 80 H88" />
      </g>
      <g className="illus-brand">
        <path d="M12 34 Q18 42 24 34 Q30 42 36 34 Q42 42 48 34 Q54 42 60 34 Q66 42 72 34 Q78 42 84 34" />
        <circle cx="31" cy="61" r="3.5" />
        <circle cx="41" cy="61" r="3.5" />
        <path d="M34.5 60 H37.5" />
      </g>
    </>
  ),
  "verified-id": (
    <>
      <g className="illus-ink">
        <rect x="14" y="24" width="62" height="50" rx="8" />
        <path d="M38 24 V16 H52 V24" />
        <circle cx="32" cy="44" r="7" />
        <path d="M21 64 Q32 52 43 64" />
        <path d="M52 40 H66 M52 50 H62" />
      </g>
      <g className="illus-brand">
        <circle className="illus-badge" cx="72" cy="70" r="13" />
        <path d="M66 70 L70.5 74.5 L78 66" />
      </g>
    </>
  ),
  clock15: (
    <>
      <path className="illus-wedge" d="M48 54 V26 A28 28 0 0 1 76 54 Z" />
      <g className="illus-ink">
        <circle cx="48" cy="54" r="28" />
        <path d="M42 14 H54 M48 14 V26" />
        <path d="M72 30 L77 25" />
      </g>
      <g className="illus-brand">
        <path d="M48 54 V34" />
        <path d="M48 54 H64" />
      </g>
      <circle className="illus-dot" cx="48" cy="54" r="3" />
    </>
  ),
  glasses: (
    <>
      <g className="illus-ink">
        <path d="M12 44 Q12 34 22 34 H36 Q44 34 44 44 V48 Q44 60 32 60 H24 Q12 60 12 48 Z" />
        <path d="M84 44 Q84 34 74 34 H60 Q52 34 52 44 V48 Q52 60 64 60 H72 Q84 60 84 48 Z" />
        <path d="M44 42 Q48 37 52 42" />
        <path d="M12 40 L5 33 M84 40 L91 33" />
      </g>
      <g className="illus-brand">
        <path d="M20 41 L26 38" />
        <path d="M60 41 L66 38" />
      </g>
    </>
  ),
  phoropter: (
    <>
      <g className="illus-ink">
        <path d="M48 20 V36 M38 20 H58" />
        <path d="M14 40 H82" />
        <circle cx="30" cy="56" r="15" />
        <circle cx="66" cy="56" r="15" />
        <circle cx="30" cy="31" r="4" />
        <circle cx="66" cy="31" r="4" />
      </g>
      <g className="illus-brand">
        <circle cx="30" cy="56" r="6" />
        <circle cx="66" cy="56" r="6" />
      </g>
    </>
  ),
  "eye-chart": (
    <>
      <g className="illus-ink">
        <rect x="24" y="10" width="48" height="76" rx="6" />
        <path d="M40 22 H56 M40 22 V40 M40 31 H52 M40 40 H56" />
      </g>
      <g className="illus-brand">
        <path d="M36 54 H44 M52 54 H60" />
        <path d="M36 64 H40 M46 64 H50 M56 64 H60" />
      </g>
      <path className="illus-faint" d="M38 74 H58" />
    </>
  ),
  calendar: (
    <>
      <g className="illus-ink">
        <rect x="16" y="22" width="64" height="58" rx="8" />
        <path d="M32 14 V28 M64 14 V28" />
        <path d="M16 38 H80" />
      </g>
      <path className="illus-brand illus-check" d="M36 60 L44 68 L62 50" />
    </>
  ),
  "clinic-pin": (
    <>
      <path
        className="illus-ink"
        d="M48 86 C48 86 22 60 22 40 A26 26 0 0 1 74 40 C74 60 48 86 48 86 Z"
      />
      <path className="illus-ink" d="M34 42 Q48 30 62 42" />
      <path className="illus-brand" d="M34 40 Q48 54 62 40" />
      <path className="illus-brand illus-lashes" d="M42 49 L41 53 M48 51 L48 55 M54 49 L55 53" />
    </>
  ),
};

// decorative spot drawing; the text beside it carries the meaning
export default function Illustration({ name, size = 112, className = "" }: IllustrationProps) {
  return (
    <svg
      className={`Illustration ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
    >
      {DRAWINGS[name]}
    </svg>
  );
}
