# Textface

A browser tool for building ASCII-art faces by picking parts (head, hair, eyes, nose, mouth) from a gallery. Client-only — no backend.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — run Vitest unit tests (engine + manifest)
- `npm run preview` — preview production build

## Architecture

Pure compositing logic lives in `src/engine/` (framework-free, fully tested). React components in `src/components/` only render and handle events. Part art is defined in `src/data/parts.json`.

## Share a face

Selections are encoded in the URL hash. Use **Copy link** to share, or **Copy face** to grab the composited ASCII string.
