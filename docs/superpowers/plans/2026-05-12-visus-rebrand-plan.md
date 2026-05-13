# Visus Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the CSC309 A3 dental staffing project (`DentaLink`) into a credible portfolio-grade optometry staffing platform (`Visus`), rebrand all visible copy/data, remove assignment artifacts, polish docs.

**Architecture:** Four sequential phases, each independently committable. Schema and model names stay untouched (already domain-neutral). Only user-visible identifiers, copy, seed data, and documentation change. Git history is preserved.

**Tech Stack:** React + TypeScript (Vite) frontend, Express + Prisma (SQLite) backend, Socket.IO, deployed on Railway via Docker.

**Reference spec:** `docs/superpowers/specs/2026-05-12-visus-rebrand-design.md`

---

## File Inventory

### Phase 1 — Docs + memory
- Modify: `CLAUDE.md`
- Modify: `/Users/johnboulanger/.claude/projects/-Users-johnboulanger-Desktop-UofT-2026-Winter-Term-CSC309-boulan23-A3/memory/project_security_hardening.md`
- Delete: `WEBSITE`, `INSTALL`, `Makefile`, `DEMO.md`, `csc309_demo.docx`, `resources/`
- Create: `LICENSE`, `.env.example`

### Phase 2 — Code + copy
- Modify: `frontend/index.html`
- Modify: `frontend/src/components/Navbar/index.tsx`
- Modify: `frontend/src/pages/Auth/RegisterUser/index.tsx`
- Modify: `frontend/src/pages/Auth/RegisterBusiness/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/PlatformStats/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/FeatureCards/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/HeroVisual/index.tsx`
- Modify: `frontend/src/pages/Public/BusinessList/index.tsx`
- Audit only: `frontend/public/logo.svg` (already a generic chain icon, likely no change)

### Phase 3 — Seed data
- Modify: `backend/prisma/seed.js` (638 lines, 6 csc309 references, many `Dental*` strings)

### Phase 4 — README + guide + screenshots
- Modify: `README.md`
- Modify: `FRONTEND_GUIDE.md`
- Replace: `docs/screenshots/*.png` (9 files, after Phases 2+3 are merged)

---

# Phase 1 — Documentation surgery

### Task 1.1: Verify security memory claims still hold

The `project_security_hardening.md` memory is 40 days old. Before keeping it, confirm the code still implements what it claims.

**Files:** None (read-only verification)

- [ ] **Step 1: Confirm rate limiter exists**

Run: `grep -l "express-rate-limit" backend/src/**/*.js backend/src/*.js 2>/dev/null`
Expected: returns `backend/src/middleware/rateLimit.js` and `backend/src/app.js`

- [ ] **Step 2: Confirm helmet exists**

Run: `grep -n "helmet" backend/src/app.js`
Expected: at least one match using `helmet()` middleware

- [ ] **Step 3: Confirm zod validation exists**

Run: `ls backend/src/validators/ && grep -rln "from 'zod'" backend/src/validators/ | head -3`
Expected: directory exists with multiple `.js` files importing zod

- [ ] **Step 4: Confirm env config exists**

Run: `grep -n "JWT_SECRET" backend/src/config/env.js`
Expected: matches showing centralized env read + startup check

- [ ] **Step 5: Record outcome**

If all four checks pass, the memory description is accurate and only the domain word needs updating. If any check fails, note which pillar is missing and update the memory body to match reality before continuing.

### Task 1.2: Update CLAUDE.md — remove assignment-bound sections

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Read CLAUDE.md to confirm current state**

Run: `wc -l CLAUDE.md && grep -n "^## " CLAUDE.md`
Expected: lists section headers including "Deployment (A3)", "Assignment Requirements (A3)", "Backend Domain — Dental Staffing Platform"

- [ ] **Step 2: Replace the title**

Replace line 1: `# A3 React Project — Conventions & Structure`
With: `# Visus — Conventions & Architecture`

- [ ] **Step 3: Update Project Setup prose**

In the Project Setup section, replace:
`- Backend is an existing Express/Node.js dentistry staffing platform`
With:
`- Backend is an Express/Node.js optometry staffing platform`

- [ ] **Step 4: Update Frontend Aesthetics ending line**

Replace:
`- vary between light/dark themes — interpret creatively for the dental staffing context`
With:
`- vary between light/dark themes — interpret creatively for the optometry staffing context`

- [ ] **Step 5: Delete the Deployment (A3) section**

Delete the entire section starting at `## Deployment (A3)` and ending just before the `---` separator that precedes `## Assignment Requirements (A3)`. (This is the EC2/Nginx/PM2/Certbot section that was never actually used — production is Railway.)

