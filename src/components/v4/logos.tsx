/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

/*
 * The real marks of the AI apps, agents and platforms the sky site names, from public/logos.
 * Single-colour marks (Apple, Tux, OpenAI, Cursor and the like) are a CSS mask filled with currentColor, so they
 * take the colour of the text around them: ink by day, near-white at night, white on an ink tab. Coloured marks
 * keep their colours. `scale` balances them optically, so a full-bleed tile and an open star read as one size.
 *
 * Sources (the files are trimmed to their shapes; the marks belong to their owners):
 * - Simple Icons, CC0: claude, openai, apple, linux, cursor, vscode (as visualstudiocode), cline, githubcopilot.
 * - Lobe Icons, MIT: codex, junie, openhands, openclaw, muse, gemini (via public/harness).
 * - Already in the repo (public/harness): grok, hermes.png.
 * - The vendors' own files: continue (continuedev/continue's IDE icon, Apache-2.0), picoclaw.png (sipeed/picoclaw's
 *   favicon, MIT).
 */

type Spec = { file: string; mono?: boolean; scale?: number; tile?: boolean };

const BRANDS = {
  claude: { file: "claude.svg" },
  openai: { file: "openai.svg", mono: true, scale: 0.92 },
  apple: { file: "apple.svg", mono: true },
  linux: { file: "linux.svg", mono: true, scale: 1.04 },
  cursor: { file: "cursor.svg", mono: true, scale: 0.94 },
  vscode: { file: "vscode.svg", scale: 0.9 },
  gemini: { file: "gemini.svg", scale: 1.04 },
  codex: { file: "codex.svg", mono: true, scale: 0.94 },
  cline: { file: "cline.svg", mono: true, scale: 0.94 },
  continue: { file: "continue.svg", mono: true, scale: 0.96 },
  copilot: { file: "githubcopilot.svg", mono: true },
  junie: { file: "junie.svg", scale: 0.84 },
  hermes: { file: "hermes.png", scale: 0.92, tile: true },
  openhands: { file: "openhands.svg", mono: true, scale: 1.08 },
  openclaw: { file: "openclaw.svg" },
  picoclaw: { file: "picoclaw.png", scale: 1.08 },
  muse: { file: "muse.svg" },
  grok: { file: "grok.svg", mono: true, scale: 0.92 },
  // Platforms, tools and sign-ins (compatibility, MCP, skills, publish). Simple Icons CC0 (latest, except heroku,
  // awslambda, aws, azure, linode, windows, slack and amazons3 from v15.22.0, dropped in v16); Lobe Icons MIT: devin,
  // manus, lovable; vendors' own: northflank.png (favicon), e2b.png (e2b-dev/E2B logo-circle), daytona (favicon).
  render: { file: "render.svg", mono: true, scale: 0.9 },
  railway: { file: "railway.svg", mono: true },
  flyio: { file: "flyio.svg", mono: true },
  heroku: { file: "heroku.svg", mono: true, scale: 0.92 },
  digitalocean: { file: "digitalocean.svg", mono: true },
  northflank: { file: "northflank.png", scale: 1.04 },
  coolify: { file: "coolify.svg", mono: true },
  caprover: { file: "caprover.svg", mono: true },
  awslambda: { file: "awslambda.svg", mono: true, scale: 0.92 },
  aws: { file: "aws.svg", mono: true, scale: 1.08 },
  googlecloud: { file: "googlecloud.svg", mono: true },
  vercel: { file: "vercel.svg", mono: true, scale: 0.86 },
  netlify: { file: "netlify.svg", mono: true },
  cloudflare: { file: "cloudflare.svg", mono: true, scale: 1.1 },
  azure: { file: "azure.svg", mono: true, scale: 0.94 },
  hetzner: { file: "hetzner.svg", mono: true, scale: 0.9 },
  linode: { file: "linode.svg", mono: true },
  kubernetes: { file: "kubernetes.svg", mono: true },
  k3s: { file: "k3s.svg", mono: true, scale: 0.92 },
  openshift: { file: "openshift.svg", mono: true },
  replit: { file: "replit.svg", mono: true, scale: 0.9 },
  devin: { file: "devin.svg", mono: true },
  modal: { file: "modal.svg", mono: true, scale: 1.04 },
  e2b: { file: "e2b.png", scale: 1.02 },
  daytona: { file: "daytona.svg", mono: true, scale: 0.92 },
  github: { file: "github.svg", mono: true },
  gitpod: { file: "gitpod.svg", mono: true, scale: 0.94 },
  coder: { file: "coder.svg", mono: true, scale: 1.04 },
  manus: { file: "manus.svg", mono: true },
  lovable: { file: "lovable.svg", mono: true, scale: 0.9 },
  v0: { file: "v0.svg", mono: true, scale: 1.06 },
  windows: { file: "windows.svg", mono: true, scale: 0.86 },
  tmux: { file: "tmux.svg", mono: true, scale: 0.9 },
  webassembly: { file: "webassembly.svg", mono: true, scale: 0.92 },
  docker: { file: "docker.svg", mono: true, scale: 1.06 },
  nginx: { file: "nginx.svg", mono: true, scale: 0.92 },
  fortinet: { file: "fortinet.svg", mono: true, scale: 0.92 },
  paloalto: { file: "paloalto.svg", mono: true, scale: 0.92 },
  google: { file: "google.svg", mono: true, scale: 0.9 },
  discord: { file: "discord.svg", mono: true },
  slack: { file: "slack.svg", mono: true, scale: 0.92 },
  mcp: { file: "mcp.svg", mono: true },
  amazons3: { file: "amazons3.svg", mono: true },
  markdown: { file: "markdown.svg", mono: true },
  go: { file: "go.svg", mono: true, scale: 1.12 },
  debian: { file: "debian.svg", mono: true, scale: 0.92 },
  // The upstream sources the service agents wrap (service-agents page). Public domain, US government (Wikimedia
  // Commons, cropped): nhtsa, usgs, nasa (the insignia), fda (its 2016 icon; openFDA), nist (NVD). Simple Icons CC0:
  // wikipedia, wikidata, hackernews (ycombinator, in HN orange), openstreetmap, googlemaps, homebrew, pypi, npm,
  // musicbrainz, itunes, internetarchive, bvg, tfl (transportforlondon), nhl, dblp, zenodo. CC BY 4.0: gbif (GBIF),
  // crossref-mark.png (Crossref's stacked logo, the mark alone). The vendor's own: open-meteo.png (its favicon).
  nhtsa: { file: "nhtsa.svg" },
  usgs: { file: "usgs.svg" },
  nasa: { file: "nasa.svg", scale: 1.1 },
  fda: { file: "fda.svg" },
  nist: { file: "nist.svg", mono: true },
  wikipedia: { file: "wikipedia.svg", mono: true },
  wikidata: { file: "wikidata.svg", mono: true, scale: 0.9 },
  hackernews: { file: "hackernews.svg", scale: 0.9 },
  openstreetmap: { file: "openstreetmap.svg", mono: true },
  googlemaps: { file: "googlemaps.svg", mono: true },
  homebrew: { file: "homebrew.svg", mono: true },
  pypi: { file: "pypi.svg", mono: true },
  npm: { file: "npm.svg", mono: true, scale: 0.9 },
  musicbrainz: { file: "musicbrainz.svg", mono: true },
  itunes: { file: "itunes.svg", mono: true },
  internetarchive: { file: "internetarchive.svg", mono: true },
  bvg: { file: "bvg.svg", mono: true },
  tfl: { file: "tfl.svg", mono: true },
  nhl: { file: "nhl.svg", mono: true },
  dblp: { file: "dblp.svg", mono: true },
  zenodo: { file: "zenodo.svg", mono: true },
  gbif: { file: "gbif.svg" },
  crossref: { file: "crossref-mark.png", scale: 0.92 },
  openmeteo: { file: "open-meteo.png", tile: true },
  // Self-hosting's audit export (Splunk HEC). Simple Icons CC0: splunk (the wordmark; it's wide, so scaled up).
  splunk: { file: "splunk.svg", mono: true, scale: 1.5 },
} satisfies Record<string, Spec>;

