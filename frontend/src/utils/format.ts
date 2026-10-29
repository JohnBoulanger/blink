// shared formatters for shift dates, hours and rates

const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const longDayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export function formatRate(min: number, max: number): string {
  const lo = Math.round(min);
  const hi = Math.round(max);
  return lo === hi ? `$${lo}` : `$${lo}–${hi}`;
}

export function formatDay(value: string): string {
  return dayFormat.format(new Date(value));
}

export function formatLongDay(value: string): string {
  return longDayFormat.format(new Date(value));
}

// 12-hour clock, e.g. "9:05 AM"
export function formatTime(value: string | Date): string {
  return timeFormat.format(new Date(value));
}

// a value for <input type="datetime-local"> in the viewer's own time zone
export function toDateTimeLocal(value: string | Date): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${timeFormat.format(new Date(start))}–${timeFormat.format(new Date(end))}`;
}

export function formatShiftWhen(start: string, end: string): string {
  return `${formatDay(start)} · ${formatTimeRange(start, end)}`;
}

// whole or half hours between two times, e.g. "8 hours"
export function formatDuration(start: string, end: string): string {
  const hours =
    Math.round(((new Date(end).getTime() - new Date(start).getTime()) / 3600000) * 2) / 2;
  if (hours <= 0) return "";
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
