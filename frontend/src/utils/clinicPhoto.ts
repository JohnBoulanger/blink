// illustrative storefront photos in public/photos/clinics, credited in the readme
const CLINIC_PHOTOS = [
  "bahen-vision-clinic",
  "spadina-vision-centre",
  "bloor-eye-care",
  "king-west-optometry",
  "danforth-vision-studio",
  "queen-street-eyecare",
  "yorkville-optometry-group",
  "college-vision-clinic",
  "harbourfront-eye-care",
  "cssu-eyecare",
  "annex-vision-studio",
  "rosedale-optometry",
  "liberty-village-eye-centre",
  "leslieville-vision-care",
  "midtown-eye-centre",
];

const KNOWN = new Set(CLINIC_PHOTOS);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function photoPath(slug: string): string {
  return `/photos/clinics/${slug}.jpg`;
}

// seeded clinics are keyed by name, so a re-seed with new ids keeps each photo;
// clinics registered later get a stable pick from their id
export function getClinicPhoto(businessId: number, businessName?: string): string {
  const slug = businessName ? slugify(businessName) : "";
  if (KNOWN.has(slug)) return photoPath(slug);
  const hash = Math.imul(businessId, 2654435761) >>> 0;
  return photoPath(CLINIC_PHOTOS[hash % CLINIC_PHOTOS.length]);
}
