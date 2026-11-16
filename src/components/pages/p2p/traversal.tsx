"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { at, curve, NodeLabel, ObjTile, Stage, WIRE, type ObjName } from "@/components/pages/security/infra";
import { PathPacket, poly, SKY, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { BrandMark } from "@/components/v4/logos";
import "./p2p.css";

/*
 * Three tiers of NAT traversal, played out between two agents behind NATs
 * with the beacon above: STUN and a direct dial (full cone), a simultaneous
 * hole-punch (restricted cone), and the encrypted relay (symmetric).
 */

type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

type Layout = {
  w: number;
  h: number;
  small: boolean;
  beacon: Box;
  a: Box;
  b: Box;
  natA: Box;
  natB: Box;
  gapA: Box;
  gapB: Box;
  lane: Pt[];
  stunA: Pt[];
  stunB: Pt[];
  relay: Pt[];
  aMid: Pt[];
  bMid: Pt[];
  aToNatB: Pt[];
  bToNatA: Pt[];
  crossA: Pt;
  crossB: Pt;
  natLabelA: Pt;
  natLabelB: Pt;
  note: Pt;
};

const WIDE: Layout = {
  w: 1160,
  h: 390,
  small: false,
  beacon: { x: 480, y: 20, w: 200, h: 72 },
  a: { x: 0, y: 250, w: 170, h: 90 },
  b: { x: 990, y: 250, w: 170, h: 90 },
  natA: { x: 300, y: 150, w: 12, h: 230 },
  natB: { x: 848, y: 150, w: 12, h: 230 },
  gapA: { x: 296, y: 281, w: 20, h: 28 },
  gapB: { x: 844, y: 281, w: 20, h: 28 },
  lane: [
    [170, 295],
    [990, 295],
  ],
  stunA: [
    [170, 295],
    [370, 295],
    [370, 56],
    [480, 56],
  ],
  stunB: [
    [990, 295],
    [790, 295],
    [790, 56],
    [680, 56],
  ],
  relay: [
    [170, 295],
    [370, 295],
    [370, 56],
    [500, 56],
    [660, 56],
    [790, 56],
    [790, 295],
    [990, 295],
  ],
  aMid: [
    [170, 295],
    [580, 295],
  ],
  bMid: [
    [990, 295],
    [580, 295],
  ],
  aToNatB: [
    [170, 295],
    [848, 295],
  ],
  bToNatA: [
    [990, 295],
    [312, 295],
  ],
  crossA: [306, 295],
  crossB: [854, 295],
  natLabelA: [306, 138],
  natLabelB: [854, 138],
  note: [580, 214],
};

const NARROW: Layout = {
  w: 360,
  h: 600,
  small: true,
  a: { x: 30, y: 0, w: 200, h: 60 },
  b: { x: 30, y: 540, w: 200, h: 60 },
  beacon: { x: 220, y: 262, w: 140, h: 72 },
  natA: { x: 10, y: 126, w: 340, h: 12 },
  natB: { x: 10, y: 462, w: 340, h: 12 },
  gapA: { x: 116, y: 122, w: 28, h: 20 },
  gapB: { x: 116, y: 458, w: 28, h: 20 },
  lane: [
    [130, 60],
    [130, 540],
  ],
  stunA: [
    [130, 60],
    [130, 190],
    [290, 190],
    [290, 262],
  ],
  stunB: [
    [130, 540],
    [130, 410],
    [290, 410],
    [290, 334],
  ],
  relay: [
    [130, 60],
    [130, 190],
    [280, 190],
    [280, 300],
    [300, 300],
    [300, 410],
    [130, 410],
    [130, 540],
  ],
  aMid: [
    [130, 60],
    [130, 300],
  ],
  bMid: [
    [130, 540],
    [130, 300],
  ],
  aToNatB: [
    [130, 60],
    [130, 462],
  ],
  bToNatA: [
    [130, 540],
    [130, 138],
  ],
  crossA: [130, 132],
  crossB: [130, 468],
  natLabelA: [14, 116],
  natLabelB: [14, 452],
  note: [144, 248],
};

const TIERS = [
  {
    nat: "full cone",
    title: "Full-cone NAT",
    body: "STUN discovers your public endpoint. The peer dials it directly. No punch needed. Works across most consumer and cloud NAT.",
    note: "public endpoint known · peer dials it",
  },
  {
    nat: "restricted cone",
    title: "Restricted cone NAT",
    body: "The rendezvous coordinates a simultaneous hole-punch on both sides. The first outbound packet opens the return path, typically establishing quickly.",
    note: "both send at once · holes open",
  },
  {
    nat: "symmetric",
    title: "Symmetric NAT",
    body: "Hole-punching is impossible. Pilot falls back to an encrypted relay automatically. The relay forwards opaque packets; it cannot read your data.",
    note: "punch fails · relay carries opaque packets",
  },
] as const;

const DURATIONS = [5600, 6400, 6800] as const;

const appear = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

function Node({ b, title, sub, lit, small }: { b: Box; title: string; sub: string; lit?: boolean; small: boolean }) {
  return (
    <g>
      <rect
        x={b.x + 0.5}
        y={b.y + 0.5}
        width={b.w - 1}
        height={b.h - 1}
        rx={2}
        className={`fill-card transition-[stroke] duration-500 ${lit ? "stroke-lime-ink" : "stroke-fg/20"}`}
      />
      <text x={b.x + (small ? 14 : 16)} y={b.y + (small ? 26 : 34)} className={`fill-fg font-sans font-medium ${small ? "text-[13.5px]" : "text-[15px]"}`}>
        {title}
      </text>
      <text x={b.x + (small ? 14 : 16)} y={b.y + (small ? 44 : 54)} className={`fill-dim font-mono ${small ? "text-[10.5px]" : "text-[11.5px]"}`}>
        {sub}
      </text>
    </g>
  );
}

function Cross({ p, delay }: { p: Pt; delay: number }) {
  return (
    <path
      d={`M${p[0] - 8} ${p[1] - 8} l16 16 M${p[0] + 8} ${p[1] - 8} l-16 16`}
      strokeWidth={1.8}
      className="kit-motion p2p-appear stroke-fg"
      style={appear(delay)}
    />
  );
}

function Diagram({ L, tier, run }: { L: Layout; tier: number; run: number }) {
  const lane = poly(L.lane);
  const back = poly([...L.lane].reverse());
  const stunA = poly(L.stunA);
  const stunAback = poly([...L.stunA].reverse());
  const stunBback = poly([...L.stunB].reverse());
  const relay = poly(L.relay);
  const aMid = poly(L.aMid);
  const bMid = poly(L.bMid);
  const aNat = poly(L.aToNatB);
  const bNat = poly(L.bToNatA);
  const t = L.small ? "text-[10.5px]" : "text-[11.5px]";
  const gapAt = tier === 0 ? [2100, 2400] : tier === 1 ? [1500, 1500] : [350, 350];
  const noteAt = tier === 0 ? 1900 : 1300;

  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="h-auto w-full overflow-visible" aria-hidden>
      {/* Wiring: the path between the agents and each one's way up to the beacon. */}
      <>
          <path d={lane.d} fill="none" strokeDasharray="3 4" className="stroke-fg/20" />
          <path d={poly(L.stunA).d} fill="none" strokeDasharray="3 4" className="stroke-fg/14" />
          <path d={poly(L.stunB).d} fill="none" strokeDasharray="3 4" className="stroke-fg/14" />
      </>

      <g key={`${tier}-${run}`}>
        {/* A direct tunnel, once there is one. */}
        {tier < 2 && (
          <path
            d={lane.d}
            fill="none"
            strokeWidth={2}
            className="kit-motion p2p-appear stroke-lime-ink/50"
            style={appear(tier === 0 ? 2400 : 2350)}
          />
        )}

        {tier === 0 && (
          <>
            <PathPacket d={stunA.d} len={stunA.len} dur={900} delay={200} className="stroke-fg" />
            <PathPacket d={stunAback.d} len={stunAback.len} dur={900} delay={1150} className="stroke-fg" />
            {[0, 1, 2].map((i) => (
              <PathPacket key={i} d={back.d} len={back.len} dur={1500} delay={2400 + i * 500} />
            ))}
          </>
        )}
        {tier === 1 && (
          <>
            <PathPacket d={stunAback.d} len={stunAback.len} dur={900} delay={200} className="stroke-fg" />
            <PathPacket d={stunBback.d} len={stunBback.len} dur={900} delay={200} className="stroke-fg" />
            <PathPacket d={aMid.d} len={aMid.len} dur={1000} delay={1250} />
            <PathPacket d={bMid.d} len={bMid.len} dur={1000} delay={1250} />
            {[0, 1].map((i) => (
              <g key={i}>
                <PathPacket d={lane.d} len={lane.len} dur={1500} delay={2500 + i * 900} />
                <PathPacket d={back.d} len={back.len} dur={1500} delay={2950 + i * 900} />
              </g>
            ))}
          </>
        )}
        {tier === 2 && (
          <>
            <PathPacket d={aNat.d} len={aNat.len} dur={1100} delay={200} />
            <PathPacket d={bNat.d} len={bNat.len} dur={1100} delay={200} />
            {[0, 1, 2].map((i) => (
              <PathPacket key={i} d={relay.d} len={relay.len} dur={2300} delay={1700 + i * 650} />
            ))}
          </>
        )}

        {/* NATs: solid until an outbound packet opens a mapping. */}
        <>
            <rect x={L.natA.x} y={L.natA.y} width={L.natA.w} height={L.natA.h} className="fill-graphite" />
            <rect x={L.natB.x} y={L.natB.y} width={L.natB.w} height={L.natB.h} className="fill-graphite" />
            <rect x={L.gapA.x} y={L.gapA.y} width={L.gapA.w} height={L.gapA.h} className="kit-motion p2p-appear fill-bg" style={appear(gapAt[0])} />
            <rect x={L.gapB.x} y={L.gapB.y} width={L.gapB.w} height={L.gapB.h} className="kit-motion p2p-appear fill-bg" style={appear(gapAt[1])} />
        </>
        {tier === 2 && (
          <>
            <Cross p={L.crossA} delay={1250} />
            <Cross p={L.crossB} delay={1250} />
          </>
        )}

        <text
          x={L.note[0]}
          y={L.note[1]}
          textAnchor={L.small ? "start" : "middle"}
          className={`kit-motion p2p-appear fill-fg font-mono ${t}`}
          style={appear(noteAt)}
        >
          {TIERS[tier].note}
        </text>
      </g>

      <text
        x={L.natLabelA[0]}
        y={L.natLabelA[1]}
        textAnchor={L.small ? "start" : "middle"}
        className={`fill-dim font-mono ${t}`}
      >
        {`NAT · ${TIERS[tier].nat}`}
      </text>
      <text
        x={L.natLabelB[0]}
        y={L.natLabelB[1]}
        textAnchor={L.small ? "start" : "middle"}
        className={`fill-dim font-mono ${t}`}
      >
        {`NAT · ${TIERS[tier].nat}`}
      </text>

      <Node b={L.beacon} title="Beacon" sub={tier === 2 ? "relays ciphertext" : tier === 1 ? "coordinates the punch" : "STUN"} lit small={L.small} />
      <Node b={L.a} title="Agent A" sub="behind NAT" lit small={L.small} />
      <Node b={L.b} title="Agent B" sub="behind NAT" lit small={L.small} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: two home networks, each behind its router, and the beacon */
/* ------------------------------------------------------------------ */

/*
 * Each agent is a machine on its own network, and each network reaches the internet through a NAT router at its
 * edge. The beacon is the antenna above. Per tier: the STUN exchange through the router, then the direct dial (full
 * cone); both sides sending at once so both routers open (restricted cone); both punches refused at the far router,
 * then every packet through the beacon (symmetric). Packets travel as the kit's beam.
 */

type SL = {
  w: number;
  h: number;
  small: boolean;
  beacon: Pt;
  a: Pt;
  b: Pt;
  natA: Pt;
  natB: Pt;
  lanA: { x: number; y: number; w: number; h: number };
  lanB: { x: number; y: number; w: number; h: number };
  tile: number;
};

const S_WIDE: SL = {
  w: 1160,
  h: 420,
  small: false,
  beacon: [580, 70],
  a: [118, 300],
  b: [1042, 300],
  natA: [372, 300],
  natB: [788, 300],
  lanA: { x: 20, y: 214, w: 352, h: 172 },
  lanB: { x: 788, y: 214, w: 352, h: 172 },
  tile: 64,
};

const S_NARROW: SL = {
  w: 340,
  h: 620,
  small: true,
  beacon: [284, 310],
  a: [152, 70],
  b: [152, 550],
  natA: [152, 190],
  natB: [152, 430],
  lanA: { x: 4, y: 4, w: 240, h: 186 },
  lanB: { x: 4, y: 430, w: 240, h: 186 },
  tile: 52,
};

const S_DURATIONS = [5200, 6000, 6400] as const;
const NAT_SUB = ["Full cone", "Restricted cone", "Symmetric"] as const;
const LANE_STATE = ["Direct", "Hole-punched", "Relayed"] as const;
const BEACON_SUB = ["STUN", "Times the punch", "Relays ciphertext"] as const;

function line(a: Pt, b: Pt) {
  return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
}

/** A router's state as a badge: closed to unsolicited packets, opened by an outbound one, or refusing a punch. */
function NatBadge({ state }: { state: "closed" | "open" | "refused" }) {
  if (state === "open")
    return (
      <span className="infra-pop grid size-full place-items-center rounded-full bg-(--sky-fill) text-white">
        <CheckIcon className="size-3" />
      </span>
    );
  if (state === "refused")
    return (
      <span className="infra-pop grid size-full place-items-center rounded-full bg-fg text-bg">
        <XIcon className="size-2.5" />
      </span>
    );
  return <span className="size-2 rounded-full bg-fg/25" />;
}

function SkyNode({
  L,
  p,
  name,
  title,
  sub,
  lit,
  badge,
  side = "below",
}: {
  L: SL;
  p: Pt;
  name: ObjName;
  title: string;
  sub?: string;
  lit?: boolean;
  badge?: ReactNode;
  side?: "below" | "above" | "right" | "left";
}) {
  const pos =
    side === "above"
      ? "bottom-full left-1/2 mb-2.5 -translate-x-1/2"
      : side === "right"
        ? "top-1/2 left-full ml-4 -translate-y-1/2 !items-start !text-left"
        : side === "left"
          ? "top-1/2 right-full mr-4 -translate-y-1/2 !items-end !text-right"
          : "top-full left-1/2 mt-3 -translate-x-1/2";
  return (
    <div style={at(p[0], p[1], L.w, L.h)}>
      <ObjTile name={name} size={L.tile} lit={lit} badge={badge} />
      <NodeLabel title={title} sub={sub} mono={false} className={`absolute ${pos}`} />
    </div>
  );
}

/** The NAT's state at each moment of a tier, for each side. */
function natState(tier: number, phase: number, side: "a" | "b"): "closed" | "open" | "refused" {
  if (tier === 0) return side === "a" ? (phase >= 1 ? "open" : "closed") : phase >= 2 ? "open" : "closed";
  if (tier === 1) return phase >= 1 ? "open" : "closed";
  return phase >= 1 ? "refused" : "closed";
}

function SkyLadder({ L, tier, run, inView }: { L: SL; tier: number; run: number; inView: boolean }) {
  const [phase, setPhase] = useState(0);
  // Phases inside a tier: 0 start, 1 the routers react, 2 the path is up.
  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(0), 0);
    const marks = tier === 0 ? [2000, 2600] : tier === 1 ? [2300, 2700] : [1500, 2200];
    const timers = marks.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    return () => {
      window.clearTimeout(t1);
      timers.forEach(window.clearTimeout);
    };
  }, [tier, run]);

  const lanAWire = line(L.a, L.natA);
  const lanBWire = line(L.natB, L.b);
  const internet = line(L.natA, L.natB);
  const upA = curve(L.natA, L.beacon, L.small ? "x" : "y");
  const upB = curve(L.natB, L.beacon, L.small ? "x" : "y");
  const aToB = line(L.a, L.b);
  const aStun = `${lanAWire} ${upA.replace(/^M[^C]+/, "")}`;
  const relay = `${aStun} ${curve(L.beacon, L.natB, L.small ? "x" : "y").replace(/^M[^C]+/, "")} L${L.b[0]} ${L.b[1]}`;
  const punchA = line(L.a, L.natB);
  const punchB = line(L.b, L.natA);
  const midPt: Pt = [(L.natA[0] + L.natB[0]) / 2, (L.natA[1] + L.natB[1]) / 2];
  const toMidA = line(L.a, midPt);
  const toMidB = line(L.b, midPt);
  const direct = tier < 2 && phase >= 2;
  const tail = L.small ? 44 : 70;
  const R = L.small ? 18 : 22;

  return (
    <Stage
      w={L.w}
      h={L.h}
      svg={
        <>
          {[L.lanA, L.lanB].map((z, i) => (
            <rect
              key={i}
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx={R}
              className="fill-[color-mix(in_srgb,var(--color-fg)_3%,var(--color-bg))] stroke-(--sky-card-line)"
            />
          ))}
          <path d={lanAWire} className={WIRE} />
          <path d={lanBWire} className={WIRE} />
          <path d={internet} className={WIRE} data-lit={direct} />
          <path d={upA} className={WIRE} data-lit={tier === 2 && phase >= 2} />
          <path d={upB} className={WIRE} data-lit={tier === 2 && phase >= 2} />
          {direct && <path d={aToB} className={`${WIRE} infra-pop`} data-lit strokeWidth={2.5} />}
          {inView && (
            <g key={`${tier}-${run}`}>
              {tier === 0 && (
                <>
                  {/* A asks the beacon for its public endpoint, the answer comes back, then B dials it. */}
                  <Beam d={aStun} run={run} duration={900} delay={200} tail={tail} />
                  <Beam d={aStun} run={run} reverse duration={900} delay={1150} tail={tail} />
                  {[0, 1, 2].map((i) => (
                    <Beam key={i} d={aToB} run={run} reverse duration={1300} delay={2300 + i * 650} tail={tail * 1.3} width={2.5} />
                  ))}
                </>
              )}
              {tier === 1 && (
                <>
                  <Beam d={upA} run={run} reverse duration={900} delay={200} tail={tail} />
                  <Beam d={upB} run={run} reverse duration={900} delay={200} tail={tail} />
                  <Beam d={toMidA} run={run} duration={1000} delay={1250} tail={tail} />
                  <Beam d={toMidB} run={run} duration={1000} delay={1250} tail={tail} />
                  {[0, 1].map((i) => (
                    <g key={i}>
                      <Beam d={aToB} run={run} duration={1300} delay={2700 + i * 900} tail={tail * 1.3} width={2.5} />
                      <Beam d={aToB} run={run} reverse duration={1300} delay={3150 + i * 900} tail={tail * 1.3} width={2.5} />
                    </g>
                  ))}
                </>
              )}
              {tier === 2 && (
                <>
                  <Beam d={punchA} run={run} duration={1100} delay={200} tail={tail} />
                  <Beam d={punchB} run={run} duration={1100} delay={200} tail={tail} />
                  {[0, 1, 2].map((i) => (
                    <Beam key={i} d={relay} run={run} duration={2200} delay={1900 + i * 700} tail={tail} />
                  ))}
                </>
              )}
            </g>
          )}
        </>
      }
    >
      {/* The state of the path between the two networks. */}
      <span style={at(midPt[0], midPt[1], L.w, L.h)}>
        <span key={`${tier}-${run}-${direct}`} className="infra-chip infra-pop" data-tone={direct ? "sky" : tier === 2 && phase >= 2 ? undefined : "off"}>
          {phase >= 2 ? LANE_STATE[tier] : "Internet"}
        </span>
      </span>
      {[
        ["a", L.lanA],
        ["b", L.lanB],
      ].map(([k, z]) => {
        const r = z as SL["lanA"];
        return (
          <span
            key={k as string}
            className="absolute text-[12.5px] leading-4 whitespace-nowrap text-mute"
            style={{
              left: `${((k === "a" || L.small ? r.x + 16 : r.x + r.w - 16) / L.w) * 100}%`,
              top: `${((L.small && k === "b" ? r.y + r.h - 28 : r.y + 14) / L.h) * 100}%`,
              transform: k === "b" && !L.small ? "translateX(-100%)" : undefined,
            }}
          >
            {k === "a" ? "Network A" : "Network B"}
          </span>
        );
      })}
      <SkyNode L={L} p={L.beacon} name="antenna" title="Beacon" sub={BEACON_SUB[tier]} lit={tier !== 0 || phase < 1} side={L.small ? "below" : "right"} />
      <SkyNode
        L={L}
        p={L.natA}
        name="router"
        title="NAT"
        sub={NAT_SUB[tier]}
        badge={<NatBadge key={`${tier}-${run}-${natState(tier, phase, "a")}`} state={natState(tier, phase, "a")} />}
        side={L.small ? "left" : "below"}
      />
      <SkyNode
        L={L}
        p={L.natB}
        name="router"
        title="NAT"
        sub={NAT_SUB[tier]}
        badge={<NatBadge key={`${tier}-${run}-${natState(tier, phase, "b")}`} state={natState(tier, phase, "b")} />}
        side={L.small ? "left" : "below"}
      />
      <SkyNode L={L} p={L.a} name="laptop" title="Agent A" lit badge={<BrandMark brand="claude" className="size-3" />} side={L.small ? "left" : "below"} />
      <SkyNode L={L} p={L.b} name="laptop" title="Agent B" lit badge={<BrandMark brand="codex" className="size-3" />} side={L.small ? "left" : "below"} />
    </Stage>
  );
}

