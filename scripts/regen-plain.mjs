#!/usr/bin/env node
// regen-plain.mjs
//
// Regenerates plain-text pages under src/pages/plain/ from their marketing twins.
//
// Design:
//   - The LLM is ONLY used to extract structured facts + paraphrase prose.
//     It never emits install commands, skill names, or numbers — those are
//     copied verbatim from source data (skills.json, setups.json, plain page).
//   - Output schema is fixed JSON. A deterministic template turns the JSON
//     into an Astro page. This kills the hallucinated-command failure mode
//     and keeps diffs reviewable.
//
// Usage:
//   GEMINI_API_KEY=... node scripts/regen-plain.mjs [page-slug ...]
//
//   If no page-slug is passed, all pages in the manifest are regenerated.
//   Valid slugs: index, p2p, mcp, plans, app-store, publish, plus every
//   docs/<slug> auto-discovered from src/pages/docs/.
//
//   Pass --stale-only to regenerate ONLY pages whose twin's stamped source
//   hash no longer matches the current source (used by CI auto-regen). Exits
//   0 with no work when everything is in sync.
//
//   Data-driven pages (skills/) are NOT regenerated here — they render
//   directly from the upstream JSON at build time.
//
// Env:
//   GEMINI_API_KEY   — required
//   GEMINI_MODEL     — optional, default "gemini-2.5-pro"
//   DRY_RUN=1        — print the generated file instead of writing
//
// Exit code: 0 on success, 1 on any failure.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// Stable content hash of a marketing source file. Stamped into the generated
// plain twin so scripts/check-plain-coverage.mjs can detect when the source
// changed but the twin was never re-run (silent content drift). MUST match the
// hashing in check-plain-coverage.mjs exactly (raw utf8 bytes, sha256, hex).
export function sourceHash(sourceText) {
  return createHash('sha256').update(sourceText, 'utf8').digest('hex');
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const API_KEY = process.env.GEMINI_API_KEY;
const DRY_RUN = process.env.DRY_RUN === '1';

// Note: GEMINI_API_KEY is required only when there is actually a page to
// regenerate (checked in main() once the work list is known). This lets
// `--stale-only` exit 0 with no key when nothing has drifted — the common
// CI case, including fork PRs where the secret is unavailable.

// Manifest: marketing source → plain destination.
//
// Each entry:
//   source:  path (relative to repo root) of the marketing .astro file
//   dest:    path (relative to repo root) of the plain .astro file to write
//   title:   <title> element value for the plain page
//   canonical: canonical URL
//   description: <meta name="description"> value
const MANIFEST = {
  index: {
    source: 'src/pages/index.astro',
    dest: 'src/pages/plain/index.astro',
    title: 'Pilot Protocol — plain',
    canonical: 'https://pilotprotocol.network/plain/',
    description: 'Pilot Protocol is an overlay network for AI agents: virtual addresses, ports, and encrypted tunnels over UDP.',
  },
  p2p: {
    source: 'src/pages/for/p2p.astro',
    dest: 'src/pages/plain/p2p.astro',
    title: 'Direct P2P — Pilot Protocol',
    canonical: 'https://pilotprotocol.network/plain/p2p/',
    description: 'Direct peer-to-peer communication for AI agents over Pilot Protocol.',
  },
  mcp: {
    source: 'src/pages/for/mcp.astro',
    dest: 'src/pages/plain/mcp.astro',
    title: 'MCP + Pilot — Pilot Protocol',
    canonical: 'https://pilotprotocol.network/plain/mcp/',
    description: 'Expose MCP servers to other agents on the Pilot Protocol network.',
  },
  plans: {
    source: 'src/pages/plans.astro',
    dest: 'src/pages/plain/plans.astro',
    title: 'Plans — Pilot Protocol',
    canonical: 'https://pilotprotocol.network/plain/plans/',
    description: 'Backbone is open and free. Private networks and enterprise are managed early-access.',
  },
  'app-store': {
    source: 'src/pages/app-store.astro',
    dest: 'src/pages/plain/app-store.astro',
    title: 'App Store — Pilot Protocol',
    canonical: 'https://pilotprotocol.network/plain/app-store/',
    description: 'Agent-native apps on the Pilot Protocol network. Install with one command; publish your own from your browser or by PR.',
  },
  publish: {
    source: 'src/pages/publish.astro',
    dest: 'src/pages/plain/publish.astro',
    title: 'Publish an app — Pilot Protocol',
    canonical: 'https://pilotprotocol.network/plain/publish/',
    description: 'Publish your existing HTTP API on the Pilot Protocol app store. Describe it once; we generate, sign, and verify an agent-first adapter.',
  },
};

// Extract title/description from DocLayout props in a doc .astro file.
function readDocMeta(astroSource) {
  const grab = (key) => {
    const re = new RegExp(`${key}\\s*=\\s*"([^"]*)"`);
    const m = astroSource.match(re);
    return m ? m[1] : null;
  };
  return { title: grab('title'), description: grab('description') };
}

// Auto-discover src/pages/docs/*.astro and register each as a plain target.
async function loadDocManifest() {
  const docsDir = join(REPO_ROOT, 'src/pages/docs');
  const entries = await readdir(docsDir);
  for (const file of entries) {
    if (!file.endsWith('.astro')) continue;
    const slugPart = basename(file, '.astro');
    const key = `docs/${slugPart}`;
    if (MANIFEST[key]) continue;
    const source = `src/pages/docs/${file}`;
    const dest = `src/pages/plain/docs/${file}`;
    const full = await readFile(join(REPO_ROOT, source), 'utf8');
    const meta = readDocMeta(full);
    const isIndex = slugPart === 'index';
    const canonical = isIndex
      ? 'https://pilotprotocol.network/plain/docs/'
      : `https://pilotprotocol.network/plain/docs/${slugPart}/`;
    MANIFEST[key] = {
      source,
      dest,
      title: meta.title ? `${meta.title} — Pilot Protocol (plain)` : `Docs — Pilot Protocol (plain)`,
      canonical,
      description: meta.description || 'Plain-text documentation for Pilot Protocol.',
    };
  }
}

// Structured output schema. Gemini's response_schema enforces this shape.
// The schema is intentionally constrained: no free-form HTML, no commands,
// no numeric claims. Facts come from the source page; the LLM only reshapes.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    h1: { type: 'string', description: 'Page H1 (plain text, no formatting).' },
    intro: {
      type: 'string',
      description: 'One or two sentences summarizing what this page is about. Plain prose, no marketing language.',
    },
    sections: {
      type: 'array',
      description: 'Sections of the page in order.',
      items: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'H2 heading.' },
          body: {
            type: 'array',
            description: 'Ordered list of blocks that render the section body.',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['paragraph', 'list', 'code'],
                  description: 'Block type.',
                },
                text: {
                  type: 'string',
                  description: 'Paragraph text. Required for paragraph blocks. Use empty string "" for list/code blocks.',
                },
                items: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List items as plain strings. Required for list blocks. Use empty array [] for paragraph/code blocks.',
                },
                code: {
                  type: 'string',
                  description: 'Pre-formatted code block contents. Required for code blocks. Must be copied verbatim from the source — never invent commands. Use empty string "" for paragraph/list blocks.',
                },
              },
              required: ['type', 'text', 'items', 'code'],
            },
          },
        },
        required: ['heading', 'body'],
      },
    },
    related_links: {
      type: 'array',
      description: 'Cross-links to other plain pages or docs.',
      items: {
        type: 'object',
        properties: {
          href: { type: 'string' },
          label: { type: 'string' },
        },
        required: ['href', 'label'],
      },
    },
  },
  required: ['h1', 'intro', 'sections'],
};