- [ ] **Step 6: Delete the Assignment Requirements (A3) section**

Delete from `## Assignment Requirements (A3)` through the closing `---` separator that precedes `## Backend Domain — Dental Staffing Platform`. This removes the Grading, Hard UI Rules, Seed Data Requirements, Deliverable Files, and CORS code-snippet subsections.

- [ ] **Step 7: Re-insert UX Principles as a top-level section**

Insert (in the slot where Assignment Requirements used to be, before Backend Domain) this section:

```markdown
## Product UX Principles

These are product rules — UX guarantees the platform makes to every user.

- Users must NEVER need to manually edit URLs
- React Router is used end-to-end (browser back/forward must work)
- Pagination on every list endpoint — no exceptions
- Sorting + filtering on all long lists
- System state is always visually obvious:
  - Job: `open / filled / expired / cancelled / completed`
  - Negotiation: `active / expired / success / failed`, who has accepted
  - Qualification: `created / submitted / approved / rejected / revised`
- Time-sensitive actions show deadlines or countdown timers
- A user in an active negotiation cannot accidentally navigate into conflicting actions

---
```

- [ ] **Step 8: Update Backend Domain heading**

Replace:
`## Backend Domain — Dental Staffing Platform`
With:
`## Backend Domain — Optometry Staffing Platform`

- [ ] **Step 9: Rebrand backend domain prose**

In the Backend Domain section, replace these specific phrases:
- `**Regular** — dental professionals seeking shifts` → `**Regular** — optometry professionals seeking shifts`
- `**Business** — dental clinics posting jobs` → `**Business** — optometry clinics posting jobs`

Leave model names, route paths, schema field names, and "clinic" as a generic term untouched.

- [ ] **Step 10: Verify the edits**

Run: `grep -n "A3\|csc309\|dental\|dentistry" CLAUDE.md`
Expected: no matches.

Run: `grep -n "^# Visus\|^## Product UX Principles\|^## Backend Domain — Optometry" CLAUDE.md`
Expected: each pattern matches exactly once.

### Task 1.3: Update the security memory file

**Files:**
- Modify: `/Users/johnboulanger/.claude/projects/-Users-johnboulanger-Desktop-UofT-2026-Winter-Term-CSC309-boulan23-A3/memory/project_security_hardening.md`

- [ ] **Step 1: Update the description line**

Replace:
`description: Three mandatory security requirements for this dental staffing platform — rate limiting, input validation, and secure secret handling`
With:
`description: Three mandatory security requirements for this optometry staffing platform — rate limiting, input validation, and secure secret handling`

- [ ] **Step 2: Verify**

Run: `grep -n "dental\|dentistry" /Users/johnboulanger/.claude/projects/-Users-johnboulanger-Desktop-UofT-2026-Winter-Term-CSC309-boulan23-A3/memory/*.md`
Expected: no matches.

### Task 1.4: Delete assignment artifacts

**Files:**
- Delete: `WEBSITE`, `INSTALL`, `Makefile`, `DEMO.md`, `csc309_demo.docx`, `resources/`

- [ ] **Step 1: Remove tracked assignment files**

Run:
```bash
git rm WEBSITE INSTALL Makefile DEMO.md
```
Expected: each file is removed and staged for deletion.

- [ ] **Step 2: Remove untracked / empty items**

Run:
```bash
rm -f csc309_demo.docx
rmdir resources 2>/dev/null || true
```
Expected: csc309_demo.docx gone; resources/ gone if empty.

- [ ] **Step 3: Verify**

Run: `ls WEBSITE INSTALL Makefile DEMO.md csc309_demo.docx resources 2>&1 | grep -c "No such"`
Expected: `6` (all six paths no longer exist).

### Task 1.5: Add MIT LICENSE

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Write LICENSE file**

Create `LICENSE` with this exact content:

```
MIT License

Copyright (c) 2026 John Boulanger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Verify**

Run: `head -3 LICENSE`
Expected: starts with `MIT License`.

### Task 1.6: Add .env.example

**Files:**
- Create: `.env.example`
- Reference: `backend/src/config/env.js` (for required env var names)

- [ ] **Step 1: Read env config to enumerate required variables**

Run: `cat backend/src/config/env.js`
Expected: lists JWT_SECRET, FRONTEND_URL, PORT, possibly others. Use the actual variable names from the file when writing `.env.example` below.

- [ ] **Step 2: Write .env.example**

Create `.env.example` with this template (adjust variable names to match what env.js actually reads):

```
# JWT signing secret (REQUIRED in production)
# Generate with: openssl rand -base64 32
JWT_SECRET=replace-me-with-a-long-random-string

