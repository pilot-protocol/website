"use client";

import { PathPacket, poly, SKY, useStepper } from "@/components/pages/security/kit";
import { SniStage } from "@/components/pages/compatibility/sni-sky";
import { SkyNode, SkyRide } from "@/components/pages/compatibility/sky";

/*
 * Single-port 443: a compat daemon opens one TLS connection to :443; nginx
 * pre-reads the SNI in the ClientHello and sends registry traffic to a TLS
 * terminator in front of the registry, beacon traffic to the WSS vhost.
 */

type Box = { x: number; y: number; w: number; h: number; title: string; sub: string };
type Pt = [number, number];

type Layout = {
  w: number;
  h: number;
  small: boolean;
  boxes: { daemon: Box; nginx: Box; term: Box; registry: Box; wss: Box; beacon: Box };
  toRegistry: Pt[];
  toBeacon: Pt[];
  hostLabels?: { registry: Pt; beacon: Pt };
  sni: Pt;
};

const WIDE: Layout = {
  w: 1160,
  h: 290,
  small: false,
  boxes: {
    daemon: { x: 0, y: 105, w: 200, h: 80, title: "compat daemon", sub: "outbound: TCP/443 only" },
    nginx: { x: 320, y: 75, w: 280, h: 140, title: "nginx :443", sub: "pre-reads the ClientHello SNI" },
    term: { x: 690, y: 20, w: 190, h: 70, title: "TLS terminator", sub: "plain bytes onward" },
    registry: { x: 970, y: 20, w: 190, h: 70, title: "Registry", sub: "control" },
    wss: { x: 690, y: 200, w: 190, h: 70, title: "WSS vhost", sub: "WebSocket Secure" },
    beacon: { x: 970, y: 200, w: 190, h: 70, title: "Beacon", sub: "data plane" },
  },
  toRegistry: [
    [200, 145],
    [600, 145],
    [645, 145],
    [645, 55],
    [1160, 55],
  ],
  toBeacon: [
    [200, 145],
    [600, 145],
    [645, 145],
    [645, 235],
    [1160, 235],
  ],
  hostLabels: { registry: [690, 116], beacon: [690, 186] },
  sni: [445, 186],
};

const NARROW: Layout = {
  w: 360,
  h: 520,
  small: true,
  boxes: {
    daemon: { x: 0, y: 0, w: 360, h: 60, title: "compat daemon", sub: "outbound: TCP/443 only" },
    nginx: { x: 0, y: 100, w: 360, h: 96, title: "nginx :443", sub: "pre-reads the ClientHello SNI" },
    term: { x: 0, y: 250, w: 170, h: 64, title: "TLS terminator", sub: "plain bytes onward" },
    registry: { x: 0, y: 380, w: 170, h: 64, title: "Registry", sub: "control" },
    wss: { x: 190, y: 250, w: 170, h: 64, title: "WSS vhost", sub: "WebSocket Secure" },
    beacon: { x: 190, y: 380, w: 170, h: 64, title: "Beacon", sub: "data plane" },
  },
  toRegistry: [
    [180, 60],
    [180, 196],
    [180, 222],
    [85, 222],
    [85, 444],
  ],
  toBeacon: [
    [180, 60],
    [180, 196],
    [180, 222],
    [275, 222],
    [275, 444],
  ],
  sni: [16, 176],
};

const HOSTS = ["registry.pilotprotocol.network", "beacon.pilotprotocol.network"] as const;
const DURATIONS = [2600, 2600] as const;

function Node({ b, lit, small }: { b: Box; lit: boolean; small: boolean }) {
  if (SKY) {
    // Sentence case, except names that are written lowercase (nginx).
    const cap = (x: string) => (x.startsWith("nginx") ? x : x.charAt(0).toUpperCase() + x.slice(1));
    return (
      <g>
        <SkyNode b={b} lit={lit} />
        <text x={b.x + (small ? 14 : 18)} y={b.y + (small ? 27 : 31)} className={`fill-fg font-sans font-medium ${small ? "text-[13.5px]" : "text-[15px]"}`}>
          {cap(b.title)}
        </text>
        <text x={b.x + (small ? 14 : 18)} y={b.y + (small ? 45 : 51)} className={`fill-mute font-sans ${small ? "text-[11.5px]" : "text-[12.5px]"}`}>
          {cap(b.sub)}
        </text>
      </g>
    );
  }
  return (
    <g>
      <rect
        x={b.x + 0.5}
        y={b.y + 0.5}
        width={b.w - 1}
        height={b.h - 1}
        rx={2}
        className={`fill-card transition-[stroke] duration-500 ${lit ? "stroke-lime-ink" : "stroke-fg/16"}`}
      />
      <text x={b.x + (small ? 12 : 16)} y={b.y + (small ? 26 : 30)} className={`fill-fg font-sans font-medium ${small ? "text-[13.5px]" : "text-[15px]"}`}>
        {b.title}
      </text>
      <text x={b.x + (small ? 12 : 16)} y={b.y + (small ? 44 : 50)} className={`fill-dim font-mono ${small ? "text-[10.5px]" : "text-[11.5px]"}`}>
        {b.sub}
      </text>
    </g>
  );
}

