import { NavLink } from "react-router-dom";
import "./style.css";

// section tabs shared by a clinic's job pages
export default function JobTabs({ jobId }: { jobId: string | number }) {
  const base = `/business/jobs/${jobId}`;
  const tabClass = ({ isActive }: { isActive: boolean }) => (isActive ? "tab active" : "tab");
  return (
    <nav className="JobTabs tabs" aria-label="Job sections">
      <NavLink to={base} end className={tabClass}>
        Overview
      </NavLink>
      <NavLink to={`${base}/candidates`} className={tabClass}>
        Candidates
      </NavLink>
      <NavLink to={`${base}/interests`} className={tabClass}>
        Interests
      </NavLink>
    </nav>
  );
}