# Frontend origin (used for CORS + Socket.IO cors)
# Local dev:    http://localhost:5173
# Production:   https://your-deployment.example.com
FRONTEND_URL=http://localhost:5173

# Port the Express server listens on
# Railway auto-injects this in production; default 3000 locally
PORT=3000
```

- [ ] **Step 3: Verify**

Run: `cat .env.example | head -3`
Expected: shows the JWT_SECRET comment.

### Task 1.7: Commit Phase 1

- [ ] **Step 1: Stage and commit**

Run:
```bash
git add CLAUDE.md LICENSE .env.example
git status
```
Expected: status shows the additions, modifications, and `git rm`'d deletions from Task 1.4 already staged.

Then:
```bash
git commit -m "chore: rebrand documentation and remove assignment artifacts"
```

- [ ] **Step 2: Verify clean state**

Run: `git status --short`
Expected: no output (working tree clean) or only `?? docs/superpowers/` for the spec + plan (those can be committed at the very end).

---

# Phase 2 — Code rebrand

### Task 2.1: Enumerate visible dental references

**Files:** None (recon)

- [ ] **Step 1: Enumerate all dental references**

Run:
```bash
grep -rin -E "dental|dentist|dentalink" backend/src frontend/src frontend/index.html frontend/public 2>/dev/null | grep -v node_modules
```
Expected: matches in 9 frontend files (per Phase 1 inventory). Any results in `backend/src` indicate hidden references — note them and include in this phase if found.

- [ ] **Step 2: Save the list for cross-checking later**

Write the grep output to a scratch file (do not commit) so Step 2.10 can verify nothing was missed:
```bash
grep -rin -E "dental|dentist|dentalink" backend/src frontend/src frontend/index.html frontend/public 2>/dev/null | grep -v node_modules > /tmp/visus-dental-refs-before.txt
wc -l /tmp/visus-dental-refs-before.txt
```

### Task 2.2: Rebrand frontend/index.html

**Files:**
- Modify: `frontend/index.html`

- [ ] **Step 1: Update the page title**

Replace: `<title>DentaLink</title>`
With:    `<title>Visus — Optometry Staffing</title>`

- [ ] **Step 2: Add a description meta tag (portfolio polish)**

Add this line after the viewport meta tag (still inside `<head>`):

```html
<meta name="description" content="Visus connects optometry clinics with qualified eye care professionals for shift staffing." />
```

- [ ] **Step 3: Verify**

Run: `grep -n "DentaLink\|dental" frontend/index.html`
Expected: no matches.

### Task 2.3: Rebrand Navbar

**Files:**
- Modify: `frontend/src/components/Navbar/index.tsx`

- [ ] **Step 1: Identify dental references**

Run: `grep -n "DentaLink\|dental\|Dental" frontend/src/components/Navbar/index.tsx`
Expected: returns one or more matches (likely the brand text).

- [ ] **Step 2: Replace all brand and copy references**

For each match found in Step 1:
- `DentaLink` → `Visus`
- `dental` → `optometry`
- `Dental` → `Optometry`

Use Edit with `replace_all` semantics if the editor supports it; otherwise edit each occurrence with enough surrounding context to make `old_string` unique.

- [ ] **Step 3: Verify**

Run: `grep -n "DentaLink\|dental\|Dental" frontend/src/components/Navbar/index.tsx`
Expected: no matches.

### Task 2.4: Rebrand RegisterUser page

**Files:**
- Modify: `frontend/src/pages/Auth/RegisterUser/index.tsx`

- [ ] **Step 1: Identify dental references**

Run: `grep -n "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Auth/RegisterUser/index.tsx`
Expected: returns matches (likely page headline, helper text).

- [ ] **Step 2: Apply replacements**

For each match:
- `DentaLink` → `Visus`
- `dental professional` → `optometry professional`
- `dental` → `optometry`
- `Dental` → `Optometry`
- `dentist` → `optometrist`

Read context around each match before deciding — for example, "dental hygienist" should become "optometric assistant", not "optometry hygienist". When in doubt, prefer "optometry professional" as the generic term.

- [ ] **Step 3: Verify**

Run: `grep -n "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Auth/RegisterUser/index.tsx`
Expected: no matches.

### Task 2.5: Rebrand RegisterBusiness page

**Files:**
- Modify: `frontend/src/pages/Auth/RegisterBusiness/index.tsx`

- [ ] **Step 1: Identify dental references**

Run: `grep -n "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Auth/RegisterBusiness/index.tsx`

- [ ] **Step 2: Apply replacements**

Same mapping as Task 2.4. For business-context phrases:
- `dental clinic` → `optometry clinic`
- `dental practice` → `optometry practice`

- [ ] **Step 3: Verify**

