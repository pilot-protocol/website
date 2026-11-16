import type { ReactNode, SVGProps } from "react";
import { BrandMark } from "@/components/v4/logos";

/* Small pieces the sky App Store page's visuals share: platform marks and one family of line glyphs. */

/** Where an app runs, as the Apple and Tux marks (in the text colour), with the names for screen readers. */
export function PlatformMarks({ mac, linux, className = "size-[15px]" }: { mac?: boolean; linux?: boolean; className?: string }) {
  const names = [mac && "macOS", linux && "Linux"].filter(Boolean).join(" and ");
  return (
    <span className="inline-flex items-center gap-1.5 text-fg/75" title={names}>
      {mac && <BrandMark brand="apple" className={className} />}
      {linux && <BrandMark brand="linux" className={className} />}
      <span className="sr-only">{names}</span>
    </span>
  );
}

/** A 20px line glyph: 1.5px strokes, round joins, in the text colour. */
function G({ children, ...rest }: { children: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

type GlyphProps = SVGProps<SVGSVGElement>;

export const Glyph = {
  /** A terminal prompt. */
  terminal: (p: GlyphProps) => (
    <G {...p}>
      <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.5" />
      <path d="m6.25 8 2.25 2-2.25 2M10.5 12.5h3.25" />
    </G>
  ),
  /** A data directory. */
  folder: (p: GlyphProps) => (
    <G {...p}>
      <path d="M2.75 6.25c0-1.1.9-2 2-2h3l1.75 1.75h5.75c1.1 0 2 .9 2 2v6.75c0 1.1-.9 2-2 2H4.75c-1.1 0-2-.9-2-2V6.25Z" />
    </G>
  ),
  /** A server that is running. */
  server: (p: GlyphProps) => (
    <G {...p}>
      <rect x="3" y="3.25" width="14" height="5.5" rx="1.75" />
      <rect x="3" y="11.25" width="14" height="5.5" rx="1.75" />
      <path d="M6.25 6h.01M6.25 14h.01" strokeWidth={2} />
    </G>
  ),
  /** A database. */
  database: (p: GlyphProps) => (
    <G {...p}>
      <ellipse cx="10" cy="5" rx="6.25" ry="2.25" />
      <path d="M3.75 5v10c0 1.24 2.8 2.25 6.25 2.25s6.25-1 6.25-2.25V5M3.75 10c0 1.24 2.8 2.25 6.25 2.25s6.25-1 6.25-2.25" />
    </G>
  ),
  /** A table of rows. */
  table: (p: GlyphProps) => (
    <G {...p}>
      <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2" />
      <path d="M2.75 8h14.5M2.75 12.25h14.5M8 8v8.25" />
    </G>
  ),
  /** A signature (a seal with a check). */
  seal: (p: GlyphProps) => (
    <G {...p}>
      <path d="M10 2.5 12 4l2.45-.2.75 2.35 2.05 1.35-.85 2.3.85 2.3-2.05 1.35-.75 2.35L12 16l-2 1.5L8 16l-2.45.2-.75-2.35-2.05-1.35.85-2.3-.85-2.3 2.05-1.35.75-2.35L8 4l2-1.5Z" />
      <path d="m7.5 10 1.75 1.75L12.75 8.5" />
    </G>
  ),
  /** A pinned hash. */
  hash: (p: GlyphProps) => (
    <G {...p}>
      <path d="M8 3.5 6.5 16.5M13.5 3.5 12 16.5M3.75 7.5h13M3.25 12.5h13" />
    </G>
  ),
  /** A package (the app's tarball). */
  box: (p: GlyphProps) => (
    <G {...p}>
      <path d="m10 2.75 6.5 3.5v7.5L10 17.25l-6.5-3.5v-7.5L10 2.75Z" />
      <path d="m3.5 6.25 6.5 3.5 6.5-3.5M10 9.75v7.5" />
    </G>
  ),
};
