import React from 'react';

/**
 * Stylized "engineering blueprint" line-art vehicles.
 * Each takes a `color` (stroke/glow accent) and renders at the parent's box size.
 * Drawn in a consistent ground-level side-profile style so silhouettes read
 * clearly when scaled small (orbit) or huge (hero stage).
 */

interface VehicleSvgProps {
  color: string;
  className?: string;
}

const wheelProps = (color: string) => ({
  stroke: color,
  strokeWidth: 3,
  fill: '#0A0E1A',
});

export const BusSvg: React.FC<VehicleSvgProps> = ({ color, className }) => (
  <svg viewBox="0 0 420 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="40" width="380" height="120" rx="18" stroke={color} strokeWidth="4" fill="rgba(255,255,255,0.02)" />
    <line x1="20" y1="92" x2="400" y2="92" stroke={color} strokeWidth="2" opacity="0.5" />
    {[60, 122, 184, 246, 308].map((x) => (
      <rect key={x} x={x} y={54} width={44} height={32} rx={4} stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.04)" />
    ))}
    <rect x="356" y="100" width="34" height="48" rx="4" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.04)" />
    <circle cx="100" cy="178" r="26" {...wheelProps(color)} />
    <circle cx="100" cy="178" r="9" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="320" cy="178" r="26" {...wheelProps(color)} />
    <circle cx="320" cy="178" r="9" stroke={color} strokeWidth="2" fill="none" />
    <line x1="0" y1="200" x2="420" y2="200" stroke={color} strokeWidth="1.5" opacity="0.25" />
    <text x="34" y="76" fill={color} fontSize="9" fontFamily="monospace" opacity="0.7">EKA-12</text>
  </svg>
);

export const AutoSvg: React.FC<VehicleSvgProps> = ({ color, className }) => (
  <svg viewBox="0 0 300 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3-seater electric auto-rickshaw, side profile */}
    <path
      d="M40 150 L40 100 Q40 78 64 78 L150 78 Q172 78 172 100 L172 150"
      stroke={color}
      strokeWidth="4"
      fill="rgba(255,255,255,0.02)"
    />
    <path d="M40 100 L40 78 Q40 60 58 60 L130 60 Q150 60 150 78" stroke={color} strokeWidth="3" fill="none" opacity="0.85" />
    <rect x="58" y="84" width="80" height="40" rx="4" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.04)" />
    <line x1="98" y1="84" x2="98" y2="124" stroke={color} strokeWidth="2" opacity="0.5" />
    <path d="M172 110 L230 110 Q248 110 248 128 L248 150" stroke={color} strokeWidth="4" fill="rgba(255,255,255,0.02)" />
    <rect x="178" y="118" width="44" height="26" rx="3" stroke={color} strokeWidth="2" fill="rgba(255,255,255,0.04)" />
    <circle cx="74" cy="172" r="22" {...wheelProps(color)} />
    <circle cx="74" cy="172" r="7" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="222" cy="172" r="22" {...wheelProps(color)} />
    <circle cx="222" cy="172" r="7" stroke={color} strokeWidth="2" fill="none" />
    <line x1="0" y1="196" x2="300" y2="196" stroke={color} strokeWidth="1.5" opacity="0.25" />
    <text x="58" y="142" fill={color} fontSize="9" fontFamily="monospace" opacity="0.7">3-SEAT</text>
  </svg>
);

export const PickupSvg: React.FC<VehicleSvgProps> = ({ color, className }) => (
  <svg viewBox="0 0 380 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Small pickup — "Puma" — cabin front, open cargo bed rear */}
    <path
      d="M30 150 L30 108 Q30 86 52 86 L120 86 L150 56 Q158 48 170 48 L186 48 Q198 48 198 60 L198 108"
      stroke={color}
      strokeWidth="4"
      fill="rgba(255,255,255,0.02)"
    />
    <line x1="150" y1="86" x2="150" y2="56" stroke={color} strokeWidth="2.5" opacity="0.6" />
    <rect x="156" y="60" width="34" height="44" rx="3" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.04)" />
    <path d="M198 108 L330 108 L330 150 L198 150 Z" stroke={color} strokeWidth="4" fill="rgba(255,255,255,0.02)" />
    <line x1="198" y1="118" x2="330" y2="118" stroke={color} strokeWidth="2" opacity="0.4" />
    <line x1="240" y1="108" x2="240" y2="150" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <line x1="282" y1="108" x2="282" y2="150" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <circle cx="92" cy="172" r="24" {...wheelProps(color)} />
    <circle cx="92" cy="172" r="8" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="280" cy="172" r="24" {...wheelProps(color)} />
    <circle cx="280" cy="172" r="8" stroke={color} strokeWidth="2" fill="none" />
    <line x1="0" y1="196" x2="380" y2="196" stroke={color} strokeWidth="1.5" opacity="0.25" />
    <text x="48" y="102" fill={color} fontSize="9" fontFamily="monospace" opacity="0.7">PUMA</text>
  </svg>
);

export const TruckSvg: React.FC<VehicleSvgProps> = ({ color, className }) => (
  <svg viewBox="0 0 420 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 150 L24 96 Q24 76 44 76 L96 76 Q116 76 116 96 L116 150"
      stroke={color}
      strokeWidth="4"
      fill="rgba(255,255,255,0.02)"
    />
    <rect x="40" y="88" width="56" height="36" rx="3" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.04)" />
    <line x1="68" y1="88" x2="68" y2="124" stroke={color} strokeWidth="2" opacity="0.5" />
    <path d="M116 56 L396 56 L396 150 L116 150 Z" stroke={color} strokeWidth="4" fill="rgba(255,255,255,0.02)" />
    {[152, 196, 240, 284, 328, 372].map((x) => (
      <line key={x} x1={x} y1="56" x2={x} y2="150" stroke={color} strokeWidth="1.2" opacity="0.25" />
    ))}
    <line x1="116" y1="100" x2="396" y2="100" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <circle cx="76" cy="172" r="26" {...wheelProps(color)} />
    <circle cx="76" cy="172" r="9" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="252" cy="172" r="26" {...wheelProps(color)} />
    <circle cx="252" cy="172" r="9" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="340" cy="172" r="26" {...wheelProps(color)} />
    <circle cx="340" cy="172" r="9" stroke={color} strokeWidth="2" fill="none" />
    <line x1="0" y1="200" x2="420" y2="200" stroke={color} strokeWidth="1.5" opacity="0.25" />
    <text x="128" y="74" fill={color} fontSize="9" fontFamily="monospace" opacity="0.7">EKA-HD</text>
  </svg>
);

export const VEHICLE_SVGS: Record<'bus' | 'auto' | 'pickup' | 'truck', React.FC<VehicleSvgProps>> = {
  bus: BusSvg,
  auto: AutoSvg,
  pickup: PickupSvg,
  truck: TruckSvg,
};
