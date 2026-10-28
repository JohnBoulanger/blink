import { useId } from "react";
import Logo from "../Logo";
import "./style.css";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  // the page's own root class, e.g. "Login"
  className?: string;
  // wider card for longer forms
  wide?: boolean;
}

// a centred card with the logo, used by every sign-in and account page
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className = "",
  wide = false,
}: AuthCardProps) {
  const titleId = useId();
  return (
    <div className={`AuthCard page-enter ${className}`}>
      <section className={`auth-card${wide ? " auth-card-wide" : ""}`} aria-labelledby={titleId}>
        <header className="auth-card-head">
          <Logo blink="off" wordmark={false} size={36} />
          <h1 id={titleId}>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </header>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </section>
    </div>
  );
}
