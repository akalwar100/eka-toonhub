import { useEffect, useState, useCallback, useRef } from 'react';
import type { LiveVehicleData, VehicleKey } from './vehicles';

/**
 * Fetches region-team-edited data from the published Google Sheet JSON
 * endpoint (see docs/REGION_DATA_SETUP.md + docs/apps-script.gs).
 *
 * Set VITE_SHEET_API_URL in a `.env` file at the project root:
 *   VITE_SHEET_API_URL=https://script.google.com/macros/s/XXXX/exec
 *
 * If the URL isn't configured, or a fetch fails (offline, sheet not
 * published yet, etc.), every consumer of this module quietly falls back
 * to the hardcoded sample data in vehicles.ts — the app never breaks or
 * shows an error state to end users over this.
 */

const SHEET_API_URL: string | undefined = import.meta.env.VITE_SHEET_API_URL;
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
let inFlight: Promise<Record<VehicleKey, LiveVehicleData> | null> | null = null;

async function fetchLiveData(): Promise<Record<VehicleKey, LiveVehicleData> | null> {
  if (!SHEET_API_URL) return null;

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch(SHEET_API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Sheet API responded ${res.status}`);
      const raw = (await res.json()) as RawSheetResponse;
      const normalized = normalize(raw);
      cache = normalized;
      cacheTimestamp = Date.now();
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

/**
 * React hook: returns live data for one vehicle, refetching on an interval
 * and whenever `active` flips to true (e.g. when its orbital view opens).
 * Returns `undefined` for any field not yet loaded or not present in the
 * sheet — buildOrbitalData() already treats `undefined` as "use fallback".
 */
export function useLiveVehicleData(vehicle: VehicleKey, active: boolean): LiveVehicleData | undefined {
  const [data, setData] = useState<LiveVehicleData | undefined>(cache?.[vehicle]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const fresh = await fetchLiveData();
    if (fresh) setData(fresh[vehicle]);
  }, [vehicle]);

  useEffect(() => {
    if (!active || !SHEET_API_URL) return;

    // Use cache immediately if it's fresh enough, then refetch in background.
    if (cache && Date.now() - cacheTimestamp < POLL_INTERVAL_MS) {
      setData(cache[vehicle]);
    }
    refresh();

    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, vehicle, refresh]);

  return data;
}

/** Whether the live sheet integration is configured at all — used to show
 *  a small "Live" vs "Sample data" indicator in the UI if desired. */
export function isLiveDataConfigured(): boolean {
  return Boolean(SHEET_API_URL);
}
