import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import HeroVisual from "./HeroVisual";
import PlatformStats from "./PlatformStats";
import FeatureCards from "./FeatureCards";
import "./style.css";

// position types shown in the scrolling ticker
const TICKER_ITEMS = [
  "Optometrist",
  "Licensed Optician",
  "Optometric Assistant",
  "Contact Lens Specialist",
  "Pre-test Technician",
  "Vision Therapist",
  "Optical Lab Technician",
  "Practice Manager",
  "Pediatric Vision Assistant",
  "Retail Optical Associate",
];

export default function Landing() {
  const { isAuthenticated, role } = useAuth();

  // redirect authenticated users to their dashboard
  function getDashboardPath() {
    if (role === "business") return "/business/jobs";
    if (role === "admin") return "/admin/users";
    return "/jobs";
  }

  return (
    <div className="Landing">
      {/* full-screen hero — split layout with floating cards */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-inner">
            <p className="hero-eyebrow">optometry staffing, simplified</p>
            <h1>
              The modern way to
              <br />
              staff optometry clinics
            </h1>
            <p className="hero-subtitle">
              Connect qualified professionals with clinics that need them. Flexible shifts, verified
              credentials, real-time matching.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to={getDashboardPath()} className="btn-primary hero-btn">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/businesses" className="btn-primary hero-btn">
                    View clinics
                  </Link>
                  <Link to="/login" className="hero-signin">
                    Sign in &rarr;
                  </Link>
                </>
              )}
            </div>
          </div>
          <HeroVisual />
        </div>

      </section>

      {/* getting started steps */}
      <section className="how-it-works">
        <p className="section-label">Getting started</p>
        <div className="steps">
          <div className="step">
            <span className="step-num">01</span>
            <h2>Create your account</h2>
            <p>Register as an optometry professional or a clinic. Activation takes under a minute.</p>
          </div>
          <div className="step-divider" aria-hidden="true" />
          <div className="step">
            <span className="step-num">02</span>
            <h2>Get qualified</h2>
            <p>
              Submit credentials for review. Once approved, you appear in search results for
              matching positions.
            </p>
          </div>
          <div className="step-divider" aria-hidden="true" />
          <div className="step">
            <span className="step-num">03</span>
            <h2>Negotiate and match</h2>
            <p>
              Express interest or receive invitations. Negotiate terms and confirm your shift in
              real time.
            </p>
          </div>
        </div>
      </section>

      {/* scrolling position types ticker */}
      <section className="ticker-section" aria-label="Position types we staff">
        <p className="ticker-label">positions we staff</p>
        {/* duplicate items so the loop is seamless */}
        <div className="ticker-viewport" aria-hidden="true">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((name, i) => (
              <span key={i} className="ticker-item">
                {name}
                <span className="ticker-dot">&middot;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* platform trust signals */}
      <PlatformStats />

      {/* feature highlights */}
      <FeatureCards />

      {/* browse cta — more prominent than before */}
      <section className="browse-cta">
        <h2>Ready to find your next shift?</h2>
        <p className="browse-cta-subtitle">
          Explore optometry clinics and open positions across the platform.
        </p>
        <Link to="/businesses" className="btn-primary hero-btn">
          Browse clinics
        </Link>
      </section>
    </div>
  );
}
