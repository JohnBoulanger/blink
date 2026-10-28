import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import AuthCard from "../../../components/AuthCard";
import PasswordInput from "../../../components/PasswordInput";
import "./style.css";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  // a server error that belongs to the email field, shown under it
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  // form fields matching backend snake_case expectations
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    postal_address: "",
    birthday: "",
  });

  // update the matching field in form state
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // submit registration and redirect to activation
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setEmailError("");
    setLoading(true);
    try {
      // only send birthday if the user actually entered one
      const { birthday, ...rest } = form;
      const payload: Record<string, string> = { ...rest };
      if (birthday) payload.birthday = birthday;
      const response = await api.post("/users", payload);
      // redirect to activation with the token from response
      navigate(`/activate/${response.data.resetToken}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setEmailError("An account with this email already exists.");
        } else {
          setError(err.response?.data?.error || "Registration failed");
        }
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      className="RegisterUser"
      wide
      title="Join as a professional"
      subtitle="Create an account to find shifts at optometry clinics."
      footer={
        <>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Registering a clinic? <Link to="/register/business">Register as a clinic</Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="auth-form-row">
          <div className="form-field">
            <label htmlFor="reg-first-name">First name</label>
            <input
              id="reg-first-name"
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="reg-last-name">Last name</label>
            <input
              id="reg-last-name"
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "reg-email-error" : undefined}
            required
          />
          {emailError && (
            <p className="field-error" id="reg-email-error">
              {emailError}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="reg-password">Password</label>
          <PasswordInput
            id="reg-password"
            name="password"
            placeholder=""
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            describedBy="reg-password-hint"
            required
          />
          <p className="field-hint" id="reg-password-hint">
            8–20 characters with an uppercase letter, a lowercase letter, a digit and a symbol.
          </p>
        </div>

        <div className="auth-form-row">
          <div className="form-field">
            <label htmlFor="reg-phone">
              Phone number <span className="label-optional">(optional)</span>
            </label>
            <input
              id="reg-phone"
              name="phone_number"
              type="text"
              value={form.phone_number}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
          <div className="form-field">
            <label htmlFor="reg-birthday">
              Birthday <span className="label-optional">(optional)</span>
            </label>
            <input
              id="reg-birthday"
              name="birthday"
              type="date"
              value={form.birthday}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="reg-address">
            Postal address <span className="label-optional">(optional)</span>
          </label>
          <input
            id="reg-address"
            name="postal_address"
            type="text"
            value={form.postal_address}
            onChange={handleChange}
            autoComplete="street-address"
          />
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading && <span className="btn-spinner" aria-hidden="true" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