function Diagram({ L, step, run }: { L: Layout; step: number; run: number }) {
  const reg = poly(L.toRegistry);
  const bea = poly(L.toBeacon);
  const toReg = step === 0;
  const B = L.boxes;
  const t = L.small ? "text-[10.5px]" : "text-[11.5px]";
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="h-auto w-full overflow-visible" aria-hidden>
      {SKY ? (
        <>
          <path d={reg.d} fill="none" strokeWidth={1.5} strokeLinejoin="round" className={`transition-[stroke] duration-500 ${toReg ? "stroke-(--sky-fill)/45" : "stroke-fg/10"}`} />
          <path d={bea.d} fill="none" strokeWidth={1.5} strokeLinejoin="round" className={`transition-[stroke] duration-500 ${toReg ? "stroke-fg/10" : "stroke-(--sky-fill)/45"}`} />
        </>
      ) : (
        <>
          <path d={reg.d} fill="none" className={`transition-[stroke] duration-500 ${toReg ? "stroke-fg/40" : "stroke-fg/18"}`} />
          <path d={bea.d} fill="none" className={`transition-[stroke] duration-500 ${toReg ? "stroke-fg/18" : "stroke-fg/40"}`} />
        </>
      )}
      <g key={`${step}-${run}`}>
        {[0, 1].map((i) =>
          SKY ? (
            <SkyRide key={i} d={(toReg ? reg : bea).d} dur={2000} delay={100 + i * 700} />
          ) : (
            <PathPacket key={i} d={(toReg ? reg : bea).d} len={(toReg ? reg : bea).len} dur={2000} delay={100 + i * 700} />
          ),
        )}
      </g>
      <Node b={B.daemon} lit={!SKY} small={L.small} />
      <Node b={B.nginx} lit={!SKY} small={L.small} />
      <Node b={B.term} lit={toReg} small={L.small} />
      <Node b={B.registry} lit={toReg} small={L.small} />
      <Node b={B.wss} lit={!toReg} small={L.small} />
      <Node b={B.beacon} lit={!toReg} small={L.small} />
      {/* What nginx reads before it routes. */}
      <g key={`sni-${step}-${run}`} className="animate-[kit-pop_400ms_var(--ease-out)_both]">
        <text x={L.small ? L.sni[0] : L.sni[0] - 109} y={L.sni[1]} className={`fill-dim font-mono ${t}`}>
          SNI <tspan className={SKY ? "fill-(--sky-accent)" : "fill-lime-ink"}>{HOSTS[step]}</tspan>
        </text>
      </g>
      {L.hostLabels && (
        <>
          <text x={L.hostLabels.registry[0]} y={L.hostLabels.registry[1]} className={`font-mono ${t} ${toReg ? "fill-fg" : "fill-faint"}`}>
            {HOSTS[0]}
          </text>
          <text x={L.hostLabels.beacon[0]} y={L.hostLabels.beacon[1]} className={`font-mono ${t} ${toReg ? "fill-faint" : "fill-fg"}`}>
            {HOSTS[1]}
          </text>
        </>
      )}
    </svg>
  );
}

export function SingleSocket() {
  const { ref, step, run } = useStepper<HTMLDivElement>(2, DURATIONS);
  if (SKY)
    return (
      <div ref={ref}>
        <SniStage step={step} run={run} />
      </div>
    );
  return (
    <div ref={ref}>
      <div className="hidden lg:block">
        <Diagram L={WIDE} step={step} run={run} />
      </div>
      <div className="mx-auto max-w-[360px] md:max-w-[460px] lg:hidden">
        <Diagram L={NARROW} step={step} run={run} />
      </div>
    </div>
  );
}
