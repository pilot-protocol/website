import { AGENT_CATEGORIES, AGENT_TOTAL } from "@/lib/agents";

/* Everything on this page comes from pilotprotocol.network/service-agents (October 2026). */

/** list-agents also counts itself and `feedback`, the two infrastructure agents. */
export const DIRECTORY_TOTAL = AGENT_TOTAL + 2;

/** Agents named on the page beyond the three examples per category: the two from the real list-agents "recall" reply. */
const EXTRA: Record<string, string[]> = {
  health: ["openfda-food-recall", "openfdadevice-recall"],
};

/** The `example` field list-agents returned for these, verbatim. */
export const EXAMPLES: Record<string, string> = {
  "nhtsa-recalls": '/data {"make": "<make>", "model": "<model>", "year": 1}',
  "openfda-food-recall": '/data {"query": "<query>"}',
  "openfdadevice-recall": "/data {}",
};

/** Words offered under the directory's search, and how many categories a phone shows before "Show all". */
export const TRY = ["weather", "recall", "aviation", "papers"];
export const MOBILE_ROWS = 10;

export type Row = { id: string; name: string; count: number; known: string[] };

export const ROWS: Row[] = AGENT_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  count: c.count,
  known: [...c.examples, ...(EXTRA[c.id] ?? [])],
}));

/**
 * `search` matches by meaning as well as by spelling ("aviation" finds the flight agents).
 * A few words from the page's own copy, mapped to the categories they describe.
 */
const MEANING: Record<string, string[]> = {
  aviation: ["flights"],
  aircraft: ["flights"],
  plane: ["flights"],
  crypto: ["finance"],
  papers: ["academic"],
  cve: ["security"],
  train: ["transit"],
  departures: ["transit"],
  forecast: ["weather"],
  car: ["vehicles"],
};

export type Match = { rows: Set<string>; agents: Set<string> };

export function search(q: string): Match | null {
  const query = q.trim().toLowerCase().replace(/s$/, "");
  if (query.length < 2) return null;
  const rows = new Set<string>();
  const agents = new Set<string>();
  for (const r of ROWS) {
    if (r.id.includes(query) || r.name.toLowerCase().includes(query)) rows.add(r.id);
    for (const name of r.known) if (name.includes(query)) agents.add(name);
  }
  for (const [word, ids] of Object.entries(MEANING)) {
    if (word.startsWith(query) && query.length >= 3) ids.forEach((id) => rows.add(id));
  }
  return { rows, agents };
}

export function matchCount(m: Match) {
  let n = 0;
  for (const r of ROWS) {
    if (m.rows.has(r.id)) n += r.count;
    else n += r.known.filter((a) => m.agents.has(a)).length;
  }
  return n;
}