Run: `grep -n "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Auth/RegisterBusiness/index.tsx`
Expected: no matches.

### Task 2.6: Rebrand Landing page

**Files:**
- Modify: `frontend/src/pages/Public/Landing/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/PlatformStats/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/FeatureCards/index.tsx`
- Modify: `frontend/src/pages/Public/Landing/HeroVisual/index.tsx`

- [ ] **Step 1: Enumerate per file**

For each of the four files, run:
`grep -n "DentaLink\|dental\|Dental\|dentist" <file>`

- [ ] **Step 2: Apply replacements**

For each match, apply the standard mapping (see Task 2.4 Step 2). Pay particular attention to hero copy / value propositions — those are the most visible to a first-time visitor. If the original copy is generic ("Connect with the best dental professionals"), the rebrand is mechanical. If the copy makes a dental-specific claim that doesn't transfer to optometry (e.g. references procedures), reword the sentence to fit optometry naturally.

- [ ] **Step 3: Verify**

Run: `grep -rn "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Public/Landing/`
Expected: no matches.

### Task 2.7: Rebrand BusinessList page

**Files:**
- Modify: `frontend/src/pages/Public/BusinessList/index.tsx`

- [ ] **Step 1: Identify references**

Run: `grep -n "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Public/BusinessList/index.tsx`

- [ ] **Step 2: Apply replacements**

Standard mapping. Note: "Clinics" as a section heading / nav label is acceptable — leave that. Only replace "Dental Clinics" → "Optometry Clinics" or similar dental-specific phrasing.

- [ ] **Step 3: Verify**

Run: `grep -n "DentaLink\|dental\|Dental\|dentist" frontend/src/pages/Public/BusinessList/index.tsx`
Expected: no matches.

### Task 2.8: Audit logo and favicon

**Files:**
- Audit: `frontend/public/logo.svg`
- Audit: `frontend/public/icons.svg`

- [ ] **Step 1: Inspect logo content**

Run: `head -3 frontend/public/logo.svg`
Expected: SVG header. The current logo is a generic chain-link icon (verified during planning). If it shows tooth shapes or dental imagery, replace it; otherwise leave it.

- [ ] **Step 2: Optional — replace with eye-themed icon**

If the user wants a distinct optometry icon, source one (eye, glasses, or "V" monogram) and replace `frontend/public/logo.svg` with it. SVG should be square-viewBox, single-color, scalable. If skipping, no action.

- [ ] **Step 3: Verify favicon still loads**

Run dev server (`cd frontend && npm run dev`), open `http://localhost:5173`, confirm browser tab shows the logo (whichever version is in place). Stop dev server with Ctrl+C.

### Task 2.9: Smoke test the rebrand

**Files:** None

- [ ] **Step 1: Start backend**

Run in a background terminal: `cd backend && node --watch src/server.js`
Expected: server starts on port 3000.

- [ ] **Step 2: Start frontend**

Run in another background terminal: `cd frontend && npm run dev`
Expected: Vite dev server on port 5173.

- [ ] **Step 3: Manual UI smoke test**

Open `http://localhost:5173` and verify:
- Browser tab title reads "Visus — Optometry Staffing"
- Navbar shows "Visus" branding
- Landing page hero references optometry (not dental)
- Registration flow (both user types) shows optometry copy
- Clicking the "Clinics" link in BusinessList shows the public list without any "Dental" prefix

- [ ] **Step 4: Stop both servers**

Ctrl+C both terminals.

### Task 2.10: Cross-check no dental strings remain

**Files:** None

- [ ] **Step 1: Run final grep**

Run:
```bash
grep -rin -E "dental|dentist|dentalink" backend/src frontend/src frontend/index.html frontend/public 2>/dev/null | grep -v node_modules
```
Expected: zero matches.

If matches remain, edit them now before committing.

### Task 2.11: Commit Phase 2

- [ ] **Step 1: Stage and commit**

```bash
git add frontend/
git status
```
Expected: shows modifications to index.html, navbar, register pages, landing components, business list.

```bash
git commit -m "refactor: rebrand frontend copy from dental to optometry"
```

---

# Phase 3 — Seed data rebrand

### Task 3.1: Read the full seed file

**Files:** None (read-only context)

- [ ] **Step 1: Read seed.js in full**

Run: `wc -l backend/prisma/seed.js`
Expected: ~638 lines.

Then read the file using your editor's read tool and locate these blocks:
- `BUSINESSES` (or similarly named) array — ~15 entries with dental names
- `POSITION_TYPES` array — 12 entries, all dental
- `BIOGRAPHIES` array — ~12-20 entries, all dental
- The user-creation loops that build emails like `regular${i+1}@csc309.utoronto.ca`
- Any `JOBS` / job-title arrays

