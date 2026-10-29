---
name: Blink
description: Clinics and eye care pros, matched in the blink of an eye.
colors:
  brand: "#3451d1"
  brand-hover: "#2b45bd"
  brand-deep: "#1f2f86"
  brand-tint: "#eaefff"
  brand-band: "#eaefff"
  sky: "#9db8ff"
  ink: "#222222"
  ink-pressed: "#000000"
  text-secondary: "#6a6a6a"
  hairline: "#dddddd"
  hairline-soft: "#ebebeb"
  border-strong: "#b0b0b0"
  surface: "#ffffff"
  surface-subtle: "#f7f7f7"
  surface-muted: "#f2f2f2"
  dot-ended: "#c1c1c1"
  warning: "#8a5300"
  warning-subtle: "#fff6e5"
  danger: "#c13515"
  danger-subtle: "#fff4f1"
typography:
  display:
    fontFamily: "Schibsted Grotesk Variable, Inter Variable, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 1.2rem + 3.6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk Variable, Inter Variable, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Schibsted Grotesk Variable, Inter Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"cv11\""
  body-sm:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
  caption:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  figures:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    fontFeature: "\"tnum\""
  chart:
    fontFamily: "Optician Sans, Schibsted Grotesk Variable, sans-serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1
rounded:
  control: "8px"
  card: "14px"
  bubble: "16px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 18px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 18px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-subtle}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.ink-pressed}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "44px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  chip-active:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-deep}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
  map-price-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  map-price-pill-active:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  map-cluster:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "30px"
  footer:
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    padding: "40px 0 32px"
---

# Design System: Blink

## Overview

**Creative North Star: "The Quiet Marketplace"**

Blink borrows the grammar of a mature listings marketplace and applies it to optometry shifts. Shifts read like listings: a storefront photo, the clinic name, the role, the day and the rate. Search comes first and sits in a wide pill. The canvas is white, the text is near-black ink, and one blue, Iris, does every job that needs colour. A pale Sky tint carries the large quiet areas. Everything else is hairlines, soft grey surfaces and type.

Density changes with the mode. Public pages breathe, with a centred display headline and generous vertical space. App screens (shift search, negotiation, admin tables) are tighter and more precise: hairline rows, sticky table headers, tabular figures and quiet underline tabs. Motion is rare and named: the logo blinks, the hero's eyelid band flattens on scroll, the live dot pulses, and a confirmed match plays one blink. Pages do not animate in. Two small signatures carry the eye-care theme: a family of eight line illustrations, and eye-chart lettering in Optician Sans on a few quiet surfaces.

The brand mark is a two-lid eye. The upper lid is ink, the lower lid is Iris with three short lashes, and the lowercase "blink" wordmark sits beside it in the display face. The product rejects the gradient hero with stock icon cards, a clinical white-and-blue hospital look, playful styling and a dark technical look.

**Key Characteristics:**
- One accent, Iris, on a white and ink base, with a pale Sky tint for large areas.
- Photo-led listing cards with one fixed illustrative storefront photo per clinic.
- Schibsted Grotesk headlines, Inter interface text, tabular figures for money and times.
- 8px controls, 14px cards, full pills for search, chips and map markers.
- One soft shadow tier, used only for lift: search, hovered cards, menus and map markers.
- Statuses are a dot and a label, never a coloured pill.
- Eight spot illustrations in ink with one Iris detail, on the logo's 3px round stroke.
- Optician Sans, the eye-chart face, only on the 404 page, zero-result charts, the admin review badge and the footer.

## Colors

A neutral marketplace palette with one blue accent, its pale Sky tint, and two feedback colours held in reserve.

