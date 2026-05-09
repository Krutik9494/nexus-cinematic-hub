## Goal

Produce a downloadable **`/mnt/documents/NEXUS_Hackathon_Deck.pptx`** that uses the attached PDF as the structural base, but upgrades it with real screenshots, the actual tech stack, and stronger hackathon-pitch slides.

## Visual style (from the attached template)

- **Palette:** deep cinematic dark — `#0A0612` background, `#1A0F2E` panels, magenta→cyan gradient accents (`#B026FF` → `#00E5FF`), white body text, muted gray captions.
- **Typography:** display headers bold (Arial Black / Impact-style), body in Calibri/Arial. Mark key words with magenta highlight, mirroring the `<mark>` styling in the template.
- **Layout motif:** glassy card panels with thin neon borders, big titles, two-column (text + visual) layouts — matching the source deck.

## Deck structure (13 slides)

| # | Slide | Source | Notes |
|---|---|---|---|
| 1 | **Title — NEXUS, Your Personal Cinematic Universe** | template p.1 | Tech chips updated to real stack |
| 2 | **The Architects** | template p.2 | Reuse the team image from PDF |
| 3 | **Fragmented Landscape** (competitor table) | template p.3 | Same table, restyled |
| 4 | **Live Data, Zero Bloat** (TMDB) | template p.4 | Same content |
| 5 | **App Showcase: Dynamic Hub (Home)** | template p.5 | **Real screenshot of `/`** |
| 6 | **App Showcase: Advanced Discovery** | template p.6 | **Real screenshot of `/discover`** |
| 7 | **App Showcase: Personal Vault (Watchlist)** | template p.7 | **Real screenshot of `/watchlist`** |
| 8 | **App Showcase: Cinematic Analytics (Profile)** | template p.8 | **Real screenshot of `/profile`** |
| 9 | **NEW — NEXUS AI Assistant** | added | Floating AI orb, Lovable AI Gateway, voice search, mood engine |
| 10 | **The NEXUS Stack** (corrected) | template p.9 | React 19 · TanStack Start · Vite 7 · Tailwind v4 · Lovable Cloud (Supabase) · Lovable AI Gateway · TMDB · Cloudflare Workers |
| 11 | **NEW — Live Demo** | added | QR code + published URL `cinematic-stage-play.lovable.app`, India-Wi-Fi disclaimer, guest-mode hint |
| 12 | **NEW — What's Next** | added | Roadmap: social feed, AI-curated playlists, mobile PWA, friend watch-parties |
| 13 | **Thank You** | template p.10 | GitHub link + trophy |

## How screenshots get captured

1. Use `browser--navigate_to_sandbox` at 1440×900 viewport.
2. Enter guest mode (login screen → "Continue as guest") so all routes load without auth.
3. Capture `/`, `/discover`, `/watchlist`, `/profile`, `/settings` via `browser--screenshot`, save to `/tmp/shots/`.
4. Frame each in a subtle macOS-style chrome via the `product-shot` skill so they look premium on dark slides.

## Build pipeline (technical)

1. `npm i -g pptxgenjs` (already documented in skill).
2. Write `/tmp/build_deck.js` using `pptxgenjs`:
   - 16:9, 13.33×7.5 in.
   - Define master slide with dark background + magenta/cyan gradient bar.
   - Embed all images as base64 (required for LibreOffice PDF/QA).
   - Use the team image extracted from the source PDF (`img_p2_1.jpg`) on slide 2.
3. Output → `/mnt/documents/NEXUS_Hackathon_Deck.pptx`.

## Mandatory QA loop

1. Convert pptx → PDF via LibreOffice, then PDF → JPGs via `pdftoppm`.
2. Read every slide image, check for: text overflow, low contrast, overlapping shapes, missing screenshots, leftover placeholders.
3. Fix and re-render until clean.
4. Report what was checked and any fixes.

## Deliverable

`<lov-artifact path="NEXUS_Hackathon_Deck.pptx" mime_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"></lov-artifact>`
