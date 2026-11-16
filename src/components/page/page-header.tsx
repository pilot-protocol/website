import type { CSSProperties, ReactNode } from "react";
import { NetworkCanvas } from "@/components/hero/network-canvas";
import { PilotMarkP } from "@/components/logo";
import { ArrowUpRightIcon } from "@/components/icons";
import { Button, GhostButton, SmartLink, TextLink } from "@/components/ui";
import { SITE_URL, SITE_VARIANT } from "@/lib/site";
import "./page-sky.css";

export type Crumb = { label: string; href?: string };

const sky = SITE_VARIANT === "sky";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (sky) return <SkyBreadcrumbs items={items} />;
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-[12px] text-dim">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-faint">/</span>}
            {c.href ? (
              <SmartLink href={c.href} className="transition-colors hover:text-fg">
                {c.label}
              </SmartLink>
            ) : (
              <span className="text-soft" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Sky breadcrumbs: sentence-case Geist, and the P mark standing in for "Home". */
function SkyBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] leading-5 text-mute">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.label} className="flex min-w-0 items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-faint">
                /
              </span>
            )}
            {c.href === "/" ? (
              <SmartLink
                href="/"
                aria-label={c.label}
                className="-m-1.5 grid place-items-center rounded-[6px] p-1.5 text-fg/60 transition-colors duration-200 hover:text-fg"
              >
                <PilotMarkP className="h-[13px] w-auto" />
              </SmartLink>
            ) : c.href ? (
              <SmartLink href={c.href} className="transition-colors duration-200 hover:text-fg">
                {c.label}
              </SmartLink>
            ) : (
              <span className="truncate text-fg/80" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The sky behind a page header: a soft band of the home page's sky with its clouds, under the nav. */
export function SkyBand({ children, className = "", as: Tag = "header" }: { children: ReactNode; className?: string; as?: "header" | "div" }) {
  return (
    <Tag className={`page-sky relative isolate overflow-hidden ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-b.webp" alt="" width={1600} height={1067} className="page-sky-cloud page-sky-cloud-a" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-a.webp" alt="" width={1600} height={1067} className="page-sky-cloud page-sky-cloud-b" />
      </div>
      {children}
    </Tag>
  );
}

/** A button or link in the sky hero. */
export type HeroAction = { label: ReactNode; href: string };
/** One fact in the sky hero's strip: the figure, and what it counts. */
export type HeroStat = { value: ReactNode; label: ReactNode };

type HeaderProps = {
  crumbs?: Crumb[];
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
  /** The solid button (white on the sky). `icon` sits after the label. */
  primary?: HeroAction & { icon?: ReactNode };
  /** The quiet button next to it (translucent on the sky). */
  secondary?: HeroAction;
  /** An underlined link with ↗, under the buttons on the sky. */
  link?: HeroAction;
  /** Sky site only: the strip of up to four facts at the foot of the hero. */
  stats?: HeroStat[];
};

/**
 * The top of every inner page. Green site: a strip of the hero's network running across the top, then
 * breadcrumbs, title and lede. Sky site: a full sky hero like the home page's (Figma 218:1585).
 */
export function PageHeader(props: HeaderProps) {
  if (sky) return <SkyPageHeader {...props} />;
  const { crumbs, title, lede, children, aside, compact, primary, secondary, link } = props;
  return (
    <header className="relative overflow-hidden border-b border-edge">
      <div aria-hidden className={`absolute inset-x-0 top-6 ${compact ? "h-[96px]" : "h-[132px]"}`}>
        <NetworkCanvas lineAlpha={0.13} />
      </div>
      <div className={`wrap relative grid grid-cols-1 gap-10 pb-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end ${compact ? "pt-[140px]" : "pt-[184px] sm:pb-20"}`}>
        <div className="max-w-[820px]">
          {crumbs && <Breadcrumbs items={crumbs} />}
          <h1
            className={`mt-5 font-medium tracking-[-0.035em] text-balance text-fg ${
              compact ? "text-[clamp(32px,4vw,48px)] leading-[1.06]" : "text-[clamp(40px,5.6vw,72px)] leading-[1.02]"
            }`}
          >
            {title}
          </h1>
          {lede && <div className="mt-6 max-w-[640px] text-[17px] leading-[1.55] text-mute sm:text-[18px]">{lede}</div>}
          {(primary || secondary || link) && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {primary && (
                <Button href={primary.href}>
                  {primary.label}
                  {primary.icon}
                </Button>
              )}
              {secondary && <GhostButton href={secondary.href}>{secondary.label}</GhostButton>}
              {link && (
                <TextLink href={link.href} className="ml-3">
                  {link.label}
                </TextLink>
              )}
            </div>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {aside}
      </div>
    </header>
  );
}

/**
 * The passport stamps from the home hero, fanned between two words of a sky hero's title (Figma 218:4811):
 * `Live <HeroStamps /> data,`. They land one after another when the page opens; reduced motion shows them still.
 */
export function HeroStamps() {
  return (
    <span aria-hidden className="page-hero-stamps">
      {HERO_STAMPS.map((s, i) => (
        <span
          key={s.src}
          className="page-hero-stamp"
          style={{ "--x": `${s.x}em`, "--y": `${s.y}em`, "--r": `${s.r}deg`, "--delay": `${420 + i * 110}ms` } as CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" width={24} height={24} className={s.className} />
        </span>
      ))}
    </span>
  );
}

// The five cards of the home hero's pile (src/components/v4/hero.tsx), bottom to top, centred in their slot.
const HERO_STAMPS = [
  { src: "/v4/stamp-hermes.png", className: "border-[0.926px] border-white object-contain", x: 0.3, y: 0.5, r: -13.07 },
  { src: "/v4/stamp-muse.png", className: "object-contain", x: 0.34, y: 0.494, r: -7.54 },
  { src: "/v4/stamp-claude.svg", className: "", x: 0.38, y: 0.487, r: 4.11 },
  { src: "/v4/stamp-dark.svg", className: "", x: 0.42, y: 0.48, r: -4.79 },
  { src: "/v4/stamp-orange.png", className: "rounded-[0.0707em] object-contain", x: 0.46, y: 0.473, r: -9.9 },
];

/** The trail for search engines: the hero has no visible breadcrumbs, so it's structured data plus a hidden nav. */
function CrumbTrail({ items }: { items: Crumb[] }) {
  const list = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: new URL(c.href, SITE_URL).toString() } : {}),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <nav aria-label="Breadcrumb" className="sr-only">
        <ol>
          {items.map((c) => (
            <li key={c.label}>
              {c.href ? (
                <SmartLink href={c.href}>{c.label}</SmartLink>
              ) : (
                <span aria-current="page">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function SkyPageHeader({ crumbs, title, lede, children, aside, compact, primary, secondary, link, stats }: HeaderProps) {
  return (
    <header className="page-hero relative isolate overflow-hidden" data-compact={compact ? "true" : undefined}>
      <div aria-hidden className="page-hero-clouds">
        <div className="page-hero-cloud page-hero-cloud-a">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v4/clouds-b.webp" alt="" width={1333} height={889} />
        </div>
        <div className="page-hero-cloud page-hero-cloud-b">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v4/clouds-a.webp" alt="" width={999} height={666} />
        </div>
        <div className="page-hero-cloud page-hero-cloud-c">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v4/clouds-a.webp" alt="" width={999} height={666} className="rotate-180" />
        </div>
      </div>
      <div aria-hidden className="page-hero-glow" />
      {crumbs && <CrumbTrail items={crumbs} />}

      <div className="wrap relative flex flex-col items-center">
        <div className="page-hero-copy flex w-full max-w-[640px] flex-col items-center text-center">
          <h1 className="page-hero-title rise-in text-balance">{title}</h1>
          {lede && (
            <div className="page-hero-lede rise-in text-pretty" style={{ "--delay": "80ms" } as CSSProperties}>
              {lede}
            </div>
          )}
          {(primary || secondary) && (
            <div className="page-hero-actions rise-in flex flex-wrap justify-center gap-3" style={{ "--delay": "160ms" } as CSSProperties}>
              {primary && (
                <SmartLink href={primary.href} className="page-hero-solid pressable">
                  {primary.label}
                  {primary.icon && <span className="grid size-4 place-items-center">{primary.icon}</span>}
                </SmartLink>
              )}
              {secondary && (
                <SmartLink href={secondary.href} className="page-hero-ghost pressable">
                  {secondary.label}
                </SmartLink>
              )}
            </div>
          )}
          {link && (
            <SmartLink
              href={link.href}
              className={`page-hero-link group rise-in ${primary || secondary ? "mt-4" : "page-hero-link-first"}`}
              style={{ "--delay": "200ms" } as CSSProperties}
            >
              {link.label}
              <ArrowUpRightIcon className="size-3 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </SmartLink>
          )}
          {children && (
            <div className="page-hero-extra rise-in w-full" style={{ "--delay": "200ms" } as CSSProperties}>
              {children}
            </div>
          )}
        </div>

        {aside && (
          <div className="page-hero-aside rise-in flex w-full justify-center text-left" style={{ "--delay": "240ms" } as CSSProperties}>
            {aside}
          </div>
        )}

        {stats && stats.length > 0 && (
          <dl className="page-hero-stats rise-in" style={{ "--delay": "260ms", "--n": stats.length } as CSSProperties}>
            {stats.map((s, i) => (
              <div key={i} className="page-hero-stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}
