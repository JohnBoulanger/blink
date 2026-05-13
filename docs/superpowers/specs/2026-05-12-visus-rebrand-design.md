# Visus Rebrand — Design Spec

**Date:** 2026-05-12
**Status:** Approved
**Owner:** @JohnBoulanger

## 1. Context

The current project (`DentaLink`) was built for CSC309 A3, a UofT React/Express assignment for a dental staffing platform. It is functional, deployed on Railway, and structurally domain-neutral at the schema layer (`Business`, `Job`, `RegularUser`, etc.).

The goal is to convert it from "school project" into a credible portfolio-quality optometry staffing platform (`Visus`) that:

- Reads as a real product to a recruiter or optometry clinic owner browsing the repo or live site
- Removes all assignment-specific artifacts (grading scripts, `csc309.utoronto.ca` emails, deliverable files, etc.)
- Preserves the existing git history

## 2. Goals and non-goals

### Goals
- Rebrand all visible identifiers: `DentaLink` → `Visus`, `dental*` → `optometry*`
- Replace seed data with realistic optometry practices and roles
- Remove assignment-bound files and documentation sections
- Add portfolio-grade additions (LICENSE, .env.example)
- Refresh README + frontend technical guide
- Re-capture screenshots after visual rebrand

### Non-goals
- No Prisma schema or model name changes (already domain-neutral)
- No git history rewriting — preserve existing commits
- No deployment changes — Railway stays
- No new features — rebrand + cleanup only
- No GitHub repo rename (existing `vision-link` is close enough to `Visus`)

## 3. Phased execution

The work is decomposed into four phases. Each phase is independently committable and verifiable.

### Phase 1 — Documentation surgery

No application code touched. Doc + memory cleanup only.

**Edit**
- `CLAUDE.md`:
  - Title: `# A3 React Project — Conventions & Structure` → `# Visus — Conventions & Architecture`
  - Update prose: `dentistry staffing platform` → `optometry staffing platform`
  - Remove section: `## Deployment (A3)` (EC2/Nginx/PM2 — never actually used)
  - Remove section: `## Assignment Requirements (A3)` and all subsections (Grading, Seed Data Requirements, Deliverable Files, CORS code snippet)
  - Rename `### Hard UI Rules` → `## Product UX Principles`, lift to top-level, reframe as principles not requirements
  - Update `## Backend Domain — Dental Staffing Platform` → `## Backend Domain — Optometry Staffing Platform`
  - Replace all `dental` / `clinic` references in backend domain prose with `optometry` / `practice`
  - Update Frontend Aesthetics line: `dental staffing context` → `optometry staffing context`
- `memory/project_security_hardening.md`: description line `dental staffing platform` → `optometry staffing platform`. Verify body claims (rate limiting, zod, helmet) still hold against current code before committing.

**Delete**
- `WEBSITE` (assignment-required URL stub)
- `INSTALL` (info lives in README)
- `Makefile` (only target is `a3-*.zip` for submission)
- `DEMO.md` ("1-Hour Grading Demo Workflow")
- `csc309_demo.docx` (untracked, gone anyway)
- `resources/` (empty)

**Add**
- `LICENSE` — MIT, year 2026, attributed to John Boulanger
- `.env.example` — document required env vars (`JWT_SECRET`, `FRONTEND_URL`, `PORT`, plus any others discovered in `backend/src/config/env.js`)

**Commit**
- Message: `chore: remove assignment artifacts and rebrand documentation`

**Verification**
- `grep -ri "csc309\|A3project\|assignment" CLAUDE.md memory/` returns nothing
- `LICENSE` and `.env.example` exist
- Deleted files are gone

### Phase 2 — Code rebrand

Visible-identifier and copy changes in `backend/` and `frontend/`. Internal model/route/component names (`Job`, `Business`, `RegularUser`) stay generic.

