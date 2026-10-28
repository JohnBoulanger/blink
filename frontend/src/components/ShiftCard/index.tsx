import { Link } from "react-router-dom";
import ClinicPhoto from "../ClinicPhoto";
import { formatRate, formatShiftWhen } from "../../utils/format";
import "./style.css";

export interface ShiftCardData {
  id: number;
  position_type: { name: string };
  business: { id: number; business_name: string; verified?: boolean };
  start_time: string;
  end_time: string;
  salary_min: number;
  salary_max: number;
}

interface ShiftCardProps {
  shift: ShiftCardData;
  to: string;
  // position in the row or grid, so photos do not repeat
  photoIndex?: number;
  // router state passed along with the link
  state?: unknown;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  // shows a spinner line while the click is being handled
  opening?: boolean;
  // highlighted from outside, e.g. by its map pin
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
}

// photo-led listing card for one open shift
export default function ShiftCard({
  shift,
  to,
  photoIndex,
  state,
  onClick,
  opening = false,
  active = false,
  onActiveChange,
}: ShiftCardProps) {
  return (
    <Link
      to={to}
      state={state}
      className={`ShiftCard shift-card${active ? " active" : ""}`}
      onClick={onClick}
      aria-busy={opening}
      onMouseEnter={onActiveChange && (() => onActiveChange(true))}
      onMouseLeave={onActiveChange && (() => onActiveChange(false))}
      onFocus={onActiveChange && (() => onActiveChange(true))}
      onBlur={onActiveChange && (() => onActiveChange(false))}
    >
      <ClinicPhoto
        businessId={shift.business.id}
        photoIndex={photoIndex}
        badge={
          shift.business.verified ? <span className="photo-pill">Verified clinic</span> : undefined
        }
      />
      <span className="shift-card-body">
        <span className="shift-card-clinic">{shift.business.business_name}</span>
        <span className="shift-card-meta">{shift.position_type.name}</span>
        <span className="shift-card-meta tabular">
          {formatShiftWhen(shift.start_time, shift.end_time)}
        </span>
        <span className="shift-card-rate tabular">
          <strong>{formatRate(shift.salary_min, shift.salary_max)}</strong> /hr
        </span>
      </span>
      {opening && (
        <span className="shift-card-opening">
          <span className="btn-spinner" aria-hidden="true" />
          Opening shift…
        </span>
      )}
    </Link>
  );
}
