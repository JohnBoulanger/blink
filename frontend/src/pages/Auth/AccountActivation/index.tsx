import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import AuthCard from "../../../components/AuthCard";
import "./style.css";

export default function AccountActivation() {
  const { resetToken } = useParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      // activate account — no password needed
      await api.post(`/auth/resets/${resetToken}`, { email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 410) {
          setError("This activation link has expired. Request a new one below.");
        } else {
          setError(err.response?.data?.error || "Activation failed");
        }
      } else {
        setError("Activation failed");
      }
    }
  }

  if (status === "success") {
    return (
      <AuthCard className="AccountActivation" title="Account activated">
        <div className="auth-success" role="status">
          <p>Your account is ready to use.</p>
          <Link to="/login" className="btn-primary">
            Sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      className="AccountActivation"
      title="Activate your account"
      subtitle="Confirm the email you registered with."
      footer={
        <p>
          Link expired? <Link to="/forgot-password">Request a new one</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="form-field">
          <label htmlFor="activate-email">Email</label>
          <input
            id="activate-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={status === "loading"}>
          {status === "loading" && <span className="btn-spinner" aria-hidden="true" />}
          {status === "loading" ? "Activating…" : "Activate account"}
        </button>
      </form>
    </AuthCard>
  );
}
