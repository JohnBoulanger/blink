// role navigation, shared by the dashboard sidebar and the mobile drawer

export interface NavItem {
  to: string;
  label: string;
  // match the path exactly instead of as a prefix
  end?: boolean;
  negotiation?: boolean;
}

const regularLinks: NavItem[] = [
  { to: "/jobs", label: "Find shifts" },
  { to: "/my-jobs", label: "My shifts" },
  { to: "/position-types", label: "Positions" },
  { to: "/qualifications", label: "Qualifications" },
  { to: "/negotiations/me", label: "Negotiation", negotiation: true },
  { to: "/profile", label: "Profile" },
];

const businessLinks: NavItem[] = [
  { to: "/business/jobs", label: "Your shifts", end: true },
  { to: "/business/jobs/new", label: "Post a shift", end: true },
  { to: "/business/negotiations/me", label: "Negotiation", negotiation: true },
  { to: "/business/profile", label: "Profile" },
];

const adminLinks: NavItem[] = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/businesses", label: "Clinics" },
  { to: "/admin/position-types", label: "Positions" },
  { to: "/admin/qualifications", label: "Qualifications" },
  { to: "/admin/settings", label: "Settings" },
];

export function getRoleLinks(role: string | null): NavItem[] {
  if (role === "regular") return regularLinks;
  if (role === "business") return businessLinks;
  if (role === "admin") return adminLinks;
  return [];
}

export function getRoleHome(role: string | null): string {
  if (role === "business") return "/business/jobs";
  if (role === "admin") return "/admin/users";
  return "/jobs";
}

export function getRoleLabel(role: string | null): string {
  if (role === "business") return "Clinic";
  if (role === "admin") return "Admin";
  return "Professional";
}