- [ ] **Step 2: Confirm scope**

Run: `grep -cE "[Dd]ental|csc309" backend/prisma/seed.js`
Expected: ≥ 60 (rough total count of dental-flavored strings + csc309 emails).

### Task 3.2: Rebrand seed emails

**Files:**
- Modify: `backend/prisma/seed.js`

- [ ] **Step 1: Replace email domain**

Replace every occurrence of `@csc309.utoronto.ca` with `@visus.dev`.

This appears in user-creation template literals (`regular${i + 1}@csc309.utoronto.ca`), in admin email (`admin1@csc309.utoronto.ca`), in business email template (`business${i + 1}@csc309.utoronto.ca`), and in any console.log strings.

- [ ] **Step 2: Verify**

Run: `grep -n "csc309" backend/prisma/seed.js`
Expected: no matches.

### Task 3.3: Rebrand practice names

**Files:**
- Modify: `backend/prisma/seed.js`

- [ ] **Step 1: Replace the 15 business entries**

Locate the `BUSINESSES` array (or equivalent) — currently 15 dental clinics. Replace the entire array with these optometry practices, preserving the `lon`/`lat` coordinates and address values from the existing entries so the map still shows realistic Toronto locations:

```js
[
  { name: 'Bahen Vision Clinic', owner: 'Sarah Chen', lon: -79.3957, lat: 43.6596, address: '40 St George St, Toronto', phone: '416-555-0101' },
  { name: 'Bloor Eye Care', owner: 'Emily Watson', lon: -79.3990, lat: 43.6677, address: '700 Bloor St W, Toronto', phone: '416-555-0103' },
  { name: 'King West Optometry', owner: 'David Kim', lon: -79.3940, lat: 43.6445, address: '500 King St W, Toronto', phone: '416-555-0104' },
  { name: 'Danforth Vision Studio', owner: 'Priya Sharma', lon: -79.3520, lat: 43.6784, address: '300 Danforth Ave, Toronto', phone: '416-555-0105' },
  { name: 'Queen Street Eyecare', owner: 'James Liu', lon: -79.3820, lat: 43.6485, address: '100 Queen St W, Toronto', phone: '416-555-0106' },
  { name: 'Yorkville Optometry Group', owner: 'Anna Martinez', lon: -79.3920, lat: 43.6715, address: '55 Yorkville Ave, Toronto', phone: '416-555-0107' },
  { name: 'College Vision Clinic', owner: 'Robert Nguyen', lon: -79.3965, lat: 43.6580, address: '400 College St, Toronto', phone: '416-555-0108' },
  { name: 'Harbourfront Eye Care', owner: 'Lisa Thompson', lon: -79.3810, lat: 43.6390, address: '10 Queens Quay W, Toronto', phone: '416-555-0109' },
  { name: 'CSSU Eyecare', owner: 'Kevin Brown', lon: -79.3950, lat: 43.6600, address: '6 Hoskin Ave, Toronto', phone: '416-555-0110' },
  { name: 'Annex Vision Studio', owner: 'Stephanie Ross', lon: -79.4050, lat: 43.6690, address: '388 Bloor St W, Toronto', phone: '416-555-0111' },
  { name: 'Rosedale Optometry', owner: 'Patrick O\'Brien', lon: -79.3780, lat: 43.6770, address: '1030 Yonge St, Toronto', phone: '416-555-0112' },
  { name: 'Liberty Village Eye Centre', owner: 'Michelle Tran', lon: -79.4200, lat: 43.6380, address: '171 E Liberty St, Toronto', phone: '416-555-0113' },
  { name: 'Leslieville Vision Care', owner: 'Andrew Campbell', lon: -79.3290, lat: 43.6650, address: '1100 Queen St E, Toronto', phone: '416-555-0114' },
  { name: 'Midtown Eye Centre', owner: 'Laura Singh', lon: -79.3930, lat: 43.6870, address: '2300 Yonge St, Toronto', phone: '416-555-0115' },
  { name: 'Riverdale Optometry', owner: 'Marcus Bell', lon: -79.3450, lat: 43.6680, address: '780 Broadview Ave, Toronto', phone: '416-555-0116' },
]
```

Note: this replaces the 15 existing entries 1:1 with optometry equivalents. Coordinates and addresses are preserved (the original list had a CSSU and an extra entry; the new list has the same count to ensure pagination still produces ≥ 2 pages).

- [ ] **Step 2: Verify**

Run: `grep -cE "Bahen Vision Clinic|Bloor Eye Care|Yorkville Optometry Group" backend/prisma/seed.js`
Expected: `3`.

### Task 3.4: Rebrand position types

