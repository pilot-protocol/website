"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LockIcon, XIcon } from "@/components/icons";
import { at, curve, NodeLabel, ObjTile, Stage, WIRE, type ObjName } from "@/components/pages/security/infra";
import { FLAT_CARD, PathPacket, poly, SKY, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { StepHead } from "@/components/sky/kit";
import { BrandMark } from "@/components/v4/logos";

/*
 * Peer traffic, separate coordination: two agents joined by an encrypted
 * tunnel, with the registry and beacon off to one side on a coordination bus.
 * Four steps loop while it's on screen: discover (registry), reach (beacon),
 * the direct tunnel, and the relay fallback through the beacon.
 */

type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

type Layout = {
  w: number;
  h: number;
  a: Box;
  b: Box;
  registry: Box;
  beacon: Box;
  bus: string;
  stubs: string[];
  band: Box;
  lookup: Pt[];
  punchA: Pt[];
  punchB: Pt[];
  tunnel: Pt[];
  relay: Pt[];
  small: boolean;
};

const WIDE: Layout = {
  w: 1160,
  h: 336,
  small: false,
  registry: { x: 330, y: 28, w: 220, h: 84 },
  beacon: { x: 610, y: 28, w: 220, h: 84 },
  a: { x: 0, y: 236, w: 210, h: 84 },
  b: { x: 950, y: 236, w: 210, h: 84 },
  bus: "M105 236 V170 H1055 V236",
  stubs: ["M440 112 V170", "M705 112 V170", "M735 112 V170"],
  band: { x: 210, y: 270, w: 740, h: 16 },
  lookup: [
    [105, 236],
    [105, 170],
    [440, 170],
    [440, 112],
  ],
  punchA: [
    [705, 112],
    [705, 170],
    [105, 170],
    [105, 236],
  ],
  punchB: [
    [735, 112],
    [735, 170],
    [1055, 170],
    [1055, 236],
  ],
  tunnel: [
    [210, 278],
    [950, 278],
  ],
  relay: [
    [105, 236],
    [105, 170],
    [705, 170],
    [705, 92],
    [735, 92],
    [735, 170],
    [1055, 170],
    [1055, 236],
  ],
};

const NARROW: Layout = {
  w: 360,
  h: 470,
  small: true,
  a: { x: 0, y: 0, w: 150, h: 64 },
  b: { x: 0, y: 406, w: 150, h: 64 },
  registry: { x: 210, y: 112, w: 150, h: 72 },
  beacon: { x: 210, y: 286, w: 150, h: 72 },
  bus: "M150 32 H182 V438 H150",
  stubs: ["M182 148 H210", "M182 310 H210", "M182 334 H210"],
  band: { x: 67, y: 64, w: 16, h: 342 },
  lookup: [
    [150, 32],
    [182, 32],
    [182, 148],
    [210, 148],
  ],
  punchA: [
    [210, 310],
    [182, 310],
    [182, 32],
    [150, 32],
  ],
  punchB: [
    [210, 334],
    [182, 334],
    [182, 438],
    [150, 438],
  ],
  tunnel: [
    [75, 64],
    [75, 406],
  ],
  relay: [
    [150, 32],
    [182, 32],
    [182, 310],
    [228, 310],
    [228, 334],
    [182, 334],
    [182, 438],
    [150, 438],
  ],
};

const STEPS = [
  {
    title: "Discover",
    body: "The registry issues addresses, stores public keys and answers lookups.",
  },
  {
    title: "Reach",
    body: "The beacon tells each daemon its public address (STUN) and coordinates hole punching.",
  },
  {
    title: "Direct tunnel",
    body: "X25519 gives each pair of peers its own secret; AES-256-GCM encrypts and authenticates every packet.",
  },
  {
    title: "Relay fallback",
    body: "When a direct path fails, the beacon relays the packets. It carries ciphertext and has no tunnel keys.",
  },
] as const;

const DURATIONS = [2600, 2600, 3400, 3800] as const;

function Node({
  box,
  title,
  lines,
  lit,
  small,
}: {
  box: Box;
  title: string;
  lines: string[];
  lit: boolean;
  small: boolean;
}) {
  const pad = small ? 12 : 16;
  if (SKY) {
    // Sky site: the parts are white cards; the one in play gets a sky outline and a dot.
    return (
      <g>
        <rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={small ? 12 : 14}
          className={`fill-card transition-[stroke] duration-500 ${lit ? "stroke-(--sky-fill)" : "stroke-fg/[0.12]"}`}
          strokeWidth={lit ? 1.5 : 1}
        />
        <text
          x={box.x + pad}
          y={box.y + (small ? 26 : 32)}
          className={`fill-fg font-sans font-medium ${small ? "text-[13.5px]" : "text-[15px]"}`}
        >
          {title}
        </text>
        {lines.map((l, i) => (
          <text
            key={l}
            x={box.x + pad}
            y={box.y + (small ? 44 : 54) + i * (small ? 15 : 17)}
            className={`fill-mute font-sans ${small ? "text-[11.5px]" : "text-[12.5px]"}`}
          >
            {l}
          </text>
        ))}
        <circle
          cx={box.x + box.w - (small ? 14 : 18)}
          cy={box.y + (small ? 15 : 18)}
          r={3.5}
          className={`fill-(--sky-fill) transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-0"}`}
        />
      </g>
    );
  }
  return (
    <g>
      <rect
        x={box.x + 0.5}
        y={box.y + 0.5}
        width={box.w - 1}
        height={box.h - 1}
        rx={2}
        className={`fill-card transition-[stroke] duration-500 ${lit ? "stroke-lime-ink" : "stroke-fg/16"}`}
      />
      <text
        x={box.x + pad}
        y={box.y + (small ? 25 : 31)}
        className={`fill-fg font-sans font-medium ${small ? "text-[13.5px]" : "text-[15px]"}`}
      >
        {title}
      </text>
      {lines.map((l, i) => (
        <text
          key={l}
          x={box.x + pad}
          y={box.y + (small ? 43 : 53) + i * (small ? 14 : 16)}
          className={`fill-dim font-mono ${small ? "text-[10.5px]" : "text-[11.5px]"}`}
        >
          {l}
        </text>
      ))}
      {lit && <rect x={box.x + box.w - (small ? 14 : 18)} y={box.y + (small ? 10 : 12)} width={6} height={6} className="fill-lime" />}
    </g>
  );
}

function Diagram({ L, step, run }: { L: Layout; step: number; run: number }) {
  const lookup = poly(L.lookup);
  const reply = poly([...L.lookup].reverse());
  const punchA = poly(L.punchA);
  const punchB = poly(L.punchB);
  const tunnel = poly(L.tunnel);
  const relay = poly(L.relay);
  const speed = 0.62; // user units per ms

  const regLines = L.small ? ["addresses · keys", "lookups · trust"] : ["addresses · public keys", "lookups · trust records"];
  const beaconLines = L.small ? ["STUN · punching", "relay fallback"] : ["public address (STUN)", "hole punching · relay"];
  const relaying = step === 3;
  const tunnelLit = step === 2;
  // Sky site: round sky-blue packets instead of lime squares.
  const pk = SKY ? { round: true, className: "stroke-(--sky-fill)" } : {};

  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="h-auto w-full overflow-visible" aria-hidden>
      {/* Coordination wiring: dashed on the green site, quiet solid lines on the sky. */}
      <path
        d={L.bus}
        fill="none"
        strokeWidth={1}
        strokeDasharray={SKY ? undefined : "3 4"}
        strokeLinejoin="round"
        className={SKY ? "stroke-fg/15" : "stroke-fg/24"}
      />
      {L.stubs.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          strokeWidth={1}
          strokeDasharray={SKY ? undefined : "3 4"}
          className={SKY ? "stroke-fg/15" : "stroke-fg/24"}
        />
      ))}
      <text
        x={L.small ? L.registry.x + L.registry.w / 2 : L.registry.x}
        y={L.small ? L.registry.y - 14 : 14}
        textAnchor={L.small ? "middle" : "start"}
        className={
          SKY
            ? `fill-mute font-sans ${L.small ? "text-[12px]" : "text-[13px]"}`
            : `fill-dim font-mono ${L.small ? "text-[10.5px]" : "text-[11.5px]"}`
        }
      >
        {L.small ? "Coordination" : "Coordination · run by Vulture Labs on the public backbone, or by you"}
      </text>

      {/* The tunnel */}
      <g className={`transition-opacity duration-500 ${relaying ? "opacity-35" : "opacity-100"}`}>
        {SKY ? (
          <rect
            x={L.band.x}
            y={L.band.y}
            width={L.band.w}
            height={L.band.h}
            rx={8}
            className={`transition-[fill] duration-500 ${tunnelLit ? "fill-(--sky-fill)/22" : "fill-fg/[0.06]"}`}
          />
        ) : (
        <>
        <rect
          x={L.band.x}
          y={L.band.y}
          width={L.band.w}
          height={L.band.h}
          className={`transition-[fill] duration-500 ${tunnelLit ? "fill-lime/[0.10]" : "fill-fg/3"}`}
        />
        {L.small ? (
          <>
            <path d={`M${L.band.x} ${L.band.y} V${L.band.y + L.band.h}`} className="stroke-fg/24" />
            <path d={`M${L.band.x + L.band.w} ${L.band.y} V${L.band.y + L.band.h}`} className="stroke-fg/24" />
          </>
        ) : (
          <>
            <path d={`M${L.band.x} ${L.band.y} H${L.band.x + L.band.w}`} className="stroke-fg/24" />
            <path d={`M${L.band.x} ${L.band.y + L.band.h} H${L.band.x + L.band.w}`} className="stroke-fg/24" />
          </>
        )}
        </>
        )}
      </g>
      {L.small ? (
        <g>
          <text x={96} y={218} className="fill-fg font-sans text-[12.5px] font-medium">
            Encrypted
          </text>
          <text x={96} y={234} className="fill-fg font-sans text-[12.5px] font-medium">
            peer tunnel
          </text>
          <text x={96} y={256} className={SKY ? "fill-mute font-sans text-[11.5px]" : "fill-dim font-mono text-[10.5px]"}>
            X25519 ·
          </text>
          <text x={96} y={270} className={SKY ? "fill-mute font-sans text-[11.5px]" : "fill-dim font-mono text-[10.5px]"}>
            AES-256-GCM
          </text>
        </g>
      ) : (
        <g>
          <text x={580} y={256} textAnchor="middle" className="fill-fg font-sans text-[14px] font-medium">
            Encrypted peer tunnel
          </text>
          <text x={580} y={310} textAnchor="middle" className={SKY ? "fill-mute font-sans text-[12.5px]" : "fill-dim font-mono text-[11.5px]"}>
            X25519 key exchange · AES-256-GCM
          </text>
        </g>
      )}
      {relaying && (
        <g key={`x-${run}`} className="animate-[kit-pop_400ms_var(--ease-out)_both]">
          {L.small ? (
            <path d="M68 228 l14 14 M82 228 l-14 14" strokeWidth={1.5} strokeLinecap={SKY ? "round" : undefined} className="stroke-fg" />
          ) : (
            <path d="M573 271 l14 14 M587 271 l-14 14" strokeWidth={1.5} strokeLinecap={SKY ? "round" : undefined} className="stroke-fg" />
          )}
        </g>
      )}

      {/* Packets for the current step */}
      <g key={`${step}-${run}`} className="kit-motion">
        {step === 0 && (
          <>
            <PathPacket {...pk} d={lookup.d} len={lookup.len} dur={lookup.len / speed} delay={200} />
            <PathPacket {...pk} d={reply.d} len={reply.len} dur={reply.len / speed} delay={300 + lookup.len / speed} />
          </>
        )}
        {step === 1 && (
          <>
            <PathPacket {...pk} d={punchA.d} len={punchA.len} dur={Math.max(punchA.len, punchB.len) / speed} delay={200} />
            <PathPacket {...pk} d={punchB.d} len={punchB.len} dur={Math.max(punchA.len, punchB.len) / speed} delay={200} />
          </>
        )}
        {step === 2 &&
          [0, 1, 2].map((i) => (
            <PathPacket key={i} {...pk} d={tunnel.d} len={tunnel.len} dur={tunnel.len / 0.55} delay={150 + i * 650} />
          ))}
        {step === 3 &&
          [0, 1].map((i) => (
            <PathPacket key={i} {...pk} d={relay.d} len={relay.len} dur={relay.len / 0.75} delay={300 + i * 900} />
          ))}
      </g>

      <Node box={L.registry} title="Registry" lines={regLines} lit={step === 0} small={L.small} />
      <Node box={L.beacon} title="Beacon" lines={beaconLines} lit={step === 1 || step === 3} small={L.small} />
      <Node box={L.a} title="Agent A" lines={["Ed25519 identity"]} lit={step >= 2 || step === 0} small={L.small} />
      <Node box={L.b} title="Agent B" lines={["Ed25519 identity"]} lit={step >= 1} small={L.small} />
    </svg>
  );
}

