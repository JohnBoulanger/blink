import { Link } from "react-router-dom";

interface BackLinkProps {
  to: string;
  children: React.ReactNode;
}

// chevron link back to the parent list; styled by .back-link in index.css
export default function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link to={to} className="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}
