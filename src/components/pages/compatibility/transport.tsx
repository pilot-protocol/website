"use client";

import type { ReactNode } from "react";
import { Code, FLAT_CARD, PathPacket, poly, SKY, useStepper } from "@/components/pages/security/kit";
import { ModeGlyph } from "@/components/pages/compatibility/mode-glyph";
import { Tile } from "@/components/pages/compatibility/marks";
import { ModesStage } from "@/components/pages/compatibility/modes-sky";
import { SkyNode, SkyRide, SkyWall } from "@/components/pages/compatibility/sky";
import { HatchPanel, Segmented } from "@/components/sky/kit";

/*
 * Auto mode, drawn: the daemon probes the beacon over UDP. If the probe gets
 * out, peers talk on a direct UDP path. If it doesn't, everything goes over one
 * outbound TCP/443 to the backbone, which relays to the peer (+1 hop), through
 * an HTTPS proxy when that's the only way out.
 */

type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

type Layout = {
  w: number;
  h: number;
  small: boolean;
  daemon: Box;
  peer: Box;
  backbone: Box;
  proxy: Box;
  wall: Box;
  udpGap: Box;
  tcpGap: Box;
  udp: Pt[];
  udpProbe: Pt[];
  tcp: Pt[];
  cross: Pt;
  labels: { udp: Pt; tcp: Pt; hop: Pt; wall: Pt };
};

const WIDE: Layout = {
  w: 1160,
  h: 330,
  small: false,
  daemon: { x: 0, y: 40, w: 210, h: 250 },
  peer: { x: 980, y: 40, w: 180, h: 250 },
  backbone: { x: 650, y: 202, w: 200, h: 76 },
  proxy: { x: 428, y: 216, w: 88, h: 48 },
  wall: { x: 467, y: 24, w: 10, h: 296 },
  udpGap: { x: 462, y: 84, w: 20, h: 32 },
  tcpGap: { x: 462, y: 224, w: 20, h: 32 },
  udp: [
    [210, 100],
    [980, 100],
  ],
  udpProbe: [
    [210, 100],
    [462, 100],
  ],
  tcp: [
    [210, 240],
    [980, 240],
  ],
  cross: [472, 100],
  labels: { udp: [560, 88], tcp: [250, 228], hop: [866, 228], wall: [472, 14] },
};

const NARROW: Layout = {
  w: 360,
  h: 520,
  small: true,
  daemon: { x: 0, y: 0, w: 360, h: 64 },
  peer: { x: 0, y: 456, w: 360, h: 64 },
  backbone: { x: 196, y: 282, w: 148, h: 64 },
  proxy: { x: 232, y: 150, w: 76, h: 46 },
  wall: { x: 10, y: 168, w: 340, h: 10 },
  udpGap: { x: 74, y: 163, w: 32, h: 20 },
  tcpGap: { x: 254, y: 163, w: 32, h: 20 },
  udp: [
    [90, 64],
    [90, 456],
  ],
  udpProbe: [
    [90, 64],
    [90, 163],
  ],
  tcp: [
    [270, 64],
    [270, 456],
  ],
  cross: [90, 173],
  labels: { udp: [102, 236], tcp: [282, 116], hop: [282, 392], wall: [104, 158] },
};

const SCENARIOS = [
  {
    key: "open",
    title: "Open egress",
    eg: "Home wifi, most cloud VMs, default Docker",
    mode: "udp" as const,
    result: "UDP mode",
    body: "The beacon answers over UDP. The daemon binds a public UDP socket and peers reach it directly or via beacon hole-punch. Lowest latency; needs outbound UDP/4000.",
  },
  {
    key: "tcp",
    title: "TCP/443 only",
    eg: "Hotel, airport, locked corporate wifi",
    mode: "compat" as const,
    result: "Compat mode",
    body: "The UDP probe never gets out, so everything moves to long-lived TCP/443: WebSocket Secure to the beacon for data, TLS to the registry for control. Traffic relays through the beacon.",
  },
  {
    key: "proxy",
    title: "HTTP proxy only",
    eg: "Replit Agent, Devin, corporate proxies",
    mode: "proxy" as const,
    result: "Compat through HTTPS_PROXY",
    body: "Since v1.13.11 compat goes through HTTPS_PROXY. The daemon asks the proxy to CONNECT by hostname, so local DNS doesn’t matter, and TLS stays end to end.",
  },
] as const;

