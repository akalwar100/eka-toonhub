# EKA Mobility — Fleet Command

React + TypeScript + Vite + Tailwind CSS app. A full-viewport hero carousel
("Fleet Command") presents four EKA vehicle lines as glowing blueprint-style
figurines — Electric Bus, Electric Auto (3-seater), Electric Pickup (Puma),
and Electric Truck. Clicking the centered vehicle (or the "Inspect" link)
zooms into a radial orbital dossier for that vehicle, with five orbiting
nodes: **Description → Regional Spread → Highlights → Issues & Actions →
Training & Glimpses**.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- shadcn-style local UI primitives (`Badge`, `Button`, `Card`) in
  `src/components/ui/`
- `lucide-react` for icons
- `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`
  for the shadcn primitives

## Setup

This project already has the shadcn project structure in place
(`src/components/ui/`, `src/lib/utils.ts`, path alias `@/*` → `src/*`).
If you're dropping these files into a fresh Vite app instead of using this
folder as-is:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react class-variance-authority @radix-ui/react-slot clsx tailwind-merge
```

Then copy this repo's `src/`, `tailwind.config.js`, `postcss.config.js`,
`tsconfig.json`'s `paths` block, `vite.config.ts`'s `resolve.alias`, and
`index.html`'s `<head>` font tags into the new project.

**Why `/components/ui` matters:** shadcn's CLI and ecosystem of copy-paste
components assume primitives live at this exact path so that generated
imports (`@/components/ui/button`, etc.) resolve without edits. Keeping this
convention means any future shadcn component can be dropped in without
import surgery.

## Install & run

```bash
npm install
npm run dev
```

## Project structure

```
src/
  components/
    ui/
      badge.tsx                 shadcn primitive
      button.tsx                shadcn primitive
      card.tsx                  shadcn primitive
      radial-orbital-timeline.tsx   orbital dossier view (per-vehicle)
      NodeDetailBody.tsx         renders the 5 different node payload shapes
    vehicles/
      VehicleSvgs.tsx            line-art SVGs: Bus, Auto, Pickup, Truck
    FleetCarousel.tsx            hero carousel (the "TOONHUB"-style stage)
  data/
    vehicles.ts                  vehicle configs + per-vehicle orbital data
  lib/
    utils.ts                     cn() helper
  App.tsx                        ties carousel + orbital view together
  index.css
  main.tsx
```

## Data model

`src/data/vehicles.ts` is the single source of truth:

- `VEHICLES`: one entry per vehicle (`bus`, `auto`, `pickup`, `truck`) with
  name, model code, tagline, stage background, and accent color.
- `buildOrbitalData(vehicle)`: returns the 5 orbital nodes for that vehicle.
  Each node's `detail` field holds a differently-shaped payload (spec table,
  regional counts, highlight stats, issue list, or training stats +
  sessions) — `NodeDetailBody.tsx` runtime-detects the shape and renders the
  right layout.

To add a 5th vehicle, add an entry to `VEHICLES`, add an SVG to
`VehicleSvgs.tsx`, add it to `VEHICLE_ORDER`, and extend the four data
functions in `vehicles.ts` (`regionalSpread`, `highlights`,
`issuesAndActions`, `trainingGlimpses`) with that vehicle's key.

## Region team data input (live data)

The Description/specs are hardcoded (they rarely change). But **Regional
Spread, Highlights, Issues & Actions, and Training** can be edited live by
non-technical regional teams through a Google Sheet — no code, no deploys.

Full setup walkthrough: [`docs/REGION_DATA_SETUP.md`](docs/REGION_DATA_SETUP.md).
Apps Script to paste into the sheet: [`docs/apps-script.gs`](docs/apps-script.gs).

Quick version:
1. Create a Google Sheet with 4 tabs (`RegionalSpread`, `Highlights`,
   `Issues`, `Training`) following the column layout in the setup doc.
2. Paste `docs/apps-script.gs` into the sheet's Apps Script editor and
   deploy it as a Web App — this turns the sheet into a JSON API, free,
   no server needed.
3. Copy `.env.example` to `.env` and set `VITE_SHEET_API_URL` to the
   deployed Web App URL.
4. Run the app. A green **"Live region data"** badge appears in each
   vehicle's orbital header when it's pulling from the sheet; otherwise it
   shows **"Sample data"** and nothing breaks.

The app polls the sheet every 60 seconds while a vehicle's orbital view is
open (see `POLL_INTERVAL_MS` in `src/data/liveData.ts`), and refetches
immediately each time a vehicle is opened.



This project's dependencies could not be installed or build-verified in the
sandbox used to generate it (no npm registry access). Every file was
manually re-reviewed for type and logic correctness, but run
`npm run build` (which runs `tsc -b`) after `npm install` to catch anything
that slipped through.