const SYSTEM_PROMPT = `You are a technical writer producing a plain-text variant of a marketing webpage. Rules:

1. Extract only FACTS from the source: what the thing is, what it does, how to install/use it, concrete specs.
2. Strip ALL marketing language: hero lines, pull quotes, "why X matters", testimonials, emoji, decorative eyebrows, calls-to-action beyond a single install hint.
3. NEVER invent commands, URLs, version numbers, skill names, counts, or technical specs. If the source does not contain a command, do not emit a code block.
4. If you include a code block, the contents must appear in the source. Do not paraphrase code. Strip only a conventional leading shell prompt marker ("$ ") from executable command lines; preserve shell variables such as $TOKEN.
5. Prefer short sentences. No "we", no "you can". Passive-to-neutral voice.
6. Do not refer to visual elements ("see the chart above", "the hero section"). The plain page has no visuals.
7. All cross-links in related_links should point under /plain/ or /docs/ — never to marketing routes like /for/*.
8. Output must conform to the JSON schema. No prose outside the JSON.`;

async function callGemini(sourceAstro, pageSlug) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Produce the plain-text variant of this marketing page. Page slug: ${pageSlug}\n\n--- SOURCE (.astro) ---\n${sourceAstro}\n--- END SOURCE ---`,
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 32768,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text part');
  return JSON.parse(text);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function renderBlock(block) {
  if (process.env.DEBUG === '1') {
    console.error('[renderBlock]', JSON.stringify(block).slice(0, 200));
  }
  if (block.type === 'paragraph' && block.text) {
    return `<p>${escapeHtml(block.text)}</p>`;
  }
  if (block.type === 'list' && Array.isArray(block.items)) {
    return `<ul>\n${block.items.map((item) => `  <li>${escapeHtml(item)}</li>`).join('\n')}\n</ul>`;
  }
  if (block.type === 'code' && block.code) {
    return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
  }
  return '';
}

function renderAstro(meta, payload, key, srcHash) {
  const sections = (payload.sections || [])
    .map((s) => {
      const body = (s.body || []).map(renderBlock).filter(Boolean).join('\n');
      return `<h2>${escapeHtml(s.heading)}</h2>\n${body}`;
    })
    .join('\n\n');

  const related = (payload.related_links || []).filter((l) => l.href && l.label);
  const relatedBlock = related.length
    ? `\n<h2>Related</h2>\n<ul>\n${related.map((l) => `  <li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`).join('\n')}\n</ul>\n`
    : '';

  // meta.dest = src/pages/plain/[...]/foo.astro. Count path segments after
  // "plain/" to determine how deep the file sits, which tells us how many
  // "../" hops are needed to reach src/layouts/.
  const parts = meta.dest.split('/');
  const plainIdx = parts.indexOf('plain');
  const depthBelowPlain = parts.length - plainIdx - 2; // minus 'plain' segment + filename
  const hops = '../'.repeat(depthBelowPlain + 2); // +2 to climb past plain/ and pages/
  const layoutImport = `import PlainLayout from '${hops}layouts/PlainLayout.astro';`;

  const isDocSubpage = key.startsWith('docs/') && key !== 'docs/index';
  const backLink = isDocSubpage
    ? `\n<p><a href="/plain/docs/">&larr; Docs index</a></p>\n`
    : '';

  return `---