const DURATIONS = [4200, 4800, 4800] as const;

const STROKE = "stroke-fg/24";

function Rect({ b, lit, dashed }: { b: Box; lit?: boolean; dashed?: boolean }) {
  if (SKY) return <SkyNode b={b} lit={lit} />;
  return (
    <rect
      x={b.x + 0.5}
      y={b.y + 0.5}
      width={b.w - 1}
      height={b.h - 1}
      rx={2}
      strokeDasharray={dashed ? "3 4" : undefined}
      className={`fill-card transition-[stroke] duration-500 ${lit ? "stroke-lime-ink" : "stroke-fg/16"}`}
    />
  );
}

function Diagram({ L, step, run }: { L: Layout; step: number; run: number }) {
  const s = SCENARIOS[step];
  const udpOpen = s.key === "open";
  const viaProxy = s.key === "proxy";
  const udp = poly(L.udp);
  const probe = poly(udpOpen ? L.udp : L.udpProbe);
  const tcp = poly(L.tcp);
  const t = L.small ? "text-[10.5px]" : "text-[11.5px]";
  const cx = (b: Box) => b.x + b.w / 2;

  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="h-auto w-full overflow-visible" aria-hidden>
      {/* Lanes */}
      {SKY ? (
        <>
          <path d={udp.d} strokeWidth={1.5} className={`transition-[stroke] duration-500 ${udpOpen ? "stroke-(--sky-fill)/45" : "stroke-fg/10"}`} />
          <path d={tcp.d} strokeWidth={1.5} className={`transition-[stroke] duration-500 ${udpOpen ? "stroke-fg/10" : "stroke-(--sky-fill)/45"}`} />
        </>
      ) : (
        <>
          <path
            d={udp.d}
            className={`transition-[stroke,opacity] duration-500 ${udpOpen ? "stroke-fg/36" : STROKE}`}
            strokeDasharray={udpOpen ? undefined : "3 4"}
          />
          <path d={tcp.d} className={`transition-[stroke] duration-500 ${udpOpen ? STROKE : "stroke-fg/36"}`} strokeDasharray={udpOpen ? "3 4" : undefined} />
        </>
      )}

      {/* The network's edge, with a hole for each port it lets out. */}
      {SKY ? (
        <SkyWall
          wall={L.wall}
          ports={[
            { at: L.udpGap, state: udpOpen ? "open" : "closed" },
            { at: L.tcpGap, state: viaProxy ? "closed" : "open" },
          ]}
        />
      ) : (
        <>
          <rect x={L.wall.x} y={L.wall.y} width={L.wall.w} height={L.wall.h} className="fill-graphite" />
          {udpOpen && <rect x={L.udpGap.x} y={L.udpGap.y} width={L.udpGap.w} height={L.udpGap.h} className="fill-bg" />}
          {!viaProxy && <rect x={L.tcpGap.x} y={L.tcpGap.y} width={L.tcpGap.w} height={L.tcpGap.h} className="fill-bg" />}
        </>
      )}
      <text
        x={L.labels.wall[0]}
        y={L.labels.wall[1]}
        textAnchor={L.small ? "start" : "middle"}
        className={SKY ? `fill-mute font-sans ${L.small ? "text-[11.5px]" : "text-[12.5px]"}` : `fill-dim font-mono ${t}`}
      >
        {SKY ? "Your network’s egress" : "your network’s egress"}
      </text>

      {/* Packets */}
      <g key={`${step}-${run}`}>
        {SKY ? (
          <>
            <SkyRide d={probe.d} dur={udpOpen ? 1300 : 700} delay={200} className="stroke-fg" />
            {udpOpen
              ? [0, 1, 2].map((i) => <SkyRide key={i} d={udp.d} dur={1300} delay={1500 + i * 600} />)
              : [0, 1, 2].map((i) => <SkyRide key={i} d={tcp.d} dur={1900} delay={1300 + i * 750} />)}
          </>
        ) : (
          <>
            <PathPacket d={probe.d} len={probe.len} dur={udpOpen ? 1300 : 700} delay={200} className="stroke-fg" />
            {udpOpen
              ? [0, 1, 2].map((i) => <PathPacket key={i} d={udp.d} len={udp.len} dur={1300} delay={1500 + i * 600} />)
              : [0, 1, 2].map((i) => <PathPacket key={i} d={tcp.d} len={tcp.len} dur={1900} delay={1300 + i * 750} />)}
          </>
        )}
      </g>
      {!udpOpen && (
        <g key={`x-${step}-${run}`} className="animate-[kit-pop_300ms_var(--ease-out)_900ms_both]">
          <path
            d={`M${L.cross[0] - 7} ${L.cross[1] - 7} l14 14 M${L.cross[0] + 7} ${L.cross[1] - 7} l-14 14`}
            className="stroke-fg"
            strokeWidth={SKY ? 1.8 : 1.6}
            strokeLinecap={SKY ? "round" : undefined}
          />
        </g>
      )}

      {/* Labels on the lanes */}
      <text x={L.labels.udp[0]} y={L.labels.udp[1]} className={`font-mono ${t} ${udpOpen ? "fill-fg" : "fill-faint"}`}>
        UDP/4000 · direct path
      </text>
      <text x={L.labels.tcp[0]} y={L.labels.tcp[1]} className={`font-mono ${t} ${udpOpen ? "fill-faint" : "fill-fg"}`}>
        TCP/443
      </text>
      <text x={L.labels.hop[0]} y={L.labels.hop[1]} className={`${SKY ? "font-sans" : "font-mono"} ${t} ${udpOpen ? "fill-faint" : "fill-dim"}`}>
        +1 hop
      </text>

      {/* Boxes */}
      <Rect b={L.backbone} lit={!udpOpen} />
      <text x={cx(L.backbone)} y={L.backbone.y + L.backbone.h / 2 - 4} textAnchor="middle" className="fill-fg font-sans text-[13.5px] font-medium">
        Beacon + registry
      </text>
      <text x={cx(L.backbone)} y={L.backbone.y + L.backbone.h / 2 + 14} textAnchor="middle" className={`fill-dim font-mono ${t}`}>
        WSS · TLS on 443
      </text>

      {viaProxy && (
        <g key={`p-${run}`} className="animate-[kit-pop_400ms_var(--ease-out)_both]">
          <Rect b={L.proxy} lit />
          <text x={cx(L.proxy)} y={L.proxy.y + L.proxy.h / 2 + 4} textAnchor="middle" className={`fill-lime-ink font-mono ${t}`}>
            HTTPS_PROXY
          </text>
        </g>
      )}

      <Rect b={L.daemon} lit={!SKY} />
      <Rect b={L.peer} lit={!SKY} />
      {L.small ? (
        <>
          <text x={16} y={28} className="fill-fg font-sans text-[14px] font-medium">
            pilot-daemon
          </text>
          <text x={16} y={47} className={`fill-dim font-mono ${t}`}>
            transport: auto
          </text>
          <text x={344} y={38} textAnchor="end" className={`font-mono ${t} ${udpOpen ? "fill-lime-ink" : "fill-fg"}`}>
            → {udpOpen ? "udp" : "compat"}
          </text>
          <text x={16} y={L.peer.y + 28} className="fill-fg font-sans text-[14px] font-medium">
            Peer
          </text>
          <text x={16} y={L.peer.y + 47} className={`fill-dim ${SKY ? "font-sans text-[12px]" : `font-mono ${t}`}`}>
            {SKY ? "Same overlay, same Ed25519 trust" : "same overlay · same Ed25519 trust"}
          </text>
        </>
      ) : (
        <>
          <text x={20} y={150} className="fill-fg font-sans text-[16px] font-medium">
            pilot-daemon
          </text>
          <text x={20} y={172} className={`fill-dim font-mono ${t}`}>
            transport: auto
          </text>
          <text x={20} y={206} className={`font-mono text-[13px] ${udpOpen ? "fill-lime-ink" : "fill-fg"}`}>
            → {udpOpen ? "udp" : "compat"}
          </text>
          <text x={1000} y={150} className="fill-fg font-sans text-[16px] font-medium">
            Peer
          </text>
          <text x={1000} y={172} className={`fill-dim ${SKY ? "font-sans text-[13px]" : `font-mono ${t}`}`}>
            {SKY ? "Same overlay" : "same overlay"}
          </text>
          <text x={1000} y={SKY ? 190 : 188} className={`fill-dim ${SKY ? "font-sans text-[13px]" : `font-mono ${t}`}`}>
            {SKY ? "Same Ed25519 trust" : "same Ed25519 trust"}
          </text>
        </>
      )}
    </svg>
  );
}