const HEX = "0123456789abcdef";
const SEED = "9f2c41d07be35a86c1e0";

/** Ciphertext on the wire: hex that keeps changing while packets are moving. */
function Cipher({ active, short = false }: { active: boolean; short?: boolean }) {
  const [text, setText] = useState(SEED);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setText(Array.from({ length: SEED.length }, () => HEX[Math.floor(Math.random() * 16)]).join(""));
    }, 90);
    return () => window.clearInterval(id);
  }, [active]);
  return <span className="tabular-nums">{short ? text.slice(0, 12) : text}</span>;
}

function Readout({ label, children, lit }: { label: string; children: React.ReactNode; lit: boolean }) {
  if (SKY)
    return (
      <div data-lit={lit} className={`group/r flex min-w-0 flex-col gap-1 px-4 py-3.5 ${FLAT_CARD}`}>
        <span className="text-[13px] leading-5 text-mute">{label}</span>
        <span className="truncate font-mono text-[13px] text-fg transition-opacity duration-500 group-data-[lit=false]/r:opacity-35">
          {children}
        </span>
      </div>
    );
  return (
    <div
      data-lit={lit}
      className="flex min-w-0 flex-col gap-1.5 border-t border-edge-2 pt-3 transition-opacity duration-500 data-[lit=false]:opacity-40"
    >
      <span className="font-mono text-[11.5px] text-dim">{label}</span>
      <span className="truncate font-mono text-[13px] text-fg">{children}</span>
    </div>
  );
}

