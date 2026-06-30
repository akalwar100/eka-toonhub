import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin, ViteDevServer } from 'vite';

/**
 * Mock backend, built as a Vite dev-server middleware.
 *
 * This exists to *prove* the auto-update loop end-to-end without needing a
 * real Google Sheet deployment (no network access was available while
 * building this). It behaves exactly like the real Apps Script endpoint
 * will: GET /api/fleet-data returns the same JSON shape, and any edit to
 * mock-backend/db.json is picked up immediately.
 *
 * To switch to the real Google Sheet later: just point VITE_SHEET_API_URL
 * (in .env) at the deployed Apps Script URL instead of leaving it unset.
 * When VITE_SHEET_API_URL is unset, liveData.ts falls back to this local
 * /api/fleet-data endpoint automatically during `npm run dev`.
 */
export function mockBackendPlugin(): Plugin {
  // This package has "type": "module" in package.json, so __dirname doesn't
  // exist here (it's CommonJS-only) — derive the equivalent from
  // import.meta.url instead. This file already lives inside mock-backend/,
  // so db.json is a sibling, not a nested path.
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const dbPath = path.resolve(thisDir, 'db.json');

  return {
    name: 'eka-mock-backend',
    configureServer(server: ViteDevServer) {
      // Watch the JSON file so edits are picked up without restarting Vite.
      server.watcher.add(dbPath);

      server.middlewares.use('/api/fleet-data', (req, res) => {
        try {
          const raw = fs.readFileSync(dbPath, 'utf-8');
          const data = JSON.parse(raw);
          // Stamp the read time fresh on every request so the UI's
          // "last synced" indicator reflects when *this fetch* happened,
          // not just when the file was last edited.
          data.generatedAt = new Date().toISOString();

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.statusCode = 200;
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to read mock backend data', detail: String(err) }));
        }
      });

      // Whenever db.json is saved, push a custom event over Vite's HMR
      // websocket so any open browser tab refetches instantly instead of
      // waiting for its next poll cycle.
      server.watcher.on('change', (changedPath) => {
        if (path.resolve(changedPath) === dbPath) {
          server.ws.send({ type: 'custom', event: 'eka-fleet-data-changed' });
        }
      });
    },
  };
}