**Scope**
- Frontend: page titles, navbar logo text, hero copy, footer text, register/login form copy, button labels, empty-state messages, position type display names (handled in Phase 3 data), `<title>` tag, favicon if dental-themed
- Backend: comments, log messages, default email template strings, error messages, hardcoded `"Dental Staffing"` strings anywhere
- Logo / image assets: any tooth-themed SVG/PNG replaced with vision-themed equivalent (eye icon, glasses, etc.). Audit `frontend/src/assets/` and `frontend/public/`.

**Approach**
- Run `grep -rin "dental\|dentist\|dentalink\|DentaLink" backend/src frontend/src frontend/public frontend/index.html` to enumerate all occurrences
- Categorize results: copy strings (rebrand), comments (rebrand), variable names (leave unless visible)
- Make edits
- Restart dev server, smoke test golden path: register regular user, register business, login as each, browse jobs, post a job, express interest

**Commit**
- Message: `refactor: rebrand frontend and backend copy from dental to optometry`

**Verification**
- `grep -rin "dental\|dentist\|dentalink" backend/src frontend/src frontend/public frontend/index.html` returns no user-visible matches (internal comments are acceptable if rebranded; non-rebranded results must be intentional)
- Dev server starts cleanly
- Login flow works for both roles
- Jobs list renders

### Phase 3 — Seed data rebrand

Replace all dental-flavored seed data with realistic optometry practice data.

**Email scheme**
- `regular1@csc309.utoronto.ca` … `regular20@csc309.utoronto.ca` → `regular1@visus.dev` … `regular20@visus.dev`
- `business1@csc309.utoronto.ca` … `business10@csc309.utoronto.ca` → `business1@visus.dev` … `business10@visus.dev`
- `admin1@csc309.utoronto.ca` → `admin1@visus.dev`
- Passwords stay `123123` (portfolio demo convenience)

**Practice names** (10, all GTA-based)
Real-sounding optometry practice names — examples to confirm during execution: Spadina Vision Centre, Bloor Eye Care, Yorkville Optometry, Annex Family Eyecare, Distillery Vision Co, Liberty Village Optical, Beaches Eye Health, Kensington Optometry, High Park Vision, Riverdale Eye Centre. Final list confirmed during execution.

**Position types** (≥ 10, replacing dental hygienist/assistant/etc.)
Proposed list:
1. Optometrist
2. Optometric Assistant
3. Ophthalmic Technician
4. Optician (licensed)
5. Contact Lens Fitter
6. Optical Lab Technician
7. Front Desk / Patient Coordinator
8. Practice Manager
9. Vision Therapist
10. Pre-test Technician
11. Sales Associate (optical retail)

Each gets a 1-2 sentence description rewritten for optometry context.

**Geographic data**
- Keep existing lat/lon (Toronto area), just relabel which practice sits where

**Other seed data**
- Job titles updated to reference optometry roles
- Job descriptions rewritten to optometry context (shift descriptions, requirements)
- Qualification documents — file names/labels stay generic (PDF uploads), but any visible labels rebranded

**Verification**
- `npx prisma db push --force-reset && npx prisma db seed` succeeds with no errors
- App boots cleanly with new data
- Jobs list paginates ≥ 2 pages (i.e. ≥ 30 jobs across statuses, same as before)
- Position types page shows new optometry roles
- No `dental` / `dentist` strings appear in the rendered UI

**Commit**
- Message: `data: replace dental seed data with optometry practices and roles`

### Phase 4 — README, frontend guide, screenshots

Final polish + visual deliverables.

**Rewrite**
- `README.md`:
  - Title: `# DentaLink` → `# Visus`
  - Description: real-time dental staffing → real-time optometry staffing
  - Feature lists: rebrand all references
  - Tech stack table: no changes
  - Getting started section: no changes (already correct)
  - Add: "Demo accounts" section with the `regular1@visus.dev / 123123` style credentials
  - Add: live demo link to Railway deployment