export function ConnectionPath() {
  if (SKY) return <SkyConnectionPath />;
  return <GreenConnectionPath />;
}

function GreenConnectionPath() {
  const { ref, step, run, manual, go, inView } = useStepper<HTMLDivElement>(STEPS.length, DURATIONS);
  const payload = step >= 2;

  return (
    <div ref={ref}>
      <div className={SKY ? "hidden pt-3 pb-2 lg:block" : "hidden lg:block"}>
        <Diagram L={WIDE} step={step} run={run} />
      </div>
      <div className={SKY ? "mx-auto max-w-[360px] px-3 pt-5 pb-1 md:max-w-[440px] lg:hidden" : "mx-auto max-w-[360px] md:max-w-[460px] lg:hidden"}>
        <Diagram L={NARROW} step={step} run={run} />
      </div>

      <div className={SKY ? "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-4" : "mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 md:mt-6"}>
        <Readout label="On agent A" lit={payload}>
          &quot;hello, peer&quot;
        </Readout>
        <Readout label={step === 3 ? "At the beacon, no keys" : "On the wire"} lit={payload}>
          <span className={SKY ? "text-(--sky-accent)" : "text-lime-ink"}>
            <Cipher active={payload && inView} />
          </span>
        </Readout>
        <Readout label="On agent B" lit={payload}>
          &quot;hello, peer&quot;
        </Readout>
      </div>

      {SKY ? (
        <SkySteps step={step} go={go} />
      ) : (
      <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.title} className="bg-bg">
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={on}
                className="group relative flex h-full w-full flex-col items-start gap-2 p-5 text-left transition-colors duration-300 hover:bg-fg/[0.02]"
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
                <span className="flex items-center gap-2.5 font-mono text-[12px] text-dim">
                  <span className={on ? "text-lime-ink" : ""}>0{i + 1}</span>
                  <span className={`text-[15px] font-sans font-medium transition-colors ${on ? "text-fg" : "text-soft"}`}>
                    {s.title}
                  </span>
                </span>
                <span className={`text-[14px] leading-[1.5] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
                  {s.body}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      )}
    </div>
  );
}

/**
 * Sky site: the four steps as the kit's stepper (Figma 233:1195). Each head is a button that jumps the diagram to
 * its step; the step in play has the blue dot. From md up every step keeps its line of text under its head; on
 * phones only the step in play does.
 */
function SkySteps({ step, go }: { step: number; go: (i: number) => void }) {
  return (
    <div className="mt-10 sm:mt-12">
      <ol className="grid grid-cols-4">
        {STEPS.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.title} className="min-w-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={on}
                className="flex w-full flex-col items-stretch rounded-[8px] pt-1 pb-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sky-accent)"
              >
                <StepHead n={i + 1} title={s.title} on={on} last={i === STEPS.length - 1} />
                <span
                  className={`mt-2 hidden max-w-[240px] self-center px-3 text-[14px] leading-[1.5] text-pretty transition-colors duration-300 md:block ${on ? "text-mute" : "text-dim"}`}
                >
                  {s.body}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p aria-live="polite" className="mx-auto mt-4 min-h-[63px] max-w-[340px] text-center text-[14.5px] leading-[1.45] text-pretty text-mute md:hidden">
        {STEPS[step].body}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: the parts as real objects                                 */
/* ------------------------------------------------------------------ */

/*
 * The registry is a server and the beacon an antenna, side by side in the coordination zone; the two agents are
 * machines below them, joined by the tunnel. Messages travel as the kit's beam along the same wires: a lookup to the
 * registry and back, the beacon answering both agents, ciphertext through the tunnel, and, when the direct path
 * fails, through the beacon. The plaintext sits under each agent and the ciphertext on the wire between them.
 */

type SkyL = {
  w: number;
  h: number;
  small: boolean;
  reg: Pt;
  bea: Pt;
  a: Pt;
  b: Pt;
  tile: number;
  agent: number;
  zone: { x: number; y: number; w: number; h: number };
};

const SKY_WIDE: SkyL = {
  w: 1160,
  h: 480,
  small: false,
  reg: [480, 112],
  bea: [680, 112],
  a: [112, 330],
  b: [1048, 330],
  tile: 60,
  agent: 68,
  zone: { x: 260, y: 6, w: 640, h: 178 },
};

const SKY_NARROW: SkyL = {
  w: 340,
  h: 520,
  small: true,
  reg: [100, 128],
  bea: [240, 128],
  a: [46, 344],
  b: [294, 344],
  tile: 50,
  agent: 54,
  zone: { x: 18, y: 4, w: 304, h: 186 },
};

/** Joins two curves end to start (a path through a middle point). */
function via(a: Pt, mid: Pt, b: Pt) {
  return `${curve(a, mid)} ${curve(mid, b).replace(/^M[^C]+/, "")}`;
}

function SkyNode({
  L,
  p,
  size,
  name,
  title,
  sub,
  lit,
  above = false,
  mono = false,
  badge,
}: {
  L: SkyL;
  p: Pt;
  size: number;
  name: ObjName;
  title: string;
  sub: string;
  lit: boolean;
  above?: boolean;
  mono?: boolean;
  badge?: ReactNode;
}) {
  return (
    <div style={at(p[0], p[1], L.w, L.h)}>
      <ObjTile name={name} size={size} lit={lit} badge={badge} />
      <NodeLabel
        title={title}
        sub={sub}
        mono={mono}
        className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-full mb-2.5" : "top-full mt-3"}`}
      />
    </div>
  );
}

function SkyDiagram({ L, step, run, inView }: { L: SkyL; step: number; run: number; inView: boolean }) {
  const aReg = curve(L.a, L.reg);
  const aBea = curve(L.a, L.bea);
  const bReg = curve(L.b, L.reg);
  const bBea = curve(L.b, L.bea);
  const tunnel = `M${L.a[0]} ${L.a[1]} L${L.b[0]} ${L.b[1]}`;
  const relay = via(L.a, L.bea, L.b);
  const mid = (L.a[0] + L.b[0]) / 2;
  const relaying = step === 3;
  const payload = step >= 2;
  const tail = L.small ? 40 : 72;
  const z = L.zone;

  return (
    <Stage
      w={L.w}
      h={L.h}
      svg={
        <>
          <rect
            x={z.x}
            y={z.y}
            width={z.w}
            height={z.h}
            rx={L.small ? 16 : 22}
            className="fill-[color-mix(in_srgb,var(--color-fg)_3%,var(--color-bg))] stroke-(--sky-card-line)"
            strokeWidth={1}
          />
          <path d={aReg} className={WIRE} data-lit={step === 0} />
          <path d={aBea} className={WIRE} data-lit={step === 1 || relaying} />
          <path d={bReg} className={WIRE} />
          <path d={bBea} className={WIRE} data-lit={step === 1 || relaying} />
          {/* The tunnel: a band between the two machines, lit while ciphertext crosses it. */}
          <rect
            x={L.a[0]}
            y={L.a[1] - (L.small ? 9 : 12)}
            width={L.b[0] - L.a[0]}
            height={L.small ? 18 : 24}
            rx={L.small ? 9 : 12}
            className={`transition-[fill,opacity] duration-500 ${step === 2 ? "fill-(--sky-fill)/16" : "fill-fg/[0.05]"} ${relaying ? "opacity-40" : ""}`}
          />
          {inView && (
            <g key={`${step}-${run}`}>
              {step === 0 && (
                <>
                  <Beam d={aReg} run={run} duration={950} delay={150} tail={tail} />
                  <Beam d={aReg} run={run} reverse duration={950} delay={1250} tail={tail} />
                </>
              )}
              {step === 1 && (
                <>
                  <Beam d={aBea} run={run} reverse duration={1000} delay={200} tail={tail} />
                  <Beam d={bBea} run={run} reverse duration={1000} delay={200} tail={tail} />
                </>
              )}
              {step === 2 &&
                [0, 1, 2].map((i) => <Beam key={i} d={tunnel} run={run} duration={1300} delay={150 + i * 800} tail={tail * 1.4} width={3} />)}
              {step === 3 &&
                [0, 1].map((i) => <Beam key={i} d={relay} run={run} duration={2000} delay={250 + i * 1200} tail={tail} />)}
            </g>
          )}
        </>
      }
    >
      <span
        className={`absolute text-[12.5px] leading-4 text-mute ${L.small ? "-translate-x-1/2" : ""}`}
        style={{ left: `${((L.small ? z.x + z.w / 2 : z.x + 20) / L.w) * 100}%`, top: `${((z.y + (L.small ? 14 : 16)) / L.h) * 100}%` }}
      >
        Coordination
      </span>
      {!L.small && (
        <span
          className="absolute -translate-x-full text-[12.5px] leading-4 text-dim"
          style={{ left: `${((z.x + z.w - 20) / L.w) * 100}%`, top: `${((z.y + 16) / L.h) * 100}%` }}
        >
          Vulture Labs, or you
        </span>
      )}

      {/* On the wire: the tunnel's cipher, and the ciphertext itself while it crosses. */}
      <div style={at(mid, L.a[1], L.w, L.h)} className="flex flex-col items-center">
        <span
          className="infra-chip"
          data-tone={step === 2 ? "sky" : undefined}
          style={relaying ? { opacity: 0.4 } : undefined}
        >
          <LockIcon className="size-3" />
          {L.small ? "AES-256-GCM" : "X25519 · AES-256-GCM"}
        </span>
      </div>
      <span
        style={at(mid, L.a[1] - (L.small ? 30 : 38), L.w, L.h)}
        className="text-[13.5px] leading-[18px] font-medium tracking-[-0.02em] whitespace-nowrap text-fg"
      >
        Peer tunnel
      </span>
      <span
        style={at(mid, L.a[1] + (L.small ? 30 : 38), L.w, L.h)}
        className={`font-mono text-[12px] whitespace-nowrap text-(--sky-accent) transition-opacity duration-500 ${step === 2 ? "opacity-100" : "opacity-0"}`}
      >
        <Cipher active={step === 2 && inView} short={L.small} />
      </span>
      {relaying && (
        <span key={`x-${run}`} style={at(mid, L.a[1], L.w, L.h)} className="infra-pop">
          <span className="grid size-7 place-items-center rounded-full bg-card text-fg shadow-[0_0_0_1px_var(--sky-card-line)]">
            <XIcon className="size-3" />
          </span>
        </span>
      )}
      {relaying && (
        <span
          key={`k-${run}`}
          style={at(L.bea[0] + (L.small ? 0 : 92), L.bea[1] + (L.small ? 60 : 0), L.w, L.h)}
          className="infra-pop infra-chip font-mono"
        >
          ciphertext only
        </span>
      )}

      <SkyNode L={L} p={L.reg} size={L.tile} name="server" title="Registry" sub="discovery" lit={step === 0} above />
      <SkyNode L={L} p={L.bea} size={L.tile} name="antenna" title="Beacon" sub="STUN · relay" lit={step === 1 || relaying} above />
      <SkyNode
        L={L}
        p={L.a}
        size={L.agent}
        name="laptop"
        title="Agent A"
        sub="ed25519"
        mono
        lit={step !== 1}
        badge={<BrandMark brand="claude" className="size-3" />}
      />
      <SkyNode
        L={L}
        p={L.b}
        size={L.agent}
        name="laptop"
        title="Agent B"
        sub="ed25519"
        mono
        lit={step >= 1}
        badge={<BrandMark brand="codex" className="size-3" />}
      />

      {/* The plaintext, at either end only. */}
      {[L.a, L.b].map((p, i) => (
        <span
          key={i}
          style={at(p[0], p[1] + (L.small ? 92 : 104), L.w, L.h)}
          className={`rounded-[12px] bg-card px-3 py-1.5 font-mono text-[12px] whitespace-nowrap text-fg shadow-[0_0_0_1px_var(--sky-card-line),0_6px_14px_-8px_rgb(10_42_156/0.25)] transition-opacity duration-500 ${
            i === 0 ? "rounded-tl-[4px]" : "rounded-tr-[4px]"
          } ${payload ? "opacity-100" : "opacity-0"}`}
        >
          hello, peer
        </span>
      ))}
    </Stage>
  );
}

function SkyConnectionPath() {
  const { ref, step, run, go, inView } = useStepper<HTMLDivElement>(STEPS.length, SKY_DURATIONS);
  return (
    <div ref={ref}>
      <div className="hidden pt-2 lg:block">
        <SkyDiagram L={SKY_WIDE} step={step} run={run} inView={inView} />
      </div>
      <div className="mx-auto max-w-[400px] pt-2 lg:hidden">
        <SkyDiagram L={SKY_NARROW} step={step} run={run} inView={inView} />
      </div>
      <SkySteps step={step} go={go} />
    </div>
  );
}

const SKY_DURATIONS = [2600, 2400, 3400, 3900] as const;
