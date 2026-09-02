const MIN_TITLE_LENGTH = 50;
const MAX_TITLE_LENGTH = 60;
const MIN_DESCRIPTION_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 160;

// Search titles are intentionally separate from visible H1s. The H1 can be
// editorial; the browser/search title should be concise, descriptive, and
// consistent across product, documentation, and resource collections.
const ROUTE_TITLES = new Map([
  ['/', 'Pilot Protocol: Secure Network OS for AI Agent Teams'],
  ['/about', 'About Pilot Protocol: Company, Team and Engineering'],
  ['/app-store', 'Agent App Store: Tools and Services | Pilot Protocol'],
  ['/aup', 'Acceptable Use Policy and Platform Rules | Pilot Protocol'],
  ['/brand', 'Pilot Protocol Brand Guidelines, Logos and Media Kit'],
  ['/blog', 'AI Agent Networking Guides and Analysis | Pilot Protocol'],
  ['/contact', 'Contact Pilot Protocol: Sales, Partnerships and Press'],
  ['/cookies', 'Cookie Policy and Tracking Controls | Pilot Protocol'],
  ['/docs', 'Pilot Protocol Documentation: Guides and API Reference'],
  ['/enterprise/autonomous-ai-agents', 'Autonomous AI Agent Control Plane | Pilot Protocol'],
  ['/enterprise/claude-code-management', 'Claude Code Management for Enterprise | Pilot Protocol'],
  ['/governance', 'Agent Network Governance and Controls | Pilot Protocol'],
  ['/learn', 'Pilot Protocol Learning Center: Guides and Concepts'],
  ['/news', 'Pilot Protocol Company News and Product Announcements'],
  ['/plans', 'Pilot Protocol Plans for Teams and Private Agent Networks'],
  ['/press', 'Pilot Protocol Press Kit, Company Facts and Brand Assets'],
  ['/privacy', 'Privacy Policy and Data Practices | Pilot Protocol'],
  ['/publish', 'Publish Agent Apps in the Pilot Protocol App Store'],
  ['/publisher-agreement', 'Agent App Publisher Agreement and Terms | Pilot Protocol'],
  ['/roadmap', 'Pilot Protocol Product Roadmap and Engineering Priorities'],
  ['/security/disclosure', 'Report a Security Vulnerability or Bug | Pilot Protocol'],
  ['/terms', 'Terms of Service and User Agreement | Pilot Protocol'],
  ['/trust', 'Pilot Protocol Trust Center: Security and Architecture'],
  ['/blog/direct-communication-protocols-ai-agents-guide', 'AI Agent Communication Protocols Compared | Pilot Protocol'],
  ['/blog/ai-networking-terminology-a2a-mcp-anp-protocols', 'AI Networking Glossary: A2A, MCP and ANP | Pilot Protocol'],
  ['/blog/overlay-networking-secure-ai-agent-communication-explained', 'Overlay Networking Explained for AI Systems | Pilot Protocol'],
  ['/blog/pilot-vs-tailscale-nebula-zerotier-ai-agents', 'Nebula vs Tailscale vs ZeroTier for Agents | Pilot Protocol'],
  ['/blog/pilot-vs-tcp-grpc-nats-comparison', 'Where Pilot Fits with TCP, gRPC and NATS | Pilot Protocol'],
  ['/blog/why-ai-agents-need-network-stack', 'AI Agent Connectivity Best Practices | Pilot Protocol'],
  ['/blog/zero-dependency-encryption-x25519-aes-gcm', 'AES-256-GCM Encryption with X25519 | Pilot Protocol'],
  ['/docs/comparison-networking', 'Pilot Network Architecture Comparison | Pilot Protocol Docs'],
  ['/learn/nats-vs-grpc-agent-messaging', 'NATS vs gRPC: Agent Messaging Compared | Pilot Protocol'],
  ['/for/compatibility', 'Pilot Protocol Deployment Compatibility by Environment'],
  ['/for/networks', 'Managed Agent Networks for Organizations | Pilot Protocol'],
  ['/for/setups', 'Multi-Agent Fleet Blueprints and Setups | Pilot Protocol'],
  ['/for/skills', 'Agent Skills and Integrations Directory | Pilot Protocol'],
]);

function normalizedPath(pathname) {
  if (!pathname) return '/';
  const withoutFile = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
  return withoutFile === '/' ? '/' : withoutFile.replace(/\/+$/, '');
}