**Files:**
- Modify: `backend/prisma/seed.js`

- [ ] **Step 1: Replace the POSITION_TYPES array**

Replace the entire `POSITION_TYPES` array (currently 12 dental entries) with this 12-entry optometry version. Keeping 12 entries preserves any seed logic that picks N random position types.

```js
const POSITION_TYPES = [
  { name: 'Optometric Assistant (Level 1)', description: 'Entry-level optometric assistant supporting pre-tests, instrument prep, and patient flow.' },
  { name: 'Optometric Assistant (Level 2)', description: 'Experienced optometric assistant performing pretesting, OCT scans, and visual field testing.' },
  { name: 'Licensed Optician', description: 'Licensed optician fitting and dispensing prescription eyewear and contact lenses.' },
  { name: 'Front Desk Coordinator', description: 'Front desk staff handling scheduling, insurance verification, and patient communications.' },
  { name: 'Contact Lens Specialist', description: 'Specialist focused on contact lens fitting, training, and follow-up care.' },
  { name: 'Pediatric Vision Assistant', description: 'Assistant specializing in pediatric optometry and child behaviour management.' },
  { name: 'Optical Lab Technician', description: 'Technician fabricating and edging prescription lenses to frame specifications.' },
  { name: 'Pre-test Technician', description: 'Specialist responsible for auto-refraction, tonometry, and pre-exam diagnostics.' },
  { name: 'Practice Manager', description: 'Manages day-to-day clinic operations, staffing, and administrative workflows.' },
  { name: 'Vision Therapist', description: 'Conducts therapy sessions for binocular vision, amblyopia, and visual processing.' },
  { name: 'Optometrist', description: 'Licensed optometrist performing comprehensive eye exams and ocular health assessments.' },
  { name: 'Retail Optical Associate', description: 'Sales-floor associate guiding patients through frame selection and lens options.' },
];
```

- [ ] **Step 2: Verify**

Run: `grep -cE "Optometric Assistant|Licensed Optician|Optometrist" backend/prisma/seed.js`
Expected: `≥ 3`.

Run: `grep -E "Dental Assistant|Dental Hygienist|Dental Lab" backend/prisma/seed.js`
Expected: no matches.

### Task 3.5: Rebrand biographies

**Files:**
- Modify: `backend/prisma/seed.js`

- [ ] **Step 1: Replace the BIOGRAPHIES array**

Replace the entire `BIOGRAPHIES` array with this 12-entry optometry version. Keep the count the same as the original (so any modulo/random logic still works).

```js
const BIOGRAPHIES = [
  'Experienced optometry professional with a passion for patient care and community vision health.',
  'Recent graduate with strong clinical skills and enthusiasm for learning in eye care.',
  'Dedicated healthcare worker with 5 years of experience in optometry settings.',
  'Detail-oriented professional committed to maintaining the highest standards of vision care.',
  'Bilingual optometry professional fluent in English and French.',
  'Certified optometric assistant with expertise in pediatric vision testing.',
  'Skilled clinician with a background in contact lens fitting and patient education.',
  'Healthcare professional with experience in both private practice and community vision clinics.',
  'Vision care specialist with a focus on low-vision rehabilitation and assistive technology.',
  'Cross-trained optical professional comfortable with pretesting, frame selection, and lab work.',
  'Patient-first optometry pro with a background in independent and corporate practice settings.',
  'Adaptable eye care professional with experience across pediatric and geriatric populations.',
];
```

- [ ] **Step 2: Verify**

Run: `grep -E "dental professional|dental settings|pediatric dentistry" backend/prisma/seed.js`
Expected: no matches.

### Task 3.6: Rebrand job titles and descriptions

**Files:**
- Modify: `backend/prisma/seed.js`

- [ ] **Step 1: Find dental references in job creation logic**

Run: `grep -n -E "dental|Dental|dentist" backend/prisma/seed.js`
Expected: any remaining dental references — likely in JOB_TITLES, JOB_DESCRIPTIONS, or hardcoded shift descriptions.

- [ ] **Step 2: Replace job-related dental strings**

For each remaining match:
- Map dental procedure references to optometry equivalents (e.g. "scaling and root planing" → "comprehensive eye exam"; "patient cleanings" → "pretesting and OCT scans")
- "Dental clinic" → "Optometry clinic"
- "Dental practice" → "Optometry practice"
- "Dental professional" → "Eye care professional"
- Any leftover `Dental` / `dental` / `dentist` → optometry equivalents

Read the surrounding context for each match before deciding the replacement — a verbatim word swap may produce awkward copy. Aim for natural optometry wording.

- [ ] **Step 3: Verify**

