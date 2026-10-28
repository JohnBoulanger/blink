import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import AuthCard from "../../../components/AuthCard";
import PasswordInput from "../../../components/PasswordInput";
import "./style.css";

// password must match backend validation
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}~|]).{8,20}$/;

export default function ResetPassword() {
  const { resetToken } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  // client-side checks point at the field they belong to
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setPasswordError("");
    setConfirmError("");

    // client-side validation
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError(
        "Password must be 8–20 characters with uppercase, lowercase, digit, and special character."
      );
      return;
    }

    setStatus("loading");
    try {
      await api.post(`/auth/resets/${resetToken}`, { email, password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 410) {
          setError("This reset link has expired. Request a new one.");
        } else {
          setError(err.response?.data?.error || "Reset failed");
        }
      } else {
        setError("Reset failed");
      }
    }
  }

  if (status === "success") {
    return (
      <AuthCard className="ResetPassword" title="Password updated">
        <div className="auth-success" role="status">
          <p>Your password has been updated. Sign in with the new one.</p>
          <Link to="/login" className="btn-primary">
            Sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      className="ResetPassword"
      title="Choose a new password"
      subtitle="Confirm your email, then set the new password."
      footer={<Link to="/forgot-password">Request a new link</Link>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="form-field">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="reset-password">New password</label>
          <PasswordInput
            id="reset-password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            invalid={Boolean(passwordError)}
            describedBy={passwordError ? "reset-password-error" : "reset-password-hint"}
            required
          />
          {passwordError ? (
            <p className="field-error" id="reset-password-error">
              {passwordError}
            </p>
          ) : (
            <p className="field-hint" id="reset-password-hint">
              8–20 characters with an uppercase letter, a lowercase letter, a digit and a symbol.
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="reset-confirm">Confirm new password</label>
          <PasswordInput
            id="reset-confirm"
            placeholder=""
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            invalid={Boolean(confirmError)}
            describedBy={confirmError ? "reset-confirm-error" : undefined}
            required
          />
          {confirmError && (
            <p className="field-error" id="reset-confirm-error">
              {confirmError}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={status === "loading"}>
          {status === "loading" && <span className="btn-spinner" aria-hidden="true" />}
          {status === "loading" ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}
