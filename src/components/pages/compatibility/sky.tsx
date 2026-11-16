import type { CSSProperties, ReactNode } from "react";
import "@/components/sky/kit.css";
import "./sky.css";

/*
 * Sky-site drawing pieces shared by the compatibility and peer-to-peer diagrams: solid rounded nodes,
 * round packets, walls with ports that open, and the scenario tabs under each diagram.
 * The green site keeps its own square, lime versions; these render only when SKY is true.
 */

export type SkyBox = { x: number; y: number; w: number; h: number };

/** A diagram node: a flat white card with a hairline edge. `lit` gives it a sky-blue edge. */
export function SkyNode({ b, lit, r = 12 }: { b: SkyBox; lit?: boolean; r?: number }) {
  return (
    <rect
      x={b.x + 0.5}
      y={b.y + 0.5}
      width={b.w - 1}
      height={b.h - 1}
      rx={r}
      className={`fill-card transition-[stroke] duration-500 ${lit ? "stroke-(--sky-fill)" : "cpx-node"}`}
    />
  );
}

/**
 * A round packet riding a path (pathLength=100) once, or on a loop: a near-zero dash with round caps, so it
 * reads as a dot. Before it starts and after it ends it sits off the path, so nothing peeks out while parked.
 */
export function SkyRide({
  d,
  size = 9,
  dur,
  delay = 0,
  loop = false,
  hold = false,
  className = "stroke-(--sky-fill)",
}: {
  d: string;
  size?: number;
  dur: number;
  delay?: number;
  loop?: boolean;
  /** Wait halfway along, as in a broker's queue. */
  hold?: boolean;
  className?: string;
}) {
  return (
    <path
      d={d}
      pathLength={100}
      fill="none"
      strokeWidth={size}
      strokeLinecap="round"
      strokeDasharray="0.01 300"
      strokeDashoffset={1}
      className={`kit-motion ${className}`}
      style={{
        animation: `${hold ? "cpx-hold" : "kit-ride"} ${dur}ms var(--ease-in-out) ${delay}ms ${loop ? "infinite" : "1"} both`,
      }}
    />
  );
}

type Port = {
  /** The port's box; only its extent along the wall matters. */
  at: SkyBox;
  /** "open" shows a gap, "closed" a plug, a number opens the plug after that many milliseconds. */
  state: "open" | "closed" | number;
};

/**
 * A network edge drawn as rounded segments with a port at each lane. A closed port is a plug with
 * a small gap either side; an opening one fades its plug out.
 */
export function SkyWall({ wall, ports, gap = 4 }: { wall: SkyBox; ports: Port[]; gap?: number }) {
  const vertical = wall.h >= wall.w;
  const start = vertical ? wall.y : wall.x;
  const end = vertical ? wall.y + wall.h : wall.x + wall.w;
  const t = vertical ? wall.w : wall.h;
  const span = (p: Port): [number, number] => (vertical ? [p.at.y, p.at.y + p.at.h] : [p.at.x, p.at.x + p.at.w]);
  const sorted = [...ports].sort((a, b) => span(a)[0] - span(b)[0]);

  const pieces: { from: number; to: number; plug?: Port }[] = [];
  let cursor = start;
  for (const p of sorted) {
    const [a, b] = span(p);
    pieces.push({ from: cursor, to: a - gap });
    if (p.state !== "open") pieces.push({ from: a, to: b, plug: p });
    cursor = b + gap;
  }
  pieces.push({ from: cursor, to: end });

  return (
    <g>
      {pieces.map((s, i) => {
        const len = s.to - s.from;
        if (len <= 0) return null;
        const rect = vertical ? { x: wall.x, y: s.from, width: t, height: len } : { x: s.from, y: wall.y, width: len, height: t };
        const opening = typeof s.plug?.state === "number";
        return (
          <rect
            key={`${i}-${s.from}`}
            {...rect}
            rx={t / 2}
            className={`fill-(--sky-accent)/16 ${opening ? "cpx-open" : ""}`}
            style={opening ? ({ animationDelay: `${s.plug!.state}ms` } as CSSProperties) : undefined}
          />
        );
      })}
    </g>
  );
}

/** A round step number: solid sky when it's the one playing. */
export function SkyStep({ n, on }: { n: number; on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-6 shrink-0 place-items-center rounded-full text-[12px] leading-none font-medium tabular-nums transition-colors duration-300 ${
        on ? "bg-(--sky-fill) text-white" : "bg-fg/[0.06] text-mute"
      }`}
    >
      {n}
    </span>
  );
}

/**
 * The tabs under a stepped diagram: one flat bordered card per scenario. The one playing is at full contrast,
 * with a thin sky line along its top that fills for as long as the step runs.
 */
export function SkyTabs<T extends { key: string }>({
  items,
  step,
  run,
  ms,
  onPick,
  render,
}: {
  items: readonly T[];
  step: number;
  run: number;
  /** How long each step runs, in milliseconds (already scaled for manual picks). */
  ms: (i: number) => number;
  onPick: (i: number) => void;
  render: (item: T, i: number, on: boolean) => ReactNode;
}) {
  return (
    <ol className="grid grid-cols-1 gap-2.5 md:grid-cols-3 sm:gap-3">
      {items.map((s, i) => {
        const on = i === step;
        return (
          <li key={s.key} className="min-w-0">
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              className="sky-card pressable relative flex h-full w-full flex-col items-start overflow-hidden p-5 text-left sm:p-6"
            >
              <span aria-hidden className="absolute inset-x-5 top-0 h-[2px] overflow-hidden rounded-full sm:inset-x-6">
                {on && (
                  <span
                    key={run}
                    className="kit-motion absolute inset-0 origin-left rounded-full bg-(--sky-fill)"
                    style={{ animation: `cpx-fill ${ms(i)}ms linear both` }}
                  />
                )}
              </span>
              {render(s, i, on)}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
