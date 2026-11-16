"use client";

import { useEffect, useState } from "react";
import { at, curve, ObjTile, Stage, WIRE, type Pt } from "@/components/pages/security/infra";
import { FLAT_CARD, poly, SKY, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import "./p2p.css";

/*
 * Hub-and-spoke next to direct: the same six agents and the same conversations.
 * On the left every message goes in to the broker, waits, and comes out again.
 * On the right a quick lookup goes to the registry, then the packet goes
 * straight to the peer, and each conversation leaves one tunnel behind.
 */

const N = 6;
const C: [number, number] = [240, 200];
const R = 150;
const AGENTS: [number, number][] = Array.from({ length: N }, (_, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [Math.round(C[0] + R * Math.cos(a)), Math.round(C[1] + R * Math.sin(a))];
});

// Who talks to whom, in order. Each pair appears once, so the mesh on the right fills in.
const PAIRS: [number, number][] = [
  [0, 3],
  [1, 4],
  [5, 2],
  [0, 2],
  [3, 5],
  [4, 0],
  [1, 3],
  [2, 4],
];
const DURATIONS = Array.from({ length: PAIRS.length }, (_, i) => (i === PAIRS.length - 1 ? 2400 : 1500));

const REGISTRY = { x: 400, y: 14, w: 76, h: 30 };
/** Sky site: the registry tile's centre, top right of the direct picture. */
const REG: Pt = [452, 30];

function Agent({ p, lit }: { p: [number, number]; lit: boolean }) {
  return (
    <rect
      x={p[0] - 9}
      y={p[1] - 9}
      width={18}
      height={18}
      rx={1}
      className={`transition-[fill,stroke] duration-300 ${lit ? "fill-fg stroke-fg" : "fill-card stroke-fg/40"}`}
    />
  );
}

/** One packet riding a path once; `hold` pauses it halfway (the broker's queue). */
function Ride({ d, len, dur, delay = 0, hold }: { d: string; len: number; dur: number; delay?: number; hold?: boolean }) {
  const dash = (8 / len) * 100;
  return (
    <path
      d={d}
      pathLength={100}
      fill="none"
      strokeWidth={8}
      strokeDasharray={`${dash} 300`}
      strokeDashoffset={dash + 1}
      className="kit-motion stroke-lime-ink"
      style={
        {
          "--half": `${-50 + dash / 2}`,
          animation: `${hold ? "p2p-via" : "kit-ride"} ${dur}ms var(--ease-in-out) ${delay}ms 1 both`,
        } as React.CSSProperties
      }
    />
  );
}

function Panel({ kind, step, run }: { kind: "hub" | "direct"; step: number; run: number }) {
  const [a, b] = PAIRS[step];
  const A = AGENTS[a];
  const B = AGENTS[b];
  const via = poly([A, C, B]);
  const direct = poly([A, B]);
  const lookup = poly([A, [A[0], REGISTRY.y + REGISTRY.h / 2], [REGISTRY.x, REGISTRY.y + REGISTRY.h / 2]]);
  const talked = PAIRS.slice(0, step + 1);

  return (
    <svg viewBox="0 0 480 400" className="h-auto w-full overflow-visible" aria-hidden>
      {kind === "hub" ? (
        <>
          {AGENTS.map((p, i) => (
            <path key={i} d={`M${p[0]} ${p[1]} L${C[0]} ${C[1]}`} className="stroke-fg/20" />
          ))}
          <g key={`${step}-${run}`}>
            <Ride d={via.d} len={via.len} dur={1400} hold />
          </g>
          <rect x={C[0] - 34} y={C[1] - 34} width={68} height={68} rx={2} className="fill-card stroke-fg/40" />
          <text x={C[0]} y={C[1] - 6} textAnchor="middle" className="fill-fg font-sans text-[12.5px] font-medium">
            broker
          </text>
          {/* The queue: a slot fills while the message waits its turn. */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={C[0] - 20 + i * 14} y={C[1] + 8} width={10} height={10} className="fill-none stroke-fg/30" />
          ))}
          <rect key={`q-${step}-${run}`} x={C[0] - 20} y={C[1] + 8} width={10} height={10} className="kit-motion p2p-queue fill-lime" />
        </>
      ) : (
        <>
          {talked.map(([x, y], i) => (
            <path
              key={`${x}-${y}`}
              d={`M${AGENTS[x][0]} ${AGENTS[x][1]} L${AGENTS[y][0]} ${AGENTS[y][1]}`}
              className={`transition-[stroke] duration-500 ${i === talked.length - 1 ? "stroke-[color-mix(in_srgb,var(--color-lime)_55%,transparent)]" : "stroke-fg/22"}`}
            />
          ))}
          <path d={lookup.d} fill="none" strokeDasharray="3 4" className="stroke-fg/14" />
          <g key={`${step}-${run}`}>
            <Ride d={lookup.d} len={lookup.len} dur={420} />
            <Ride d={direct.d} len={direct.len} dur={800} delay={480} />
          </g>
          <rect x={REGISTRY.x} y={REGISTRY.y} width={REGISTRY.w} height={REGISTRY.h} rx={2} className="fill-card stroke-fg/30" strokeDasharray="3 3" />
          <text x={REGISTRY.x + REGISTRY.w / 2} y={REGISTRY.y + 19} textAnchor="middle" className="fill-dim font-mono text-[10.5px]">
            registry
          </text>
        </>
      )}
      {AGENTS.map((p, i) => (
        <Agent key={i} p={p} lit={i === a || i === b} />
      ))}
    </svg>
  );
}

