import type { ReactNode } from "react";
import { DownloadIcon } from "@/components/icons";
import { PageHeader } from "@/components/page/page-header";
import { isSky } from "@/components/page/sky";
import { GhostButton, Reveal, TextLink } from "@/components/ui";
import { Construction } from "./construction";
import { fileSize } from "./files";
import { LogoUsage } from "./logo-usage";
import { Palette } from "./palette";
import { Parts } from "./parts";
import { SkyBrandPage } from "./sky-brand";
import { Specimen } from "./specimen";

/* eslint-disable @next/next/no-img-element */

const H2 = "text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";

function Head({ n, id, title, children }: { n: string; id: string; title: string; children?: ReactNode }) {
  return (
    <Reveal className="mb-12 grid grid-cols-1 gap-5 sm:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
      <div>
        <p className="font-mono text-[12px] text-dim">{n}</p>
        <h2 id={id} className={`mt-3 ${H2}`}>
          {title}
        </h2>
      </div>
      {children && <div className="text-[15.5px] leading-[1.55] text-mute">{children}</div>}
    </Reveal>
  );
}

const DO = [
  "Keep dark as the default; white sections are the variation.",
  "Use lime for packets, highlights and calls to action.",
  "Set labels, captions and commands in Geist Mono, in sentence case.",
  "Stick to two weights: 400 and 500.",
  "Keep clear space equal to the logo’s height around it.",
];

const DONT = [
  "Set text in lime on white; there it is a fill only.",
  "Set body text in lime.",
  "Introduce blues, purples or reds.",
  "Recolor, stretch or rotate the logo, or add effects.",
  "Separate the mark from the wordmark without approval.",
];

export function BrandPage() {
  // The sky site presents its own brand: the P, the sky's blues, and the parts as the sky pages use them.
  if (isSky) return <SkyBrandPage />;
  const logoFiles = [
    {
      label: "Logo, light on dark",
      href: "/brand/pilot-protocol-logo.svg",
      note: "SVG · 362 × 72",
      size: fileSize("brand/pilot-protocol-logo.svg"),
    },
    {
      label: "Logo, black on light",
      href: "/brand/pilot-protocol-logo-black.svg",
      note: "SVG · 362 × 72",
      size: fileSize("brand/pilot-protocol-logo-black.svg"),
    },
  ];

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
            Pilot / Protocol. <span className="text-lime-ink">Where agents go.</span>
          </>
        }
        lede="The mark, color, type and parts that make Pilot recognizable. Dark and light themes. Every value on this page comes from the live site's code."
      >
        <div className="flex flex-wrap gap-2">
          <GhostButton href="#logo">Logo files</GhostButton>
          <GhostButton href="#color">Color</GhostButton>
          <GhostButton href="#type">Type</GhostButton>
          <GhostButton href="#parts">Parts</GhostButton>
        </div>
      </PageHeader>

      {/* The mark */}
      <section aria-labelledby="mark-title" className="py-24 sm:py-32">
        <div className="wrap">
          <Head n="01" id="mark-title" title="The mark.">
            Two halves around one axis, two equal circles and a triangle on the center line. Drawn here over its own
            geometry.
          </Head>
          <Reveal>
            <Construction />
          </Reveal>
        </div>
      </section>

      {/* Logo */}
      <section id="logo" aria-labelledby="logo-title" className="scroll-mt-20 border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Head n="02" id="logo-title" title="Logo.">
            The mark with the two-line wordmark is the primary lockup. Use the light version on dark backgrounds and the
            black one on light.
          </Head>
          <LogoUsage files={logoFiles} />
        </div>
      </section>

      {/* Color */}
      <section id="color" aria-labelledby="color-title" className="scroll-mt-20 border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Head n="03" id="color-title" title="Color.">
            Charcoal and off-white, a ramp of warm greys between them, and one lime accent. The light theme uses the
            same token names with paper and white in place of charcoal.
          </Head>
          <Palette />
        </div>
      </section>

      {/* Type */}
      <section id="type" aria-labelledby="type-title" className="scroll-mt-20 border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Head n="04" id="type-title" title="Type.">
            Geist for words, Geist Mono for anything a machine would say. Headings are set tight; body copy is set loose
            and quiet.
          </Head>
          <Specimen />
        </div>
      </section>

      {/* Parts */}
      <section id="parts" aria-labelledby="parts-title" className="scroll-mt-20 border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Head n="05" id="parts-title" title="Parts.">
            The pieces every page is built from, rendered live. One container, 1248px wide with 20–24px gutters; 2px
            corners throughout.
          </Head>
          <Parts />
        </div>
      </section>

      {/* Usage */}
      <section aria-labelledby="usage-title" className="pp-invert py-24 sm:py-32">
        <div className="wrap">
          <Head n="06" id="usage-title" title="Usage." />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
            {[
              { title: "Do", items: DO, mark: "bg-lime" },
              { title: "Don’t", items: DONT, mark: "bg-fg" },
            ].map((col, ci) => (
              <Reveal key={col.title} delay={ci * 80}>
                <h3 className="flex items-center gap-3 border-b border-edge-3 pb-3 text-[17px] font-medium text-fg">
                  <span aria-hidden className={`size-2 ${col.mark}`} />
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

      {/* Archive */}
      <section aria-labelledby="archive-title" className="py-24 sm:py-28">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <Reveal>
            <p className="font-mono text-[12px] text-dim">Archive</p>
            <h2 id="archive-title" className="mt-3 text-[28px] leading-[1.1] font-medium tracking-[-0.03em] text-fg">
              Brand kit v1.0
            </h2>
            <div className="mt-6 flex items-start gap-5">
              <img
                src="/brand/pilot-logo-dark@1x.png"
                alt="The v1.0 illustrated logo"
                width={72}
                height={72}
                loading="lazy"
                className="size-[72px] shrink-0 rounded-md border border-edge bg-bg-deep p-1.5"
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
                    <span className="flex items-center gap-5 font-mono text-[12px] text-dim">
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
