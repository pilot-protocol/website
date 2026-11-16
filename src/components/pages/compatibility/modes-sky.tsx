"use client";

import type { CSSProperties, ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { ModeGlyph } from "@/components/pages/compatibility/mode-glyph";
import { LineIcon, Tile } from "@/components/pages/compatibility/marks";
import { Beam } from "@/components/sky/beam";

/*
 * Sky site: auto mode as a picture. Your laptop's daemon on the left, your network's edge in the middle with its two
 * ports (UDP/4000 and TCP/443), the beacon on the backbone, and the peer on the right. The probe either gets through
 * the UDP port (a direct path) or stops at it, and then everything goes out on 443 (through the proxy, when that's
 * the only door), via the beacon: one extra hop. Nodes are HTML on a fixed-ratio stage, lanes and packets are SVG.
 */

export type NetKey = "open" | "tcp" | "proxy";

type Pt = [number, number];
type Stage = {
  w: number;
  h: number;
  vertical: boolean;
  daemon: Pt;
  peer: Pt;
  beacon: Pt;
  wall: { from: Pt; to: Pt };
  udpPort: Pt;
  tcpPort: Pt;
  net: Pt;
  udp: Pt[];
  tcp: Pt[];
  direct: Pt;
  hop: Pt;
};

const WIDE: Stage = {
  w: 1000,
  h: 300,
  vertical: false,
  daemon: [100, 150],
  peer: [900, 150],
  beacon: [660, 196],
  wall: { from: [420, 30], to: [420, 270] },
  udpPort: [420, 104],
  tcpPort: [420, 196],
  net: [420, 150],
  udp: [
    [100, 104],
    [900, 104],
  ],
  tcp: [
    [100, 196],
    [900, 196],
  ],
  direct: [660, 104],
  hop: [660, 258],
};

const NARROW: Stage = {
  w: 360,
  h: 540,
  vertical: true,
  daemon: [180, 40],
  peer: [180, 500],
  beacon: [262, 330],
  wall: { from: [8, 172], to: [352, 172] },
  udpPort: [86, 172],
  tcpPort: [262, 172],
  net: [174, 140],
  udp: [
    [86, 40],
    [86, 500],
  ],
  tcp: [
    [262, 40],
    [262, 500],
  ],
  direct: [86, 330],
  hop: [262, 396],
};

const d = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

/** A node, centred on its point on the stage. */
function At({ p, s, children, className = "", style }: { p: Pt; s: Stage; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ left: `${(p[0] / s.w) * 100}%`, top: `${(p[1] / s.h) * 100}%`, ...style }}
    >
      {children}
    </div>
  );
}

/** A port in the network's edge: open (sky), or blocked (a cross that lands when the probe arrives). */
function Port({ label, state, run }: { label: string; state: "lit" | "open" | "blocked"; run: number }) {
  return (
    <span
      data-state={state}
      className="flex h-8 items-center gap-1.5 rounded-full bg-card pr-3 pl-1.5 font-mono text-[12px] whitespace-nowrap text-mute ring-1 ring-(--sky-card-line) transition-[color,box-shadow] duration-500 ring-inset data-[state=lit]:text-(--sky-accent) data-[state=lit]:ring-(--sky-fill)/45"
    >
      <span
        className={`grid size-5 place-items-center rounded-full transition-colors duration-500 ${
          state === "lit" ? "bg-(--sky-fill) text-white" : state === "blocked" ? "bg-fg/[0.07] text-fg" : "bg-fg/[0.06] text-mute"
        }`}
      >
        {state === "blocked" ? (
          <XIcon key={run} className="size-2.5" />
        ) : (
          <CheckIcon className="size-2.5" />
        )}
      </span>
      {label}
    </span>
  );
}

function Name({ children, sub, mono = false }: { children: ReactNode; sub: ReactNode; mono?: boolean }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className={`text-[14.5px] leading-5 whitespace-nowrap text-fg ${mono ? "font-mono text-[14px]" : "font-medium tracking-[-0.01em]"}`}>{children}</span>
      <span className="text-[12.5px] leading-[18px] whitespace-nowrap text-mute">{sub}</span>
    </span>
  );
}

/** Pilot's P on the corner of a device: this machine runs a Pilot node. */
function PilotBadge() {
  return (
    <span className="absolute -right-1.5 -bottom-1.5 grid size-[18px] place-items-center rounded-[6px] bg-(--sky-fill) text-white ring-2 ring-(--color-card)">
      <svg viewBox="0 0 10 12" className="h-[9px] w-auto" fill="currentColor" aria-hidden>
        <path d="M0 0h5.4a3.6 3.6 0 0 1 0 7.2H2.6V12H0V0Zm2.6 2.3v2.6h2.7a1.3 1.3 0 0 0 0-2.6H2.6Z" />
      </svg>
    </span>
  );
}

