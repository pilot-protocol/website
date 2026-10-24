// Single source of truth for network figures shown on BOTH the human
// homepage (src/pages/index.astro) and the plain/bot homepage
// (src/pages/plain/index.astro), so the two can never drift.
//
// Fetched once at build time. total_nodes is the cumulative count of
// registered addresses; active_nodes is daemons with a heartbeat in the last
// 30 minutes. If the fetch fails, each figure shows "—" rather than a guess;
// the homepage script fills in live values in the browser.

export interface LiveStats {
  /** Registered addresses, all time (total_nodes), compact e.g. "~250,000". */
  liveAgents: string;
  /** Exact grouped total, e.g. "248,113". */
  liveAgentsExact: string;
  /** Daemons seen in the last 30 minutes (active_nodes), compact e.g. "~219,000". */
  liveAgentsOnline: string;
  /** Compact routed-request total, e.g. "~104B". */
  liveRequests: string;
  /** Registry requests per second, grouped, e.g. "20,000". */
  liveRps: string;
  /** Compact requests-per-hour (rps × 3600), e.g. "~72M". */
  liveRequestsPerHour: string;
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000_000) return `~${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (n >= 1_000_000)     return `~${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 10_000)        return `~${Math.round(n / 1000)},000`;
  if (n >= 1_000)         return `~${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

export async function getLiveStats(): Promise<LiveStats> {
  const stats: LiveStats = {
    liveAgents: '—',
    liveAgentsExact: '—',
    liveAgentsOnline: '—',
    liveRequests: '—',
    liveRps: '—',
    liveRequestsPerHour: '—',
  };

  try {
    const res = await fetch('https://polo.pilotprotocol.network/api/public-stats', {
      headers: { 'User-Agent': 'pilotprotocol-web' },
    });
    if (res.ok) {
      const s: any = await res.json();
      if (typeof s.total_nodes === 'number') {
        stats.liveAgents = fmtCompact(s.total_nodes);
        stats.liveAgentsExact = s.total_nodes.toLocaleString('en-US');
      }
      if (typeof s.active_nodes === 'number') {
        stats.liveAgentsOnline = fmtCompact(s.active_nodes);
      }
      if (typeof s.total_requests === 'number') {
        stats.liveRequests = fmtCompact(s.total_requests);
      }
      if (typeof s.requests_per_sec === 'number') {
        stats.liveRps = Math.round(s.requests_per_sec).toLocaleString('en-US');
        stats.liveRequestsPerHour = fmtCompact(Math.round(s.requests_per_sec * 3600));
      }
    }
  } catch {}

  return stats;
}
