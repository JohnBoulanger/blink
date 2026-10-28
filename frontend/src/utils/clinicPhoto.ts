// illustrative stock photos in public/photos, credited in the readme
const PHOTO_COUNT = 10;

function photoPath(n: number): string {
  const index = (((n % PHOTO_COUNT) + PHOTO_COUNT) % PHOTO_COUNT) + 1;
  return `/photos/clinic-${String(index).padStart(2, "0")}.jpg`;
}

// the same clinic always gets the same photo
export function getClinicPhoto(businessId: number): string {
  return photoPath(businessId);
}

// one photo per position, so a row or grid of up to ten cards never repeats a photo
export function getPhotoByIndex(position: number): string {
  return photoPath(position);
}
