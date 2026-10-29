import { getClinicPhoto } from "../../utils/clinicPhoto";
import "./style.css";

interface ClinicPhotoProps {
  businessId: number;
  // picks the clinic's own photo; the id is the fallback key
  businessName?: string;
  // shown over the top-left corner, e.g. a verified pill
  badge?: React.ReactNode;
  className?: string;
}

export default function ClinicPhoto({
  businessId,
  businessName,
  badge,
  className = "",
}: ClinicPhotoProps) {
  return (
    <span className={`ClinicPhoto ${className}`}>
      <img src={getClinicPhoto(businessId, businessName)} alt="" loading="lazy" decoding="async" />
      {badge && <span className="clinic-photo-badge">{badge}</span>}
      <span className="clinic-photo-note">Illustrative photo</span>
    </span>
  );
}
