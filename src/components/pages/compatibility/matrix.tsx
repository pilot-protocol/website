"use client";

import { useState } from "react";
import { CATEGORIES, MODES, SKY_LABEL, type Mode } from "@/components/pages/compatibility/data";
import { ModeGlyph } from "@/components/pages/compatibility/mode-glyph";
import { SKY } from "@/components/pages/security/kit";
import { Segmented } from "@/components/sky/kit";
import { Reveal } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { LineIcon, Tile, TileStack, type IconName } from "@/components/pages/compatibility/marks";
import "@/components/pages/compatibility/sky.css";

const ALL = CATEGORIES.flatMap((c) => c.items);
const COUNT = Object.fromEntries(MODES.map((m) => [m.mode, ALL.filter((p) => p.mode === m.mode).length])) as Record<Mode, number>;

// Fill for each mode's share of the summary bar.
const BAR: Record<Mode, string> = {
  udp: "bg-lime",
  compat: "bg-lime/45",
  proxy: "bg-lime/25",
  allowlist: "bg-lime/15",
  wrong: "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-fg)_22%,transparent)_0_2px,transparent_2px_6px)]",
  unshipped: "bg-fg/10",
};

// Sky site: one blue in falling strengths, solid greys for the two that don't run.
const SKY_BAR: Record<Mode, string> = {
  udp: "bg-(--sky-fill)",
  compat: "bg-(--sky-fill)/60",
  proxy: "bg-(--sky-fill)/36",
  allowlist: "bg-(--sky-fill)/20",
  wrong: "bg-fg/20",
  unshipped: "bg-fg/10",
};

/*
 * Sky site: each platform's real mark (several for a row that names several vendors), or a line icon where the row
 * is a kind of thing rather than a product (bare metal, a browser tab).
 */
const MARK: Record<string, Brand[] | IconName> = {
  Render: ["render"],
  Railway: ["railway"],
  "Fly.io Machines": ["flyio"],
  Heroku: ["heroku"],
  "DigitalOcean App Platform": ["digitalocean"],
  Northflank: ["northflank"],
  "Coolify / CapRover": ["coolify", "caprover"],
  "AWS Lambda": ["awslambda"],
  "Google Cloud Run": ["googlecloud"],
  "Vercel / Netlify / GCP Functions": ["vercel", "netlify", "googlecloud"],
  "Cloudflare Workers": ["cloudflare"],
  "EC2 / GCE / Azure VM": ["aws", "googlecloud", "azure"],
  "DO Droplets / Hetzner / Linode": ["digitalocean", "hetzner", "linode"],
  "Bare metal": "server",
  "Vanilla k8s / EKS / GKE / AKS": ["kubernetes"],
  "k3s / k0s / OpenShift / kind": ["k3s", "openshift"],
  "Locked clusters (NetworkPolicy default-deny)": "lock",
  "Cursor Cloud Agents": ["cursor"],
  "Replit Agent": ["replit"],
  "Devin (Cognition)": ["devin"],
  "Modal Sandboxes": ["modal"],
  "E2B Sandboxes": ["e2b"],
  "Daytona Sandboxes": ["daytona"],
  "GitHub Codespaces": ["github"],
  Gitpod: ["gitpod"],
  "Coder (workspaces)": ["coder"],
  "Manus Sandbox": ["manus"],
  "Lovable / v0 / Bolt.new": ["lovable", "v0"],
  "macOS (LaunchAgent)": ["apple"],
  "Linux (systemd)": ["linux"],
  "tmux / screen": ["tmux"],
  Windows: ["windows"],
  "Browser tab": "browser",
  "WASM runtime": ["webassembly"],
};

/** Sky site: a small icon beside each category's name. */
const CAT_ICON: Record<string, IconName> = {
  paas: "cloud",
  serverless: "bolt",
  vms: "server",
  k8s: "cube",
  sandboxes: "cube",
  desktop: "laptop",
  browser: "browser",
};

function PlatformMark({ name, off }: { name: string; off: boolean }) {
  const m = MARK[name];
  if (!m) return <Tile icon="server" off={off} />;
  // A locked-down cluster: the Kubernetes wheel with a padlock on its corner.
  if (m === "lock")
    return (
      <Tile brand="kubernetes" off={off}>
        <span className="absolute -right-1 -bottom-1 grid size-[17px] place-items-center rounded-full bg-fg text-bg ring-2 ring-(--color-card)">
          <LineIcon name="lock" className="size-[10px]" strokeWidth={2} />
        </span>
      </Tile>
    );
  if (typeof m === "string") return <Tile icon={m} off={off} />;
  return <TileStack brands={m} off={off} />;
}

