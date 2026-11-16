import type { CSSProperties, ReactNode } from "react";
import { DownloadIcon } from "@/components/icons";
import { Logo, PilotMarkP } from "@/components/logo";
import { PageHeader } from "@/components/page/page-header";
import { SKY_H2 } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { GhostButton, Reveal, TextLink } from "@/components/ui";
import { fileSize } from "./files";
import { SkyConstruction } from "./sky-construction";
import { SkyPalette } from "./sky-palette";
import { SkyParts } from "./sky-parts";

/* eslint-disable @next/next/no-img-element */

/*
 * The brand page on the sky site: the P, the sky's blues, Geist, and the parts the pages are built
 * from, rendered live. Every value comes from the code (logo.tsx, v4.css, globals.css, the v4 sections).
 */

/** The flat card (the kit's .sky-card, in utilities so a hover can restyle its border). */
const FLAT = "rounded-[12px] border border-(--sky-card-line) bg-card";

/** A two-tone section heading (the claim, then the qualifier in mute) with its note on the right, as on /service-agents. */
function Head({ id, title, rest, children }: { id: string; title: string; rest: string; children?: ReactNode }) {
  return (
    <Reveal className="mb-12 grid grid-cols-1 gap-5 sm:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-16">
      <h2 id={id} className={SKY_H2}>
        {title} <span className="block text-mute">{rest}</span>
      </h2>
      {children && <div className="text-[16px] leading-[1.55] text-pretty text-mute lg:pb-1.5">{children}</div>}
    </Reveal>
  );
}

/* ---------------- Logo ---------------- */

const HERO_SKY = "linear-gradient(180deg, #0a2a9c 0%, #1f5bff 40%, #5aa9ff 76%, #b9dcff 100%)";
const ICON = "linear-gradient(180deg, #1f5bff, #0a2a9c)";

/** A small label set into a visual, instead of a caption under it. */
function Tag({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      className={`absolute top-4 left-4 rounded-full px-2.5 py-1 text-[12px] leading-4 font-medium ${
        onDark ? "bg-white/14 text-white" : "bg-fg/[0.06] text-soft"
      }`}
    >
      {children}
    </span>
  );
}

function Tile({ children, tag, onDark, className = "", style }: { children: ReactNode; tag: string; onDark?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <figure className={`relative grid min-h-[240px] place-items-center overflow-hidden rounded-[12px] p-8 ${className}`} style={style}>
      <figcaption>
        <Tag onDark={onDark}>{tag}</Tag>
      </figcaption>
      {children}
    </figure>
  );
}

const DONTS: { caption: string; style: CSSProperties }[] = [
  { caption: "Recolored", style: { color: "#c6f24e" } },
  { caption: "Stretched", style: { transform: "scaleX(1.4) scaleY(0.8)" } },
  { caption: "Rotated", style: { transform: "rotate(-12deg)" } },
  { caption: "With effects", style: { filter: "drop-shadow(0 0 12px #5aa9ff) drop-shadow(0 6px 4px #000)" } },
];

