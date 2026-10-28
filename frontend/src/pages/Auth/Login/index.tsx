import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import AuthCard from "../../../components/AuthCard";
import PasswordInput from "../../../components/PasswordInput";
import useDemoLogin, { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../../Public/Landing/useDemoLogin";
import "./style.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const demo = useDemoLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notActivated, setNotActivated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setNotActivated(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      const message = (err as Error).message;
      // detect "not activated" from backend 403 response
      if (message.toLowerCase().includes("not activated")) {
        setNotActivated(true);
        setError("Your account is not yet activated.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      className="Login"
      title="Sign in to Blink"
      subtitle="Use your account, or open a demo account below."
      footer={
        <>
          <p>
            New to Blink? <Link to="/register">Join as a professional</Link>
          </p>
          <p>
            Run a clinic? <Link to="/register/business">Register your clinic</Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <div className="error-message" role="alert">
            {error}
            {notActivated && (
              <span>
                {" "}
                <Link to="/forgot-password">Request activation link</Link>
              </span>
            )}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-field">
          <div className="login-password-label">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgot-password" className="login-forgot">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading && <span className="btn-spinner" aria-hidden="true" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* one-click demo accounts, shared with the landing page */}
      <section className="login-demo" aria-labelledby="login-demo-title">
        <h2 id="login-demo-title" className="login-demo-title">
          <span>Demo accounts</span>
        </h2>
        <ul className="login-demo-list">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.role}>
              <button
                type="button"
                className="login-demo-btn"
                onClick={() => demo.enter(account.role)}
                disabled={demo.pending !== null}
                aria-busy={demo.pending === account.role}
              >
                <span className="login-demo-role">{account.label}</span>
                <span className="login-demo-email">
                  {demo.pending === account.role ? "Signing in…" : account.email}
                </span>
                {demo.pending === account.role ? (
                  <span className="btn-spinner" aria-hidden="true" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
        <p className="login-demo-note">
          Every demo account uses the password <span className="tabular">{DEMO_PASSWORD}</span>.
        </p>
        {demo.error && (
          <p className="error-message" role="alert">
            {demo.error}
          </p>
        )}
      </section>
    </AuthCard>
  );
}