### Primary
- **Iris** (#3451d1): primary buttons, the landing "Find shifts" button, the Live status dot, the sidebar live dot, the countdown's remaining minutes, active map price pills and clusters, clinic dot pins, the logo's lower lid and lashes, the favicon, the brand detail in each spot illustration, checkbox and radio fills, the text caret, and on-state switches. White on Iris is 6.47:1.
- **Iris Hover** (#2b45bd): hover and pressed state for Iris fills. White on it is 7.81:1.
- **Deep Iris** (#1f2f86): the footer band; text on Sky Tint (active chips, success messages, 10.11:1). White on Deep Iris is 11.61:1.
- **Sky Tint** (#eaefff): the landing hero's eyelid band, the closing call-to-action band, active chip fill, text selection, success message fill and the photo placeholder behind clinic images. Ink on it is 13.86:1 and Secondary Grey is 4.71:1.
- **Sky** (#9db8ff): soft details where a mid tone is needed, such as the border of success messages on Sky Tint. Decorative only, never text.

### Neutral
- **Ink** (#222222): all headings and body text, secondary button borders, the active tab underline, the focus ring, map clusters, ink pill buttons, the sender's chat bubble, solid status dots.
- **Pressed Ink** (#000000): hover state of ink-filled buttons only.
- **Secondary Grey** (#6a6a6a): meta lines, captions, table headers, inactive tabs, placeholders, the pending status ring.
- **Hairline** (#dddddd): input, card, chip and map borders, section rules, empty countdown dots.
- **Soft Hairline** (#ebebeb): row dividers inside lists, tables and detail lists; the top bar's lower edge.
- **Strong Border** (#b0b0b0): input border on hover.
- **White** (#ffffff): the canvas and every card and control surface.
- **Soft Surface** (#f7f7f7): hover fill for ghost controls and nav links, the active sidebar item, disabled inputs, the map placeholder.
- **Muted Surface** (#f2f2f2): initials avatars, the other party's chat bubble, disabled send button.
- **Ended Grey** (#c1c1c1): the dot for ended, expired, cancelled and rejected states.

### Feedback
- **Amber** (#8a5300 on #fff6e5): the countdown in its final two minutes and warning messages. Nothing else.
- **Danger Red** (#c13515 on #fff4f1): form errors, invalid input borders and error banners. Destructive buttons do not use it.

### Named Rules
**The One Accent Rule.** Iris is the only accent; Sky is its tint, not a second colour. If a new element needs emphasis and is not a primary action, a live state or a selected state, it gets ink or weight, not a colour.

**The Live Is Iris Rule.** Among statuses, only Live is Iris, and it pulses. Filled and Approved use a solid ink dot, Open and In review use a hollow grey ring, Ended states use a grey dot.

## Typography

**Display Font:** Schibsted Grotesk Variable (with Inter Variable, system-ui)
**Body Font:** Inter Variable (with system-ui, -apple-system, Segoe UI), character variant cv11 on
**Label/Mono Font:** Inter for labels; the system monospace stack is defined but carries no brand role.
**Chart Font:** Optician Sans (`--font-chart`), a free face (SIL Open Font License 1.1) rebuilt from the letters on real eye charts. It is self-hosted from `frontend/src/assets/fonts/` with the licence beside it as `OFL.txt`.

**Character:** A tight, confident grotesk for headlines over a neutral, highly legible interface face. Headlines are bold and closely tracked; everything else is regular to semibold.

Schibsted Grotesk and Inter are self-hosted through Fontsource.

### Hierarchy
- **Display** (700, clamp(2.375rem, 1.2rem + 3.6vw, 4rem), 1.04): the landing hero headline only, centred, two lines on desktop.
- **Headline** (700, 2rem, 1.15; 1.75rem on phones): page titles (h1) in the app.
- **Title** (700, 1.5rem, 1.25; 1.375rem on phones): section headings (h2). Landing section heads step up to 2rem and the closing band to 2.5rem.
- **Subtitle** (Inter 600, 1.125rem, 1.35): card and panel headings (h3, h4).
- **Body** (400, 1rem, 1.5): running text and inputs. Page subtitles and helper text use 0.875rem in Secondary Grey, up to 64ch.
- **Card text** (0.9375rem, 1.35): listing card clinic name (600), meta lines (400, grey) and rate.
- **Label** (500, 0.875rem): form labels, chips, nav links, status labels. Buttons use 600.
- **Caption** (500 to 700, 0.75rem): table headers, tab counts, photo overlays, the small field labels inside the landing search pill. Sentence case, never uppercase.
- **Chart** (Optician Sans 400, line height 1): shrinking eye-chart lines only. The 404 chart runs 150, 84, 48, 28 and 16px; the zero-result chart 40, 24 and 14px; the admin badge 26, 15 and 9px; the footer "B L I N K" 64, 54, 45, 37 and 30px (65% below 600px). It is always decorative and `aria-hidden`; the real text sits beside it.

### Named Rules
**The Tabular Money Rule.** Rates, times, counts and the countdown use tabular figures (`font-variant-numeric: tabular-nums`), so columns and live numbers do not jitter.

**The Sentence Case Rule.** No text in the product is uppercase or letter-spaced for decoration. Small labels name a field; they never sit above a heading as a tag. The one exception is the eye-chart lettering, which is a picture of a chart and is hidden from screen readers.

**The Four Places Rule.** Optician Sans appears in four places only: the 404 page, zero-result search states (filtered shift search and clinic search), the admin credential review badge and the footer sign-off. It never sets working content such as rates, names or headings.

## Layout

Content sits in a container of up to 1280px with 40px gutters (16px on phones). The top bar is 72px tall (64px on phones), sticky, white, with a soft hairline below. Public pages use a three-column top bar: logo left, links centre, actions right. App pages use a left sidebar with the logo and an account pill in the top bar.

Spacing runs on a 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96). Cards use 24px padding. Page headers sit 24px above content. Empty states use 64px of vertical padding.

Shift search pairs a two-column grid of listing cards with a sticky map on the right. Tables keep a sticky header under the top bar, scroll sideways from 769px to 1100px, and stack into label and value rows at 768px and below. The single breakpoint for phone layout is 768px; at that width chips and small buttons grow to 44px touch targets.

## Elevation & Depth

The system is flat with one lift. Surfaces at rest have a hairline border and no shadow. A single three-layer soft shadow appears when something floats or responds: the landing search pill, a hovered listing card, the account pill on hover, menus, map markers and the map card popup. Inputs show focus with an inset ink border, not a shadow.

### Shadow Vocabulary
- **The tier** (`box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0`): every lifted element.

### Named Rules
**The One Tier Rule.** There is one shadow. A hovered listing card gets the tier and rises 2px; nothing gets a second, heavier shadow.

## Shapes

Three radii carry the system. Controls (buttons, inputs, selects, messages, tooltips) use gently rounded 8px corners. Cards, panels, photos and the map frame use 14px. Search fields, chips, filter selects, nav links, the account pill, map price pills and clusters use full pills (999px). Chat bubbles use 16px with the corner nearest the sender cut to 4px. Avatars, status dots, countdown dots and map pins are circles.

The one curved silhouette is the eyelid: the hero band's lower edge is a wide elliptical arc (220px deep on desktop, 96px on phones) that flattens to 24px (12px on phones) over the first 300px of scroll.

## Components

### Buttons
Restrained and solid; colour marks only the primary action.
- **Shape:** gently rounded (8px), 40px tall; small 32px, large 48px.
- **Primary:** Iris fill, white text, 600 weight, 8px 18px padding. Hover goes to Iris Hover.
- **Secondary:** white fill, 1px ink border, ink text. Hover fills Soft Surface.
- **Danger:** looks the same as Secondary. Destructive actions stay neutral and are confirmed in context.
- **Ghost:** ink text with no fill; underline on hover.
- **Ink pill:** ink fill, white text, full pill or circle, hover to black. Used for the mobile map toggle and the chat send button.
- **States:** press scales to 0.98. Disabled drops to 45% opacity. Focus shows a 2px ink outline with a 2px offset. A loading button shows a small spinner in its own colour.

### Chips
- **Style:** white, 1px Hairline border, full pill, 36px tall, ink label. Hover darkens the border to ink.
- **State:** selected chips fill Sky Tint with an Iris border and Deep Iris text. Filter selects use the same pill and show a 2px ink border once set.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** white.
- **Shadow Strategy:** none at rest; listing cards take the shadow tier and rise 2px on hover (see Elevation & Depth).
- **Border:** 1px Hairline on panels; listing cards have no border, the photo carries the shape.
- **Internal Padding:** 24px for panels.

### Inputs / Fields
- **Style:** white, 1px Hairline, 8px radius, 44px tall, 10px 14px padding, Iris caret.
- **Focus:** the border turns ink and an inset 1px ink line doubles it, so the layout does not move.
- **Error / Disabled:** errors use a doubled Danger Red border and a red message below. Disabled fields fill Soft Surface with grey text.

### Navigation
- **Top bar links:** 0.875rem, 500 weight, ink, full pill hit area; hover fills Soft Surface; the current link goes to 600.
- **Account pill:** full pill with a 32px avatar (ink circle with white initial when there is no photo); takes the shadow tier on hover and when open.
- **Sidebar:** grey items; the active item is ink on Soft Surface. A pulsing Iris dot marks a live negotiation.
- **Tabs:** grey labels with an ink 2px underline on the active tab.
- **Mobile:** links move into a drawer.

### Listing Card (signature)
A clinic photo at 4:3 with 14px corners, a white "Verified clinic" pill on the photo, then the clinic name (600), role and day in grey, and the rate in tabular figures with the number bold and "/hr" regular. A small "Illustrative photo" note appears on the photo on hover and always on touch screens.

### Clinic Photo
Each seeded clinic has one fixed Unsplash storefront photo, matched by clinic name, so a reseed keeps the pairing. Clinics added later get a stable pick from their id. Photos are illustrative and credited in the README.

### Status Badge
An 8px dot and a 0.875rem label in ink, with no pill background. Live is an Iris dot that pulses (1.6s). Filled, Completed and Approved are a solid ink dot. Open, Not submitted and In review are a hollow grey ring. Expired, Cancelled and Rejected are a grey dot with grey text.

### Negotiation Countdown
Fifteen 8px dots, one per minute (10px in the large size). Remaining minutes are Iris, the current minute pulses, elapsed minutes fade to Hairline grey. A plain sentence below gives the time left ("12 of 15 minutes left"). In the final two minutes the dots and the sentence turn Amber. When the clock stops, the pulse stops.

### Clinic Map
Mapbox GL JS on the Mapbox Standard style, framed with a Hairline border and 14px corners. The basemap is flat and calm: day light, no 3D buildings, trees or landmarks, no points of interest, transit labels or admin lines. Land, buildings and land-use fills are warm near-white neutrals, greenspace is a natural soft green (hsl(110, 30%, 87%)), water is a pale clear blue (hsl(205, 58%, 86%)), and roads, trunks and motorways are quiet greys, so the price pills stay the strongest thing on the map. Road and place labels stay. The Mapbox logo sits bottom left and the attribution bottom right, both small. Without a Mapbox token the same map runs on MapLibre GL with OpenFreeMap's Positron style. Each shift is a white price pill (rate range, 700 weight, tabular, shadow tier). Hovering the pin or its listing card makes it active: the pill fills Iris with white text and scales to 1.06. Nearby pins merge into ink cluster pills ("4 shifts") that also turn Iris when they hold the active shift. Clinic profiles use a 14px Iris dot pin with a white ring and a name tooltip. Clicking a pin opens a compact card with a 96px photo column.

### Logo
The two-lid mark and the lowercase "blink" wordmark (display face, 700, -0.04em, 82% of the mark height). The blink is natural: only the upper lid moves. Its path morphs from `M6 36 Q32 4 58 36` to the closed `M6 31 Q32 54 58 31`, holds and opens (close 160ms, hold 80ms, open 200ms), while the Iris lower lid and lashes stay still. The morph is an SMIL `<animate>` started with `beginElement()`, so it runs the same in Chrome, Firefox and Safari. In the top bar it plays once every 4.5 seconds. A confirmed negotiation plays one blink beside "Shift confirmed" after 0.15s. Reduced-motion users see a still mark.

### Eyelid Band
The landing hero sits on a Sky Tint band that is wider than the viewport and has a curved lower edge. Scroll flattens the curve like a slow blink, using a scroll-driven animation with a passive scroll listener as fallback. The band keeps its size; only the curve changes.

### Spot Illustrations
Eight line drawings on a 96px grid with a 3px round stroke, the same stroke family as the logo (`components/Illustration`, with `name` and `size` props). Ink draws the shape; one Iris detail marks what matters, and the 15-minute clock adds an Iris wedge at 16% opacity. They are `aria-hidden`; the text beside them carries the meaning.
- **storefront:** "How it works" step 1; the clinic's empty "Your shifts".
- **verified-id:** "How it works" step 2; the empty qualifications page.
- **clock15:** "How it works" step 3; "No active negotiation".
- **glasses:** the professional's empty interests and invitations tabs.
- **calendar:** the empty Work history tab.
- **phoropter:** the admin credential review empty queue.
- **clinic-pin:** an empty clinic list (the clinic directory without a search, the landing clinic grid).
- **eye-chart:** shift search with no open shifts and no filters.

On the landing page the step drawings sit at 80px in a 120px Soft Surface circle (56px in an 80px circle on phones). In empty states they sit at 104px above the existing title, text and action.

### Eye Chart
Shrinking lines of Optician Sans. The 404 page is a full chart ("4", "0 4", "P A G E", "N O T F O U N D", then a faded "L O O K I N G E L S E W H E R E"), a hairline, "This page is out of focus." and an Iris "Back to open shifts" button. Every line scales from one base size, so the chart fits a 390px screen. Zero-result searches (filtered shift search, clinic search) show a small three-line chart ("E", "F P", "T O Z") above the message instead of an illustration. The admin credential review shows the same three lines in a white bordered tile to the right of the heading, hidden below 600px.

### Footer
A Deep Iris band with white text. It opens with "B L I N K" in Optician Sans as shrinking letters (64, 54, 45, 37 and 30px, 65% below 600px) on one shared baseline, each followed by a 0.35em gap; it is a home link named "Blink home" for screen readers. Below a faint white rule sit "Built by John Boulanger", the demo reset note with the photo credits link, and "Source on GitHub". Links are white and underlined, and the focus ring turns white on the band. Secondary text is white at 82% (8.34:1).

## Do's and Don'ts

### Do:
- **Do** use Iris (#3451d1) only for primary actions, live and selected states, form-control fills, clinic map pins, the illustration details and the logo's lower lid.
- **Do** keep Optician Sans to its four places, always decorative and hidden from screen readers.
- **Do** show every status as an 8px dot plus a sentence-case label.
- **Do** set rates, times and counts in tabular figures.
- **Do** use 8px corners for controls, 14px for cards and photos, and full pills for search, chips and map markers.
- **Do** keep surfaces flat at rest and use the one shadow tier for lift.
- **Do** lead listings with the clinic's fixed photo and keep the "Illustrative photo" note.
- **Do** honour reduced motion: the logo, the eyelid band and the pulses all stop.

### Don't:
- **Don't** add a second accent colour or colour-coded status pills. Sky is a tint of Iris, not a second accent.
- **Don't** make any status other than Live Iris.
- **Don't** show a large ticking countdown number; the 15 dots carry the time.
- **Don't** add a second, heavier shadow.
- **Don't** use a gradient hero, stock icon feature cards, a white-and-blue clinical look, playful styling or a dark technical theme. Iris stays a small accent on white and ink; it never floods a page.
- **Don't** put a faint eye chart behind the home hero.
- **Don't** put uppercase or letter-spaced tags above headings.
- **Don't** colour destructive buttons red; confirm the action in context instead.
