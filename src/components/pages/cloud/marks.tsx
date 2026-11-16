import type { CSSProperties, ReactNode, SVGProps } from "react";
import { BrandMark } from "@/components/v4/logos";
import { logo } from "./assets";

/* eslint-disable @next/next/no-img-element */

/*
 * Sky: the small real things the Cloud page draws with. The AI apps' own marks (single-colour ones follow the
 * theme), the sign-in providers' marks, and the circle badges from Pilot Cloud's Friends screen (a heart for close
 * friends, a paw for friends, a bone for acquaintances).
 */

/** An AI app's mark, by the name the page writes ("Claude", "ChatGPT", "Muse"…). Decorative. */
export function AppMark({ app, className = "size-5" }: { app: string; className?: string }) {
  const c = logo(app);
  if (c.mark) return <BrandMark brand={c.mark} className={`text-fg ${className}`} />;
  return <img src={c.logo} alt="" aria-hidden width={24} height={24} draggable={false} className={`shrink-0 object-contain ${className}`} />;
}

/** A single-colour mark from public/logos, filled with the text colour (Google, GitHub). */
export function MaskMark({ file, className = "size-4" }: { file: string; className?: string }) {
  const mask = `url(/logos/${file}) center / contain no-repeat`;
  return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={{ mask, WebkitMask: mask } as CSSProperties} />;
}

type Circle = "close" | "friends" | "acquaintances";

/** The circle badges as Pilot Cloud draws them: a round chip in the circle's colour with its glyph in white. */
const BADGE: Record<Circle, { bg: string; glyph: (p: SVGProps<SVGSVGElement>) => ReactNode }> = {
  close: {
    bg: "#e5484d",
    glyph: (p) => (
      <svg viewBox="0 0 16 16" fill="currentColor" {...p}>
        <path d="M8 13.6 2.9 8.7A3.15 3.15 0 0 1 7.4 4.3L8 4.9l.6-.6a3.15 3.15 0 0 1 4.5 4.4L8 13.6Z" />
      </svg>
    ),
  },
  friends: {
    bg: "#e8912d",
    glyph: (p) => (
      <svg viewBox="0 0 16 16" fill="currentColor" {...p}>
        <ellipse cx="4.1" cy="6.6" rx="1.35" ry="1.7" />
        <ellipse cx="6.6" cy="4.4" rx="1.35" ry="1.75" />
        <ellipse cx="9.4" cy="4.4" rx="1.35" ry="1.75" />
        <ellipse cx="11.9" cy="6.6" rx="1.35" ry="1.7" />
        <path d="M8 7.6c1.9 0 3.6 2.1 3.6 3.6 0 1.1-.8 1.6-1.7 1.6-.8 0-1.2-.4-1.9-.4s-1.1.4-1.9.4c-.9 0-1.7-.5-1.7-1.6C4.4 9.7 6.1 7.6 8 7.6Z" />
      </svg>
    ),
  },
  acquaintances: {
    bg: "#4f8fe8",
    glyph: (p) => (
      <svg viewBox="0 0 16 16" fill="currentColor" {...p}>
        <g transform="rotate(-35 8 8)">
          <rect x="4" y="6.9" width="8" height="2.2" rx="0.4" />
          <circle cx="3.9" cy="6.5" r="1.75" />
          <circle cx="3.9" cy="9.5" r="1.75" />
          <circle cx="12.1" cy="6.5" r="1.75" />
          <circle cx="12.1" cy="9.5" r="1.75" />
        </g>
      </svg>
    ),
  },
};

export function CircleBadge({ circle, className = "size-5" }: { circle: Circle; className?: string }) {
  const b = BADGE[circle];
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full text-white ${className}`} style={{ background: b.bg }}>
      {b.glyph({ className: "size-[62%]" })}
    </span>
  );
}

const g = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function MailGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg {...g} className={className}>
      <rect x="1.9" y="3.4" width="12.2" height="9.2" rx="1.8" />
      <path d="m2.6 4.6 5.4 4 5.4-4" />
    </svg>
  );
}

export function FileGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg {...g} className={className}>
      <path d="M4 1.9h5.2L12.4 5v8.1c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V2.9c0-.55.45-1 1-1Z" />
      <path d="M9 2v3.2h3.3" />
    </svg>
  );
}

export function ArrowUpGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg {...g} strokeWidth={1.6} className={className}>
      <path d="M8 13V3.4M3.8 7.4 8 3.2l4.2 4.2" />
    </svg>
  );
}

/** A sandbox: an open box, for "one per account". */
export function BoxGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg {...g} className={className}>
      <path d="M8 1.9 13.6 5v6L8 14.1 2.4 11V5L8 1.9Z" />
      <path d="M2.6 5.1 8 8.1l5.4-3M8 8.1v5.8" />
    </svg>
  );
}

export function TrashGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg {...g} className={className}>
      <path d="M2.6 4.3h10.8M6.3 4.2V2.8c0-.4.3-.7.7-.7h2c.4 0 .7.3.7.7v1.4M4 4.4l.6 8.6c0 .6.5 1 1.1 1h4.6c.6 0 1.1-.4 1.1-1l.6-8.6" />
      <path d="M6.6 7v4.3M9.4 7v4.3" />
    </svg>
  );
}
