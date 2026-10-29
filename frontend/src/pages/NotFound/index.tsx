import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import "./style.css";

// not found: an eye chart that blurs out, one line and a way back
export default function NotFound() {
  const { role } = useAuth();
  const backTo = role === "regular" ? "/jobs" : "/";

  return (
    <div className="NotFound page-enter">
      <div className="nf-chart" aria-hidden="true">
        <span className="nf-line nf-line-1">4</span>
        <span className="nf-line nf-line-2">0 4</span>
        <span className="nf-line nf-line-3">P A G E</span>
        <span className="nf-line nf-line-4">N O T F O U N D</span>
        <span className="nf-line nf-line-5">L O O K I N G E L S E W H E R E</span>
      </div>
      <span className="nf-rule" aria-hidden="true" />
      <h1>
        <span className="visually-hidden">Page not found. </span>This page is out of focus.
      </h1>
      <p>The link may be old, or the shift may have been filled.</p>
      <Link to={backTo} className="btn-primary">
        Back to open shifts
      </Link>
    </div>
  );
}
