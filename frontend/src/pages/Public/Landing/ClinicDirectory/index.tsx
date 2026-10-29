import { Link } from "react-router-dom";
import ClinicPhoto from "../../../../components/ClinicPhoto";
import Illustration from "../../../../components/Illustration";
import type { Clinic } from "../types";
import "./style.css";

// a short grid; the full directory has its own page and map
const CARD_LIMIT = 6;

interface ClinicDirectoryProps {
  clinics: Clinic[];
  loading: boolean;
  error: boolean;
}

export default function ClinicDirectory({ clinics, loading, error }: ClinicDirectoryProps) {
  if (loading) {
    return (
      <ul className="ClinicDirectory clinic-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="clinic-skeleton">
            <span className="clinic-skeleton-photo" />
            <span className="clinic-skeleton-line" />
          </li>
        ))}
      </ul>
    );
  }
  if (error) {
    return (
      <p className="clinic-list-message">
        The clinic list did not load. <Link to="/businesses">Open the clinic directory</Link>.
      </p>
    );
  }
  if (clinics.length === 0) {
    return (
      <div className="clinic-list-empty">
        <Illustration name="clinic-pin" size={96} />
        <p className="clinic-list-message">No clinics are listed yet.</p>
      </div>
    );
  }
  return (
    <ul className="ClinicDirectory clinic-grid">
      {clinics.slice(0, CARD_LIMIT).map((clinic) => (
        <li key={clinic.id}>
          <Link to={`/businesses/${clinic.id}`} className="clinic-card">
            <ClinicPhoto businessId={clinic.id} businessName={clinic.business_name} />
            <span className="clinic-card-name">{clinic.business_name}</span>
            <span className="clinic-card-address">{clinic.postal_address}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