function decodeTitle(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSubject(value) {
  return decodeTitle(value)
    .replace(/\s+-\s+Orgs\s+·\s+Pilot Protocol$/i, '')
    .replace(/\s+[—–-]\s+Pilot Protocol App Store$/i, '')
    .replace(/\s+[—–-]\s+Pilot Protocol$/i, '')
    .replace(/\s+\|\s+Pilot Protocol(?: Blog| Newsroom| News)?$/i, '')
    .trim();
}

function cropWords(value, max) {
  if (value.length <= max) return value;
  const prefix = value.slice(0, max + 1);
  const boundary = prefix.search(/\s+\S*$/);
  if (boundary <= 0) return '';
  let cropped = prefix.slice(0, boundary).replace(/[,:;\-–—]+$/, '').trim();
  const weakEnding = /\b(?:a|an|and|by|every|for|from|in|of|or|the|to|with|your)$/i;
  while (weakEnding.test(cropped)) {
    const next = cropped.replace(/\s+\S+$/, '').trim();
    if (next === cropped) return '';
    cropped = next;
  }
  return cropped;
}

function subjectVariants(subject) {
  const variants = new Set([subject]);
  const simplified = subject
    .replace(/\bA Step-by-Step Guide\b/gi, 'Step-by-Step')
    .replace(/\bA Practical Guide\b/gi, 'Practical Guide')
    .replace(/\bEvery AI Engineer Should Know\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  variants.add(simplified);

  const clauses = subject.split(/\s*(?::|\s+[—–]\s+|\s+\|\s+)\s*/).filter(Boolean);
  if (clauses[0]?.length >= 8) variants.add(clauses[0]);
  if (clauses.length > 1) {
    for (const max of [42, 38, 34, 30]) {
      const second = cropWords(clauses[1], Math.max(8, max - clauses[0].length - 2));
      if (second) variants.add(`${clauses[0]}: ${second}`);
    }
  }

  for (const max of [43, 40, 38, 35, 32, 29, 26, 23, 20]) {
    const cropped = cropWords(simplified, max);
    if (cropped) variants.add(cropped);
  }
  return [...variants];
}

function chooseFitted(subject, templates) {
  const words = new Set(subject.toLowerCase().match(/[a-z0-9]+/g) || []);
  const candidates = [];
  for (const variant of subjectVariants(subject)) {
    const kept = (variant.toLowerCase().match(/[a-z0-9]+/g) || []).filter((word) => words.has(word)).length;
    for (let i = 0; i < templates.length; i += 1) {
      const value = templates[i](variant);
      if (value.length < MIN_TITLE_LENGTH || value.length > MAX_TITLE_LENGTH) continue;
      const score = kept * 100 - i * 8 - Math.abs(55 - value.length);
      candidates.push({ value, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score || a.value.localeCompare(b.value));
  return candidates[0]?.value;
}

function fallbackTitle(subject, suffix) {
  const maxSubject = MAX_TITLE_LENGTH - suffix.length;
  const minSubject = MIN_TITLE_LENGTH - suffix.length;
  let fitted = cropWords(subject, maxSubject);
  if (!fitted) fitted = `${subject.slice(0, Math.max(1, maxSubject - 1)).trim()}…`;
  if (fitted.length < minSubject) fitted = `${fitted}: Technical Guide`;
  const finalSubject = cropWords(fitted, maxSubject) || fitted.slice(0, maxSubject);
  return `${finalSubject}${suffix}`;
}

export function formatPageTitle(title, pathname) {
  const path = normalizedPath(pathname);
  const supplied = decodeTitle(title);
  const direct = ROUTE_TITLES.get(path);
  if (direct) return direct;
  if (supplied.length >= MIN_TITLE_LENGTH && supplied.length <= MAX_TITLE_LENGTH) return supplied;

  const subject = cleanSubject(supplied);
  let fitted;

  if (path.startsWith('/apps/')) {
    fitted = chooseFitted(subject, [
      (name) => `${name}: Agent App Methods & Install | Pilot Protocol`,
      (name) => `${name} Agent App: Features & Setup | Pilot Protocol`,
    ]);
    return fitted || fallbackTitle(subject, ': Agent App | Pilot Protocol');
  }

  if (path.startsWith('/for/setups/')) {
    fitted = chooseFitted(subject, [
      (name) => `${name}: Agent Fleet Blueprint | Pilot Protocol`,
      (name) => `${name}: Multi-Agent Setup | Pilot Protocol`,
    ]);
    return fitted || fallbackTitle(subject, ': Agent Fleet | Pilot Protocol');
  }

  if (path.startsWith('/docs/')) {
    fitted = chooseFitted(subject, [
      (name) => `Pilot Protocol ${name}: Developer Guide & Reference`,
      (name) => `${name} Guide & Reference | Pilot Protocol Docs`,
      (name) => `${name} | Pilot Protocol Documentation`,
    ]);
    return fitted || fallbackTitle(subject, ' | Pilot Protocol Docs');
  }

  if (path.startsWith('/learn/')) {
    fitted = chooseFitted(subject, [
      (name) => `${name} | Pilot Protocol Learning Center`,
      (name) => `${name}: Technical Guide | Pilot Protocol`,
      (name) => `${name}: Concepts & Tradeoffs | Pilot Protocol`,
    ]);
    return fitted || fallbackTitle(subject, ' | Pilot Learning Center');
  }

  if (path.startsWith('/blog/')) {
    fitted = chooseFitted(subject, [
      (name) => `${name} | Pilot Protocol Blog`,
      (name) => `${name} | Pilot Protocol`,
      (name) => `${name}: Technical Guide | Pilot Protocol`,
      (name) => `${name}: Engineering Analysis | Pilot Protocol`,
    ]);
    return fitted || fallbackTitle(subject, ' | Pilot Protocol Blog');
  }

  if (path.startsWith('/news/')) {
    fitted = chooseFitted(subject, [
      (name) => `${name} | Pilot Protocol Newsroom`,
      (name) => `${name} | Pilot Protocol News`,
    ]);
    return fitted || fallbackTitle(subject, ' | Pilot Protocol News');
  }

  if (path.startsWith('/for/')) {
    fitted = chooseFitted(subject, [
      (name) => `${name}: Agent Network Solutions | Pilot Protocol`,
      (name) => `${name} | Pilot Protocol Solutions`,
    ]);
    return fitted || fallbackTitle(subject, ' | Pilot Protocol Solutions');
  }

  return supplied;
}

function finishSentence(value) {
  const clean = value.trim().replace(/[,:;\-–—]+$/, '');
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

export function formatMetaDescription(description, pathname) {
  const path = normalizedPath(pathname);
  let clean = decodeTitle(description);

  if (clean.length > MAX_DESCRIPTION_LENGTH) {
    return finishSentence(cropWords(clean, MAX_DESCRIPTION_LENGTH - 1) || clean.slice(0, MAX_DESCRIPTION_LENGTH - 1));
  }
  if (clean.length >= MIN_DESCRIPTION_LENGTH) return clean;

  const suffixes = path.startsWith('/apps/')
    ? [
        'See setup and usage details.',
        'Review setup, usage, and operating details.',
        'Review its methods, setup, runtime requirements, and typed agent interface.',
      ]
    : path.startsWith('/for/setups/')
      ? [
          'See the implementation blueprint.',
          'Review the workflow, roles, and controls.',
          'Review the workflow, roles, controls, and practical implementation blueprint.',
        ]
      : path.startsWith('/docs/')
        ? [
            'Read the implementation guide.',
            'Read configuration and operating guidance.',
            'Read implementation details, configuration, and operational guidance.',
          ]
        : [
            'See the technical details.',
            'Review the architecture and practical guidance.',
            'Review the architecture, operating model, tradeoffs, and practical next steps.',
          ];

  clean = finishSentence(clean);
  const candidate = suffixes
    .map((suffix) => `${clean} ${suffix}`)
    .find((value) => value.length >= MIN_DESCRIPTION_LENGTH && value.length <= MAX_DESCRIPTION_LENGTH)
    || `${clean} ${suffixes[suffixes.length - 1]}`;

  return candidate.length <= MAX_DESCRIPTION_LENGTH
    ? candidate
    : finishSentence(cropWords(candidate, MAX_DESCRIPTION_LENGTH - 1) || candidate.slice(0, MAX_DESCRIPTION_LENGTH - 1));
}

export {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MIN_TITLE_LENGTH,
  normalizedPath,
};
