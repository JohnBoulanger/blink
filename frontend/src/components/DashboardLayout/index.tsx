import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { useNegotiation } from "../../contexts/NegotiationContext/NegotiationContext";
import { getRoleLabel, getRoleLinks } from "../../utils/navLinks";
import Navbar from "../Navbar";
import "./style.css";

export default function DashboardLayout() {
  const { role } = useAuth();
  const { hasActiveNeg } = useNegotiation();
  const links = getRoleLinks(role);

  return (
    <div className="DashboardLayout">
      <Navbar variant="app" />
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav" aria-label={`${getRoleLabel(role)} navigation`}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
              >
                <span>{link.label}</span>
                {link.negotiation && hasActiveNeg && (
                  <span className="sidebar-live">
                    <span className="sidebar-live-dot" aria-hidden="true" />
                    Live
                    <span className="visually-hidden"> negotiation in progress</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