/**
 * Sky site (Figma 233:1195): the section's heading and the three networks as segmented tabs on a hatch panel, the
 * diagram on the hatching under them, and what auto mode picks on the chosen network beneath it. The tabs step on
 * their own while the panel is on screen, as the cards did.
 */
function SkyTransport({ head }: { head?: ReactNode }) {
  const { ref, step, run, go } = useStepper<HTMLDivElement>(SCENARIOS.length, DURATIONS);
  const s = SCENARIOS[step];
  return (
    <div ref={ref}>
      <HatchPanel className="cpx-bleed px-4 py-12 sm:px-10 sm:py-16 lg:px-[72px] lg:py-[88px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          {head}
          <Segmented
            items={SCENARIOS.map((x) => ({ id: x.key, label: x.title }))}
            value={s.key}
            onChange={(id) => go(SCENARIOS.findIndex((x) => x.key === id))}
            label="Kind of network"
            layoutId="cpx-network"
            panelId="cpx-network-panel"
            className="cpx-seg-tight shrink-0 self-start lg:self-auto"
          />
        </div>
        <div id="cpx-network-panel" role="tabpanel" aria-label={s.title} className="mt-12 sm:mt-16">
          <ModesStage net={s.key} run={run} />
          <div key={s.key} className="mt-10 grid animate-[kit-pop_350ms_var(--ease-out)_both] grid-cols-1 gap-3 sm:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
            <div className="flex flex-col items-start gap-2.5">
              {/* On the hatching: the tint laid over the paper, so the lines don't show through it. */}
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-[13px] leading-4 font-medium text-(--sky-accent) ring-1 ring-(--sky-fill)/25 ring-inset">
                <ModeGlyph mode={s.mode} />
                {s.result}
              </span>
              <span className="text-[13.5px] leading-5 text-mute">{s.eg}</span>
            </div>
            <p className="max-w-[620px] text-[15px] leading-[1.6] text-pretty text-mute">{s.body}</p>
          </div>
        </div>
      </HatchPanel>
    </div>
  );
}

