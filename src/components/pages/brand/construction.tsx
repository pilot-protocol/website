"use client";

import { LOGO_MARK_PATH } from "@/components/logo";
import { useInView } from "@/lib/hooks";

/*
 * The mark drawn over its own geometry. Every guide sits on a real edge or
 * center of the path in logo.tsx (units are the path's own: 112.6 × 71).
 */

const S = 4.6; // drawing scale
const W = 1200;
const H = 560;
const OX = (W - 112.58 * S) / 2;
const OY = (H - 71 * S) / 2 + 6;
const X = (u: number) => OX + u * S;
const Y = (u: number) => OY + u * S;

const ROWS = [0.17, 28.1, 41.51, 49.92, 71.14];
const COLS = [0, 27.43, 85.15, 112.58];
const AXIS = 56.29;

// The outer edges extended past the mark, and their mirror images.
const DIAGONALS: [number, number, number, number][] = [
  [-16.46, 47.02, 43.89, -17.4],
  [-12.74, 6.52, 31.28, 85.73],
].flatMap(([x1, y1, x2, y2]) => [
  [x1, y1, x2, y2],
  [112.58 - x1, y1, 112.58 - x2, y2],
]);

const EYES = [39.69, 72.89];
const R = 8.615;

const guide = { fill: "none", className: "stroke-fg", strokeOpacity: 0.2, strokeWidth: 1, vectorEffect: "non-scaling-stroke" } as const;

type DrawProps = { on: boolean; labels: boolean };

function Drawing({ on, labels }: DrawProps) {
  let k = 0;
  const draw = (delay = (k++) * 70) =>
    ({
      pathLength: 1,
      strokeDasharray: 1,
      strokeDashoffset: on ? 0 : 1,
      style: { transition: `stroke-dashoffset 1100ms var(--ease-out) ${delay}ms` },
    }) as const;

  return (
    <>
      {/* Fine background grid in mark units. */}
      <g className="stroke-fg" strokeOpacity={0.035}>
        {Array.from({ length: 40 }, (_, i) => (
          <line key={`v${i}`} x1={X(-60 + i * 6.5)} x2={X(-60 + i * 6.5)} y1={0} y2={H} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={`h${i}`} x1={0} x2={W} y1={Y(-40 + i * 6.5)} y2={Y(-40 + i * 6.5)} />
        ))}
      </g>

      {ROWS.map((r) => (
        <line key={`r${r}`} x1={0} x2={W} y1={Y(r)} y2={Y(r)} {...guide} {...draw()} />
      ))}
      {COLS.map((c) => (
        <line key={`c${c}`} x1={X(c)} x2={X(c)} y1={0} y2={H} {...guide} {...draw()} />
      ))}
      <line x1={X(AXIS)} x2={X(AXIS)} y1={0} y2={H} {...guide} strokeOpacity={0.45} strokeDasharray="4 5" style={{ opacity: on ? 1 : 0, transition: "opacity 800ms ease 200ms" }} />
      {DIAGONALS.map(([x1, y1, x2, y2], i) => (
        <line key={`d${i}`} x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} {...guide} {...draw()} />
      ))}
      {EYES.map((cx) => (
        <g key={cx}>
          <circle cx={X(cx)} cy={Y(28.1)} r={R * S} {...guide} {...draw()} />
          <circle cx={X(cx)} cy={Y(28.1)} r={1.6} className="fill-fg" fillOpacity={on ? 0.5 : 0} style={{ transition: "fill-opacity 600ms ease 900ms" }} />
        </g>
      ))}
      <path d={`M${X(43.59)} ${Y(49.92)}H${X(68.99)}L${X(AXIS)} ${Y(71.14)}Z`} {...guide} {...draw()} />

      {/* The mark: outline draws in, then fills. */}
      <g transform={`translate(${OX} ${OY}) scale(${S})`}>
        <path
          d={LOGO_MARK_PATH}
          className="fill-lime stroke-lime"
          fillOpacity={on ? 1 : 0}
          strokeWidth={0.5 / S}
          {...draw(500)}
          style={{
            transition: "stroke-dashoffset 1600ms var(--ease-out) 500ms, fill-opacity 900ms var(--ease-out) 1500ms",
          }}
        />
      </g>

      {/* Measurements */}
      {labels && (
        <g className="fill-dim font-mono text-[12px]" style={{ opacity: on ? 1 : 0, transition: "opacity 700ms ease 1600ms" }}>
          <line x1={X(0)} x2={X(112.58)} y1={Y(-9)} y2={Y(-9)} className="stroke-dim" strokeWidth={1} />
          <line x1={X(0)} x2={X(0)} y1={Y(-11)} y2={Y(-7)} className="stroke-dim" />
          <line x1={X(112.58)} x2={X(112.58)} y1={Y(-11)} y2={Y(-7)} className="stroke-dim" />
          <rect x={X(AXIS) - 26} y={Y(-9) - 9} width={52} height={18} className="fill-bg-deep" />
          <text x={X(AXIS)} y={Y(-9) + 4} textAnchor="middle">
            112.6
          </text>

          <line x1={X(121)} x2={X(121)} y1={Y(0.17)} y2={Y(71.14)} className="stroke-dim" />
          <line x1={X(119)} x2={X(123)} y1={Y(0.17)} y2={Y(0.17)} className="stroke-dim" />
          <line x1={X(119)} x2={X(123)} y1={Y(71.14)} y2={Y(71.14)} className="stroke-dim" />
          <text x={X(123.5)} y={Y(36)}>
            71
          </text>

          <text x={X(-4)} y={Y(28.1) - 8} textAnchor="end">
            two circles, Ø 17.2
          </text>
          <text x={X(AXIS) + 8} y={H - 14}>
            axis of symmetry
          </text>
          <text x={X(AXIS) + 8} y={Y(-3)}>
            gap 4.3
          </text>
        </g>
      )}
    </>
  );
}

const LABEL =
  "The Pilot mark drawn over its construction lines: two halves around a symmetry axis, two circles of equal size, and a triangle on the center line.";

export function Construction() {
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  // Phones get a tighter crop around the mark; the measurements would be too small to read.
  const crop = `${X(-14)} ${Y(-16)} ${141 * S} ${100 * S}`;
  return (
    <div ref={ref} className="pp-island relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="hidden h-auto w-full sm:block" role="img" aria-label={LABEL}>
        <Drawing on={on} labels />
      </svg>
      <svg viewBox={crop} className="block h-auto w-full sm:hidden" role="img" aria-label={LABEL}>
        <Drawing on={on} labels={false} />
      </svg>
      <p className="absolute bottom-3 left-4 font-mono text-[11px] text-dim max-sm:hidden">Units are the path&apos;s own</p>
    </div>
  );
}
