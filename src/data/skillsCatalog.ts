// Agent-skills catalogue for /for/skills and /plain/skills, fetched at build
// time. It lives under the maintainer's account until the repo transfers to
// the org.
const SKILLS_JSON_URL = 'https://raw.githubusercontent.com/TeoSlayer/pilot-skills/main/skills.json';

// Some catalogue entries describe features Pilot does not have, so the site
// does not list them. Each entry says why; drop it once the skill is fixed
// upstream.
const EXCLUDED_CATEGORIES: Record<string, string> = {
  'swarm-coordination':
    'publish to the registry and read pub/sub events from the inbox, or find peers by tag; ' +
    'events never reach the inbox and `peers --search` only matches node IDs',
  setups:
    'fleets built on skills that do not exist (pilot-task-router, pilot-cron, pilot-escrow, ...); ' +
    '/for/setups was removed for the same reason',
};

const EXCLUDED_SKILLS: Record<string, string> = {
  'pilot-momy': 'the advertised source is absent',
  'pilot-relay': 'store-and-forward with guaranteed eventual delivery is not a Pilot feature',
  'pilot-priority-queue': 'SLA-based delivery is not a Pilot feature',
  'pilot-matchmaker': 'ranks agents by polo score, which was removed',
  'pilot-discover': 'searches peers by tag and reads the removed polo score',
  'pilot-announce-capabilities': 'relies on capability search by tag, which does not exist, and advertises SLA fields',
  'pilot-http-proxy': 'built on the gateway, which no longer ships in the install',
  'pilot-database-bridge': 'built on the gateway, which no longer ships in the install',
  'pilot-api-gateway': 'built on the gateway, which no longer ships in the install',
};

export interface SkillsCatalog {
  categories: any[];
  total: number;
}

let cached: Promise<SkillsCatalog> | undefined;

async function fetchCatalog(): Promise<SkillsCatalog> {
  try {
    const res = await fetch(SKILLS_JSON_URL);
    if (!res.ok) return { categories: [], total: 0 };
    const data = await res.json();
    const categories = (data.categories ?? [])
      .filter((category: any) => !(category.slug in EXCLUDED_CATEGORIES))
      .map((category: any) => ({
        ...category,
        skills: (category.skills ?? []).filter((skill: any) => !(skill.slug in EXCLUDED_SKILLS)),
      }))
      .filter((category: any) => category.skills.length > 0);
    const total = categories.reduce((sum: number, category: any) => sum + category.skills.length, 0);
    return { categories, total };
  } catch {
    return { categories: [], total: 0 };
  }
}

export function loadSkillsCatalog(): Promise<SkillsCatalog> {
  cached ??= fetchCatalog();
  return cached;
}
