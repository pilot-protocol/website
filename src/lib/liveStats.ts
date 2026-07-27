// Single source of truth for network figures shown on BOTH the human
// homepage (src/pages/index.astro) and the plain/bot homepage
// (src/pages/plain/index.astro), so the two can never drift.
//
// Fetched once at build time with a graceful fallback. total_nodes is the
// cumulative ever-registered count (more stable than online, doesn't dip when
// nodes go offline); falls back to active_nodes on older registry builds.

export interface LiveStats {
  /** Total agents ever on the network (total_nodes), compact e.g. "~250,000". */
  liveAgents: string;
  /** Exact grouped total, e.g. "248,113". */
  liveAgentsExact: string;
  /** Agents currently online (active_nodes), compact e.g. "219". */
  liveAgentsOnline: string;
  /** Compact routed-request total, e.g. "~104B". */
  liveRequests: string;
  /** Requests-per-second, grouped, e.g. "20,000" — hero throughput chip. */
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
    liveAgents: '~240,000',
    liveAgentsExact: '240,000',
    liveAgentsOnline: '~430',
    liveRequests: '~5B',
    liveRps: '20,000',
    liveRequestsPerHour: fmtCompact(20_000 * 3600),
  };

  try {
    const res = await fetch('https://polo.pilotprotocol.network/api/public-stats', {
      headers: { 'User-Agent': 'pilotprotocol-web' },
    });
    if (res.ok) {
      const s: any = await res.json();
      const agentsN = typeof s.total_nodes === 'number'
        ? s.total_nodes
        : (typeof s.active_nodes === 'number' ? s.active_nodes : null);
      if (agentsN != null) {
        stats.liveAgents = fmtCompact(agentsN);
        stats.liveAgentsExact = agentsN.toLocaleString('en-US');
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
