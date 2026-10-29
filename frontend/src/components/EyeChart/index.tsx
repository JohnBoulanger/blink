import "./style.css";

interface EyeChartProps {
  // empty: above a zero-result message; badge: a small tile beside a heading
  variant?: "empty" | "badge";
  className?: string;
}

// three shrinking eye-chart lines, decorative only
export default function EyeChart({ variant = "empty", className = "" }: EyeChartProps) {
  return (
    <div className={`EyeChart EyeChart-${variant} ${className}`.trim()} aria-hidden="true">
      <span className="eyechart-line eyechart-line-1">E</span>
      <span className="eyechart-line eyechart-line-2">F P</span>
      <span className="eyechart-line eyechart-line-3">T O Z</span>
    </div>
  );
}
