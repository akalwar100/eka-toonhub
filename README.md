import { useEffect, useState, useCallback, useRef } from 'react';
import type { LiveVehicleData, VehicleKey } from './vehicles';

/**
 * Fetches region-team-edited fleet data from a backend.
 *
 * Two backends are supported, picked automatically:
 *
 * 1. PRODUCTION — a published Google Sheet (see docs/REGION_DATA_SETUP.md
 *    + docs/apps-script.gs). Set VITE_SHEET_API_URL in `.env`:
 *      VITE_SHEET_API_URL=https://script.google.com/macros/s/XXXX/exec
 *
 * 2. LOCAL DEV — if VITE_SHEET_API_URL is unset, this falls back to
 *    /api/fleet-data, a tiny mock backend (mock-backend/) that runs inside
 *    `npm run dev` automatically. It reads mock-backend/db.json and pushes
 *    an instant-refresh signal over Vite's HMR socket whenever that file is
 *    saved — so editing db.json and watching the open app update live is a
 *    genuine end-to-end test of the exact same polling/refresh mechanism
 *    the real Google Sheet will use, with no deployment required.
 *
 * Either way, if a fetch fails (offline, sheet not published yet,
 * malformed response, etc.), every consumer of this module quietly falls
 * back to the hardcoded sample data in vehicles.ts — the app never breaks
 * or shows an error state to end users over this.
 */

const CONFIGURED_SHEET_URL: string | undefined = import.meta.env.VITE_SHEET_API_URL;
const LOCAL_MOCK_URL = '/api/fleet-data';
const API_URL = CONFIGURED_SHEET_URL || LOCAL_MOCK_URL;
const USING_LOCAL_MOCK = !CONFIGURED_SHEET_URL;

const POLL_INTERVAL_MS = 60_000;

interface RawSheetResponse {
  regionalSpread: Record<string, { region: string; count: number }[]>;
  highlights: Record<string, { label: string; value: string }[]>;
  issues: Record<
    string,
    {
      id: string;
      title: string;
      severity: string;
      status: string;
      desc: string;
      action: string;
    }[]
  >;
  training: Record<
    string,
    {
      sessions: { label: string; date: string }[];
      stats: { label: string; value: string }[];
    }
  >;
  generatedAt: string;
}

function isValidSeverity(s: string): s is 'Minor' | 'Critical' {
  return s === 'Minor' || s === 'Critical';
}
function isValidStatus(s: string): s is 'Resolved' | 'In Progress' {
  return s === 'Resolved' || s === 'In Progress';
}

/** Converts the raw sheet JSON into the typed, per-vehicle shape the rest
 *  of the app expects, dropping any row that fails validation rather than
 *  letting a typo in the sheet (e.g. "critical" lowercase) crash anything. */
function normalize(raw: RawSheetResponse): Record<VehicleKey, LiveVehicleData> {
  const vehicles: VehicleKey[] = ['bus', 'auto', 'pickup', 'truck'];
  const result = {} as Record<VehicleKey, LiveVehicleData>;

  for (const v of vehicles) {
    const issues = (raw.issues?.[v] ?? [])
      .filter((i) => isValidSeverity(i.severity) && isValidStatus(i.status))
      .map((i) => ({
        id: i.id,
        title: i.title,
        severity: i.severity as 'Minor' | 'Critical',
        status: i.status as 'Resolved' | 'In Progress',
        desc: i.desc,
        action: i.action,
      }));

    result[v] = {
      regionalSpread: raw.regionalSpread?.[v]?.length ? raw.regionalSpread[v] : undefined,
      highlights: raw.highlights?.[v]?.length ? raw.highlights[v] : undefined,
      issues: issues.length ? issues : undefined,
      training: raw.training?.[v] ? raw.training[v] : undefined,
    };
  }

  return result;
}

let cache: Record<VehicleKey, LiveVehicleData> | null = null;
let cacheTimestamp = 0;
let lastSyncedAt: Date | null = null;
let inFlight: Promise<Record<VehicleKey, LiveVehicleData> | null> | null = null;

/** Subscribers notified after every successful fetch, regardless of which
 *  component triggered it — lets multiple open vehicles (or a status
 *  indicator elsewhere in the UI) all react to one shared fetch result. */
const listeners = new Set<() => void>();

async function fetchLiveData(): Promise<Record<VehicleKey, LiveVehicleData> | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Fleet data API responded ${res.status}`);
      const raw = (await res.json()) as RawSheetResponse;
      const normalized = normalize(raw);
      cache = normalized;
      cacheTimestamp = Date.now();
      lastSyncedAt = new Date();
      listeners.forEach((fn) => fn());
      return normalized;
    } catch (err) {
      // Network error, sheet not published yet, malformed response, etc.
      // Swallow it — callers fall back to hardcoded sample data.
      console.warn('[liveData] falling back to sample data:', err);
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

// In local dev, the mock backend plugin pushes a custom HMR event the
// instant mock-backend/db.json is saved, so we don't wait for the next
// poll cycle — this is what makes edits feel "instant" while developing.
if (USING_LOCAL_MOCK && import.meta.hot) {
  import.meta.hot.on('eka-fleet-data-changed', () => {
    fetchLiveData();
  });
}

/**
 * React hook: returns live data for one vehicle, refetching on an interval
 * and whenever `active` flips to true (e.g. when its orbital view opens).
 * Returns `undefined` for any field not yet loaded or not present in the
 * backend — buildOrbitalData() already treats `undefined` as "use fallback".
 */
export function useLiveVehicleData(vehicle: VehicleKey, active: boolean): LiveVehicleData | undefined {
  const [data, setData] = useState<LiveVehicleData | undefined>(cache?.[vehicle]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const fresh = await fetchLiveData();
    if (fresh) setData(fresh[vehicle]);
  }, [vehicle]);

  useEffect(() => {
    if (!active) return;

    // Use cache immediately if it's fresh enough, then refetch in background.
    if (cache && Date.now() - cacheTimestamp < POLL_INTERVAL_MS) {
      setData(cache[vehicle]);
    }
    refresh();

    // Also react to fetches triggered elsewhere (e.g. the HMR instant
    // refresh above, or another open vehicle's poll tick).
    const onExternalUpdate = () => {
      if (cache) setData(cache[vehicle]);
    };
    listeners.add(onExternalUpdate);

    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      listeners.delete(onExternalUpdate);
    };
  }, [active, vehicle, refresh]);

  return data;
}

/**
 * React hook: tracks when the fleet data was last successfully synced, and
 * a short-lived `justUpdated` flag (true for 2.4s after each sync) for
 * driving a "data just refreshed" pulse animation in the UI.
 */
export function useLastSynced(): { lastSynced: Date | null; justUpdated: boolean } {
  const [lastSynced, setLastSynced] = useState<Date | null>(lastSyncedAt);
  const [justUpdated, setJustUpdated] = useState(false);
  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onUpdate = () => {
      setLastSynced(lastSyncedAt);
      setJustUpdated(true);
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
      pulseTimeout.current = setTimeout(() => setJustUpdated(false), 2400);
    };
    listeners.add(onUpdate);
    return () => {
      listeners.delete(onUpdate);
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
    };
  }, []);

  return { lastSynced, justUpdated };
}

/** Whether a real (non-local-mock) sheet integration is configured — used
 *  to label the indicator "Live region data" vs "Live (local dev mock)". */
export function isLiveDataConfigured(): boolean {
  return Boolean(CONFIGURED_SHEET_URL);
}

export function isUsingLocalMock(): boolean {
  return USING_LOCAL_MOCK;
}

