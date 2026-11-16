import type { ReactNode, SVGProps } from "react";
import "./iso.css";

/*
 * A tiny isometric drawing kit for variant C. Everything is SVG in grid units:
 * x runs down-right, y runs down-left, z runs up. Faces take their colours from
 * CSS variables (iso.css), so every scene follows the light and dark themes.
 */

/** Half a tile's width and height on screen, and one unit of height, in px. */
export const TILE = { w: 34, h: 17, z: 30 };

export type Pt = [number, number, number?];

/** Grid point → screen point. */
export function iso(x: number, y: number, z = 0): [number, number] {
  return [(x - y) * TILE.w, (x + y) * TILE.h - z * TILE.z];
}

const pts = (list: [number, number][]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

export type Tone = "paper" | "lime" | "ink" | "glass";

/** A box from (x, y, z) with width w (along x), depth d (along y) and height h. */
export function IsoBox({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  tone = "paper",
  className = "",
  children,
  ...rest
}: { x: number; y: number; z?: number; w: number; d: number; h: number; tone?: Tone; children?: ReactNode } & Omit<
  SVGProps<SVGGElement>,
  "x" | "y" | "z" | "d"
>) {
  const top = pts([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]);
  const left = pts([iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z)]);
  const right = pts([iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z)]);
  return (
    <g className={`iso iso-${tone} ${className}`} {...rest}>
      <polygon className="iso-l" points={left} />
      <polygon className="iso-r" points={right} />
      <polygon className="iso-t" points={top} />
      {children}
    </g>
  );
}

/** A flat shape lying on a plane at height z (a pad, a marking, a district). */
export function IsoTile({
  x,
  y,
  z = 0,
  w,
  d,
  className = "",
  ...rest
}: { x: number; y: number; z?: number; w: number; d: number } & Omit<SVGProps<SVGPolygonElement>, "x" | "y" | "z" | "d">) {
  return (
    <polygon
      className={className}
      points={pts([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)])}
      {...rest}
    />
  );
}

/** A path through grid points, e.g. a tunnel. Returns the SVG path string too, for packets. */
export function isoPath(points: Pt[]) {
  return points
    .map(([x, y, z = 0], i) => {
      const [a, b] = iso(x, y, z);
      return `${i ? "L" : "M"} ${a.toFixed(1)} ${b.toFixed(1)}`;
    })
    .join(" ");
}

/** A lime tunnel between grid points, with an optional stream of packets riding it. */
export function IsoTunnel({
  points,
  packets = 0,
  duration = 3,
  on = true,
  dashed = false,
  className = "",
}: {
  points: Pt[];
  packets?: number;
  duration?: number;
  on?: boolean;
  dashed?: boolean;
  className?: string;
}) {
  const d = isoPath(points);
  return (
    <g className={`iso-tunnel ${className}`} data-on={on}>
      <path d={d} className="iso-tunnel-bed" />
      <path d={d} className={dashed ? "iso-tunnel-dash" : "iso-tunnel-line"} pathLength={1} />
      {on &&
        Array.from({ length: packets }, (_, i) => (
          <g key={i} className="iso-packet">
            <path d="M0 -4.5 L7 -1 L0 2.5 L-7 -1 Z" className="iso-packet-top" />
            <path d="M-7 -1 L0 2.5 L0 6 L-7 2.5 Z" className="iso-packet-l" />
            <path d="M7 -1 L0 2.5 L0 6 L7 2.5 Z" className="iso-packet-r" />
            <animateMotion dur={`${duration}s`} begin={`${(-i * duration) / packets}s`} repeatCount="indefinite" path={d} />
          </g>
        ))}
    </g>
  );
}

/** A label floating above a grid point: a pill with an optional logo and a second line. */
export function IsoTag({
  at,
  label,
  sub,
  logo,
  mono = false,
  invertLogo = false,
  tone = "card",
  className = "",
}: {
  at: Pt;
  label: string;
  sub?: string;
  logo?: string;
  mono?: boolean;
  invertLogo?: boolean;
  tone?: "card" | "lime" | "ink";
  className?: string;
}) {
  const [cx, cy] = iso(at[0], at[1], at[2] ?? 0);
  const charW = mono ? 7.3 : 6.9;
  const textW = Math.max(label.length * charW, sub ? sub.length * 6.1 : 0);
  const w = Math.round(textW + (logo ? 44 : 24));
  const h = sub ? 42 : 30;
  const x = cx - w / 2;
  const y = cy - h - 12;
  return (
    <g className={`iso-tag iso-tag-${tone} ${className}`}>
      <line x1={cx} y1={cy - 12} x2={cx} y2={cy - 2} className="iso-tag-stem" />
      <rect x={x} y={y} width={w} height={h} rx={h / 2.4} className="iso-tag-bg" />
      {logo && (
        <image
          href={logo}
          x={x + 9}
          y={y + h / 2 - 9}
          width={18}
          height={18}
          preserveAspectRatio="xMidYMid meet"
          className={invertLogo ? "iso-invert" : undefined}
        />
      )}
      <text x={x + (logo ? 33 : 12)} y={sub ? y + 17 : y + 19.5} className={`iso-tag-label ${mono ? "iso-mono" : ""}`}>
        {label}
      </text>
      {sub && (
        <text x={x + (logo ? 33 : 12)} y={y + 32} className="iso-tag-sub">
          {sub}
        </text>
      )}
    </g>
  );
}

