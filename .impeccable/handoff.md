# Blink UI overhaul: handoff (2026-10-28)

Branch `ui-overhaul`. Phases A (rename, tokens, landing), B (professional screens, negotiation room) and C (clinic, admin, auth, public pages, README screenshots) are built and pushed as one work-in-progress commit. Review screenshots in `.impeccable/review/` are not committed.

## Approved by John, not built yet
1. **Map engine.** Replace Leaflet with MapLibre GL and the OpenFreeMap "positron" style (`https://tiles.openfreemap.org/styles/positron`, free, no key). Pin the newest `maplibre-gl` version that is at least 14 days old. Load it only on pages with a map. Update the CSP in `backend/src/app.js` (img, connect and worker sources) for OpenFreeMap.
   - Shift maps: white price pills; hovering a card turns its pill Pine and brings it to the front; clicking a pill opens a small card (photo, clinic, role, date, rate, link); nearby pills cluster into a bubble such as "3 shifts" when zoomed out.
   - Clinic maps (landing, directory, clinic profile, shift detail): small Pine dot pins, name on hover, click opens the same small card.
2. **Storefront photos.** Replace the 10 interior photos with 15 Unsplash storefront exterior photos, one fixed photo per clinic (the clinics are fictional seed data). No readable brand names on signs; crop if needed. Keep the "Illustrative photo" note; update README credits and provenance (`impeccable embed-prompt`).
3. **Home page map.** Merge the map into "Open shifts this week": 8 cards in a 2-column grid on the left, the map on the right with price pills, top of the map visible in the first 1440x900 screen. Remove the map from "Clinics on Blink". On phones: a short map strip above the cards plus a "Show map" button that opens it full screen. The hero does not change.

## Still to do
- Finish review (`impeccable:impeccable-finish-reviewer`). The first run stopped because some captures were invalid. Recapture first: step-scroll to load lazy images, wait for every image to load, scroll to 0, then take full-page shots; add viewport-only 390x844 shots for pages with fixed bottom bars. Reviewer notes so far: map price pins overlap near St George; Regular/Interests, Invitations and ProfileEdit are unrouted dead pages; `clinicPhoto.ts:14` comment is wrong for 12 cards.
- Show John the review fixes plus these items as one plan and wait for his go:
  - Clinic shift edit fills time fields from UTC (`toLocalInput` uses `toISOString`), so saving moves the shift by the time-zone offset.
  - Shift create `min` time is UTC, so near start times cannot be picked.
  - README and footer still link to `github.com/JohnBoulanger/visus`; the repo is now `blink`.
  - Delete the unreferenced old screenshots `01`-`09` in `docs/screenshots/`.
- Then DESIGN.md (`impeccable:impeccable-documenter`).
- Then commit and push `ui-overhaul`. Do not merge into `main`.

## Working rules
- Test servers: backend 3100, frontend 5180 (John uses 3000 and 5173). Re-seed after tests with `npm run seed` in `backend`.
- Commits: one lowercase conventional line, John as the only author, no AI trailer.
- Before any code edit, show John the plan and wait for his go.
