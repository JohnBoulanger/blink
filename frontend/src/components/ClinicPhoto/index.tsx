import { getClinicPhoto, getPhotoByIndex } from "../../utils/clinicPhoto";
import "./style.css";

interface ClinicPhotoProps {
  businessId: number;
  // position in a row or grid; when set, the photo is picked by position instead of clinic
  photoIndex?: number;
  // shown over the top-left corner, e.g. a verified pill
  badge?: React.ReactNode;
  className?: string;
}

export default function ClinicPhoto({
  businessId,
  photoIndex,
  badge,
  className = "",
}: ClinicPhotoProps) {
  const src = photoIndex === undefined ? getClinicPhoto(businessId) : getPhotoByIndex(photoIndex);
  return (
    <span className={`ClinicPhoto ${className}`}>
      <img src={src} alt="" loading="lazy" decoding="async" />
      {badge && <span className="clinic-photo-badge">{badge}</span>}
      <span className="clinic-photo-note">Illustrative photo</span>
    </span>
  );
}
