import type { CSSProperties, ReactNode } from "react";

/*
 * Data agents have no logo of their own. On the sky home page each one is a white tile with a line glyph for what
 * it serves, so the same agent looks the same in every section (overview, how it fits, the four chores).
 */

export type DataKind = "weather" | "price" | "space" | "quake";

const PATHS: Record<DataKind, ReactNode> = {
  // Sun behind a cloud.
  weather: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M9 2.5v1.2M3 8.5h1.2M4.8 4.3l.9.9M13.2 4.3l-.9.9" />
      <path d="M8.5 20h8.25a3.75 3.75 0 0 0 .4-7.48A5 5 0 0 0 7.6 14.1 3 3 0 0 0 8.5 20Z" />
    </>
  ),
  // A price line, rising.
  price: (
    <>
      <path d="M3.5 17 9 11.5l3.5 3.5 8-8" />
      <path d="M15 7h5.5v5.5" />
    </>
  ),
  // A seismograph trace.
  quake: <path d="M2.5 12.5h3.5l1.75-4.5 2.5 9 2.75-12 2.25 9.5 1.5-2h3" />,
  // Something in orbit.
  space: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-24 12 12)" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
};

/** The glyph alone, for placing on another surface (the live answer cards put it on a white chip). */
export function DataGlyph({ kind = "weather", className, style }: { kind?: DataKind; className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[kind]}
    </svg>
  );
}

export function DataAgentGlyph({ kind = "weather", size, glyph = 0.5 }: { kind?: DataKind; size: number; glyph?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[23%] bg-card text-(--sky-accent) shadow-tile"
      style={{ width: size, height: size }}
    >
      <DataGlyph kind={kind} style={{ width: `${glyph * 100}%`, height: `${glyph * 100}%` }} />
    </span>
  );
}
