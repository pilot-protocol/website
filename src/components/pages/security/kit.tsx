import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { CopyButton } from "@/components/pages/security/kit-client";
import { SkyRule } from "@/components/sky/kit";
import { Packet, Reveal, SmartLink } from "@/components/ui";
import { SITE_VARIANT } from "@/lib/site";
import "@/components/sky/kit.css";
import "./kit.css";

// No "use client" here on purpose: server components import the SKY constants and render these pieces directly.
// The stateful parts live in kit-client.tsx and are re-exported below, so every import path stays the same.
export { CopyButton, useStepper } from "@/components/pages/security/kit-client";

/*
 * Small pieces shared by the security, disclosure, self-hosting, compatibility
 * and peer-to-peer pages: section heads, static code panels, the packet switch,
 * a stepper that runs while it's on screen, and an orthogonal-path helper for
 * the SVG diagrams.
 */

/** The sky site (flight design): product pages pick up the home page's sky surfaces, cards and code colours. */
export const SKY = SITE_VARIANT === "sky";

/**
 * Sky-site building blocks, so every product page uses the same surfaces: one flat neutral panel
 * (the theme's deep background, no gradient) holding solid cards.
 */
export const SKY_SURFACE = "rounded-[28px] bg-bg-deep p-2.5 sm:p-5 lg:p-8";
export const SKY_CARD = "rounded-[20px] bg-card shadow-card";
/**
 * Code on the sky site: a solid card in the page's own theme (white by day, charcoal at night) with the sky code
 * colours (prompts and strings in deep sky blue by day, pale sky at night), in place of the dark terminal island.
 */
export const SKY_CODE = "overflow-hidden rounded-[16px] bg-card shadow-card";
/** A quiet sentence-case label, as on the home page. */
export const SKY_LABEL = "text-[13px] leading-5 text-mute";

/*
 * The 13 Nov system (Figma 233:1195; src/components/sky/kit.*), as plain class strings so server components can
 * use them too (constants exported from the "use client" sky kit arrive in a server component as references).
 *
 * - SKY_H2: the section heading. 48px, tracking -0.0625em, two-tone: claim in fg, qualifier in mute.
 * - SKY_LEDE: the 18/27 mute lede under it.
 * - FLAT_CARD / FLAT_CODE: the flat bordered card (`.sky-card`), and the same for code, in place of floating cards.
 * - SKY_PILL: the blue tag.
 */
export const SKY_H2 = "text-[clamp(34px,4.6vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg";
export const SKY_LEDE = "text-[16px] leading-[1.55] text-pretty text-mute sm:text-[18px] sm:leading-[27px] sm:tracking-[-0.012em]";
export const FLAT_CARD = "sky-card";
export const FLAT_CODE = "sky-card overflow-hidden";
export const SKY_PILL =
  "inline-flex items-center gap-1.5 rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12px] leading-4 font-medium text-(--sky-accent)";

/** Second half of a two-part heading, set back in grey. */
export const Soft = ({ children }: { children: ReactNode }) => <span className="text-mute">{children}</span>;

export function SectionHead({
  id,
  kicker,
  title,
  lede,
  center = false,
  className = "",
  children,
}: {
  id?: string;
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  /** Sky site: centre the heading and lede over the section, as most of the Figma's sections do. */
  center?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const mid = SKY && center;
  return (
    <Reveal className={`${SKY ? "max-w-[760px]" : "max-w-[720px]"} ${mid ? "mx-auto flex flex-col items-center text-center" : ""} ${className}`}>
      {/* The sky site leads with the heading alone; the green site keeps its mono kicker. */}
      {kicker && !SKY && (
        <p className="mb-5 flex items-center gap-2.5 font-mono text-[13px] text-dim">
          <Packet />
          {kicker}
        </p>
      )}
      <h2
        id={id}
        className={
          SKY ? SKY_H2 : "text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg"
        }
      >
        {title}
      </h2>
      {lede && (
        <div className={SKY ? `mt-4 max-w-[580px] ${SKY_LEDE} ${mid ? "text-balance" : ""}` : "mt-5 max-w-[580px] text-[16px] leading-[1.55] text-mute sm:text-[17px]"}>
          {lede}
        </div>
      )}
      {children}
    </Reveal>
  );
}

/**
 * The split section (Figma 211:13852, the Cloud section; 218:22895, the service page): text on plain paper on one
 * side, the visual on hatching on the other, a 1px divider between them, and full-width rules along the top and
 * bottom. Stacks on phones, text first. `flip` puts the visual on the left from lg up.
 */
export function SkySplit({
  id,
  labelledBy,
  text,
  visual,
  flip = false,
  top = true,
  className = "",
  textClassName = "",
  visualClassName = "",
}: {
  id?: string;
  labelledBy?: string;
  text: ReactNode;
  visual: ReactNode;
  flip?: boolean;
  /** Draw the top rule. Turn it off where a split sits straight under another one, so they share a single rule. */
  top?: boolean;
  className?: string;
  textClassName?: string;
  visualClassName?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`scroll-mt-20 ${className}`}>
      <div className="wrap">
        {top && <SkyRule />}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,51fr)_minmax(0,49fr)]">
          <div
            className={`flex min-w-0 flex-col justify-center py-14 sm:py-20 lg:py-[100px] ${flip ? "lg:order-2 lg:pl-16" : "lg:pr-16"} ${textClassName}`}
          >
            {text}
          </div>
          <div
            className={`sky-hatch-bg sky-frame relative -mx-5 flex min-w-0 items-center justify-center border-t px-5 py-10 sm:-mx-6 sm:px-10 sm:py-14 lg:mx-0 lg:border-t-0 lg:border-x lg:px-12 lg:py-16 ${flip ? "lg:order-1" : ""} ${visualClassName}`}
          >
            {visual}
          </div>
        </div>
        <SkyRule />
      </div>
    </section>
  );
}

