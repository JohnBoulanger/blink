import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import AuthCard from "../../../components/AuthCard";
import "./style.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  // the unknown-email error belongs to the field
  const [emailError, setEmailError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setEmailError("");
    setStatus("loading");
    try {
      const response = await api.post("/auth/resets", { email });
      // navigate directly to reset page — don't expose the token in UI
      navigate(`/reset-password/${response.data.resetToken}`);
    } catch (err) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 429) {
          setError("Too many requests. Please wait before trying again.");
        } else if (code === 404) {
          setEmailError("No account found with this email.");
        } else {
          setError(err.response?.data?.error || "Request failed");
        }
      } else {
        setError("Request failed");
      }
    }
  }

  return (
    <AuthCard
      className="ForgotPassword"
      title="Reset your password"
      subtitle="Enter your account email to choose a new password."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="form-field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "forgot-email-error" : undefined}
            required
          />
          {emailError && (
            <p className="field-error" id="forgot-email-error">
              {emailError}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={status === "loading"}>
          {status === "loading" && <span className="btn-spinner" aria-hidden="true" />}
          {status === "loading" ? "Sending…" : "Continue"}
        </button>
      </form>
    </AuthCard>
  );
}
