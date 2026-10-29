import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { useNegotiation } from "../../contexts/NegotiationContext/NegotiationContext";
import { getRoleHome, getRoleLabel, getRoleLinks } from "../../utils/navLinks";
import Logo from "../Logo";
import "./style.css";

interface NavbarProps {
  variant?: "public" | "app";
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar({ variant = "public" }: NavbarProps) {
  const { isAuthenticated, role, user, logout } = useAuth();
  const { hasActiveNeg } = useNegotiation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  // the drawer stays open only on the route it was opened on, so navigation closes it
  const [drawerOpenAt, setDrawerOpenAt] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  const routeKey = location.pathname + location.hash;
  const drawerOpen = drawerOpenAt === routeKey;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const displayName = user
    ? role === "business"
      ? (user.business_name as string) || ""
      : role === "admin"
        ? "Admin"
        : (user.first_name as string) || ""
    : "";
  const avatarUrl = user?.avatar ? `${backendUrl}${user.avatar}` : "";
  const profilePath =
    role === "business" ? "/business/profile" : role === "admin" ? "/admin/users" : "/profile";
  const roleLinks = getRoleLinks(role);

  // lock page scroll and move focus into the drawer while it is open
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  // close the account menu on an outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handlePointer(e: PointerEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || pillRef.current?.contains(target)) return;
      setMenuOpen(false);
      setConfirmSignOut(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [menuOpen]);

  function closeMenu(returnFocus = false) {
    setMenuOpen(false);
    setConfirmSignOut(false);
    if (returnFocus) pillRef.current?.focus();
  }

  function closeDrawer(returnFocus = true) {
    setDrawerOpenAt(null);
    if (returnFocus) toggleRef.current?.focus();
  }

  function handleLogout() {
    closeMenu();
    setDrawerOpenAt(null);
    logout();
    // defer navigation so react flushes auth state before the route change
    setTimeout(() => navigate("/login"), 0);
  }

  // scroll to a landing section, or go to the landing page first
  function goToSection(e: React.MouseEvent, id: string) {
    e.preventDefault();
    closeDrawer(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ block: id === "demo" ? "center" : "start" });
    if (id === "demo") target.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeMenu(true);
    }
  }

  // keep tab focus inside the drawer and close it on escape
  function handleDrawerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeDrawer();
      return;
    }
    if (e.key !== "Tab" || !drawerRef.current) return;
    const items = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const avatar = avatarUrl ? (
    <img src={avatarUrl} alt="" className="nav-avatar" />
  ) : (
    <span className="nav-avatar nav-avatar-placeholder" aria-hidden="true">
      {displayName.charAt(0).toUpperCase() || "?"}
    </span>
  );

  const userSection = (
    <div className="nav-user-section" onKeyDown={handleMenuKeyDown}>
      <button
        ref={pillRef}
        type="button"
        className="nav-user-pill"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-controls="nav-account-menu"
        onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
      >
        {avatar}
        <span className="nav-user-name">{displayName}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {menuOpen && (
        <div ref={menuRef} id="nav-account-menu" className="nav-account-menu">
          {confirmSignOut ? (
            <div className="nav-confirm" role="group" aria-label="Confirm sign out">
              <p>Sign out of Blink?</p>
              <div className="nav-confirm-actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setConfirmSignOut(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn-primary btn-sm" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="nav-account-head">
                <span className="nav-user-name">{displayName}</span>
                <span className="nav-user-role">{getRoleLabel(role)}</span>
              </div>
              {variant === "public" && (
                <Link to={getRoleHome(role)} className="nav-menu-item" onClick={() => closeMenu()}>
                  Dashboard
                </Link>
              )}
              <Link to={profilePath} className="nav-menu-item" onClick={() => closeMenu()}>
                {role === "admin" ? "Users" : "Profile"}
              </Link>
              <button
                type="button"
                className="nav-menu-item"
                onClick={() => setConfirmSignOut(true)}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className={`Navbar Navbar-${variant}`}>
      <div className={variant === "public" ? "container navbar-inner" : "navbar-inner"}>
        <div className="nav-start">
          <Logo to="/" />
        </div>

        {variant === "public" && (
          <nav className="nav-centre" aria-label="Main">
            <NavLink to="/businesses" className="nav-link">
              Clinics
            </NavLink>
            <a
              href="/#how-it-works"
              className="nav-link"
              onClick={(e) => goToSection(e, "how-it-works")}
            >
              How it works
            </a>
          </nav>
        )}

        <div className="nav-end">
          <div className="nav-desktop">
            {variant === "public" && !isAuthenticated && (
              <>
                <NavLink to="/login" className="nav-link">
                  Sign in
                </NavLink>
                <a href="/#demo" className="btn-primary" onClick={(e) => goToSection(e, "demo")}>
                  Try the demo
                </a>
              </>
            )}
            {isAuthenticated && userSection}
          </div>

          <div className="nav-mobile">
            {variant === "public" && !isAuthenticated && (
              <a
                href="/#demo"
                className="btn-primary btn-sm"
                onClick={(e) => goToSection(e, "demo")}
              >
                Try the demo
              </a>
            )}
            <button
              ref={toggleRef}
              type="button"
              className="nav-menu-toggle"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="nav-drawer"
              onClick={() => setDrawerOpenAt(routeKey)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="nav-drawer-root">
          <div className="nav-drawer-backdrop" onClick={() => closeDrawer()} aria-hidden="true" />
          <div
            id="nav-drawer"
            ref={drawerRef}
            className="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onKeyDown={handleDrawerKeyDown}
          >
            <div className="nav-drawer-header">
              <Logo to="/" blink="off" onClick={() => setDrawerOpenAt(null)} />
              <button
                type="button"
                className="nav-menu-toggle"
                aria-label="Close menu"
                onClick={() => closeDrawer()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {variant === "app" && isAuthenticated ? (
              <>
                <nav className="nav-drawer-links" aria-label={`${getRoleLabel(role)} navigation`}>
                  {roleLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className="nav-drawer-link"
                      onClick={() => setDrawerOpenAt(null)}
                    >
                      {link.label}
                      {link.negotiation && hasActiveNeg && (
                        <span className="nav-live">
                          <span className="nav-live-dot" aria-hidden="true" />
                          Live
                          <span className="visually-hidden"> negotiation in progress</span>
                        </span>
                      )}
                    </NavLink>
                  ))}
                </nav>
                <div className="nav-drawer-account">
                  <Link
                    to={profilePath}
                    className="nav-drawer-identity"
                    onClick={() => setDrawerOpenAt(null)}
                  >
                    {avatar}
                    <span>
                      <span className="nav-user-name">{displayName}</span>
                      <span className="nav-user-role">{getRoleLabel(role)}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary nav-drawer-btn"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <nav className="nav-drawer-links" aria-label="Main">
                  <NavLink
                    to="/businesses"
                    className="nav-drawer-link"
                    onClick={() => setDrawerOpenAt(null)}
                  >
                    Clinics
                  </NavLink>
                  <a
                    href="/#how-it-works"
                    className="nav-drawer-link"
                    onClick={(e) => goToSection(e, "how-it-works")}
                  >
                    How it works
                  </a>
                  {!isAuthenticated && (
                    <>
                      <NavLink
                        to="/login"
                        className="nav-drawer-link"
                        onClick={() => setDrawerOpenAt(null)}
                      >
                        Sign in
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="nav-drawer-link"
                        onClick={() => setDrawerOpenAt(null)}
                      >
                        Register
                      </NavLink>
                    </>
                  )}
                </nav>
                <div className="nav-drawer-account">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={getRoleHome(role)}
                        className="btn-primary nav-drawer-btn"
                        onClick={() => setDrawerOpenAt(null)}
                      >
                        Go to dashboard
                      </Link>
                      <button
                        type="button"
                        className="btn-secondary nav-drawer-btn"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <a
                      href="/#demo"
                      className="btn-primary nav-drawer-btn"
                      onClick={(e) => goToSection(e, "demo")}
                    >
                      Try the demo
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