/**
 * A static numbered list (Figma 218:22856, the service page's steps): the number in a 24px dot, a title, and a
 * line of mute text under it, hairlines between the items. For a sequence the reader steps through, use the
 * kit's StepHead instead.
 */
export function NumberedList({
  items,
  className = "",
}: {
  items: { title: ReactNode; body?: ReactNode; key?: string }[];
  className?: string;
}) {
  return (
    <ol className={`border-t border-(--sky-card-line) ${className}`}>
      {items.map((it, i) => (
        <li key={it.key ?? i} className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 border-b border-(--sky-card-line) py-4">
          <span className="sky-step-dot tabular-nums">{i + 1}</span>
          <div className="min-w-0">
            <p className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{it.title}</p>
            {it.body && <div className="mt-1.5 text-[14.5px] leading-[1.5] text-pretty text-mute">{it.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Mono inline code that sits in running text. */
export function Code({ children, className = "" }: { children: ReactNode; className?: string }) {
  // Sky site: short literals (flags, commands) never break at a hyphen; long ones still wrap on phones.
  const short = SKY && typeof children === "string" && children.length <= 28;
  return (
    <code className={`rounded-md bg-fg/[0.07] px-[0.36em] py-[0.12em] font-mono text-[0.86em] text-fg ${short ? "whitespace-nowrap " : ""}${className}`}>
      {children}
    </code>
  );
}

/** A plain arrow link used at the end of rows and cells. */
export function RowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <SmartLink
      href={href}
      className={`group inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-fg ${SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"} ${className}`}
    >
      {children}
      <ArrowUpRightIcon className="size-2.5 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </SmartLink>
  );
}

/* ------------------------------------------------------------------ */
/* Packet switch                                                       */
/* ------------------------------------------------------------------ */

/** A square on/off switch whose knob is a packet. Purely visual unless wrapped in a button. */
export function Switch({ on, delay = 0, className = "" }: { on: boolean; delay?: number; className?: string }) {
  if (SKY) {
    // The home page's toggle: a sky-blue pill with a white knob.
    return (
      <span
        aria-hidden
        data-on={on}
        style={{ transitionDelay: `${delay}ms` }}
        className={`group/sw relative inline-flex h-[20px] w-[34px] shrink-0 rounded-full bg-fg/12 transition-colors duration-300 ease-(--ease-out) data-[on=true]:bg-(--sky-fill) ${className}`}
      >
        <span
          style={{ transitionDelay: `${delay}ms` }}
          className="absolute top-[3px] left-[3px] size-[14px] rounded-full bg-white shadow-tile transition-transform duration-300 ease-(--ease-out) group-data-[on=true]/sw:translate-x-[14px] motion-reduce:transition-none"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      data-on={on}
      className={`group/sw relative inline-flex h-[18px] w-[34px] shrink-0 rounded-[5px] border border-edge-3 transition-[border-color,background-color] duration-500 data-[on=true]:border-lime-ink/70 data-[on=true]:bg-lime/[0.12] ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span
        className="absolute top-[4px] left-[4px] size-2 bg-faint transition-[transform,background-color] duration-500 ease-(--ease-out) group-data-[on=true]/sw:translate-x-4 group-data-[on=true]/sw:bg-lime"
        style={{ transitionDelay: `${delay}ms` }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Code panels                                                         */
/* ------------------------------------------------------------------ */

type Lang = "sh" | "json" | "yaml" | "docker";

function jsonTokens(line: string) {
  const out: ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)|([{}[\],])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <span key={k++} className="text-fg">
          {m[1]}
        </span>,
        <span key={k++} className="text-dim">
          {m[2]}
        </span>,
      );
    } else if (m[1]) {
      out.push(
        <span key={k++} className="text-lime-ink/90">
          {m[1]}
        </span>,
      );
    } else if (m[3] || m[4]) {
      out.push(
        <span key={k++} className="text-soft">
          {m[0]}
        </span>,
      );
    } else {
      out.push(
        <span key={k++} className="text-dim">
          {m[0]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** Splits a trailing "  # comment" off a shell line. */
function splitComment(line: string): [string, string] {
  const i = line.search(/\s{2,}#\s/);
  return i > 0 ? [line.slice(0, i), line.slice(i)] : [line, ""];
}

function CodeLine({ line, lang, output }: { line: string; lang: Lang; output?: boolean }) {
  if (/^\s*#/.test(line)) return <span className="text-dim">{line}</span>;
  if (lang === "json") return <>{jsonTokens(line)}</>;
  if (lang === "sh") {
    if (output) return <span className="text-soft">{line}</span>;
    const prompt = line.startsWith("$ ");
    const [body, comment] = splitComment(prompt ? line.slice(2) : line);
    return (
      <>
        {prompt && <span className="text-lime-ink select-none">$ </span>}
        <span className="text-fg">{body}</span>
        {comment && <span className="text-dim">{comment}</span>}
      </>
    );
  }
  if (lang === "docker") {
    const m = line.match(/^([A-Z]+)(\s.*)$/);
    if (m)
      return (
        <>
          <span className="text-lime-ink">{m[1]}</span>
          <span className="text-fg">{m[2]}</span>
        </>
      );
    return <span className="text-fg">{line}</span>;
  }
  // yaml: keys in white, values softer.
  const m = line.match(/^(\s*-?\s*)([A-Za-z_][\w-]*)(:)(.*)$/);
  if (m)
    return (
      <>
        {m[1]}
        <span className="text-fg">{m[2]}</span>
        <span className="text-dim">{m[3]}</span>
        <span className="text-soft">{m[4]}</span>
      </>
    );
  return <span className="text-soft">{line}</span>;
}

/**
 * A static code panel (commands and config, not recorded output): a title bar,
 * light highlighting and a copy button that drops the "$ " prompts.
 */
export function CodePanel({
  title,
  meta,
  code,
  lang = "sh",
  className = "",
  highlight,
  onLineHover,
}: {
  title: ReactNode;
  meta?: ReactNode;
  code: string;
  lang?: Lang;
  className?: string;
  /** Inclusive [from, to] line ranges (0-based) to light up. */
  highlight?: [number, number] | null;
  onLineHover?: (line: number | null) => void;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  // In prompted shell blocks, lines that aren't a command or its continuation are output.
  const prompted = lang === "sh" && lines.some((l) => l.startsWith("$ "));
  const isOutput = (i: number) =>
    prompted && !lines[i].startsWith("$ ") && !/^\s*#/.test(lines[i]) && !(i > 0 && lines[i - 1].endsWith("\\"));
  const copyValue =
    lang === "sh"
      ? lines
          .filter((_, i) => !isOutput(i))
          .map((l) => l.replace(/^\$ /, ""))
          .join("\n")
      : lines.join("\n");
  return (
    <figure className={`min-w-0 ${SKY ? FLAT_CODE : "pp-island"} ${className}`}>
      <figcaption className={`flex items-center gap-3 border-b pl-4 ${SKY ? "border-(--sky-card-line)" : "border-edge"} ${SKY ? "h-11 pr-2" : "h-10 pr-1.5"}`}>
        <span className={`min-w-0 flex-1 truncate font-mono ${SKY ? "text-[12px] text-mute" : "text-[11.5px] text-dim"}`}>{title}</span>
        {meta && <span className={`shrink-0 ${SKY ? "text-[12px] text-dim" : "font-mono text-[11px] text-faint"}`}>{meta}</span>}
        <CopyButton value={copyValue} label="Copy code" />
      </figcaption>
      <pre
        className="no-scrollbar overflow-x-auto py-4 font-mono text-[12.5px] leading-[1.75] sm:text-[13px]"
        onPointerLeave={onLineHover ? () => onLineHover(null) : undefined}
      >
        {lines.map((line, i) => {
          const lit = highlight && i >= highlight[0] && i <= highlight[1];
          return (
            <div
              key={i}
              data-lit={lit ? "true" : highlight ? "false" : undefined}
              onPointerEnter={onLineHover ? (e) => e.pointerType === "mouse" && onLineHover(i) : undefined}
              className={`relative px-4 whitespace-pre transition-[opacity,background-color] duration-300 data-[lit=false]:opacity-45 sm:px-5 ${SKY ? "data-[lit=true]:bg-(--sky-tint)" : "data-[lit=true]:bg-lime/[0.06]"}`}
            >
              {lit && <span aria-hidden className={`absolute inset-y-0 left-0 w-[2px] ${SKY ? "bg-(--sky-fill)" : "bg-lime"}`} />}
              <CodeLine line={line} lang={lang} output={isOutput(i)} />
              {line === "" && "​"}
            </div>
          );
        })}
      </pre>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

/** An orthogonal (or any straight-segment) path through points, and its length. */
export function poly(points: [number, number][]) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return { d, len };
}

/**
 * A lime packet riding an SVG path: a square-ended dash, `size` user units long,
 * travelling from the start of the path to its end once (or on a loop).
 */
export function PathPacket({
  d,
  len,
  size = 8,
  dur = 1200,
  delay = 0,
  loop = false,
  className = "stroke-lime-ink",
  round = false,
}: {
  d: string;
  len: number;
  size?: number;
  dur?: number;
  delay?: number;
  loop?: boolean;
  className?: string;
  /** A round dot instead of a square-ended dash (the sky site's packets). Parks fully off both ends. */
  round?: boolean;
}) {
  const dash = (size / len) * 100;
  if (round) {
    const cap = (size / 2 / len) * 100;
    return (
      <path
        d={d}
        pathLength={100}
        fill="none"
        strokeWidth={size}
        strokeLinecap="round"
        strokeDasharray="0.001 300"
        strokeDashoffset={cap + 1}
        className={`kit-motion ${className}`}
        style={{
          ["--kit-end" as string]: `${-(100 + cap + 1)}`,
          animation: `kit-ride-round ${dur}ms var(--ease-in-out) ${delay}ms ${loop ? "infinite" : "1"} both`,
        }}
      />
    );
  }
  return (
    <path
      d={d}
      pathLength={100}
      fill="none"
      strokeWidth={size}
      strokeLinecap="butt"
      strokeDasharray={`${dash} 300`}
      strokeDashoffset={dash + 1}
      className={`kit-motion ${className}`}
      style={{
        animation: `kit-ride ${dur}ms var(--ease-in-out) ${delay}ms ${loop ? "infinite" : "1"} both`,
      }}
    />
  );
}

/** Status glyphs used in ledgers: filled, outlined, crossed out, solid grey. */
export function Glyph({ kind, className = "" }: { kind: "ships" | "run" | "none" | "yours"; className?: string }) {
  if (SKY) {
    // Round marks on the sky site: filled sky, a sky ring, a struck-through ring, solid ink.
    if (kind === "ships") return <span aria-hidden className={`inline-block size-2.5 shrink-0 rounded-full bg-(--sky-fill) ${className}`} />;
    if (kind === "run")
      return <span aria-hidden className={`inline-block size-2.5 shrink-0 rounded-full border-[1.5px] border-(--sky-fill) ${className}`} />;
    if (kind === "yours") return <span aria-hidden className={`inline-block size-2.5 shrink-0 rounded-full bg-fg ${className}`} />;
    return (
      <svg aria-hidden viewBox="0 0 10 10" className={`size-2.5 shrink-0 text-dim ${className}`}>
        <circle cx="5" cy="5" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "ships") return <span aria-hidden className={`inline-block size-2.5 shrink-0 bg-lime ${className}`} />;
  if (kind === "run")
    return <span aria-hidden className={`inline-block size-2.5 shrink-0 border-[1.5px] border-lime-ink ${className}`} />;
  if (kind === "yours") return <span aria-hidden className={`inline-block size-2.5 shrink-0 bg-fg ${className}`} />;
  return (
    <svg aria-hidden viewBox="0 0 10 10" className={`size-2.5 shrink-0 text-dim ${className}`}>
      <rect x="0.75" y="0.75" width="8.5" height="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 9 9 1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