export type Brand = keyof typeof BRANDS;

/** Which mark goes with a client's name as the site writes it. */
export const BRAND_OF: Record<string, Brand> = {
  Claude: "claude",
  "Claude Code": "claude",
  ChatGPT: "openai",
  Codex: "codex",
  "Codex CLI": "codex",
  Cursor: "cursor",
  "VS Code": "vscode",
  Gemini: "gemini",
  "Gemini CLI": "gemini",
  Cline: "cline",
  Continue: "continue",
  "GitHub Copilot CLI": "copilot",
  Junie: "junie",
  Hermes: "hermes",
  OpenHands: "openhands",
  OpenClaw: "openclaw",
  PicoClaw: "picoclaw",
  Muse: "muse",
  "Grok Bot": "grok",
  // OpenAI's always-on agent; it carries the OpenAI mark (as pilotprotocol.network shows it).
  Dots: "openai",
  macOS: "apple",
  Linux: "linux",
};

/** A brand's mark, decorative (the name always sits next to it). Size it with `className` (default 16px). */
export function BrandMark({ brand, className = "size-4" }: { brand: Brand; className?: string }) {
  const b: Spec = BRANDS[brand];
  const style: CSSProperties = b.scale ? { scale: b.scale } : {};
  if (b.mono) {
    const mask = `url(/logos/${b.file}) center / contain no-repeat`;
    return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={{ ...style, mask, WebkitMask: mask }} />;
  }
  return (
    <img
      src={`/logos/${b.file}`}
      alt=""
      aria-hidden
      width={24}
      height={24}
      draggable={false}
      className={`shrink-0 object-contain ${b.tile ? "rounded-[24%]" : ""} ${className}`}
      style={style}
    />
  );
}