/**
 * Sky site: the ladder on the section's hatched panel, and the three tiers as a stepper under it (the kit's step
 * dots, blue for the tier playing; the line to the next tier fills while it plays).
 */
function SkyTraversal() {
  const { ref, step, run, manual, go, reduced, inView } = useStepper<HTMLDivElement>(TIERS.length, S_DURATIONS);
  return (
    <div ref={ref}>
      <div className="hidden lg:block">
        <SkyLadder L={S_WIDE} tier={step} run={run} inView={inView} />
      </div>
      <div className="mx-auto max-w-[400px] lg:hidden">
        <SkyLadder L={S_NARROW} tier={step} run={run} inView={inView} />
      </div>
      <ol className="mt-12 grid grid-cols-1 gap-3 sm:mt-14 lg:grid-cols-3 lg:gap-0">
        {TIERS.map((t, i) => {
          const on = i === step;
          const last = i === TIERS.length - 1;
          return (
            <li key={t.nat} className="min-w-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={on}
                className="group flex w-full flex-col items-center rounded-[12px] px-4 py-2 text-center"
              >
                <span className="relative flex w-full justify-center">
                  {!last && (
                    <span aria-hidden className="sky-step-line absolute top-1/2 left-[calc(50%+20px)] hidden w-[calc(100%-8px)] overflow-hidden lg:block">
                      {on && !reduced && (
                        <span
                          key={run}
                          className="kit-motion absolute inset-0 origin-left bg-(--sky-fill)"
                          style={{ animation: `kit-fill ${S_DURATIONS[i] * (manual ? 2.2 : 1)}ms linear both` }}
                        />
                      )}
                    </span>
                  )}
                  <span className="sky-step-dot relative tabular-nums" data-on={on}>
                    {i + 1}
                  </span>
                </span>
                <span
                  className={`mt-3 text-[16px] leading-[22px] font-medium tracking-[-0.03em] transition-colors duration-300 ${on ? "text-fg" : "text-mute group-hover:text-fg"}`}
                >
                  {t.title}
                </span>
                <span className="mt-2 max-w-[340px] text-[14.5px] leading-[1.5] text-pretty text-mute">{t.body}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Traversal() {
  return SKY ? <SkyTraversal /> : <GreenTraversal />;
}

function GreenTraversal() {
  const { ref, step, run, manual, go } = useStepper<HTMLDivElement>(TIERS.length, DURATIONS);
  return (
    <div ref={ref}>
      <div className="hidden lg:block">
        <Diagram L={WIDE} tier={step} run={run} />
      </div>
      <div className="mx-auto max-w-[360px] md:max-w-[460px] lg:hidden">
        <Diagram L={NARROW} tier={step} run={run} />
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-3">
        {TIERS.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.title} className="bg-bg">
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
                <span className={`font-mono text-[28px] leading-none font-medium tracking-[-0.03em] ${on ? "text-lime-ink" : "text-graphite"}`}>
                  0{i + 1}
                </span>
                <span className={`mt-5 text-[18px] font-medium tracking-[-0.015em] ${on ? "text-fg" : "text-soft"}`}>{s.title}</span>
                <span className={`mt-2 text-[14px] leading-[1.55] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
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