const label = (m: Mode) => (SKY ? SKY_LABEL[m] : MODES.find((x) => x.mode === m)!.label);

export function Matrix() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const hit = (name: string, m: Mode) => (!mode || m === mode) && (!query || name.toLowerCase().includes(query));
  const filtering = Boolean(mode || query);
  const matches = ALL.filter((p) => hit(p.name, p.mode)).length;

  return (
    <div>
      {/* Summary: every platform on the page, by the mode it needs. */}
      <Reveal className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <p className="text-[clamp(22px,2.4vw,28px)] leading-[1.2] font-medium tracking-[-0.025em] text-fg">
            {COUNT.udp} of {ALL.length} run on plain UDP.{" "}
            <span className="text-mute">{COUNT.compat + COUNT.proxy} more need compat.</span>
          </p>
          <label
            className={
              SKY
                ? "flex h-11 w-full items-center gap-2.5 rounded-full border border-(--sky-card-line) bg-card px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-(--sky-fill) focus-within:shadow-[0_0_0_3px_var(--sky-tint)] sm:w-[300px]"
                : "flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-edge-2 px-3 transition-colors focus-within:border-lime-ink/60 sm:w-[280px]"
            }
          >
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 text-dim">
              <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="sr-only">Find your platform</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find your platform"
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-fg outline-none! placeholder:text-faint"
            />
            {filtering && <span className={`shrink-0 text-dim ${SKY ? "text-[12.5px] tabular-nums" : "font-mono text-[11.5px]"}`}>{matches}</span>}
          </label>
        </div>

        <div className={`flex w-full gap-[2px] overflow-hidden ${SKY ? "h-2.5 rounded-full" : "h-3"}`} aria-hidden>
          {MODES.map((m) => (
            <span
              key={m.mode}
              className={`h-full transition-opacity duration-300 ${(SKY ? SKY_BAR : BAR)[m.mode]} ${mode && mode !== m.mode ? "opacity-25" : ""}`}
              style={{ flexGrow: COUNT[m.mode], flexBasis: 0 }}
            />
          ))}
        </div>

        {SKY ? (
          <div className="cpx-seg-scroll no-scrollbar -mx-5 flex items-center gap-x-3 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:gap-y-2 sm:overflow-visible sm:px-0">
            <Segmented
              items={[
                { id: "all", label: <span className="inline-flex items-center gap-2">All<span className="tabular-nums opacity-60">{ALL.length}</span></span> },
                ...MODES.map((m) => ({
                  id: m.mode,
                  label: (
                    <span className="inline-flex items-center gap-2" title={m.long}>
                      <ModeGlyph mode={m.mode} />
                      {label(m.mode)}
                      <span className="tabular-nums opacity-60">{COUNT[m.mode]}</span>
                    </span>
                  ),
                })),
              ]}
              value={mode ?? "all"}
              onChange={(id) => setMode(id === "all" ? null : (id as Mode))}
              label="Filter by mode"
              layoutId="cpx-matrix-mode"
            />
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  setQ("");
                }}
                className="pressable inline-flex h-9 shrink-0 items-center px-2 text-[13px] text-dim hover:text-fg"
              >
                Clear
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-2 gap-y-2" role="group" aria-label="Filter by mode">
            {MODES.map((m) => {
              const on = mode === m.mode;
              return (
                <button
                  key={m.mode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMode(on ? null : m.mode)}
                  title={m.long}
                  className={`pressable inline-flex h-9 items-center gap-2.5 rounded-[10px] border px-3 font-mono text-[12px] transition-colors ${
                    on ? "border-fg text-fg" : "border-edge-2 text-soft hover:border-edge-3 hover:text-fg"
                  }`}
                >
                  <ModeGlyph mode={m.mode} />
                  {label(m.mode)}
                  <span className="text-dim">{COUNT[m.mode]}</span>
                </button>
              );
            })}
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  setQ("");
                }}
                className="pressable inline-flex h-9 items-center px-2 font-mono text-[12px] text-dim hover:text-fg"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </Reveal>

      <div className="mt-14 flex flex-col">
        {CATEGORIES.map((c) => {
          const any = c.items.some((p) => hit(p.name, p.mode));
          return (
            <section
              key={c.id}
              aria-labelledby={`cat-${c.id}`}
              className={`grid grid-cols-1 gap-5 border-t border-edge py-8 transition-opacity duration-300 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-10 ${
                filtering && !any ? "opacity-30" : ""
              }`}
            >
              <Reveal>
                <h3 id={`cat-${c.id}`} className={`text-[18px] leading-[1.3] font-medium tracking-[-0.015em] text-fg ${SKY ? "flex items-center gap-2.5" : ""}`}>
                  {SKY &&
                    (c.id === "k8s" ? (
                      <BrandMark brand="kubernetes" className="size-[17px] text-mute" />
                    ) : (
                      <LineIcon name={CAT_ICON[c.id] ?? "server"} className="size-[17px] text-mute" />
                    ))}
                  {c.title}
                </h3>
                <p className="mt-2 max-w-[420px] text-[14px] leading-[1.55] text-mute">{c.note}</p>
              </Reveal>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {c.items.map((p, i) => {
                  const off = p.mode === "wrong" || p.mode === "unshipped";
                  const lit = hit(p.name, p.mode);
                  return (
                    <Reveal
                      as="li"
                      key={p.name}
                      delay={(i % 3) * 40}
                      className={
                        SKY
                          ? `flex flex-col p-3.5 transition-[opacity,box-shadow] duration-300 sm:p-4 ${
                              off ? "rounded-[12px] bg-fg/[0.035]" : "sky-card"
                            } ${filtering && lit && !off ? "shadow-[0_0_0_1px_var(--sky-fill)]" : ""}`
                          : `flex flex-col rounded-[16px] border p-4 transition-[opacity,border-color] duration-300 ${
                              off ? "border-dashed border-edge-2" : "border-edge-2"
                            } ${filtering && lit ? "border-fg/40" : ""}`
                      }
                      style={{ opacity: filtering && !lit ? 0.18 : undefined }}
                    >
                      {SKY ? (
                        <SkyPlatform name={p.name} mode={p.mode} note={p.note} off={off} />
                      ) : (
                        <>
                      <span className="flex items-start justify-between gap-3">
                        <span className={`text-[15px] leading-[1.35] font-medium ${off ? "text-soft" : "text-fg"}`}>{p.name}</span>
                        <span
                          className={
                            SKY
                              ? `mt-[2px] flex shrink-0 items-center gap-1.5 text-[12.5px] whitespace-nowrap ${off ? "text-mute" : "text-soft"}`
                              : `mt-[3px] flex shrink-0 items-center gap-1.5 font-mono text-[11.5px] whitespace-nowrap ${
                                  off ? "text-dim" : "text-fg"
                                }`
                          }
                        >
                          <ModeGlyph mode={p.mode} />
                          {label(p.mode)}
                        </span>
                      </span>
                      <span className="mt-2 text-[13.5px] leading-[1.5] [overflow-wrap:anywhere] text-mute">{p.note}</span>
                        </>
                      )}
                    </Reveal>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Sky site: one platform as a card, like an app's: its mark and its mode on top, then its name and what to know.
 * On phones (one column, room to spare across) the mark sits beside the name instead, so the list stays short.
 */
function SkyPlatform({ name, mode, note, off }: { name: string; mode: Mode; note: string; off: boolean }) {
  const modeLabel = (cls: string) => (
    <span className={`shrink-0 items-center gap-1.5 text-[12.5px] leading-5 whitespace-nowrap ${off ? "text-mute" : "text-soft"} ${cls}`}>
      <ModeGlyph mode={mode} />
      {label(mode)}
    </span>
  );
  return (
    <span className="flex min-w-0 gap-3.5 sm:flex-col sm:gap-0">
      <span className="flex items-start justify-between gap-3">
        <PlatformMark name={name} off={off} />
        {modeLabel("hidden pt-0.5 sm:flex")}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-x-3 pt-[7px] max-sm:flex-col sm:mt-3.5 sm:pt-0">
          <span className={`min-w-0 text-[15px] leading-[1.35] font-medium tracking-[-0.01em] ${off ? "text-soft" : "text-fg"}`}>{name}</span>
          {modeLabel("mt-1 flex sm:hidden")}
        </span>
        <span className="mt-1 text-[13.5px] leading-[1.5] [overflow-wrap:anywhere] text-mute">{note}</span>
      </span>
    </span>
  );
}
