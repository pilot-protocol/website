"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ElementType, type ReactNode } from "react";
import { ArrowUpRightIcon, CheckIcon, CopyIcon } from "@/components/icons";
import { useInView } from "@/lib/hooks";

/** Fades, lifts and un-blurs its children the first time they scroll into view. */
export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  style,
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
} & Record<string, unknown>) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      data-in-view={inView}
      className={`reveal ${className}`}
      style={{ ...style, "--delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Internal paths go through next/link (prefetch, client navigation); everything else is a plain anchor. */
export function SmartLink({ href = "", ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/") && !href.startsWith("//") && !/\.(sh|txt|pdf|xml|png|svg|js)$/.test(href.split("#")[0])) {
    return <NextLink href={href} {...rest} />;
  }
  return <a href={href} {...rest} />;
}

const buttonBase =
  "pressable inline-flex h-10 items-center justify-center gap-2.5 rounded-[10px] px-4 text-[14px] leading-[21px] font-medium whitespace-nowrap";

/** The solid button: off-white on the dark theme, ink on the light one. */
export function Button({ className = "", children, ...rest }: ComponentProps<"a">) {
  return (
    <SmartLink
      className={`${buttonBase} bg-fg text-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-fg/88 ${className}`}
      {...rest}
    >
      {children}
    </SmartLink>
  );
}

export function GhostButton({ className = "", children, ...rest }: ComponentProps<"a">) {
  return (
    <SmartLink className={`${buttonBase} bg-card text-fg shadow-tile hover:bg-card-2 ${className}`} {...rest}>
      {children}
    </SmartLink>
  );
}

/** Underlined text link with the tilted arrow, as in the Figma "Getting started ↗". */
export function TextLink({ className = "", children, ...rest }: ComponentProps<"a">) {
  return (
    <SmartLink
      className={`group inline-flex items-center gap-2.5 text-[14px] leading-[21px] font-medium text-fg underline decoration-fg/35 underline-offset-[3px] transition-[text-decoration-color] duration-200 hover:decoration-fg ${className}`}
      {...rest}
    >
      {children}
      <ArrowUpRightIcon className="size-3 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </SmartLink>
  );
}

/** The small lime square that marks a packet everywhere on the site. */
export function Packet({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`inline-block size-2 shrink-0 rounded-[2px] bg-packet ${className}`} />;
}

/**
 * Section heading in two tones: the claim, then the qualifier in a quieter grey on its own line.
 * `lede` sits under it; `center` centres the block.
 */
export function SectionHead({
  id,
  title,
  muted,
  lede,
  center = false,
  className = "",
  children,
}: {
  id: string;
  title: ReactNode;
  muted?: ReactNode;
  lede?: ReactNode;
  center?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className={`${center ? "mx-auto max-w-[760px] text-center" : "max-w-[640px]"} ${className}`}>
      <h2
        id={id}
        className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-medium tracking-[-0.042em] text-balance text-fg"
      >
        {title}
        {muted && <span className="block text-mute">{muted}</span>}
      </h2>
      {lede && (
        <p className={`mt-5 text-[17px] leading-[1.5] text-pretty text-mute sm:text-[18px] ${center ? "mx-auto max-w-[560px]" : "max-w-[520px]"}`}>
          {lede}
        </p>
      )}
      {children}
    </Reveal>
  );
}

/** A raised surface: white with a soft shadow on the light theme, a lifted charcoal on the dark one. */
export function Card({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: { as?: ElementType; className?: string; children?: ReactNode } & Record<string, unknown>) {
  return (
    <Tag className={`rounded-[20px] bg-card shadow-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** A real app or agent icon, in the rounded-square tile it ships with. */
export function AppIcon({
  src,
  alt = "",
  size = 56,
  className = "",
  pad = false,
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  /** Logos that aren't full-bleed tiles get a card background and some padding. */
  pad?: boolean;
}) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[23%] bg-card shadow-tile ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={pad ? "size-[58%] object-contain" : "size-full object-cover"}
      />
    </span>
  );
}

/** Section label: a packet, a mono index and a plain-language name. */
export function Eyebrow({ index, children, className = "" }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 font-mono text-[13px] text-mute ${className}`}>
      <Packet />
      {index && <span className="text-fg">{index}</span>}
      <span>{children}</span>
    </p>
  );
}

/** Copyable one-liner in the bordered mono box from the Figma hero and steps. */
export function Command({
  value,
  prefix,
  children,
  className = "",
  label = "Copy command",
  wrap = false,
}: {
  value: string;
  prefix?: string;
  children?: ReactNode;
  className?: string;
  label?: string;
  /** Let long text (a sentence rather than a command) wrap instead of scrolling. */
  wrap?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={`flex max-w-full min-w-0 items-center gap-2.5 rounded-[10px] bg-bg-deep py-1.5 pr-1.5 pl-3.5 ring-1 ring-edge ring-inset ${className}`}
    >
      <code
        // Scrolls sideways when it doesn't wrap, so keyboard users can reach the rest of it.
        tabIndex={wrap ? undefined : 0}
        className={`no-scrollbar min-w-0 flex-1 overflow-x-auto font-mono text-[12px] leading-[18px] tracking-[-0.02em] text-fg ${wrap ? "py-0.5 whitespace-normal" : "whitespace-nowrap"}`}
      >
        {prefix && <span className="text-lime-ink">{prefix}</span>}
        {children ?? value}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : label}
        className="pressable grid size-[28px] shrink-0 place-items-center rounded-[7px] text-fg/70 hover:bg-fg/[0.07] hover:text-fg"
      >
        <CopyIcon
          className="col-start-1 row-start-1 size-[13px] transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
          data-hidden={copied}
        />
        <CheckIcon
          className="col-start-1 row-start-1 size-[14px] text-lime-ink transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
          data-hidden={!copied}
        />
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}

/** Pulsing lime dot for anything fed by the live registry. */
export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`relative inline-flex size-1.5 ${className}`}>
      <span className="absolute inset-0 rounded-full bg-packet motion-safe:animate-[live-ping_2s_var(--ease-out)_infinite]" />
      <span className="relative size-1.5 rounded-full bg-packet" />
    </span>
  );
}