export function HubVsDirect() {
  return SKY ? <SkyHubVsDirect /> : <GreenHubVsDirect />;
}

function GreenHubVsDirect() {
  const { ref, step, run } = useStepper<HTMLDivElement>(PAIRS.length, DURATIONS);
  return (
    <div ref={ref} className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-2">
      <figure className="flex flex-col bg-bg p-5 sm:p-8">
        <figcaption className="flex items-baseline justify-between gap-4">
          <span className="text-[17px] font-medium tracking-[-0.015em] text-soft">Through a broker</span>
          <span className="font-mono text-[12px] text-dim">2 hops + a queue</span>
        </figcaption>
        <div className="mx-auto mt-6 w-full max-w-[440px]">
          <Panel kind="hub" step={step} run={run} />
        </div>
        <p className="mt-4 text-[14px] leading-[1.55] text-dim">
          Every message goes in to the gateway or broker and back out, through its queue.
        </p>
      </figure>
      <figure className="flex flex-col bg-bg p-5 sm:p-8">
        <figcaption className="flex items-baseline justify-between gap-4">
          <span className="text-[17px] font-medium tracking-[-0.015em] text-fg">Direct, with Pilot</span>
          <span className="font-mono text-[12px] text-lime-ink">0 hops in between</span>
        </figcaption>
        <div className="mx-auto mt-6 w-full max-w-[440px]">
          <Panel kind="direct" step={step} run={run} />
        </div>
        <p className="mt-4 text-[14px] leading-[1.55] text-dim">
          A thin registry handles discovery. Then the packet goes straight to the peer, and each new peer adds one tunnel.
        </p>
      </figure>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site                                                            */
/* ------------------------------------------------------------------ */

/** Six real agents around the ring, so the picture reads as agents talking rather than boxes. */
const SKY_AGENTS: { src: string; name: string; pad?: boolean; mono?: boolean }[] = [
  { src: "/harness/claude-color.svg", name: "Claude Code", pad: true },
  { src: "/harness/codex.svg", name: "Codex" },
  { src: "/harness/openclaw.png", name: "OpenClaw", pad: true },
  { src: "/harness/hermes.png", name: "Hermes" },
  { src: "/harness/gemini.svg", name: "Gemini", pad: true },
  { src: "/harness/muse.svg", name: "Muse", pad: true, mono: true },
];

/** The agents as solid app tiles over the drawing; the two in the current conversation lift and take a sky ring. */
function SkyAgents({ step }: { step: number }) {
  const [a, b] = PAIRS[step];
  return (
    <>
      {AGENTS.map((p, i) => {
        const lit = i === a || i === b;
        const t = SKY_AGENTS[i];
        return (
          <span
            key={i}
            data-lit={lit}
            className="absolute grid aspect-square w-[9.5%] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-[23%] bg-card shadow-tile outline-2 outline-offset-2 outline-transparent transition-[outline-color,scale] duration-300 ease-(--ease-out) data-[lit=true]:scale-110 data-[lit=true]:outline-(--sky-fill)"
            style={{ left: `${(p[0] / 480) * 100}%`, top: `${(p[1] / 400) * 100}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.src}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              draggable={false}
              className={`${t.pad ? "size-[58%] object-contain" : "size-full object-cover"} ${t.mono ? "dark:invert" : ""}`}
            />
          </span>
        );
      })}
    </>
  );
}

function SkyPanel({ kind, step, run, inView }: { kind: "hub" | "direct"; step: number; run: number; inView: boolean }) {
  const [a, b] = PAIRS[step];
  const A = AGENTS[a];
  const B = AGENTS[b];
  const talked = PAIRS.slice(0, step + 1);
  const toHub = `M${A[0]} ${A[1]} L${C[0]} ${C[1]}`;
  const fromHub = `M${C[0]} ${C[1]} L${B[0]} ${B[1]}`;
  const direct = `M${A[0]} ${A[1]} L${B[0]} ${B[1]}`;
  const lookup = curve(A, REG, "x");
  const [queued, setQueued] = useState(false);
  // The broker holds the message for a beat between the two hops.
  useEffect(() => {
    if (kind !== "hub") return;
    const t0 = window.setTimeout(() => setQueued(false), 0);
    const t1 = window.setTimeout(() => setQueued(true), 560);
    const t2 = window.setTimeout(() => setQueued(false), 1120);
    return () => [t0, t1, t2].forEach(window.clearTimeout);
  }, [kind, step, run]);

  return (
    <div className="relative">
      <Stage
        w={480}
        h={400}
        svg={
          kind === "hub" ? (
            <>
              {AGENTS.map((p, i) => (
                <path key={i} d={`M${p[0]} ${p[1]} L${C[0]} ${C[1]}`} className={WIRE} data-lit={i === a || i === b} />
              ))}
              {inView && (
                <g key={`${step}-${run}`}>
                  <Beam d={toHub} run={run} duration={520} delay={40} tail={46} />
                  <Beam d={fromHub} run={run} duration={520} delay={1080} tail={46} />
                </g>
              )}
            </>
          ) : (
            <>
              {talked.map(([x, y], i) => (
                <path
                  key={`${x}-${y}`}
                  d={`M${AGENTS[x][0]} ${AGENTS[x][1]} L${AGENTS[y][0]} ${AGENTS[y][1]}`}
                  className={WIRE}
                  data-lit={i === talked.length - 1}
                />
              ))}
              <path d={lookup} className={WIRE} strokeDasharray="2 5" />
              {inView && (
                <g key={`${step}-${run}`}>
                  <Beam d={lookup} run={run} duration={420} delay={40} tail={36} width={1.5} color="var(--color-mute)" />
                  <Beam d={direct} run={run} duration={760} delay={500} tail={56} />
                </g>
              )}
            </>
          )
        }
      >
        {kind === "hub" ? (
          <div style={at(C[0], C[1], 480, 400, 60)} className="flex flex-col items-center">
            <ObjTile name="server" size={60} lit={queued} />
            <span className="mt-2.5 flex flex-col items-center gap-1.5">
              <span className="text-[13px] leading-4 font-medium text-fg">Broker</span>
              {/* The queue: a slot fills while the message waits its turn. */}
              <span aria-hidden className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`size-[7px] rounded-full transition-colors duration-200 ${
                      i === 0 && queued ? "bg-(--sky-fill)" : "bg-fg/[0.12]"
                    }`}
                  />
                ))}
              </span>
            </span>
          </div>
        ) : (
          <div style={at(REG[0], REG[1], 480, 400, 34)} className="flex flex-col items-center">
            <ObjTile name="server" size={34} />
            <span className="mt-1.5 text-[12px] leading-4 text-mute">Registry</span>
          </div>
        )}
      </Stage>
      <SkyAgents step={step} />
    </div>
  );
}

/** Sky site: the two pictures as flat bordered cards, side by side on the section's hatched panel. */
function SkyHubVsDirect() {
  const { ref, step, run, inView } = useStepper<HTMLDivElement>(PAIRS.length, DURATIONS);
  return (
    <div ref={ref} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
      <figure className={`flex flex-col p-5 sm:p-7 ${FLAT_CARD}`}>
        <figcaption className="flex items-baseline justify-between gap-4">
          <span className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-mute">Through a broker</span>
          <span className="text-[13px] text-mute">2 hops and a queue</span>
        </figcaption>
        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <SkyPanel kind="hub" step={step} run={run} inView={inView} />
        </div>
      </figure>
      <figure className={`flex flex-col p-5 sm:p-7 ${FLAT_CARD}`}>
        <figcaption className="flex items-baseline justify-between gap-4">
          <span className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">Direct, with Pilot</span>
          <span className="rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12px] leading-4 font-medium text-(--sky-accent)">0 hops in between</span>
        </figcaption>
        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <SkyPanel kind="direct" step={step} run={run} inView={inView} />
        </div>
      </figure>
    </div>
  );
}
