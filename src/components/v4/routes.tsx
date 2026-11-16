"use client";

import { useEffect, useRef, useState } from "react";
import { PilotMarkP } from "@/components/logo";
import { Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import "./routes.css";

/*
 * "Direct when it can, a layover when it must." One flight card is the object: claude-code to
 * open-meteo-forecast. Above it, one arc on a calm sky with a small plane. The card's timeline lights up
 * step by step as the plane flies. The switch on the card re-routes the arc through the beacon.
 */

type Mode = "direct" | "relay";
type P = { x: number; y: number };

/* The arc lives in a 1000 × 300 box, stretched to the sky's size (strokes don't scale). */
const BOX = { w: 1000, h: 300 };
const A: P = { x: 90, y: 236 };
const B: P = { x: 910, y: 236 };

/** Two quadratic hops, A → mid → B. Direct is one arc split at its apex; relay lands at the beacon. */
type Shape = { c1: P; m: P; c2: P };
const DIRECT_C: P = { x: 500, y: -24 };
const SHAPES: Record<Mode, Shape> = {
  direct: {
    c1: { x: (A.x + DIRECT_C.x) / 2, y: (A.y + DIRECT_C.y) / 2 },
    m: { x: (A.x + 2 * DIRECT_C.x + B.x) / 4, y: (A.y + 2 * DIRECT_C.y + B.y) / 4 },
    c2: { x: (DIRECT_C.x + B.x) / 2, y: (DIRECT_C.y + B.y) / 2 },
  },
  relay: {
    c1: { x: 290, y: 110 },
    m: { x: 500, y: 214 },
    c2: { x: 710, y: 110 },
  },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpP = (a: P, b: P, t: number): P => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const lerpShape = (a: Shape, b: Shape, t: number): Shape => ({ c1: lerpP(a.c1, b.c1, t), m: lerpP(a.m, b.m, t), c2: lerpP(a.c2, b.c2, t) });
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function quad(p0: P, c: P, p1: P, t: number): P {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y };
}
function quadTangent(p0: P, c: P, p1: P, t: number): P {
  return { x: 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p1.x - c.x), y: 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p1.y - c.y) };
}
/** The first part of a quadratic, up to t (de Casteljau). */
function quadHead(p0: P, c: P, p1: P, t: number) {
  const q = lerpP(p0, c, t);
  const end = quad(p0, c, p1, t);
  return `Q${q.x.toFixed(1)} ${q.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}
const fullPath = (s: Shape) => `M${A.x} ${A.y}Q${s.c1.x} ${s.c1.y} ${s.m.x} ${s.m.y}Q${s.c2.x} ${s.c2.y} ${B.x} ${B.y}`;

/* ---------------- The card's story ---------------- */

const STEPS: Record<Mode, { title: string; line: string }[]> = {
  direct: [
    { title: "STUN probe", line: "Each daemon asks the beacon for its public address." },
    { title: "Hole punched", line: "The beacon has both sides send a packet at once, which opens each NAT." },
    { title: "Connected, direct", line: "Packets go straight between the two agents, encrypted." },
  ],
  relay: [
    { title: "Direct path blocked", line: "A symmetric NAT gives every destination a new port, so the punch fails." },
    { title: "Relayed by the beacon", line: "The beacon forwards the packets between the two agents." },
    { title: "Connected, still encrypted", line: "The tunnel stays encrypted end to end on the way through." },
  ],
};

/** One loop, in ms: when each step lights up, when the plane flies, and how long it rests. */
const PLAN: Record<Mode, { legs: { from: number; to: number; at: number; ms: number }[]; steps: number[]; total: number }> = {
  // Direct: probe, punch, then one flight.
  direct: { legs: [{ from: 0, to: 2, at: 1100, ms: 2600 }], steps: [150, 900, 3700], total: 6600 },
  // Relay: blocked, then a hop to the beacon, a short layover, and on.
  relay: {
    legs: [
      { from: 0, to: 1, at: 1000, ms: 1500 },
      { from: 1, to: 2, at: 3100, ms: 1500 },
    ],
    steps: [150, 2500, 4600],
    total: 7500,
  },
};

function Switch({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div role="group" aria-label="Route" className="rt-switch relative grid grid-cols-2 rounded-[10px] p-1">
      <span aria-hidden className="rt-switch-pill absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[7px]" data-mode={mode} />
      {(["direct", "relay"] as const).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => setMode(m)}
          className="rt-switch-btn relative z-10 h-8 rounded-[7px] px-3.5 text-[13px] leading-[18px] font-medium whitespace-nowrap"
        >
          {m === "direct" ? "Direct" : "Via relay"}
        </button>
      ))}
    </div>
  );
}

export function Routes() {
  const [mode, setMode] = useState<Mode>("direct");
  const reduced = usePrefersReducedMotion();
  const [liveRef, onScreen] = useInView<HTMLDivElement>({ once: false, margin: "0px" });

  const sky = useRef<HTMLDivElement>(null);
  const base = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const plane = useRef<HTMLSpanElement>(null);
  const beacon = useRef<HTMLSpanElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const shapeRef = useRef<Shape>(SHAPES.direct);

  // Everything that moves: the arc's shape, the plane, the trail behind it and the timeline. One frame loop.
  useEffect(() => {
    const skyEl = sky.current;
    const baseEl = base.current;
    const trailEl = trail.current;
    const planeEl = plane.current;
    const beaconEl = beacon.current;
    const list = steps.current;
    if (!skyEl || !baseEl || !trailEl || !planeEl || !beaconEl || !list) return;
    const items = Array.from(list.children) as HTMLElement[];
    const plan = PLAN[mode];
    const from = shapeRef.current;
    const to = SHAPES[mode];
    const morphMs = reduced || from === to ? 0 : 750;

    let size = { w: skyEl.clientWidth, h: skyEl.clientHeight };
    const observer = new ResizeObserver(() => {
      size = { w: skyEl.clientWidth, h: skyEl.clientHeight };
    });
    observer.observe(skyEl);

    const pointOn = (s: Shape, u: number) => (u <= 1 ? quad(A, s.c1, s.m, u) : quad(s.m, s.c2, B, u - 1));
    const tangentOn = (s: Shape, u: number) => (u <= 1 ? quadTangent(A, s.c1, s.m, u) : quadTangent(s.m, s.c2, B, u - 1));
    const headOf = (s: Shape, u: number) =>
      u <= 0
        ? ""
        : u <= 1
          ? `M${A.x} ${A.y}${quadHead(A, s.c1, s.m, u)}`
          : `M${A.x} ${A.y}Q${s.c1.x} ${s.c1.y} ${s.m.x} ${s.m.y}${quadHead(s.m, s.c2, B, u - 1)}`;

    const place = (s: Shape, u: number, alpha: number) => {
      const p = pointOn(s, Math.max(0.0001, Math.min(1.9999, u)));
      const d = tangentOn(s, Math.max(0.0001, Math.min(1.9999, u)));
      const sx = size.w / BOX.w;
      const sy = size.h / BOX.h;
      const angle = (Math.atan2(d.y * sy, d.x * sx) * 180) / Math.PI;
      planeEl.style.transform = `translate3d(${(p.x * sx).toFixed(1)}px, ${(p.y * sy).toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg)`;
      planeEl.style.opacity = alpha.toFixed(3);
      trailEl.setAttribute("d", headOf(s, u));
    };
    const light = (n: number) => items.forEach((el, i) => (el.dataset.lit = String(i < n)));
    const showShape = (s: Shape) => {
      baseEl.setAttribute("d", fullPath(s));
      beaconEl.style.transform = `translate3d(${((s.m.x / BOX.w) * size.w).toFixed(1)}px, ${((s.m.y / BOX.h) * size.h).toFixed(1)}px, 0)`;
    };

    // Static: the finished story.
    if (reduced || !onScreen) {
      shapeRef.current = to;
      showShape(to);
      place(to, 2, 0);
      light(3);
      return () => observer.disconnect();
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const e = now - start;
      // 1. Re-route the arc when the mode changes.
      if (e < morphMs) {
        const k = easeInOut(e / morphMs);
        const s = lerpShape(from, to, k);
        shapeRef.current = s;
        showShape(s);
        place(s, 0, 0);
        trailEl.setAttribute("d", "");
        light(0);
        frame = requestAnimationFrame(tick);
        return;
      }
      shapeRef.current = to;
      showShape(to);
      // 2. The loop: steps light in order while the plane flies.
      const t = (e - morphMs) % plan.total;
      light(plan.steps.filter((at) => t >= at).length);
      let u = 0;
      let alpha = 0;
      for (const leg of plan.legs) {
        if (t >= leg.at) {
          const k = Math.min(1, (t - leg.at) / leg.ms);
          u = lerp(leg.from, leg.to, easeInOut(k));
          alpha = 1;
        }
      }
      // Fade the plane in as it leaves and out as it lands, and rest the finished route before the next loop.
      const first = plan.legs[0];
      const last = plan.legs[plan.legs.length - 1];
      if (t < first.at + 160) alpha = Math.max(0, (t - first.at) / 160);
      const landed = last.at + last.ms;
      if (t > landed) alpha = Math.max(0, 1 - (t - landed) / 400);
      if (t > plan.total - 500) {
        const k = (t - (plan.total - 500)) / 500;
        trailEl.style.opacity = String(1 - k);
      } else {
        trailEl.style.opacity = "1";
      }
      place(to, u, alpha);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mode, onScreen, reduced]);

  const relay = mode === "relay";

  return (
    <section id="routes" aria-labelledby="routes-title" className="rt relative py-24 sm:py-32">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        <Reveal className="max-w-[520px]">
          <h2
            id="routes-title"
            className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.043em] text-balance text-fg"
          >
            Direct when it can,
            <span className="block text-mute">a layover when it must.</span>
          </h2>
          <p className="mt-5 max-w-[460px] text-[17px] leading-[1.55] tracking-[-0.01em] text-pretty text-mute sm:text-[18px]">
            Pilot connects two agents directly whenever the network allows it. When it doesn&apos;t, the beacon carries the
            traffic, and it stays encrypted the whole way.
          </p>
        </Reveal>

        <div ref={liveRef} className="rt-surface relative overflow-hidden rounded-[24px] px-3 pb-3 sm:px-8 sm:pb-8">
          {/* The sky with the route */}
          <div ref={sky} className="rt-sky relative" aria-hidden>
            <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              <path ref={base} d={fullPath(SHAPES.direct)} className="rt-arc" vectorEffect="non-scaling-stroke" />
              <path ref={trail} d="" className="rt-trail" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="rt-end" style={{ left: `${(A.x / BOX.w) * 100}%`, top: `${(A.y / BOX.h) * 100}%` }} />
            <span className="rt-end" style={{ left: `${(B.x / BOX.w) * 100}%`, top: `${(B.y / BOX.h) * 100}%` }} />
            <span ref={beacon} className="rt-beacon" data-on={relay}>
              <span className="rt-end" />
              <span className="rt-beacon-label">
                <PilotMarkP className="h-[10px] w-auto text-(--sky-accent)" />
                Beacon
              </span>
            </span>
            <span ref={plane} className="rt-plane">
              <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
                <g transform="rotate(45 12 12)">
                  <path
                    fillRule="evenodd"
                    d="M15.87 4.033a3.006 3.006 0 0 1 4.243 4.243l-7.822 7.822-3.436 2.668.318.611c.513 1.197.071 2.596-.739 3.406l-2.353-2.429-1.289.443a1.044 1.044 0 0 1-1.441-1.168l.441-1.293-2.43-2.354c.811-.81 2.21-1.252 3.407-.739l.609.311 2.67-3.428 7.822-7.822ZM17.406 13.811l-3.347 3.347 3.626 5.18.85-.608a2.92 2.92 0 0 0 .939-3.783l-2.068-4.136ZM7.011 10.064l3.301-3.301-4.303-2.152a2.92 2.92 0 0 0-3.783.94l-.551.778 5.336 3.735Z"
                  />
                </g>
              </svg>
            </span>
          </div>

          {/* The flight card */}
          <div className="rt-card @container relative mx-auto max-w-[540px] rounded-[20px] bg-card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[13px] leading-[18px] font-medium text-fg">
                <span className="grid size-6 place-items-center rounded-[7px] bg-(--sky-fill) text-white">
                  <PilotMarkP className="h-[11px] w-auto" />
                </span>
                Tunnel
              </span>
              <Switch mode={mode} setMode={setMode} />
            </div>

            <div className="mt-6 grid grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] items-end gap-3 sm:mt-7">
              <div className="min-w-0">
                <p className="truncate font-mono text-[clamp(15px,4.8cqw,22px)] leading-[1.15] tracking-[-0.03em] text-fg">claude-code</p>
                <p className="mt-1 text-[13px] leading-[18px] text-mute">Your agent</p>
              </div>
              <span aria-hidden className="rt-card-line mb-[26px] h-px self-end" />
              <div className="min-w-0 text-right">
                <p className="truncate font-mono text-[clamp(15px,4.8cqw,22px)] leading-[1.15] tracking-[-0.03em] text-fg">
                  open-meteo-forecast
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-mute">Weather data agent</p>
              </div>
            </div>

            <ol ref={steps} className="rt-steps mt-7 sm:mt-8" aria-label={relay ? "Relayed connection" : "Direct connection"}>
              {STEPS[mode].map((s, i) => (
                <li key={`${mode}-${i}`} className="rt-step" data-lit={reduced}>
                  <span aria-hidden className="rt-step-dot" />
                  <p className="text-[15px] leading-[21px] font-medium tracking-[-0.01em]">{s.title}</p>
                  <p className="mt-0.5 text-[13.5px] leading-[19px] text-pretty text-mute">{s.line}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 border-t border-edge pt-4 text-[12.5px] leading-[18px] text-mute sm:mt-7">
              <p>Every tunnel uses X25519 and AES-256-GCM.</p>
              <p className="mt-0.5">
                Ping to <span className="font-mono text-[12px]">open-meteo-forecast</span> · 145 ms, recorded October 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
