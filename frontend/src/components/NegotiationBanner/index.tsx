import { Link } from "react-router-dom";
import StatusBadge from "../StatusBadge";
import "./style.css";

interface NegotiationBannerProps {
  to: string;
  text: string;
  action?: string;
}

// a quiet bar that points to the live negotiation
export default function NegotiationBanner({
  to,
  text,
  action = "Open negotiation",
}: NegotiationBannerProps) {
  return (
    <div className="NegotiationBanner">
      <StatusBadge tone="live">Live negotiation</StatusBadge>
      <span className="negotiation-banner-text">{text}</span>
      <Link to={to} className="btn-primary btn-sm">
        {action}
      </Link>
    </div>
  );
}
