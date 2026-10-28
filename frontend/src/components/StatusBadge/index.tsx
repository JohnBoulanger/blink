import "./style.css";

// legacy tone names stay valid so existing callers keep working
export type StatusTone =
  | "live"
  | "success"
  | "pending"
  | "ended"
  | "neutral"
  | "accent"
  | "warning"
  | "danger";

interface StatusBadgeProps {
  tone?: StatusTone;
  // kept for compatibility; every status now shows a dot
  dot?: boolean;
  children: React.ReactNode;
}

const TONE_MAP: Record<StatusTone, "live" | "success" | "pending" | "ended"> = {
  live: "live",
  accent: "live",
  success: "success",
  pending: "pending",
  warning: "pending",
  neutral: "pending",
  ended: "ended",
  danger: "ended",
};

export default function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  const resolved = TONE_MAP[tone];
  return (
    <span className={`StatusBadge StatusBadge-${resolved}`}>
      <span className="StatusBadge-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
