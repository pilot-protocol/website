import type { ReactNode } from "react";

/*
 * Line icons for the company pages (about, roadmap, press, contact): Nucleo UI outline, 18px, drawn in currentColor
 * at a 1.5 stroke, the same family as the Protocol menu's icons (src/components/sky/nav-icons.tsx).
 */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const G = {
  file: (
    <>
      <path {...S} d="M15.16 6.25h-3.41c-.55 0-1-.45-1-1V1.85" />
      <path {...S} d="M2.75 14.25V3.75c0-1.1.9-2 2-2h5.59c.26 0 .52.1.7.29l3.92 3.92c.19.19.29.44.29.7v7.59c0 1.1-.9 2-2 2h-8.5c-1.1 0-2-.9-2-2Z" />
    </>
  ),
  envelope: (
    <>
      <path {...S} d="m1.75 5.75 6.77 3.73c.3.17.66.17.96 0l6.77-3.73" />
      <rect {...S} x="1.75" y="3.25" width="14.5" height="11.5" rx="2" />
    </>
  ),
  map: (
    <>
      <path {...S} d="M6.25 2.79v10.5M11.75 4.71v10.5" />
      <path
        {...S}
        d="m2.53 3.58 3.43-.77c.19-.04.38-.03.56.04l4.95 1.8c.18.07.37.08.56.04l3-.67c.62-.14 1.22.34 1.22.98v8.9c0 .47-.33.87-.78.98l-3.43.76c-.19.04-.38.03-.56-.04l-4.95-1.8a1 1 0 0 0-.56-.03l-3 .66c-.62.14-1.22-.34-1.22-.98V4.55c0-.47.33-.87.78-.97Z"
      />
    </>
  ),
  bug: (
    <>
      <path {...S} d="M9 15.25v-4.5M6.75 5.75V4.5a2.25 2.25 0 0 1 4.5 0v1.25M4.75 9.75h-3M4.75 7.25A2.75 2.75 0 0 1 2 4.5M4.75 12.25A2.75 2.75 0 0 0 2 15M13.25 9.75h3M13.25 7.25A2.75 2.75 0 0 0 16 4.5M13.25 12.25A2.75 2.75 0 0 1 16 15" />
      <path {...S} d="M6.75 5.75h4.5c1.1 0 2 .9 2 2V11a4.25 4.25 0 0 1-8.5 0V7.75c0-1.1.9-2 2-2Z" />
    </>
  ),
  newspaper: (
    <>
      <path {...S} d="M3.25 15.25h11.5c.83 0 1.5-.67 1.5-1.5v-11H4.75v11c0 .83-.67 1.5-1.5 1.5Z" />
      <path {...S} d="M3.25 15.25c-.83 0-1.5-.67-1.5-1.5v-7M13.25 5.75h-5.5v3.5h5.5v-3.5ZM13.25 12.25h-5.5" />
    </>
  ),
  badge: (
    <>
      <path {...S} d="M10.75 4.25h3.5c1.1 0 2 .9 2 2v6.5c0 1.1-.9 2-2 2H3.75c-1.1 0-2-.9-2-2v-6.5c0-1.1.9-2 2-2h3.5" />
      <path {...S} d="M10.75 2.5v2.75h-3.5V2.5a1.75 1.75 0 0 1 3.5 0ZM10.5 8.25h2.75M10.5 11.25h2.75" />
      <path {...S} fill="currentColor" d="M7.75 8.25h-3v3h3v-3Z" />
    </>
  ),
  shieldCheck: (
    <>
      <path
        {...S}
        d="m9.3 1.85 5.25 1.68c.42.13.7.52.7.95v6.52c0 3.03-4.68 4.75-5.94 5.16a1 1 0 0 1-.62 0c-1.26-.41-5.94-2.13-5.94-5.16V4.48c0-.43.28-.82.7-.95l5.25-1.68a1 1 0 0 1 .6 0Z"
      />
      <path {...S} d="m6.5 9.75 1.6 1.5 3.4-4.5" />
    </>
  ),
  magnifier: (
    <>
      <path {...S} d="m15.75 15.75-4.11-4.11" />
      <circle {...S} cx="7.75" cy="7.75" r="5.5" />
    </>
  ),
  plug: (
    <>
      <path {...S} d="M6.25 4.75v-3M11.75 4.75v-3M9 16.25v-2.5" />
      <path {...S} d="M3.75 4.75h10.5c.55 0 1 .45 1 1V7.5a6.25 6.25 0 0 1-12.5 0V5.75c0-.55.45-1 1-1Z" />
    </>
  ),
  stairs: <path {...S} d="M10.75 2.75v4h-4v4h-4v4.5h12.5V2.75h-4.5Z" />,
  server: (
    <>
      <rect {...S} x="1.75" y="2.75" width="14.5" height="5" rx="1.5" />
      <rect {...S} x="1.75" y="10.25" width="14.5" height="5" rx="1.5" />
      <circle cx="4.25" cy="5.25" r=".75" fill="currentColor" />
      <circle cx="6.75" cy="5.25" r=".75" fill="currentColor" />
      <circle cx="4.25" cy="12.75" r=".75" fill="currentColor" />
      <circle cx="6.75" cy="12.75" r=".75" fill="currentColor" />
    </>
  ),
  user: (
    <>
      <circle {...S} cx="9" cy="4.5" r="2.75" />
      <path
        {...S}
        d="M13.76 15.52c.86-.27 1.31-1.22.95-2.05A6.24 6.24 0 0 0 9 9.75a6.24 6.24 0 0 0-5.71 3.72c-.36.83.09 1.78.95 2.05 1.23.38 2.85.73 4.76.73s3.54-.35 4.76-.73Z"
      />
    </>
  ),
  book: (
    <>
      <path {...S} d="M9 15.05c.17 0 .34-.04.49-.13.65-.37 1.74-.85 3.15-.85.9 0 1.66.2 2.27.44.65.25 1.34-.24 1.34-.94V4.49c0-.35-.18-.68-.49-.86a6.2 6.2 0 0 0-3.14-.87c-1.89 0-3.2.88-3.62 1.19" />
      <path {...S} d="M9 15.05c-.17 0-.34-.04-.49-.13-.65-.37-1.74-.85-3.15-.85-.9 0-1.66.2-2.27.44-.65.25-1.34-.24-1.34-.94V4.49c0-.35.18-.68.49-.86a6.2 6.2 0 0 1 3.14-.87c1.89 0 3.2.88 3.62 1.19v11.1Z" />
    </>
  ),
  pen: (
    <>
      <path {...S} d="M2.75 15.25s3.6-.57 4.55-1.52l7.32-7.32a2.14 2.14 0 0 0-3.03-3.03L4.27 10.7c-.95.95-1.52 4.55-1.52 4.55Z" />
      <path {...S} d="M10 15.25h5.25" />
    </>
  ),
  compass: (
    <>
      <path {...S} d="m12.29 5.71-1.87 4.7-4.7 1.87 1.87-4.7 4.7-1.87Z" />
      <circle {...S} cx="9" cy="9" r="7.25" />
    </>
  ),
  cloud: (
    <>
      <path {...S} d="M13.46 6.89a4.5 4.5 0 0 0-8.84 1.37 3 3 0 0 0 .13 5.99h7.75a3.75 3.75 0 0 0 .96-7.36Z" />
      <path {...S} d="M9.7 8a3.75 3.75 0 0 1 3.76-1.11" />
    </>
  ),
  apps: (
    <>
      <rect {...S} x="2.75" y="10.75" width="4.5" height="4.5" rx="1" />
      <rect {...S} x="10.75" y="10.75" width="4.5" height="4.5" rx="1" />
      <rect {...S} x="2.75" y="2.75" width="4.5" height="4.5" rx="1" />
      <rect {...S} x="10.75" y="2.75" width="4.5" height="4.5" rx="1" transform="rotate(45 13 5)" />
    </>
  ),
  terminal: <path {...S} d="M2.75 14.25 8 9 2.75 3.75M9.5 14.25h5.75" />,
  database: (
    <>
      <ellipse {...S} cx="9" cy="4.25" rx="6.25" ry="2.25" />
      <path {...S} d="M2.75 4.25v9.5c0 1.24 2.8 2.25 6.25 2.25s6.25-1.01 6.25-2.25v-9.5M2.75 9c0 1.24 2.8 2.25 6.25 2.25S15.25 10.24 15.25 9" />
    </>
  ),
  tag: (
    <>
      <path {...S} d="M3.25 2.25h4.92c.53 0 1.04.21 1.42.59l5.75 5.75c.78.78.78 2.05 0 2.83l-3.92 3.92c-.78.78-2.05.78-2.83 0L2.84 9.59a2 2 0 0 1-.59-1.42V3.25c0-.55.45-1 1-1Z" />
      <circle cx="6.25" cy="6.25" r="1.25" fill="currentColor" />
    </>
  ),
  archive: (
    <>
      <path {...S} d="M14.75 6.25v7c0 1.1-.9 2-2 2h-7.5c-1.1 0-2-.9-2-2v-7" />
      <rect {...S} x="1.75" y="2.75" width="14.5" height="3.5" rx="1" />
      <path {...S} d="M7 9.25h4" />
    </>
  ),
  mobile: (
    <>
      <path {...S} d="M10.5 2h-3v.75h3V2Z" />
      <rect {...S} x="3.75" y="1.75" width="10.5" height="14.5" rx="2" />
    </>
  ),
  tablet: (
    <>
      <rect {...S} x="2.75" y="1.75" width="12.5" height="14.5" rx="2" />
      <path {...S} d="M7.75 13.25h2.5" />
    </>
  ),
  laptop: <path {...S} d="M4.25 14.75c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h9.5c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2M.75 14.75h16.5" />,
  pullRequest: (
    <>
      <path {...S} d="M14.25 12.25v-6.5c0-1.1-.9-2-2-2h-3.5M11 6 8.75 3.75 11 1.5M3.75 5.75v6.5" />
      <circle {...S} cx="14.25" cy="14.25" r="2" />
      <circle {...S} cx="3.75" cy="14.25" r="2" />
      <circle {...S} cx="3.75" cy="3.75" r="2" />
    </>
  ),
  check: <path {...S} d="m3.75 9.75 3.25 3.5 7.25-8.5" />,
  x: <path {...S} d="m4.5 4.5 9 9M13.5 4.5l-9 9" />,
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof G;

/** One of the icons above, in an 18px box by default. Decorative: the label sits next to it. */
export function Glyph({ name, className = "size-[18px]" }: { name: GlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className={`shrink-0 ${className}`}>
      {G[name]}
    </svg>
  );
}

/**
 * The object tile: white with the tile shadow, as the home hero's tiles, and light in both themes (as they are), so
 * coloured marks keep their contrast at night. Holds a glyph or a mark, drawn in ink.
 */
export const OBJECT_TILE = "bg-white text-[#141413] shadow-tile dark:bg-[#f2f2ec]";

export function Tile({ children, className = "size-10 rounded-[10px]" }: { children: ReactNode; className?: string }) {
  return <span className={`grid shrink-0 place-items-center ${OBJECT_TILE} ${className}`}>{children}</span>;
}