// Auto-generated by scripts/regen-plain.mjs. Edit the marketing source and re-run.
// plain-source: ${meta.source}
// plain-source-sha256: ${srcHash}
${layoutImport}
---
<PlainLayout title=${JSON.stringify(meta.title)} description=${JSON.stringify(meta.description)} canonical=${JSON.stringify(meta.canonical)}>
${backLink}
<h1>${escapeHtml(payload.h1)}</h1>

<p>${escapeHtml(payload.intro)}</p>

${sections}
${relatedBlock}
</PlainLayout>
`;
}

async function regen(slug) {
  const entry = MANIFEST[slug];
  if (!entry) {
    throw new Error(`Unknown page slug: ${slug}`);
  }
  const sourcePath = join(REPO_ROOT, entry.source);
  const destPath = join(REPO_ROOT, entry.dest);
  const sourceAstro = await readFile(sourcePath, 'utf8');

  console.log(`[${slug}] calling ${MODEL}...`);
  const payload = await callGemini(sourceAstro, slug);
  if (process.env.DEBUG === '1') {
    console.log(`[${slug}] payload sections=${payload.sections?.length}, first-body-len=${payload.sections?.[0]?.body?.length ?? 0}`);
  }
  const rendered = renderAstro(entry, payload, slug, sourceHash(sourceAstro));

  if (DRY_RUN) {
    console.log(`\n--- ${destPath} ---\n${rendered}\n--- END ---\n`);
    return;
  }

  await mkdir(dirname(destPath), { recursive: true });
  await writeFile(destPath, rendered, 'utf8');
  console.log(`[${slug}] wrote ${entry.dest}`);
}

// Slugs whose twin's stamped source hash no longer matches the current source
// (or whose twin is missing/unstamped) — i.e. exactly the pages that drifted.
async function staleSlugs() {
  const out = [];
  for (const [slug, entry] of Object.entries(MANIFEST)) {
    let srcText;
    try {
      srcText = await readFile(join(REPO_ROOT, entry.source), 'utf8');
    } catch {
      continue; // source gone — coverage guard handles that case
    }
    const current = sourceHash(srcText);
    let stamped = null;
    try {
      const twin = await readFile(join(REPO_ROOT, entry.dest), 'utf8');
      const m = twin.match(/^\/\/ plain-source-sha256:\s*([0-9a-f]{64})/m);
      stamped = m ? m[1] : null;
    } catch {
      stamped = null; // twin missing
    }
    if (stamped !== current) out.push(slug);
  }
  return out;
}

async function main() {
  await loadDocManifest();

  const argv = process.argv.slice(2);
  const staleOnly = argv.includes('--stale-only');
  const requested = argv.filter((a) => !a.startsWith('--'));

  let slugs;
  if (staleOnly) {
    slugs = await staleSlugs();
    if (!slugs.length) {
      console.log('No stale plain pages — nothing to regenerate.');
      return;
    }
    console.log(`Stale page(s): ${slugs.join(', ')}`);
  } else {
    slugs = requested.length ? requested : Object.keys(MANIFEST);
  }

  const unknown = slugs.filter((s) => !MANIFEST[s]);
  if (unknown.length) {
    console.error(`Unknown slugs: ${unknown.join(', ')}`);
    console.error(`Known: ${Object.keys(MANIFEST).join(', ')}`);
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY (required to regenerate pages).');
    process.exit(1);
  }

  let failed = 0;
  for (const slug of slugs) {
    try {
      await regen(slug);
    } catch (err) {
      console.error(`[${slug}] failed:`, err.message);
      failed += 1;
    }
  }
  if (failed) process.exit(1);
  console.log(`done. ${slugs.length} page(s) regenerated.`);
}

main();
