import {
  FileText,
  MapPin,
  Star,
  Wrench,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';

export type VehicleKey = 'bus' | 'auto' | 'pickup' | 'truck';

export interface OrbitalNode {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: LucideIcon;
  relatedIds: number[];
  status: 'completed' | 'in-progress' | 'pending';
  energy: number;
  // Structured payload rendered inside the expanded card, beyond `content`.
  // Shape varies per node (specs / regions / highlights / issues / training) —
  // NodeDetailBody discriminates at runtime via shape-checking.
  detail: unknown;
}

export interface VehicleConfig {
  key: VehicleKey;
  name: string;
  model: string;
  tagline: string;
  bg: string; // hero stage background
  panel: string; // lighter panel tone
  accent: string; // glow / line-art color
  specs: { label: string; value: string; unit: string }[];
}

export const VEHICLES: Record<VehicleKey, VehicleConfig> = {
  bus: {
    key: 'bus',
    name: 'Electric Bus',
    model: 'EKA-12',
    tagline: 'Zero-emission city transit, built for Indian roads.',
    bg: '#0E1F2E',
    panel: '#143049',
    accent: '#00D9E8',
    specs: [
      { label: 'Range', value: '300+', unit: 'km' },
      { label: 'Capacity', value: '40–55', unit: 'pax' },
      { label: 'Charging', value: '< 2', unit: 'hrs' },
      { label: 'Battery', value: '312', unit: 'kWh' },
    ],
  },
  auto: {
    key: 'auto',
    name: 'Electric Auto',
    model: '3-Seater',
    tagline: 'Last-mile passenger mobility, zero tailpipe emissions.',
    bg: '#2E230E',
    panel: '#3F3014',
    accent: '#FFB23E',
    specs: [
      { label: 'Range', value: '120+', unit: 'km' },
      { label: 'Capacity', value: '3', unit: 'pax' },
      { label: 'Charging', value: '< 3', unit: 'hrs' },
      { label: 'Battery', value: '7.5', unit: 'kWh' },
    ],
  },
  pickup: {
    key: 'pickup',
    name: 'Electric Pickup',
    model: 'PUMA',
    tagline: 'Compact electric muscle for urban small-cargo runs.',
    bg: '#142B17',
    panel: '#1B3B20',
    accent: '#8FE388',
    specs: [
      { label: 'Range', value: '150+', unit: 'km' },
      { label: 'Payload', value: '600', unit: 'kg' },
      { label: 'Charging', value: '< 3', unit: 'hrs' },
      { label: 'Battery', value: '21', unit: 'kWh' },
    ],
  },
  truck: {
    key: 'truck',
    name: 'Electric Truck',
    model: 'EKA-HD',
    tagline: 'Heavy-duty electric haulage for intercity freight.',
    bg: '#2A0F0F',
    panel: '#3B1614',
    accent: '#FF6B5B',
    specs: [
      { label: 'Range', value: '200+', unit: 'km' },
      { label: 'Payload', value: '9,000', unit: 'kg' },
      { label: 'Charging', value: '< 4', unit: 'hrs' },
      { label: 'Battery', value: '210', unit: 'kWh' },
    ],
  },
};

export const VEHICLE_ORDER: VehicleKey[] = ['bus', 'auto', 'pickup', 'truck'];

/** Shape of the live overrides fetched from the regional team's Google Sheet.
 *  Any field left undefined falls back to the hardcoded sample data below —
 *  this keeps the app fully functional even before the sheet is wired up. */
export interface LiveVehicleData {
  regionalSpread?: { region: string; count: number }[];
  highlights?: { label: string; value: string }[];
  issues?: {
    id: string;
    title: string;
    severity: 'Minor' | 'Critical';
    status: 'Resolved' | 'In Progress';
    desc: string;
    action: string;
  }[];
  training?: {
    sessions: { label: string; date: string }[];
    stats: { label: string; value: string }[];
  };
}

/**
 * Builds the 5-node orbital ring for a vehicle:
 * Description -> Regional Spread -> Highlights -> Issues & Actions -> Training & Glimpses
 * Connected sequentially since this *is* a real reviewing sequence (spec sheet flow).
 *
 * `live`, when provided, overrides the 4 region-editable sections with data
 * fetched from the team's Google Sheet (see src/data/liveData.ts). Vehicle
 * Description always comes from the hardcoded VEHICLES config, since specs
 * rarely change and aren't regional input.
 */
export function buildOrbitalData(vehicle: VehicleConfig, live?: LiveVehicleData): OrbitalNode[] {
  const spread = live?.regionalSpread ?? regionalSpread(vehicle.key);
  const hl = live?.highlights ?? highlights(vehicle.key);
  const issues = live?.issues ?? issuesAndActions(vehicle.key);
  const training = live?.training ?? trainingGlimpses(vehicle.key);

  return [
    {
      id: 1,
      title: 'Description',
      date: vehicle.model,
      category: 'Spec',
      icon: FileText,
      relatedIds: [2],
      status: 'completed',
      energy: 100,
      content: vehicle.tagline,
      detail: vehicle.specs,
    },
    {
      id: 2,
      title: 'Regional Spread',
      date: 'Live',
      category: 'Deployment',
      icon: MapPin,
      relatedIds: [1, 3],
      status: 'completed',
      energy: 85,
      content: 'Active deployment footprint across operating regions.',
      detail: spread,
    },
    {
      id: 3,
      title: 'Highlights',
      date: 'Live',
      category: 'Performance',
      icon: Star,
      relatedIds: [2, 4],
      status: 'in-progress',
      energy: 70,
      content: 'Standout performance metrics for this vehicle line.',
      detail: hl,
    },
    {
      id: 4,
      title: 'Issues & Actions',
      date: 'Live',
      category: 'Quality',
      icon: Wrench,
      relatedIds: [3, 5],
      status: 'in-progress',
      energy: 55,
      content: 'Open and resolved field issues with corrective actions.',
      detail: issues,
    },
    {
      id: 5,
      title: 'Training & Glimpses',
      date: 'Live',
      category: 'Enablement',
      icon: GraduationCap,
      relatedIds: [4],
      status: 'pending',
      energy: 40,
      content: 'Driver and technician training sessions for this fleet.',
      detail: training,
    },
  ];
}

// ---- Per-vehicle structured payloads -------------------------------------
// These are the fallback/sample values, used until the Google Sheet is
// configured (or if a fetch fails). See docs/REGION_DATA_SETUP.md.

function regionalSpread(key: VehicleKey) {
  const map: Record<VehicleKey, { region: string; count: number }[]> = {
    bus: [
      { region: 'North', count: 148 },
      { region: 'West', count: 96 },
      { region: 'South', count: 72 },
      { region: 'East', count: 39 },
    ],
    auto: [
      { region: 'Metro', count: 412 },
      { region: 'Tier 2', count: 268 },
      { region: 'Industrial', count: 94 },
      { region: 'Rural', count: 51 },
    ],
    pickup: [
      { region: 'Metro', count: 211 },
      { region: 'Tier 2', count: 134 },
      { region: 'Industrial', count: 88 },
      { region: 'Coastal', count: 22 },
    ],
    truck: [
      { region: 'Highway Corridor', count: 64 },
      { region: 'Industrial', count: 47 },
      { region: 'Port Routes', count: 28 },
      { region: 'Tier 2', count: 11 },
    ],
  };
  return map[key];
}

function highlights(key: VehicleKey) {
  const map: Record<VehicleKey, { label: string; value: string }[]> = {
    bus: [
      { label: 'Fleet Uptime', value: '98.2%' },
      { label: 'CO₂ Avoided', value: '2.1M kg' },
      { label: 'Avg Real Range', value: '294 km' },
      { label: 'Lower OpEx', value: '38%' },
    ],
    auto: [
      { label: 'Vehicles Active', value: '825' },
      { label: 'Energy Cost', value: '₹0.9/km' },
      { label: 'Avg Daily Run', value: '96 km' },
      { label: 'Driver Earnings ↑', value: '22%' },
    ],
    pickup: [
      { label: 'Units Deployed', value: '455' },
      { label: 'Energy Cost', value: '₹1.6/km' },
      { label: 'Avg Daily Run', value: '110 km' },
      { label: 'Remote Resolve', value: '84%' },
    ],
    truck: [
      { label: 'Units Active', value: '150' },
      { label: 'Cost / Tonne-km', value: '₹2.1' },
      { label: 'Avg Trip Length', value: '180 km' },
      { label: 'Uptime', value: '95.4%' },
    ],
  };
  return map[key];
}

interface IssueEntry {
  id: string;
  title: string;
  severity: 'Minor' | 'Critical';
  status: 'Resolved' | 'In Progress';
  desc: string;
  action: string;
}

function issuesAndActions(key: VehicleKey): IssueEntry[] {
  const map: Record<VehicleKey, IssueEntry[]> = {
    bus: [
      {
        id: 'BUS-01',
        title: 'AC compressor noise at high load',
        severity: 'Minor',
        status: 'Resolved',
        desc: 'Rattling under sustained high load in peak summer.',
        action: 'Mounting dampeners replaced across Q2 batch; firmware capped peak draw.',
      },
      {
        id: 'BUS-02',
        title: 'BMS over-temp false positives',
        severity: 'Critical',
        status: 'Resolved',
        desc: 'False alerts within safe temp range caused route stops.',
        action: 'OTA threshold recalibration; polling interval reduced to 1s.',
      },
    ],
    auto: [
      {
        id: 'AUTO-01',
        title: 'Regen braking jerk at low speed',
        severity: 'Minor',
        status: 'Resolved',
        desc: 'Abrupt deceleration below 12 km/h in early units.',
        action: 'Regen curve smoothed via OTA below 18 km/h.',
      },
      {
        id: 'AUTO-02',
        title: 'Seat frame rattle on rough roads',
        severity: 'Minor',
        status: 'In Progress',
        desc: 'Reported on unpaved-route operators in 3 cities.',
        action: 'Reinforced bracket in design validation, rollout next batch.',
      },
    ],
    pickup: [
      {
        id: 'PUMA-01',
        title: 'Cargo latch corrosion — coastal units',
        severity: 'Minor',
        status: 'In Progress',
        desc: 'Early corrosion in high-humidity coastal deployments.',
        action: 'Marine-grade hardware sourced; 48 units retrofitted.',
      },
      {
        id: 'PUMA-02',
        title: 'Charging inlet pin wear',
        severity: 'Critical',
        status: 'Resolved',
        desc: 'Accelerated wear after 800+ cycles on early batches.',
        action: 'Reinforced inlet spec from Batch 4; earlier units retrofitted under warranty.',
      },
    ],
    truck: [
      {
        id: 'HD-01',
        title: 'Battery thermal derate on long highway runs',
        severity: 'Critical',
        status: 'In Progress',
        desc: 'Power derates after 2.5 hrs continuous highway load.',
        action: 'Upgraded thermal loop in validation; interim route advisory issued.',
      },
      {
        id: 'HD-02',
        title: 'Cabin door seal wind noise',
        severity: 'Minor',
        status: 'Resolved',
        desc: 'Wind noise above 70 km/h reported by drivers.',
        action: 'Seal profile updated; applied to all units in service.',
      },
    ],
  };
  return map[key];
}

interface TrainingEntry {
  label: string;
  date: string;
}

function trainingGlimpses(key: VehicleKey): { stats: { label: string; value: string }[]; sessions: TrainingEntry[] } {
  const sessionsMap: Record<VehicleKey, TrainingEntry[]> = {
    bus: [
      { label: 'Driver Induction — Pune', date: 'Feb 2025' },
      { label: 'BMS Diagnostics Workshop', date: 'Jan 2025' },
      { label: 'HV Safety Bootcamp', date: 'Sep 2024' },
    ],
    auto: [
      { label: 'Driver Onboarding — Mumbai', date: 'Mar 2025' },
      { label: 'Charging Network Walkthrough', date: 'Jan 2025' },
      { label: 'Earnings App Training', date: 'Nov 2024' },
    ],
    pickup: [
      { label: 'Loading Drills — Chennai', date: 'Feb 2025' },
      { label: 'Cargo Securing Certification', date: 'Dec 2024' },
      { label: 'City Route Simulation', date: 'Oct 2024' },
    ],
    truck: [
      { label: 'Highway Driver Certification', date: 'Mar 2025' },
      { label: 'Thermal System Workshop', date: 'Jan 2025' },
      { label: 'Fleet Manager Summit', date: 'Aug 2024' },
    ],
  };
  const statsMap: Record<VehicleKey, { label: string; value: string }[]> = {
    bus: [
      { label: 'Trainees', value: '450' },
      { label: 'Sessions', value: '38' },
      { label: 'Satisfaction', value: '94%' },
    ],
    auto: [
      { label: 'Trainees', value: '610' },
      { label: 'Sessions', value: '52' },
      { label: 'Satisfaction', value: '91%' },
    ],
    pickup: [
      { label: 'Trainees', value: '290' },
      { label: 'Sessions', value: '24' },
      { label: 'Satisfaction', value: '93%' },
    ],
    truck: [
      { label: 'Trainees', value: '95' },
      { label: 'Sessions', value: '14' },
      { label: 'Satisfaction', value: '96%' },
    ],
  };
  return { stats: statsMap[key], sessions: sessionsMap[key] };
}