- `FRONTEND_GUIDE.md`:
  - Title: `# DentaLink — Frontend Technical Guide` → `# Visus — Frontend Technical Guide`
  - Domain references: dental → optometry
  - File paths referenced inside: spot-check against current code (some may have moved across the 71 commits)

**Screenshots**
- After Phases 2 + 3 are merged, re-capture all `docs/screenshots/*.png`:
  - `01-landing.png` (hero with Visus branding)
  - `02-login.png`
  - `03-regular-jobs.png` (now showing optometry jobs)
  - `04-regular-qualifications.png`
  - `05-business-jobs.png`
  - `06-admin-users.png`
  - `07-admin-settings.png`
  - `08-clinics-list.png` (keep filename; "clinics" terminology stays per identifier mapping)
  - `09-register.png`
- Use a clean dev environment with the new seed data
- Use a real-looking browser (no devtools, no dev banner)

**Commit**
- Message: `docs: rewrite README and frontend guide for Visus, refresh screenshots`

## 4. Identifier mapping (canonical)

| Old | New |
|-----|-----|
| `DentaLink` | `Visus` |
| `dental staffing` / `dentistry staffing` | `optometry staffing` |
| `dental clinic` | `optometry clinic` (or `optometry practice` depending on context) |
| `dentist` / `dental professional` | `optometrist` / `eye care professional` |
| `dental hygienist` (seed position type) | `optometric assistant` |
| `dental assistant` (seed position type) | `optometric technician` |
| `regular*@csc309.utoronto.ca` | `regular*@visus.dev` |
| `business*@csc309.utoronto.ca` | `business*@visus.dev` |
| `admin*@csc309.utoronto.ca` | `admin*@visus.dev` |

Note: the word "Business" as a model name and "clinic" (generic) in component names, routes, and user-facing copy stay — "clinic" is a real optometry term (eye care clinic, optometry clinic). Only the specific phrase `dental clinic` gets reworded. This minimizes churn and reads naturally to optometry audiences.

## 5. What stays the same

- Prisma schema and model names (`Account`, `RegularUser`, `Business`, `Job`, `Qualification`, etc.)
- All API route paths (`/jobs`, `/businesses`, etc.)
- React component names and file structure
- Auth flow, Socket.IO events
- Dockerfile, railway.json, deployment target
- Git history (no rewriting)
- GitHub repo name (`vision-link`)

## 6. Verification strategy

Per-phase verification is listed inline above. Cross-phase verification at the end:

- `grep -rin "dental\|dentist\|dentalink\|csc309\|A3project" .` (excluding `.git`, `node_modules`, `dist`) returns no meaningful matches
- Fresh clone + `npm install` + `npx prisma db push && npx prisma db seed` + `npm run dev` boots a fully rebranded app
- Railway deployment continues to work after pushing each phase
- README renders cleanly on GitHub with new screenshots showing Visus branding

## 7. Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Hardcoded dental strings hide in unexpected places (page titles, email templates, error messages) | Aggressive grep before declaring Phase 2 done; smoke test all major pages |
| Seed data changes break existing dev DBs | Run `prisma db push --force-reset` before reseeding |
| Tooth-shaped logo/favicon needs replacement | Audit `src/assets/` and `public/` during Phase 2; replace with eye/glasses icon |
| `project_security_hardening.md` memory is 40 days stale | Verify rate limiting, zod, helmet still wired up before committing the memory edit |
| Railway production deployment breaks during phased rollout | Each phase is independently committable; verify Railway build after each push |
| Screenshots in `docs/screenshots/` referenced from README become stale during Phase 2 | Defer screenshot rewrite to Phase 4 after code + data are settled |

## 8. Out of scope

These could become follow-up specs after the rebrand:
- Custom domain on Railway (`visus.dev` or similar) instead of `*.up.railway.app`
- Open-graph image / social preview card for the live URL
- Resume-grade case-study writeup linking back to the repo
- E2E test suite for the optometry domain
