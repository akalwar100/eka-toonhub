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

## Notes on a known environment limitation

This project's dependencies could not be installed or build-verified in the
sandbox used to generate it (no npm registry access). Every file was
manually re-reviewed for type and logic correctness, but run
`npm run build` (which runs `tsc -b`) after `npm install` to catch anything
that slipped through.
