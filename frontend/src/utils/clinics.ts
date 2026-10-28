import api from "./api";

// public clinic fields used to place shifts on a map
export interface ClinicSummary {
  id: number;
  business_name: string;
  postal_address: string;
  location: { lat: number; lon: number } | null;
}

let directory: Promise<Map<number, ClinicSummary>> | null = null;

// the public list is paginated, so walk every page
async function fetchDirectory(): Promise<Map<number, ClinicSummary>> {
  const clinics = new Map<number, ClinicSummary>();
  const limit = 50;
  let page = 1;
  while (true) {
    const res = await api.get("/businesses", {
      params: { page, limit, sort: "business_name", order: "asc" },
    });
    for (const clinic of res.data.results as ClinicSummary[]) clinics.set(clinic.id, clinic);
    if (page * limit >= res.data.count) break;
    page += 1;
  }
  return clinics;
}

// fetched once per session and shared by the shift pages; a failure allows a retry
export function getClinicDirectory(): Promise<Map<number, ClinicSummary>> {
  if (!directory) {
    directory = fetchDirectory().catch((err) => {
      directory = null;
      throw err;
    });
  }
  return directory;
}

// a 0,0 location means none was set
export function hasLocation(
  clinic: ClinicSummary | undefined
): clinic is ClinicSummary & { location: { lat: number; lon: number } } {
  return Boolean(clinic?.location && clinic.location.lat !== 0 && clinic.location.lon !== 0);
}