/** `head` (sky site only) is the section's heading, set inside the panel next to the tabs. */
export function Transport({ head }: { head?: ReactNode }) {
  return SKY ? <SkyTransport head={head} /> : <GreenTransport />;
}

function GreenTransport() {
  const { ref, step, run, manual, go } = useStepper<HTMLDivElement>(SCENARIOS.length, DURATIONS);
  return (
    <div ref={ref}>
      <div className="hidden lg:block">
        <Diagram L={WIDE} step={step} run={run} />
      </div>
      <div className="mx-auto max-w-[360px] md:max-w-[460px] lg:hidden">
        <Diagram L={NARROW} step={step} run={run} />
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-3">
        {SCENARIOS.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.key} className="bg-bg">
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={on}
                className="relative flex h-full w-full flex-col items-start p-5 text-left transition-colors duration-300 hover:bg-fg/[0.02] sm:p-6"
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                  {on && (
                    <span
                      key={run}
                      className="kit-motion absolute inset-0 origin-left bg-lime"
                      style={{ animation: `kit-fill ${DURATIONS[i] * (manual ? 2.2 : 1)}ms linear both` }}
                    />
                  )}
                </span>
                <span className="font-mono text-[12px] text-dim">{s.eg}</span>
                <span className={`mt-3 text-[18px] font-medium tracking-[-0.015em] ${on ? "text-fg" : "text-soft"}`}>{s.title}</span>
                <span className="mt-3 flex items-center gap-2 font-mono text-[12.5px] text-fg">
                  <ModeGlyph mode={s.mode} />
                  {s.result}
                </span>
                <span className={`mt-3 text-[14px] leading-[1.55] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
                  {s.body}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ModeSpecs() {
  const rows: [string, ReactNode, ReactNode][] = [
    ["Flag", <Code key="a">-transport=udp</Code>, <Code key="b">-transport=compat</Code>],
    ["Status", "Default", "Since v1.10.3"],
    ["Path", "Direct, RTT-bound", "+1 hop via the beacon"],
    ["Ports", "Outbound UDP/4000 (inbound too for a public node)", "One outbound TCP/443"],
    ["Proxy", "—", <span key="p">Through <Code>HTTPS_PROXY</Code> since v1.13.11</span>],
    ["Trust", "Same overlay, same Ed25519 trust", "Same overlay, same Ed25519 trust"],
  ];
  if (SKY) return <SkyModeSpecs rows={rows} />;
  const head = (mode: "udp" | "compat") => (
    <span className="flex items-center gap-2 font-mono text-[12px] text-fg">
      <ModeGlyph mode={mode} /> {mode === "udp" ? "UDP mode" : "Compat mode"}
    </span>
  );
  return (
    <>
      {/* Narrow: one card per mode. */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {(["udp", "compat"] as const).map((m, col) => (
          <dl key={m} className="overflow-hidden rounded-[16px] border border-edge">
            <div className="border-b border-edge-2 p-4">{head(m)}</div>
            {rows.map(([k, a, b]) => (
              <div key={k} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-edge p-4 text-[14px] leading-[1.5] last:border-b-0">
                <dt className="font-mono text-[12px] text-dim">{k}</dt>
                <dd className="text-soft">{col === 0 ? a : b}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      {/* Wide: side by side. */}
      <div className="hidden overflow-hidden rounded-[16px] border border-edge md:block">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,4fr)] border-b border-edge-2">
          <span className="p-4 sm:px-5" />
          <span className="border-l border-edge p-4 sm:px-5">{head("udp")}</span>
          <span className="border-l border-edge p-4 sm:px-5">{head("compat")}</span>
        </div>
        {rows.map(([k, a, b]) => (
          <div
            key={k}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,4fr)] border-b border-edge text-[14px] leading-[1.5] last:border-b-0"
          >
            <span className="p-4 font-mono text-[12px] text-dim sm:px-5">{k}</span>
            <span className="border-l border-edge p-4 text-soft sm:px-5">{a}</span>
            <span className="border-l border-edge p-4 text-soft sm:px-5">{b}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/** Sky site: a mode's route in miniature, your laptop to the peer: straight across, or by way of the beacon. */
function Route({ hop }: { hop: boolean }) {
  const wire = "h-[1.5px] min-w-4 flex-1 rounded-full bg-(--sky-fill)/45";
  return (
    <div aria-hidden className="flex max-w-[280px] items-center gap-1.5">
      <Tile icon="laptop" size="sm" />
      <span className={wire} />
      {hop && (
        <>
          <Tile icon="antenna" size="sm" accent />
          <span className={wire} />
        </>
      )}
      <Tile icon="server" size="sm" />
    </div>
  );
}

/** Sky site: the two modes side by side on one flat card, each headed by its route, labels in sentence case. */
function SkyModeSpecs({ rows }: { rows: [string, ReactNode, ReactNode][] }) {
  const head = (mode: "udp" | "compat") => (
    <div className="flex flex-col gap-4">
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.01em] text-fg">
          <ModeGlyph mode={mode} /> {mode === "udp" ? "UDP mode" : "Compat mode"}
        </span>
        <span className="text-[12.5px] text-mute">{mode === "udp" ? "Direct" : "+1 hop"}</span>
      </span>
      <Route hop={mode === "compat"} />
    </div>
  );
  return (
    <>
      {/* Narrow: one card per mode. */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {(["udp", "compat"] as const).map((m, col) => (
          <dl key={m} className={`overflow-hidden ${FLAT_CARD}`}>
            <div className="border-b border-edge px-5 py-4">{head(m)}</div>
            {rows.map(([k, a, b]) => (
              <div key={k} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-edge px-5 py-3.5 text-[14px] leading-[1.5] last:border-b-0">
                <dt className="text-[13px] leading-[1.6] text-mute">{k}</dt>
                <dd className="text-soft">{col === 0 ? a : b}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      {/* Wide: side by side. */}
      <div className={`hidden overflow-hidden md:block ${FLAT_CARD}`}>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,4fr)] border-b border-edge">
          <span className="px-6 py-5" />
          <span className="px-6 py-5 lg:pr-16">{head("udp")}</span>
          <span className="px-6 py-5 lg:pr-16">{head("compat")}</span>
        </div>
        {rows.map(([k, a, b]) => (
          <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,4fr)] border-b border-edge text-[14.5px] leading-[1.5] last:border-b-0">
            <span className="px-6 py-4 text-[13.5px] text-mute">{k}</span>
            <span className="px-6 py-4 text-soft">{a}</span>
            <span className="px-6 py-4 text-soft">{b}</span>
          </div>
        ))}
      </div>
    </>
  );
}
