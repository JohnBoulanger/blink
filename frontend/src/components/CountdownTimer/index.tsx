import "./style.css";

interface CountdownTimerProps {
  seconds: number;
  label?: string;
  // seconds at or below which the timer turns urgent
  urgentAt?: number;
  size?: "md" | "lg";
  // length of the whole window, one dot per minute
  totalSeconds?: number;
  // the clock no longer runs, so the current minute stops pulsing
  stopped?: boolean;
}

export default function CountdownTimer({
  seconds,
  label,
  urgentAt = 120,
  size = "md",
  totalSeconds = 15 * 60,
  stopped = false,
}: CountdownTimerProps) {
  const safe = Math.max(0, Math.floor(seconds));
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const minutesLeft = Math.min(totalMinutes, Math.ceil(safe / 60));
  const urgent = safe > 0 && safe <= urgentAt;
  const classes = ["CountdownTimer", `CountdownTimer-${size}`];
  if (urgent) classes.push("CountdownTimer-urgent");
  if (stopped) classes.push("CountdownTimer-stopped");

  const summary =
    safe === 0
      ? "Time is up"
      : safe < 60
        ? `Under a minute of ${totalMinutes} left`
        : `${minutesLeft} of ${totalMinutes} minutes left`;

  return (
    <div
      className={classes.join(" ")}
      role="timer"
      aria-label={`${Math.floor(safe / 60)} minutes ${safe % 60} seconds remaining`}
    >
      {label && <span className="countdown-label">{label}</span>}
      <span className="countdown-dots" aria-hidden="true">
        {Array.from({ length: totalMinutes }, (_, i) => {
          const state =
            i < minutesLeft - 1 ? "left" : i === minutesLeft - 1 ? "current" : "elapsed";
          return <span key={i} className={`countdown-dot countdown-dot-${state}`} />;
        })}
      </span>
      <span className="countdown-value">{summary}</span>
    </div>
  );
}
