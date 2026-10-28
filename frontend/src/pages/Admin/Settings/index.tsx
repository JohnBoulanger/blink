import { useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import "./style.css";

// each system setting — endpoint, label, display unit, and multiplier to convert to native api unit
interface SettingConfig {
  key: string;
  endpoint: string;
  field: string;
  label: string;
  description: string;
  unit: "minutes" | "days";
  // multiplier converts the display value to the native unit the backend service expects
  multiplier: number;
  min: number;
}

const SETTINGS: SettingConfig[] = [
  {
    key: "negotiation_window",
    endpoint: "/system/negotiation-window",
    field: "negotiation_window",
    label: "Negotiation window",
    description: "How long each negotiation stays active before expiring.",
    unit: "minutes",
    multiplier: 60_000, // minutes → milliseconds (service uses ms arithmetic)
    min: 1,
  },
  {
    key: "reset_cooldown",
    endpoint: "/system/reset-cooldown",
    field: "reset_cooldown",
    label: "Password reset cooldown",
    description: "Minimum time between activation / reset token requests.",
    unit: "minutes",
    multiplier: 60, // minutes → seconds (service compares elapsed seconds)
    min: 0,
  },
  {
    key: "job_start_window",
    endpoint: "/system/job-start-window",
    field: "job_start_window",
    label: "Job start window",
    description: "How close to shift start a no-show can be reported.",
    unit: "days",
    multiplier: 1, // days → days (service converts days to ms internally)
    min: 1,
  },
  {
    key: "availability_timeout",
    endpoint: "/system/availability-timeout",
    field: "availability_timeout",
    label: "Availability timeout",
    description: "Inactivity period after which a user is no longer discoverable.",
    unit: "days",
    multiplier: 86_400, // days → seconds (service compares elapsed seconds)
    min: 1,
  },
];

interface SettingState {
  value: string; // display value (string for input)
  saving: boolean;
  saved: boolean;
  error: string;
}

const DEFAULT_STATE: SettingState = { value: "", saving: false, saved: false, error: "" };

export default function AdminSettings() {
  // each setting has its own independent state
  const [states, setStates] = useState<Record<string, SettingState>>(
    Object.fromEntries(SETTINGS.map((s) => [s.key, { ...DEFAULT_STATE }]))
  );

  function updateState(key: string, patch: Partial<SettingState>) {
    setStates((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  async function handleSave(cfg: SettingConfig) {
    const raw = parseFloat(states[cfg.key].value);
    if (isNaN(raw) || raw < cfg.min) {
      updateState(cfg.key, { error: `Must be at least ${cfg.min} ${cfg.unit}.` });
      return;
    }
    // convert display unit to the native unit the backend service expects
    const nativeValue = raw * cfg.multiplier;
    updateState(cfg.key, { saving: true, error: "", saved: false });
    try {
      await api.patch(cfg.endpoint, { [cfg.field]: nativeValue });
      updateState(cfg.key, { saving: false, saved: true, value: String(raw) });
      // clear the "saved" checkmark after 2s
      setTimeout(() => updateState(cfg.key, { saved: false }), 2000);
    } catch (err) {
      updateState(cfg.key, {
        saving: false,
        error: axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to save."
          : "Failed to save.",
      });
    }
  }

  return (
    <div className="AdminSettings page-enter">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Settings</h1>
          <p className="page-subtitle">
            Platform-wide timing rules. The server does not report current values, so each field
            starts empty. Enter a new value and save it.
          </p>
        </div>
      </header>

      <ul className="row-list as-list">
        {SETTINGS.map((cfg) => {
          const s = states[cfg.key];
          const inputId = `as-${cfg.key}`;
          const errorId = `${inputId}-error`;
          return (
            <li key={cfg.key} className="as-row">
              <div className="as-text">
                <label htmlFor={inputId} className="as-label">
                  {cfg.label}
                </label>
                <p className="as-description" id={`${inputId}-desc`}>
                  {cfg.description}
                </p>
              </div>

              <div className="as-control">
                <div className="as-input-wrap">
                  <input
                    id={inputId}
                    type="number"
                    min={cfg.min}
                    step={1}
                    inputMode="numeric"
                    placeholder={cfg.unit === "days" ? "e.g. 7" : "e.g. 15"}
                    value={s.value}
                    onChange={(e) =>
                      updateState(cfg.key, { value: e.target.value, error: "", saved: false })
                    }
                    aria-invalid={s.error ? true : undefined}
                    aria-describedby={s.error ? errorId : `${inputId}-desc`}
                    className="as-input"
                  />
                  <span className="as-unit">{cfg.unit}</span>
                </div>
                <button
                  type="button"
                  className="btn-primary as-save"
                  disabled={s.saving || !s.value}
                  onClick={() => handleSave(cfg)}
                >
                  {s.saving ? "Saving…" : "Save"}
                </button>
                <span className="as-saved" role="status">
                  {s.saved && (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12.5l4.5 4.5L19 7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Saved
                    </>
                  )}
                </span>
              </div>

              {s.error && (
                <p className="field-error as-error" id={errorId}>
                  {s.error}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
