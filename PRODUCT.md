# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience today: recruiters and hiring managers evaluating the author (John Boulanger) for software roles. They open the demo, log in with a seeded account, and click through for two to three minutes. The product must read as a real, shipped product to them.

In-product users (fictional, served by the demo data):
- Optometry professionals (assistants, opticians, technicians, optometrists) looking for individual shifts.
- Optometry clinics that need to fill shifts quickly with qualified people.
- Platform administrators who verify clinics, review credentials, and tune system settings.

## Product Purpose

Blink is a real-time staffing platform that connects qualified eye care professionals with optometry clinics that need shifts filled. Success for the demo: a recruiter understands what the product does within seconds, can complete a believable flow (browse a shift, see a negotiation, review a credential) without guidance, and leaves convinced it is production-quality work.

## Positioning

Two mechanisms together, weighted equally:
- Time-boxed, real-time negotiation: a clinic and a professional negotiate a shift live in a 15-minute window, then both confirm. Fast, decisive matching instead of message threads.
- Verified credentials: admins review qualification documents before a professional appears in clinic search, so clinics trust who they hire.

## Operating Context

- Roles and dashboards: professional (`regular`), clinic (`business`), admin. Each role has its own navigation and pages.
- Core flows: browse and filter open shifts; express interest; clinics invite candidates; mutual interest starts a 15-minute negotiation with live chat and a countdown; both sides accept or decline.
- Credential flow: professionals request a qualification per position type and upload a PDF; admins approve or reject.
- Public pages: landing, clinic directory with search and sort, clinic profile with map.
- Demo accounts (password `123123`): regular1-20@blink.dev, business1-15@blink.dev, admin1@blink.dev. Data reseeds on server start.

## Capabilities and Constraints

- Stack: React 19 + TypeScript + Vite frontend, Express + Prisma + SQLite + Socket.IO backend, single-service deploy. Maps use Mapbox GL JS with the Mapbox Standard style when a Mapbox token is set, and fall back to MapLibre GL JS with OpenFreeMap tiles without one (OpenStreetMap data in both). Fonts are self-hosted (Schibsted Grotesk and Inter through Fontsource, Optician Sans under the SIL Open Font License 1.1).
- All existing features, pages, and workflows stay. The overhaul changes presentation, not functionality.
- The product name is Blink (formerly Visus). No logo asset exists yet.
- The seeded Toronto clinics and demo accounts stay as the content shown.
- Copy and wording may be rewritten for clarity.
- Hosting is undecided (Railway was taken down for cost). Development happens locally with `npm run dev`.

## Brand Commitments

- Name: Blink (renamed from Visus on 2026-10-28). The name pairs eyes with speed: shifts filled in a blink, matching the 15-minute negotiation.
- Core idea, in the user's words: matching clinics to professionals in the blink of an eye. Copy and identity build on this.
- Primary headline (chosen 2026-10-28): "Clinics and eye care pros, matched in the blink of an eye."
- Visual direction (chosen 2026-10-28): the category standard, played straight. Blink should look like a clean, conventional staffing marketplace at the craft level of Linear and Airbnb, with no gimmicks or novelty themes.
- Ruled out by the user: generic SaaS-template filler (gradient hero, stock icon cards), a clinical/hospital look, playful or cartoon styling, and a dark/techy look.
- Brand colour (chosen 2026-10-29): Iris (#3451d1) replaces Pine green as the one accent, for primary buttons, the logo's lower lid, live status and selected states. Sky (pale tint #eaefff, mid tone #9db8ff) replaces the green bands and tints. Deep Iris (#1f2f86) carries the footer.
- Eye-care signatures (chosen 2026-10-29): eight spot illustrations in ink with one Iris detail (storefront, verified ID, 15-minute clock, glasses, phoropter, eye chart, calendar, clinic pin) on the "How it works" steps and the empty states; a natural logo blink where only the upper lid closes (blink A); and Optician Sans eye-chart lettering in five places only: the wordmark beside the logo, the 404 page, zero-result search charts, the admin credential review badge and the footer sign-off. The home hero has no background chart.

## Evidence on Hand

- Seed data: 15 Toronto optometry clinics with addresses and coordinates, 20 professionals, 12 position types, open/filled/expired shifts (`backend/prisma/seed.js`).
- No real customers, testimonials, usage numbers, or press exist. Do not fabricate them. Platform stats on the landing page must come from real data (clinic count, position type count).

## Product Principles

1. Read as real within seconds: a first-time visitor should never wonder whether this is a class project.
2. The negotiation is the signature moment: the 15-minute live window deserves the most care.
3. Trust is visible: verification and credential status are always clear.
4. Every role gets a complete, consistent experience; no neglected admin or empty screens.
5. Honest content: real seed data, no invented proof.
