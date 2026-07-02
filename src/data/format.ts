// Small formatting helpers shared by the app-store pages.

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}

const PLATFORM_LABELS: Record<string, string> = {
  'darwin-arm64': 'macOS · Apple Silicon',
  'darwin-amd64': 'macOS · Intel',
  'linux-arm64': 'Linux · arm64',
  'linux-amd64': 'Linux · amd64',
};
export function platformLabel(p: string): string { return PLATFORM_LABELS[p] ?? p; }

export function osOf(platform: string): string { return platform.split('-')[0] === 'darwin' ? 'macOS' : 'Linux'; }

export const ALL_PLATFORMS = ['darwin-arm64', 'darwin-amd64', 'linux-arm64', 'linux-amd64'];

// Unique OS families a set of bundles covers, e.g. "macOS · Linux" or "Linux".
export function osSummary(bundles: { platform: string }[]): string {
  const seen: string[] = [];
  for (const b of bundles) { const o = osOf(b.platform); if (!seen.includes(o)) seen.push(o); }
  return seen.join(' · ');
}

export function fmtDate(d: string | null): string {
  if (!d) return '—';
  const dt = new Date(d + (d.length === 10 ? 'T00:00:00Z' : ''));
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
