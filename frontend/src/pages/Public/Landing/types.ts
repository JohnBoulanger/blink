export interface Clinic {
  id: number;
  business_name: string;
  postal_address: string;
  location: { lat: number; lon: number } | null;
}

export interface PositionType {
  id: number;
  name: string;
}

// shape returned by the public GET /jobs/public endpoint
export interface PublicShift {
  id: number;
  position_type: { id: number; name: string };
  business: {
    id: number;
    business_name: string;
    postal_address?: string;
    verified?: boolean;
  };
  start_time: string;
  end_time: string;
  salary_min: number;
  salary_max: number;
}