/* ---------------- Machines ---------------- */

/** A laptop, open, at (x, y). About 2 × 1.4 tiles. */
export function Laptop({ x, y, z = 0, lit = false }: { x: number; y: number; z?: number; lit?: boolean }) {
  return (
    <g>
      <IsoBox x={x} y={y} z={z} w={2} d={1.4} h={0.12} />
      <IsoBox x={x} y={y} z={z + 0.12} w={2} d={0.08} h={1.25} tone={lit ? "lime" : "paper"} />
      <polygon
        className="iso-display"
        points={pts([iso(x + 0.12, y + 0.08, z + 0.24), iso(x + 1.88, y + 0.08, z + 0.24), iso(x + 1.88, y + 0.08, z + 1.27), iso(x + 0.12, y + 0.08, z + 1.27)])}
      />
      <polygon
        className="iso-display-glow"
        points={pts([iso(x + 0.3, y + 0.08, z + 0.95), iso(x + 0.55, y + 0.08, z + 0.95), iso(x + 0.55, y + 0.08, z + 1.08), iso(x + 0.3, y + 0.08, z + 1.08)])}
      />
      <IsoTile x={x + 0.25} y={y + 0.35} z={z + 0.121} w={1.5} d={0.8} className="iso-keys" />
    </g>
  );
}

/** A server: a tall box with drive slots on its side. */
export function Server({ x, y, z = 0, h = 2.2, lit = false }: { x: number; y: number; z?: number; h?: number; lit?: boolean }) {
  const slots = [0.45, 0.9, 1.35, 1.8].filter((s) => s < h - 0.2);
  return (
    <IsoBox x={x} y={y} z={z} w={1.3} d={1.3} h={h} tone={lit ? "lime" : "paper"}>
      {slots.map((s) => {
        const [a1, b1] = iso(x + 1.3, y + 0.25, z + s);
        const [a2, b2] = iso(x + 1.3, y + 1.05, z + s);
        return <line key={s} x1={a1} y1={b1} x2={a2} y2={b2} className="iso-slot" />;
      })}
      {(() => {
        const [lx, ly] = iso(x + 1.3, y + 0.2, z + h - 0.25);
        return <circle cx={lx} cy={ly} r={2.6} className="iso-led" />;
      })()}
    </IsoBox>
  );
}

/** A stack of containers, one of them lime. */
export function Containers({ x, y, z = 0, lime = 1 }: { x: number; y: number; z?: number; lime?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <IsoBox key={i} x={x} y={y} z={z + i * 0.62} w={1.8} d={1.1} h={0.55} tone={i === lime ? "lime" : "paper"} />
      ))}
    </g>
  );
}

/** A tower for the backbone: the registry (disks) or the beacon (a light with rings). */
export function Tower({ x, y, z = 0, kind }: { x: number; y: number; z?: number; kind: "registry" | "beacon" }) {
  const [tx, ty] = iso(x + 0.45, y + 0.45, z + 3.1);
  return (
    <g>
      <IsoBox x={x} y={y} z={z} w={0.9} d={0.9} h={2.6} tone="ink" />
      {kind === "registry" ? (
        [0, 1, 2].map((i) => <IsoBox key={i} x={x - 0.15} y={y - 0.15} z={z + 2.6 + i * 0.22} w={1.2} d={1.2} h={0.16} tone={i === 2 ? "lime" : "paper"} />)
      ) : (
        <g>
          <IsoBox x={x + 0.2} y={y + 0.2} z={z + 2.6} w={0.5} d={0.5} h={0.5} tone="lime" />
          <ellipse cx={tx} cy={ty} rx={26} ry={13} className="iso-ring" />
          <ellipse cx={tx} cy={ty} rx={26} ry={13} className="iso-ring iso-ring-2" />
        </g>
      )}
    </g>
  );
}

/** A phone lying flat-ish, standing on its edge. */
export function Phone({ x, y, z = 0 }: { x: number; y: number; z?: number }) {
  return (
    <g>
      <IsoBox x={x} y={y} z={z} w={0.9} d={0.12} h={1.7} tone="ink" />
      <polygon
        className="iso-screen"
        points={pts([iso(x + 0.08, y + 0.12, z + 0.12), iso(x + 0.82, y + 0.12, z + 0.12), iso(x + 0.82, y + 0.12, z + 1.58), iso(x + 0.08, y + 0.12, z + 1.58)])}
      />
    </g>
  );
}

/** The scene: an SVG sized to the bounds of the drawing, scaling with its container. */
export function IsoScene({
  view,
  className = "",
  label,
  children,
}: {
  view: [number, number, number, number];
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={view.join(" ")}
      className={`iso-scene block h-auto w-full overflow-visible ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}
