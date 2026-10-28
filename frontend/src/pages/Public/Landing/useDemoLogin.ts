import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import { getRoleHome } from "../../../utils/navLinks";

export type DemoRole = "regular" | "business" | "admin";

// public seeded accounts, reset on every server start
export const DEMO_PASSWORD = "123123";

export const DEMO_ACCOUNTS: {
  role: DemoRole;
  label: string;
  article: string;
  who: string;
  email: string;
}[] = [
  {
    role: "regular",
    label: "Professional",
    article: "a professional",
    who: "Alice Lin",
    email: "regular1@blink.dev",
  },
  {
    role: "business",
    label: "Clinic",
    article: "a clinic",
    who: "Bahen Vision Clinic",
    email: "business1@blink.dev",
  },
  {
    role: "admin",
    label: "Admin",
    article: "an admin",
    who: "Credential review",
    email: "admin1@blink.dev",
  },
];

// signs in with a demo account, then opens that role's dashboard (or a given path)
export default function useDemoLogin() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<DemoRole | null>(null);
  const [error, setError] = useState("");

  async function enter(target: DemoRole, path?: string) {
    const destination = path ?? getRoleHome(target);
    setError("");
    if (isAuthenticated && role === target) {
      navigate(destination);
      return;
    }
    const account = DEMO_ACCOUNTS.find((a) => a.role === target);
    if (!account) return;
    setPending(target);
    try {
      await login(account.email, DEMO_PASSWORD);
      navigate(destination);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Login failed";
      setError(`Could not open the demo (${reason}). Try again, or use Sign in.`);
      setPending(null);
    }
  }

  return { enter, pending, error };
}
