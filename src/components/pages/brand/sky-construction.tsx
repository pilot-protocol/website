"use client";

import { useInView } from "@/lib/hooks";

/*
 * The sky site's P, drawn over its own geometry. Every guide sits on a real edge of the path in
 * logo.tsx (PilotMarkP, units are the path's own: 18 × 24): a grid of 6-unit squares, the two corners
 * of radius 6, and the three parallel 45° cuts.
 */

const P =
  "M6 24H0V12H6V24ZM12 0C15.3137 0 18 2.68629 18 6V12L17.9922 12.3086C17.8368 15.3767 15.3767 17.8368 12.3086 17.9922L12 18H6L12 12V6H6L0 12V6L6 0H12Z";

const S = 16; // drawing scale: one unit = 16px
const W = 1200;
const H = 560;
const OX = (W - 18 * S) / 2;
const OY = (H - 24 * S) / 2;
const X = (u: number) => OX + u * S;
const Y = (u: number) => OY + u * S;

const COLS = [0, 6, 12, 18];
const ROWS = [0, 6, 12, 18, 24];
// Corner circles: the bowl's two rounded corners, radius 6.
const CIRCLES = [
  [12, 6],
  [12, 12],
];
// The three 45° cuts, each a point on it: the top-left chamfer and the two sides of the counter.
const CUTS = [
  [0, 6],
  [0, 12],
  [6, 18],
];

type DrawProps = { on: boolean; labels: boolean };

/** A label on a card-coloured pill, so the guides pass under it rather than through it. */
function Note({ x, y, anchor = "start", children }: { x: number; y: number; anchor?: "start" | "end"; children: string }) {
  const w = children.length * 7 + 20;
  return (
    <g>
      <rect x={anchor === "end" ? x - w : x} y={y - 12} width={w} height={24} rx={12} className="fill-bg-deep" />
      <text x={anchor === "end" ? x - 10 : x + 10} y={y + 4.5} textAnchor={anchor}>
        {children}
      </text>
    </g>
  );
}

function Drawing({ on, labels }: DrawProps) {
  let k = 0;
  const draw = (delay = k++ * 70) =>
    ({
      pathLength: 1,
      strokeDasharray: 1,
      strokeDashoffset: on ? 0 : 1,
      style: { transition: `stroke-dashoffset 1100ms var(--ease-out) ${delay}ms` },
    }) as const;
  const guide = { fill: "none", className: "stroke-fg", strokeOpacity: 0.16, strokeWidth: 1, vectorEffect: "non-scaling-stroke" } as const;
  const strong = { ...guide, strokeOpacity: 0.32 };
  const fade = (delay: number) => ({ opacity: on ? 1 : 0, transition: `opacity 700ms ease ${delay}ms` });

  return (
    <>
      {/* The module grid, run out to the edges. */}
      {ROWS.map((r) => (
        <line key={`r${r}`} x1={0} x2={W} y1={Y(r)} y2={Y(r)} {...guide} {...draw()} />
      ))}
      {COLS.map((c) => (
        <line key={`c${c}`} x1={X(c)} x2={X(c)} y1={0} y2={H} {...guide} {...draw()} />
      ))}

      {/* The cuts, extended both ways at 45°. */}
      {CUTS.map(([x, y]) => {
        const t = 40;
        return <line key={`d${x}-${y}`} x1={X(x - t)} y1={Y(y + t)} x2={X(x + t)} y2={Y(y - t)} {...strong} strokeDasharray="4 6" style={fade(400)} />;
      })}

      {/* The two rounded corners. */}
      {CIRCLES.map(([cx, cy]) => (
        <g key={`o${cx}-${cy}`}>
          <circle cx={X(cx)} cy={Y(cy)} r={6 * S} {...strong} {...draw()} />
          <circle cx={X(cx)} cy={Y(cy)} r={2.5} className="fill-fg" fillOpacity={on ? 0.45 : 0} style={{ transition: "fill-opacity 600ms ease 900ms" }} />
        </g>
      ))}

      {/* The mark: outline draws in, then fills. */}
      <g transform={`translate(${OX} ${OY}) scale(${S})`}>
        <path
          d={P}
          className="fill-(--sky-fill) stroke-(--sky-fill)"
          fillOpacity={on ? 1 : 0}
          strokeWidth={1 / S}
          {...draw(500)}
          style={{
            transition: "stroke-dashoffset 1600ms var(--ease-out) 500ms, fill-opacity 900ms var(--ease-out) 1500ms",
          }}
        />
      </g>

      {/* Measurements, in units of the path. */}
      {labels && (
        <g className="fill-mute text-[13px]" style={fade(1600)}>
          <line x1={X(0)} x2={X(18)} y1={Y(-2.2)} y2={Y(-2.2)} className="stroke-mute" strokeOpacity={0.6} />
          <line x1={X(0)} x2={X(0)} y1={Y(-2.7)} y2={Y(-1.7)} className="stroke-mute" strokeOpacity={0.6} />
          <line x1={X(18)} x2={X(18)} y1={Y(-2.7)} y2={Y(-1.7)} className="stroke-mute" strokeOpacity={0.6} />
          <rect x={X(9) - 18} y={Y(-2.2) - 10} width={36} height={20} rx={10} className="fill-bg-deep" />
          <text x={X(9)} y={Y(-2.2) + 4.5} textAnchor="middle">
            18
          </text>

          <line x1={X(20.2)} x2={X(20.2)} y1={Y(0)} y2={Y(24)} className="stroke-mute" strokeOpacity={0.6} />
          <line x1={X(19.7)} x2={X(20.7)} y1={Y(0)} y2={Y(0)} className="stroke-mute" strokeOpacity={0.6} />
          <line x1={X(19.7)} x2={X(20.7)} y1={Y(24)} y2={Y(24)} className="stroke-mute" strokeOpacity={0.6} />
          <rect x={X(20.2) - 18} y={Y(12) - 10} width={36} height={20} rx={10} className="fill-bg-deep" />
          <text x={X(20.2)} y={Y(12) + 4.5} textAnchor="middle">
            24
          </text>

          <Note x={X(-1.2)} y={Y(3)} anchor="end">
            One module, 6 units
          </Note>
          <Note x={X(23.2)} y={Y(6)}>Corners of radius 6</Note>
          <Note x={X(-1.2)} y={Y(21)} anchor="end">
            Three parallel cuts at 45°
          </Note>
        </g>
      )}
    </>
  );
}

const LABEL =
  "The Pilot P drawn over its construction: a grid of 6-unit squares, three wide and four tall, two rounded corners of radius 6, and three parallel cuts at 45 degrees.";

export function SkyConstruction() {
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  // Phones get a tighter crop around the mark; the measurements would be too small to read.
  const crop = `${X(-7)} ${Y(-5)} ${32 * S} ${34 * S}`;
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[12px] border border-(--sky-card-line) bg-card">
      <svg viewBox={`0 0 ${W} ${H}`} className="hidden h-auto w-full sm:block" role="img" aria-label={LABEL}>
        <Drawing on={on} labels />
      </svg>
      <svg viewBox={crop} className="block h-auto w-full sm:hidden" role="img" aria-label={LABEL}>
        <Drawing on={on} labels={false} />
      </svg>
    </div>
  );
}