function LogoSection() {
  const files = [
    { label: "Logo, ink", note: "SVG · 173 × 24", href: "/brand/pilot-sky-logo-ink.svg" },
    { label: "Logo, white", note: "SVG · 173 × 24", href: "/brand/pilot-sky-logo-white.svg" },
    { label: "App icon", note: "SVG · 64 × 64", href: "/brand/pilot-sky-icon.svg" },
  ].map((f) => ({ ...f, size: fileSize(f.href.slice(1)) }));

  return (
    <div className="flex flex-col gap-16">
      <Reveal className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Tile tag="Ink, on white" className="border border-[rgb(26_26_26/0.1)] bg-white [--color-soft:#2f2f2c] [--color-fg:#141413]">
          <Logo className="h-auto w-[min(250px,72%)] text-ink" />
        </Tile>
        <Tile tag="White, on blue" onDark className="bg-(--sky-800)">
          <Logo className="h-auto w-[min(250px,72%)] text-white" />
        </Tile>
        <Tile tag="App icon" className={FLAT}>
          <span className="grid size-24 place-items-center rounded-[23%] shadow-card" style={{ background: ICON }}>
            <PilotMarkP className="h-[42px] w-auto text-white" />
          </span>
        </Tile>
        <Tile tag="White, on the sky" onDark style={{ background: HERO_SKY }}>
          <Logo className="h-auto w-[min(220px,66%)] text-white" />
        </Tile>
        <Tile tag="On the hatching" className="sky-hatch-bg sky-frame border">
          <Logo className="h-auto w-[min(220px,66%)] text-fg" />
        </Tile>
        <Tile tag="Clear space" className={FLAT}>
          <span className="relative block w-[min(150px,46%)]">
            <span aria-hidden className="absolute -inset-x-[13.9%] -inset-y-full rounded-[4px] border border-dashed border-(--sky-400)" />
            <span aria-hidden className="absolute -inset-x-[13.9%] -inset-y-full rounded-[4px] bg-(--sky-tint)" />
            <Logo className="relative h-auto w-full text-fg" />
          </span>
        </Tile>
      </Reveal>

      <div>
        <h3 className="text-[17px] font-medium text-fg">Keep it as drawn</h3>
        <Reveal className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {DONTS.map((d) => (
            <figure key={d.caption} className={`relative grid aspect-[4/3] place-items-center overflow-hidden ${FLAT}`}>
              <figcaption>
                <Tag>{d.caption}</Tag>
              </figcaption>
              <Logo className="h-auto w-[56%] text-fg" style={d.style} />
              <svg aria-hidden viewBox="0 0 100 75" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <line x1="0" y1="75" x2="100" y2="0" className="stroke-fg" strokeOpacity="0.22" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </figure>
          ))}
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {files.map((f) => (
          <a
            key={f.href}
            href={f.href}
            download
            className={`group flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:border-fg/20 ${FLAT}`}
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-[15px] font-medium text-fg">{f.label}</span>
              <span className="truncate text-[13px] text-mute">
                {f.note} · {f.size}
              </span>
            </span>
            <DownloadIcon className="size-[14px] shrink-0 text-dim transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-y-0.5 group-hover:text-lime-ink" />
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Type ---------------- */

const SCALE: { role: string; spec: string; sample: ReactNode; className: string }[] = [
  {
    role: "Display",
    spec: "Geist 500 · 46–72px · line 0.9 · tracking −0.056em",
    sample: "The internet for agents.",
    className: "text-[clamp(46px,7vw,72px)] leading-[0.9] font-medium tracking-[-0.0556em]",
  },
  {
    role: "Section",
    spec: "Geist 500 · 34–48px · line 1.1 · tracking −0.0625em · the qualifier in mute",
    sample: (
      <>
        Every agent gets a passport.
        <span className="block text-mute">A permanent address, tied to its own key.</span>
      </>
    ),
    className: "text-[clamp(30px,4.6vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em]",
  },
  {
    role: "Page title",
    spec: "Geist 500 · 40–64px · line 1.02 · tracking −0.05em",
    sample: "Building the network agents can use.",
    className: "text-[clamp(34px,5.4vw,64px)] leading-[1.02] font-medium tracking-[-0.05em]",
  },
  {
    role: "Body",
    spec: "Geist 400 · 17–18px · line 1.55 · in mute",
    sample:
      "Every agent gets a permanent address and encrypted tunnels to other agents. Nobody can reach yours until both sides approve.",
    className: "max-w-[620px] text-[17px] leading-[1.55] tracking-[-0.01em] text-mute sm:text-[18px]",
  },
  {
    role: "Label",
    spec: "Geist 400 · 13px · sentence case · in mute",
    sample: "Add this URL as an MCP server",
    className: "text-[13px] leading-5 text-mute",
  },
  {
    role: "Code",
    spec: "Geist Mono 400 · 12–14px · only for commands, hostnames and addresses",
    sample: "open-meteo-forecast · 0:0000.0000.4BB9",
    className: "font-mono text-[14px] text-fg",
  },
];

function Specimen() {
  return (
    <div className="flex flex-col gap-16">
      <Reveal className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={`flex flex-col justify-between gap-12 p-6 sm:p-10 ${FLAT}`}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[17px] font-medium text-fg">Geist</p>
            <p className="text-[13px] text-mute">400 · 500 · 600 for the wordmark</p>
          </div>
          <p aria-hidden className="text-[clamp(120px,16vw,220px)] leading-[0.8] font-medium tracking-[-0.06em] text-fg">
            Aa
          </p>
        </div>
        <div className={`flex flex-col justify-between gap-12 p-6 sm:p-10 ${FLAT}`}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-[17px] text-fg">Geist Mono</p>
            <p className="text-[13px] text-mute">400</p>
          </div>
          <p aria-hidden className="font-mono text-[clamp(120px,16vw,220px)] leading-[0.8] tracking-[-0.08em] text-fg">
            Aa
          </p>
        </div>
      </Reveal>

      <ol>
        {SCALE.map((s, i) => (
          <Reveal
            as="li"
            key={s.role}
            delay={i * 40}
            className="grid grid-cols-1 gap-4 overflow-hidden border-b border-edge py-8 first:border-t lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
          >
            <div>
              <p className="text-[15px] font-medium text-fg">{s.role}</p>
              <p className="mt-1 text-[13px] leading-[1.5] text-mute">{s.spec}</p>
            </div>
            <p className={`text-balance text-fg ${s.className}`}>{s.sample}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Usage ---------------- */

const DO = [
  "Keep paper and white as the ground, and let the blues mark what matters.",
  "Use the sky blues for links, accents and the deep contrast bands.",
  "Set labels and captions in Geist, in sentence case, in mute.",
  "Keep mono for what a machine would say: commands, hostnames, addresses.",
  "Keep cards flat: white, a hairline border, 12px corners. Show a visual on the hatching, in its frame.",
];

const DONT = [
  "Set labels in uppercase, or space them out with tracking.",
  "Bring lime, greens or other accents in beside the blues.",
  "Float cards on heavy shadows, or lay glass or gradients behind a section.",
  "Recolor, stretch or rotate the logo, or add effects.",
  "Separate the mark from the wordmark, except as the app icon.",
];

/* ---------------- Page ---------------- */

export function SkyBrandPage() {
  const archive = [
    { label: "Brand kit v1.0", note: "PDF · 8 pages", href: "/brand/pilot-brand-kit.pdf" },
    { label: "Logo, 200 × 200", note: "PNG", href: "/brand/pilot-logo-dark@1x.png" },
    { label: "Logo, 400 × 400", note: "PNG", href: "/brand/pilot-logo-dark@2x.png" },
    { label: "Logo, 600 × 600", note: "PNG", href: "/brand/pilot-logo-dark@3x.png" },
    { label: "Logo source, 1024 × 1024", note: "PNG", href: "/brand/pilot-logo-source.png" },
    { label: "Tailwind config", note: "JavaScript", href: "/brand/tailwind.config.js" },
  ].map((f) => ({ ...f, size: fileSize(f.href.slice(1)) }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Brand" }]}
        title={
          <>
            Pilot Protocol. <span className="text-lime-ink">Where agents go.</span>
          </>
        }
        lede="The mark, color, type and parts that make Pilot recognizable, in light and dark. Every value on this page comes from the live site's code."
      >
        <div className="flex flex-wrap gap-2">
          <GhostButton href="#logo">Logo files</GhostButton>
          <GhostButton href="#color">Color</GhostButton>
          <GhostButton href="#type">Type</GhostButton>
          <GhostButton href="#parts">Parts</GhostButton>
        </div>
      </PageHeader>

      <section aria-labelledby="mark-title" className="pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="wrap">
          <Head id="mark-title" title="The mark." rest="One P, drawn on a grid.">
            Squares of 6 units, three wide and four tall: one stem, a bowl with two corners of radius 6, and three cuts at
            45°, all parallel. Drawn here over its own geometry.
          </Head>
          <Reveal>
            <HatchPanel className="p-3 sm:p-8 lg:p-12">
              <SkyConstruction />
            </HatchPanel>
          </Reveal>
        </div>
      </section>

      <section id="logo" aria-labelledby="logo-title" className="scroll-mt-20 py-24 sm:py-32">
        <div className="wrap">
          <Head id="logo-title" title="Logo." rest="Ink on light, white on blue.">
            The P and the wordmark, set in Geist SemiBold, make the lockup. On dark backgrounds it goes white too.
          </Head>
          <LogoSection />
        </div>
      </section>

      <section id="color" aria-labelledby="color-title" className="scroll-mt-20 py-24 sm:py-32">
        <div className="wrap">
          <Head id="color-title" title="Color." rest="The sky’s blues on warm paper.">
            Paper and ink carry the page; the blues mark what matters, from links to the deep contrast bands. At night the
            same sky turns navy.
          </Head>
          <SkyPalette />
        </div>
      </section>

      <section id="type" aria-labelledby="type-title" className="scroll-mt-20 py-24 sm:py-32">
        <div className="wrap">
          <Head id="type-title" title="Type." rest="Geist, and Geist Mono for machines.">
            Mono is for anything a machine would say. Headings come in two tones: the claim, then the qualifier in mute.
          </Head>
          <Specimen />
        </div>
      </section>

      <section id="parts" aria-labelledby="parts-title" className="scroll-mt-20 py-24 sm:py-32">
        <div className="wrap">
          <Head id="parts-title" title="Parts." rest="Rendered live from the site.">
            One container, 1248px wide; flat cards with a hairline border at 12px corners, the app icon at 23%, pills
            fully round.
          </Head>
          <SkyParts />
        </div>
      </section>

      <section aria-labelledby="usage-title" className="pp-invert py-24 sm:py-32">
        <div className="wrap">
          <Head id="usage-title" title="Usage." rest="What keeps it Pilot." />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
            {[
              { title: "Do", items: DO, mark: "bg-(--sky-200)" },
              { title: "Don’t", items: DONT, mark: "border-[1.5px] border-white" },
            ].map((col, ci) => (
              <Reveal key={col.title} delay={ci * 80}>
                <h3 className="flex items-center gap-3 border-b border-edge-3 pb-3 text-[17px] font-medium text-fg">
                  <span aria-hidden className={`size-2 rounded-full ${col.mark}`} />
                  {col.title}
                </h3>
                <ul>
                  {col.items.map((t) => (
                    <li key={t} className="border-b border-edge py-4 text-[15px] leading-[1.5] text-soft">
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="archive-title" className="py-24 sm:py-28">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <Reveal>
            <h2 id="archive-title" className="text-[28px] leading-[1.15] font-medium tracking-[-0.04em] text-fg">
              Brand kit v1.0 <span className="text-mute">Archived.</span>
            </h2>
            <div className="mt-6 flex items-start gap-5">
              <img
                src="/brand/pilot-logo-dark@1x.png"
                alt="The v1.0 illustrated logo"
                width={72}
                height={72}
                loading="lazy"
                className="size-[72px] shrink-0 rounded-[16px] bg-[#141414] p-1.5"
              />
              <p className="text-[14.5px] leading-[1.55] text-mute">
                The first identity: the illustrated logo, Inter Tight and JetBrains Mono, and a #C5F000 accent. Design by
                Artemii Amelin. Kept for reference; use the files above for anything new.
              </p>
            </div>
            <TextLink href="/press" className="mt-8">
              Press kit
            </TextLink>
          </Reveal>
          <Reveal delay={80}>
            <ul className="border-t border-edge">
              {archive.map((f) => (
                <li key={f.href} className="border-b border-edge">
                  <a href={f.href} download className="group flex items-center justify-between gap-4 py-4">
                    <span className="text-[15px] text-soft transition-colors group-hover:text-fg">{f.label}</span>
                    <span className="flex items-center gap-5 text-[13px] text-mute">
                      <span className="max-sm:hidden">{f.note}</span>
                      <span className="w-16 text-right tabular-nums">{f.size}</span>
                      <DownloadIcon className="size-[13px] transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-y-0.5 group-hover:text-lime-ink" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
