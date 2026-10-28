---
version: 1
slug: "frontend-src-pages-public-landing-index-tsx"
primary_target: "frontend/src/pages/Public/Landing/index.tsx"
related_targets: []
---

# Landing page (public "/")

## Scope and mode

Public landing page at `/`. Mode: Persuade. It sets the visual world that every app screen (shift search, shift detail, negotiation, clinic, admin) then inherits as Operate surfaces.

## Audience, job, action

- Visitor: a recruiter or hiring manager opening the demo for two to three minutes.
- Job: understand what Blink is within seconds, then get inside the product without friction.
- Primary action: search shifts (signs in as the demo professional), plus one-click demo entry as professional, clinic or admin.
- Proof: real seed data only (15 Toronto clinics, real open shifts and rates, 15-minute negotiation window, admin credential review). Clinic photos are free-licensed stock, labelled illustrative.

## Constraints

- All features and flows stay. Name is Blink (formerly Visus). Toronto seed data stays. Copy may be rewritten.
- Ruled out: gradient hero, stock icon feature cards, clinical white-and-blue hospital feel, playful styling, dark/techy look, the drifting eye-shape pattern, multi-coloured status pills, a big ticking countdown.
- Quality bar and system base: Airbnb (search-first, photo-led listing cards, one accent colour, modest weights, single shadow tier, pills for search and badges), with Linear's precision in the dense app screens.

## Direction contract

THESIS: Airbnb's marketplace grammar applied to optometry shifts: a search-first page where real shifts read like listings, one green accent does every job, and the brand lives in a blinking two-lid eye. Refuses the gradient-hero-plus-icon-cards template.

OWN-WORLD: White canvas, ink #222222 text, #6a6a6a secondary, #dddddd hairlines, #f7f7f7 soft surfaces. One accent, Pine #1f6f4a (tint #e2f1e9, deep #175a3c), on primary buttons, the search button, saved hearts, the live state and the logo's lower lid. Schibsted Grotesk for headlines, Inter for interface text, tabular figures for rates and times. 8px buttons, 14px cards, full pills for search and chips, one soft shadow tier. Statuses are a dot plus a label; only Live is green and pulses.

STORY: The visitor reads "Clinics and eye care pros, matched in the blink of an eye.", searches or picks a demo role, and lands on real shifts that look as browsable as Airbnb listings.

FIRST VIEWPORT: Top bar: two-lid logo with lowercase "blink" wordmark left; Clinics and How it works centre; Sign in and a Pine "Try the demo" button right. A pale Pine band with a curved lower edge (the eyelid) sits behind a centred two-line headline, a wide pill search (Clinic, Role, Pine "Find shifts" button) and a line of demo links. A row of four photo-led shift cards (clinic, role, day, rate) starts just above the fold.

FORM: The category standard (standing exit chosen by the user over the roll), refined with the user onto the Airbnb system from awesome-design-md. Not on the ordered list. seed:9a24c824b9c4cee9

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

The logo blinks every few seconds; as the visitor scrolls, the eyelid band's curve closes like a slow blink. In the negotiation room, a confirmed match triggers the same blink with "Shift confirmed".

## Decided details

- Negotiation timer: 15 dots, one per minute, fading as minutes pass; no big ticking number.
- Statuses: dot plus label, no pill backgrounds.
- Wordmark: lowercase "blink".
- Logo: navy-free two-lid mark: ink upper lid, Pine lower lid with three short lower lashes.

## Unresolved

- Hosting target for a public demo.
