import type { StatusTone } from "../components/StatusBadge";

// raw api statuses mapped to a dot tone and a readable label
export interface StatusInfo {
  label: string;
  tone: StatusTone;
}

export const JOB_STATUS: Record<string, StatusInfo> = {
  open: { label: "Open", tone: "pending" },
  filled: { label: "Filled", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  expired: { label: "Expired", tone: "ended" },
  cancelled: { label: "Cancelled", tone: "ended" },
};

export const QUAL_STATUS: Record<string, StatusInfo> = {
  created: { label: "Not submitted", tone: "pending" },
  submitted: { label: "In review", tone: "pending" },
  revised: { label: "Resubmitted", tone: "pending" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "ended" },
};

// unknown values fall back to a pending dot with the raw label
export function getStatus(map: Record<string, StatusInfo>, value: string): StatusInfo {
  return map[value] ?? { label: value, tone: "pending" };
}