Run: `grep -n -E "dental|Dental|dentist" backend/prisma/seed.js`
Expected: no matches.

### Task 3.7: Update seed file header comment

**Files:**
- Modify: `backend/prisma/seed.js`

- [ ] **Step 1: Update the header comment**

Find the comment near line 14: `// Toronto-area dental clinic names and coordinates`
Replace with: `// Toronto-area optometry clinic names and coordinates`

- [ ] **Step 2: Verify final state**

Run: `grep -ciE "dental|dentist|csc309" backend/prisma/seed.js`
Expected: `0`.

### Task 3.8: Reseed the database

**Files:** None (DB operation)

- [ ] **Step 1: Force-reset the dev database and reseed**

Run:
```bash
cd backend
npx prisma db push --force-reset
```
Expected: schema applied, all data dropped. Confirm prompt if any.

Then:
```bash
npx prisma db seed
```
Expected: seed completes successfully, console output shows `Created admin: admin1@visus.dev`, `Created business: business1@visus.dev`, etc.

- [ ] **Step 2: Verify counts**

Run:
```bash
npx prisma studio
```
or use a one-liner query:
```bash
node -e "const {PrismaClient}=require('@prisma/client');(async()=>{const p=new PrismaClient();console.log('users:',await p.regularUser.count(),'businesses:',await p.business.count(),'jobs:',await p.job.count(),'positionTypes:',await p.positionType.count());await p.\$disconnect();})()"
```
Expected: ≥ 20 users, ≥ 10 businesses (we seeded 15), ≥ 30 jobs, 12 position types.

### Task 3.9: UI smoke test the new data

**Files:** None

- [ ] **Step 1: Start both servers**

Same as Task 2.9 Steps 1-2.

- [ ] **Step 2: Verify in browser**

Navigate `http://localhost:5173`:
- Public clinics list shows optometry practice names (e.g. "Bahen Vision Clinic", "Yorkville Optometry Group"), paginated ≥ 2 pages
- Position types dropdown (visible in business job-creation flow or admin page) shows "Optometrist", "Licensed Optician", etc.
- Login as `admin1@visus.dev / 123123` succeeds; admin dashboard shows the new users + businesses
- Login as `regular1@visus.dev / 123123` succeeds; jobs feed shows optometry-flavored job titles

- [ ] **Step 3: Stop servers**

Ctrl+C both terminals.

### Task 3.10: Commit Phase 3

- [ ] **Step 1: Stage and commit**

```bash
git add backend/prisma/seed.js
git commit -m "data: replace dental seed data with optometry practices and roles"
```

Note: `backend/prisma/dev.db` is gitignored and should not be committed; verify with `git status`.

---

# Phase 4 — README, frontend guide, screenshots

### Task 4.1: Rewrite README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read current README**

Run: `wc -l README.md && head -20 README.md`
Expected: ~145 lines starting with `# DentaLink`.

- [ ] **Step 2: Apply rebrand replacements**

Across the entire file:
- `DentaLink` → `Visus`
- `dental staffing platform` → `optometry staffing platform`
- `dental professional` → `optometry professional` / `eye care professional`
- `dental clinic` → `optometry clinic`
- `dentist` → `optometrist`
- Subsection "For dental professionals" → "For optometry professionals"
- Subsection "For dental clinics" → "For optometry clinics"

- [ ] **Step 3: Add demo credentials section**

Insert (after the "Tech stack" section, before "Getting started") this section:

```markdown
## Live demo

[https://dentalink-production-ceda.up.railway.app](https://dentalink-production-ceda.up.railway.app)

### Demo accounts

All accounts use the password `123123`.

| Role | Email |
|------|-------|
| Optometry professional | `regular1@visus.dev` through `regular20@visus.dev` |
| Optometry clinic | `business1@visus.dev` through `business15@visus.dev` |
| Platform admin | `admin1@visus.dev` |
```

Note: the Railway URL still contains `dentalink-production` — that's the deployment ID and isn't worth renaming for a portfolio project. If you want a custom domain later, that's a separate task.

- [ ] **Step 4: Verify**

