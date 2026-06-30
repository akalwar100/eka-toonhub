import React from 'react';

interface SpecItem {
  label: string;
  value: string;
  unit: string;
}
interface RegionItem {
  region: string;
  count: number;
}
interface HighlightItem {
  label: string;
  value: string;
}
interface IssueItem {
  id: string;
  title: string;
  severity: 'Minor' | 'Critical';
  status: 'Resolved' | 'In Progress';
  desc: string;
  action: string;
}
interface TrainingPayload {
  stats: HighlightItem[];
  sessions: { label: string; date: string }[];
}

function isSpecArray(d: unknown): d is SpecItem[] {
  return Array.isArray(d) && d.length > 0 && 'unit' in (d[0] as object);
}
function isRegionArray(d: unknown): d is RegionItem[] {
  return Array.isArray(d) && d.length > 0 && 'region' in (d[0] as object);
}
function isHighlightArray(d: unknown): d is HighlightItem[] {
  return (
    Array.isArray(d) &&
    d.length > 0 &&
    'label' in (d[0] as object) &&
    'value' in (d[0] as object) &&
    !('region' in (d[0] as object))
  );
}
function isIssueArray(d: unknown): d is IssueItem[] {
  return Array.isArray(d) && d.length > 0 && 'severity' in (d[0] as object);
}
function isTrainingPayload(d: unknown): d is TrainingPayload {
  return typeof d === 'object' && d !== null && 'sessions' in (d as object);
}

export const NodeDetailBody: React.FC<{
  nodeId: number;
  detail: unknown;
  accent: string;
}> = ({ detail, accent }) => {
  if (isSpecArray(detail)) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {detail.map((s) => (
          <div key={s.label} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-wider text-white/40">{s.label}</div>
            <div className="text-sm font-semibold text-white font-mono">
              {s.value} <span className="text-[10px] text-white/40 font-normal">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isRegionArray(detail)) {
    const max = Math.max(...detail.map((r) => r.count));
    const total = detail.reduce((a, r) => a + r.count, 0);
    return (
      <div className="space-y-1.5">
        {detail.map((r) => (
          <div key={r.region}>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-white/65">{r.region}</span>
              <span className="font-mono text-white/80">{r.count}</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(r.count / max) * 100}%`, backgroundColor: accent }}
              />
            </div>
          </div>
        ))}
        <div className="text-[10px] text-white/40 pt-1 font-mono">{total} vehicles total</div>
      </div>
    );
  }

  if (isIssueArray(detail)) {
    return (
      <div className="space-y-2">
        {detail.map((issue) => (
          <div key={issue.id} className="rounded border border-white/10 bg-white/[0.03] p-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono text-white/40">{issue.id}</span>
              <div className="flex gap-1">
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: issue.severity === 'Critical' ? '#FF6B5B22' : '#8FE38822',
                    color: issue.severity === 'Critical' ? '#FF6B5B' : '#8FE388',
                  }}
                >
                  {issue.severity}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: issue.status === 'Resolved' ? '#8FE38822' : '#FFB23E22',
                    color: issue.status === 'Resolved' ? '#8FE388' : '#FFB23E',
                  }}
                >
                  {issue.status}
                </span>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-white/85 mb-0.5">{issue.title}</div>
            <div className="text-[10px] text-white/50 mb-1">{issue.desc}</div>
            <div className="text-[10px] text-white/70">
              <span className="text-white/40">→ </span>
              {issue.action}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isTrainingPayload(detail)) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          {detail.stats.map((s) => (
            <div key={s.label} className="text-center rounded border border-white/10 bg-white/[0.03] py-1.5">
              <div className="text-sm font-mono font-semibold" style={{ color: accent }}>
                {s.value}
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {detail.sessions.map((s) => (
            <div
              key={s.label}
              className="flex justify-between text-[10px] border-b border-white/5 pb-1 last:border-0"
            >
              <span className="text-white/65">{s.label}</span>
              <span className="text-white/35 font-mono">{s.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isHighlightArray(detail)) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {detail.map((h) => (
          <div key={h.label} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1.5">
            <div className="text-sm font-mono font-semibold" style={{ color: accent }}>
              {h.value}
            </div>
            <div className="text-[9px] text-white/40 uppercase tracking-wide">{h.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