function Stage({ s, net, run }: { s: Stage; net: NetKey; run: number }) {
  const open = net === "open";
  const proxy = net === "proxy";
  const probeTo: Pt[] = open ? s.udp : [s.udp[0], s.vertical ? [s.udpPort[0], s.udpPort[1] - 18] : [s.udpPort[0] - 46, s.udpPort[1]]];
  const lane = (lit: boolean) => `transition-[stroke] duration-500 ${lit ? "stroke-(--sky-fill)/50" : "stroke-fg/[0.09]"}`;
  const v = s.vertical;

  return (
    <div aria-hidden className="relative w-full" style={{ aspectRatio: `${s.w} / ${s.h}` }}>
      <svg viewBox={`0 0 ${s.w} ${s.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* The network's edge: a soft slab, the ports sit in it. */}
        <line
          x1={s.wall.from[0]}
          y1={s.wall.from[1]}
          x2={s.wall.to[0]}
          y2={s.wall.to[1]}
          strokeWidth={10}
          strokeLinecap="round"
          className="stroke-(--sky-accent)/[0.13]"
        />
        <path d={d(s.udp)} fill="none" strokeWidth={1.5} className={lane(open)} />
        <path d={d(s.tcp)} fill="none" strokeWidth={1.5} className={lane(!open)} />
        {/* The probe (grey), then the traffic (sky) on whichever lane got out. */}
        <g key={net}>
          <Beam d={d(probeTo)} run={run} duration={open ? 1300 : 760} delay={200} color="var(--color-mute)" tail={v ? 40 : 70} />
          {[0, 1, 2].map((i) => (
            <Beam
              key={i}
              d={d(open ? s.udp : s.tcp)}
              run={run}
              duration={open ? 1400 : 2000}
              delay={(open ? 1500 : 1250) + i * (open ? 600 : 750)}
              tail={v ? 60 : 110}
            />
          ))}
        </g>
      </svg>

      {/* Lane names */}
      <At p={s.direct} s={s} className={v ? "translate-x-[14px]! -translate-y-1/2" : "-translate-y-[calc(100%+10px)]!"}>
        <span className={`block text-[12.5px] whitespace-nowrap transition-colors duration-500 ${open ? "text-(--sky-accent)" : "text-faint"}`}>
          Direct path
        </span>
      </At>
      <At p={s.hop} s={s} className={v ? "translate-x-[14px]! -translate-y-1/2" : ""}>
        <span className={`block text-[12.5px] whitespace-nowrap transition-colors duration-500 ${open ? "text-faint" : "text-(--sky-accent)"}`}>
          +1 hop
        </span>
      </At>

      {/* Your network, between its two ports */}
      <At p={s.net} s={s}>
        <span className="flex items-center gap-2 rounded-full bg-bg px-2.5 py-1 text-[12.5px] whitespace-nowrap text-mute">
          <LineIcon name="firewall" className="size-[15px]" />
          Your network
        </span>
      </At>
      <At p={s.udpPort} s={s}>
        <Port label="UDP 4000" state={open ? "lit" : "blocked"} run={run} />
      </At>
      <At p={s.tcpPort} s={s}>
        {proxy ? (
          <span key={`p${run}`} className="flex animate-[kit-pop_400ms_var(--ease-out)_both] items-center gap-2 rounded-[12px] bg-card py-1.5 pr-3 pl-1.5 ring-1 ring-(--sky-fill)/45 ring-inset">
            <Tile icon="proxy" size="sm" accent />
            <span className="font-mono text-[12px] whitespace-nowrap text-(--sky-accent)">HTTPS_PROXY</span>
          </span>
        ) : (
          <Port label="TCP 443" state={open ? "open" : "lit"} run={run} />
        )}
      </At>

      {/* The beacon, on the backbone */}
      <At p={s.beacon} s={s}>
        <span
          data-lit={!open}
          className="sky-card flex items-center gap-3 rounded-[14px]! p-2.5 pr-4 transition-[box-shadow] duration-500 data-[lit=true]:shadow-[0_0_0_1px_var(--sky-fill)]"
        >
          <Tile icon="antenna" accent />
          <Name sub={<span className="font-mono text-[11.5px]">WSS · TLS on 443</span>}>Beacon + registry</Name>
        </span>
      </At>

      {/* The two ends */}
      <At p={s.daemon} s={s} className={v ? "w-full" : ""}>
        <div className={`sky-card rounded-[16px]! ${v ? "flex items-center gap-3.5 p-3 pr-4" : "flex w-[184px] flex-col items-start p-4"}`}>
          <Tile icon="laptop" size="lg">
            <PilotBadge />
          </Tile>
          <div className={`flex min-w-0 ${v ? "flex-1 items-center justify-between gap-3" : "mt-4 w-full flex-col gap-3"}`}>
            <Name mono sub="transport: auto">
              pilot-daemon
            </Name>
            <span
              key={open ? "u" : "c"}
              className="inline-flex h-7 w-fit animate-[kit-pop_350ms_var(--ease-out)_both] items-center gap-2 rounded-full bg-(--sky-tint) px-2.5 text-[12.5px] font-medium whitespace-nowrap text-(--sky-accent)"
            >
              <ModeGlyph mode={open ? "udp" : proxy ? "proxy" : "compat"} />
              {open ? "UDP" : proxy ? "Compat + proxy" : "Compat"}
            </span>
          </div>
        </div>
      </At>
      <At p={s.peer} s={s} className={v ? "w-full" : ""}>
        <div className={`sky-card rounded-[16px]! ${v ? "flex items-center gap-3.5 p-3 pr-4" : "flex w-[184px] flex-col items-start p-4"}`}>
          <Tile icon="server" size="lg">
            <PilotBadge />
          </Tile>
          <div className={v ? "min-w-0 flex-1" : "mt-4"}>
            <Name
              sub={
                <span className="inline-flex items-center gap-1.5">
                  <LineIcon name="key" className="size-[13px]" />
                  Same Ed25519 trust
                </span>
              }
            >
              Peer
            </Name>
          </div>
        </div>
      </At>
    </div>
  );
}

/** The picture for one kind of network, wide (lg up) and stacked (below). */
export function ModesStage({ net, run }: { net: NetKey; run: number }) {
  return (
    <>
      <div className="hidden lg:block">
        <Stage s={WIDE} net={net} run={run} />
      </div>
      <div className="mx-auto max-w-[380px] md:max-w-[440px] lg:hidden">
        <Stage s={NARROW} net={net} run={run} />
      </div>
    </>
  );
}