Run: `grep -in "dental\|dentalink" README.md`
Expected: no matches. (One match is acceptable: the Railway deployment URL `dentalink-production-ceda.up.railway.app` — that's the live URL, not editable copy.)

If only the URL matches, that's fine. Otherwise edit.

### Task 4.2: Rewrite FRONTEND_GUIDE.md

**Files:**
- Modify: `FRONTEND_GUIDE.md`

- [ ] **Step 1: Apply same mapping as README**

Run: `grep -cin "dental\|dentalink\|dentist" FRONTEND_GUIDE.md`
Expected: a count of remaining matches.

Apply the same replacements as Task 4.1 Step 2 across the entire file. The guide is ~997 lines so this may take multiple Edit operations — use `replace_all` semantics where the editor supports it.

- [ ] **Step 2: Spot-check file paths and line numbers**

The guide references specific file paths and possibly line numbers in the source. Across the 71+ commits since the guide was written, some may have drifted. Run:

```bash
grep -nE "^(##|###).*Example|frontend/src/[a-zA-Z]" FRONTEND_GUIDE.md | head -20
```

Pick 3-5 file path references at random and confirm those files still exist at the cited paths. Note any that have moved; correct them inline. Do not exhaustively re-check every line number — a portfolio guide just needs to be plausibly accurate.

- [ ] **Step 3: Verify**

Run: `grep -in "dental\|dentalink\|dentist" FRONTEND_GUIDE.md`
Expected: no matches.

### Task 4.3: Re-capture screenshots

**Files:**
- Replace: `docs/screenshots/01-landing.png` through `docs/screenshots/09-register.png`

This is a manual step. Automation via Playwright is possible but probably not worth the setup for nine screenshots.

- [ ] **Step 1: Start a clean app**

Run:
```bash
cd backend && npx prisma db push --force-reset && npx prisma db seed
cd ../backend && node --watch src/server.js  # in one terminal
cd frontend && npm run dev                    # in another
```

- [ ] **Step 2: Capture each screenshot**

For each of the nine `docs/screenshots/*.png` files referenced in README.md, navigate to the relevant page in the browser and take a screenshot. Use a fresh browser window with no dev tools open. Aim for 1440×900 or similar standard size. Pages to capture (in README order):

1. `01-landing.png` — landing page hero
2. `02-login.png` — login form
3. `03-regular-jobs.png` — logged in as regular, jobs list
4. `04-regular-qualifications.png` — qualifications page
5. `05-business-jobs.png` — logged in as business, jobs management
6. `06-admin-users.png` — admin users panel
7. `07-admin-settings.png` — admin settings
8. `08-clinics-list.png` — public clinics list
9. `09-register.png` — registration form

- [ ] **Step 3: Replace files in place**

Save each new screenshot to `docs/screenshots/` with the same filenames (overwriting the old DentaLink-branded shots).

- [ ] **Step 4: Verify**

Run: `git diff --stat docs/screenshots/`
Expected: nine modified PNG files.

Visually open the README in a markdown previewer or push and check on GitHub — all images should now show Visus branding.

### Task 4.4: Final cross-phase verification

**Files:** None

- [ ] **Step 1: Run global grep across entire project**

```bash
grep -rin -E "dental|dentist|dentalink|csc309|A3 React" . \
  --include="*.{js,jsx,ts,tsx,md,html,json,svg,css}" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=.playwright-mcp 2>/dev/null
```

Expected: zero matches, OR only matches in the Railway deployment URL (`dentalink-production-ceda.up.railway.app`) which is the live URL and acceptable.

- [ ] **Step 2: Smoke test full app one more time**

Restart both servers (backend + frontend), navigate through:
- Landing page
- Login as admin
- Login as a business
- Login as a regular user
- Browse public clinics

Confirm no "dental" / "DentaLink" text appears anywhere.

### Task 4.5: Commit Phase 4 + spec/plan files

- [ ] **Step 1: Stage and commit Phase 4 work**

```bash
git add README.md FRONTEND_GUIDE.md docs/screenshots/
git commit -m "docs: rewrite README and frontend guide for Visus, refresh screenshots"
```

- [ ] **Step 2: Commit the spec and plan documents**

```bash
git add docs/superpowers/specs/2026-05-12-visus-rebrand-design.md
git add docs/superpowers/plans/2026-05-12-visus-rebrand-plan.md
git commit -m "docs: add Visus rebrand spec and implementation plan"
```

- [ ] **Step 3: Confirm clean working tree**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

- [ ] **Step 4: Push to remote**

```bash
git push origin main
```
Expected: push succeeds.

Then verify Railway picks up the deploy and the live site still works (open `https://dentalink-production-ceda.up.railway.app` in a browser, confirm Visus branding appears).

---

## Done state

When all phases are complete:

- `git log --oneline -10` shows four new rebrand commits + spec/plan commit, on top of the original history
- `grep -rin "dental\|dentist\|dentalink\|csc309" .` (excluding Railway URL and node_modules) returns zero matches
- Live Railway deployment shows Visus branding end-to-end
- README on GitHub renders with new screenshots
- Memory file describes the project as "optometry staffing platform"
- LICENSE and .env.example exist
- Assignment artifact files (WEBSITE, INSTALL, Makefile, DEMO.md, csc309_demo.docx, resources/) are gone
