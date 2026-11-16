import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page/page-header";
import { bySite, isSky, LABEL, LABEL_SM } from "@/components/page/sky";
import { FLAT_CARD, SKY_H2, SKY_LEDE, SkySplit } from "@/components/pages/security/kit";
import { HatchPanel, SkyRule } from "@/components/sky/kit";
import { Reveal, SmartLink, TextLink } from "@/components/ui";
import socialPaper from "../about/paper-social-structures.webp";
import wirePaper from "../about/paper-wire-spec.webp";
import { fileSize } from "../brand/files";
import { CopyText } from "./copy-text";
import { Facts } from "./facts";
import { Rules } from "./rules";
import { Glyph } from "../about/glyphs";

/* eslint-disable @next/next/no-img-element */

const PRESS_EMAIL = "press@pilotprotocol.network";
const H2 = bySite("text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg", SKY_H2);

const BOILERPLATE =
  "Pilot Protocol is an open-source network for AI agents: persistent identity and addressing, encrypted peer connectivity and explicit trust, with live data agents, an App Store and a hosted version on the same network. The service and website are operated by Vulture Labs, Inc., a Delaware corporation.";

const DO = isSky
  ? ["Set the logo in ink on light backgrounds and in white on blue or dark ones.", "Keep clear space equal to the logo’s height.", "Use the sky blues for accents; paper and white stay the ground."]
  : ["Use lime sparingly: highlights and calls to action.", "Keep clear space equal to the logo’s height.", "Keep dark as the default."];
const DONT = isSky
  ? ["Recolor, stretch or rotate the logo.", "Separate the mark from the wordmark, except as the app icon.", "Bring back the lime accent or the earlier mark."]
  : ["Recolor, stretch or rotate the logo.", "Separate the mark from the wordmark.", "Introduce blues, purples or reds."];

/** Sky: what's in each archive file, at a glance: the logo itself for the PNGs, a page for the PDF, a file for the config. */
function FileThumb({ note }: { note: string }) {
  if (note === "PNG")
    return <img src="/brand/pilot-logo-dark@1x.png" alt="" width={36} height={36} loading="lazy" className="size-9 shrink-0 rounded-[8px] bg-white object-cover ring-1 ring-(--sky-card-line)" />;
  return (
    <span aria-hidden className="relative grid size-9 shrink-0 place-items-center rounded-[8px] bg-bg text-fg ring-1 ring-(--sky-card-line)">
      <Glyph name={note === "PDF" ? "file" : "terminal"} className="size-4" />
    </span>
  );
}

export function PressPage() {
  const logos = (
    isSky
      ? [
          { file: "brand/pilot-sky-logo-white.svg", label: "White, for blue and dark backgrounds", dark: true },
          { file: "brand/pilot-sky-logo-ink.svg", label: "Ink, for light backgrounds", dark: false },
        ]
      : [
          { file: "brand/pilot-protocol-logo.svg", label: "Light, for dark backgrounds", dark: true },
          { file: "brand/pilot-protocol-logo-black.svg", label: "Black, for light backgrounds", dark: false },
        ]
  ).map((l) => ({ ...l, size: fileSize(l.file) }));

  const papers = [
    {
      img: wirePaper,
      title: "Pilot Protocol: Wire Specification and Architecture",
      meta: "Calin Teodor · v2.1, October 2026 · 22 pages",
      href: "/research/WHITEPAPER.pdf",
      size: fileSize("research/WHITEPAPER.pdf"),
    },
    {
      img: socialPaper,
      title: "Emergent Social Structures in Autonomous AI Agent Networks",
      meta: "Teodor-Ioan Calin · February 2026 · 10 pages",
      href: "/research/social-structures.pdf",
      size: fileSize("research/social-structures.pdf"),
    },
  ];

  const archive = [
    { label: "Brand kit v1.0", note: "PDF", href: "brand/pilot-brand-kit.pdf" },
    { label: "Logo 200 × 200", note: "PNG", href: "brand/pilot-logo-dark@1x.png" },
    { label: "Logo 400 × 400", note: "PNG", href: "brand/pilot-logo-dark@2x.png" },
    { label: "Logo 600 × 600", note: "PNG", href: "brand/pilot-logo-dark@3x.png" },
    { label: "Logo source 1024 × 1024", note: "PNG", href: "brand/pilot-logo-source.png" },
    { label: "Tailwind config", note: "JS", href: "brand/tailwind.config.js" },
  ].map((f) => ({ ...f, size: fileSize(f.href) }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Press" }]}
        title={
          <>
            Logos, facts and papers <span className="text-lime-ink">for writing about Pilot.</span>
          </>
        }
        lede="Logos, company facts, research papers and the rules for using them. Download what you need, or read the full brand guidelines."
        aside={
          <div className={`w-full max-w-[360px] p-5 ${bySite("rounded-[16px] border border-edge-2", FLAT_CARD)}`}>
            <p className={LABEL}>Press enquiries</p>
            <a href={`mailto:${PRESS_EMAIL}`} className="mt-2 block text-[17px] font-medium break-all text-fg hover:text-lime-ink">
              {PRESS_EMAIL}
            </a>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CopyText text={PRESS_EMAIL} label="Copy address" />
              <TextLink href="/brand" className="text-[13px]!">
                Brand guidelines
              </TextLink>
            </div>
          </div>
        }
      />

      {/* The logo, ready to drop in */}
      {isSky ? (
        // Sky: the two files on a hatched showcase panel, the heading inside it.
        <section aria-labelledby="logo-title" className="py-24 sm:py-32">
          <div className="wrap">
            <HatchPanel className="px-4 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <Reveal className="mb-10 grid grid-cols-1 gap-5 sm:mb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
                <h2 id="logo-title" className={SKY_H2}>
                  The logo, <span className="block text-mute">in white and in ink.</span>
                </h2>
                <p className="text-[15.5px] leading-[1.55] text-pretty text-mute lg:pb-1.5">
                  Vector files of the full lockup: the P mark and the wordmark. Use the white one on blue and dark backgrounds and the ink one
                  on light; leave clear space equal to its height around it.
                </p>
              </Reveal>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {logos.map((l, i) => (
                  <Reveal key={l.file} delay={i * 80}>
                    <a
                      href={`/${l.file}`}
                      download
                      className={`group relative flex aspect-[16/10] flex-col justify-between overflow-hidden p-5 sm:p-6 ${bySite(
                        "rounded-[16px]",
                        "rounded-[12px]",
                      )} ${
                        l.dark
                          ? bySite("pp-island text-fg", "bg-(--sky-800) text-white")
                          : bySite("bg-white text-ink shadow-card", "border border-(--sky-card-line) bg-white text-ink")
                      }`}
                    >
                      <span className="flex items-start justify-between gap-4 text-[13px] opacity-60">
                        <span>{l.label}</span>
                        <span className="shrink-0 whitespace-nowrap">SVG · {l.size}</span>
                      </span>
                      <span className="grid flex-1 place-items-center">
                        <Logo
                          className={`h-auto transition-transform duration-500 ease-(--ease-out) group-hover:scale-[1.03] ${bySite(
                            "w-[min(300px,60%)]",
                            "w-[min(280px,56%)]",
                          )}`}
                        />
                      </span>
                      <span className="flex items-center justify-between">
                        <span className="font-mono text-[11.5px] opacity-60">{l.file.split("/")[1]}</span>
                        <span
                          className={`inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium transition-colors ${
                            l.dark ? bySite("bg-fg text-bg group-hover:bg-fg/88", "bg-white text-(--sky-800) group-hover:bg-white/90") : "bg-ink text-white group-hover:bg-black"
                          }`}
                        >
                          Download
                          <DownloadIcon className="size-[12px]" />
                        </span>
                      </span>
                    </a>
                  </Reveal>
                ))}
              </div>
            </HatchPanel>
          </div>
        </section>
      ) : (
      <section aria-labelledby="logo-title" className="py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="mb-12 grid grid-cols-1 gap-5 sm:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
            <h2 id="logo-title" className={H2}>
              The logo.
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-mute">
              {isSky
                ? "Vector files of the full lockup: the P mark and the wordmark. Use the white one on blue and dark backgrounds and the ink one on light; leave clear space equal to its height around it."
                : "Vector files of the full lockup. Use the light one on dark backgrounds and the black one on light; leave clear space equal to its height around it."}
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {logos.map((l, i) => (
              <Reveal key={l.file} delay={i * 80}>
                <a
                  href={`/${l.file}`}
                  download
                  className={`group relative flex aspect-[16/10] flex-col justify-between overflow-hidden p-5 sm:p-6 ${bySite(
                    "rounded-[16px]",
                    "rounded-[12px]",
                  )} ${
                    l.dark
                      ? bySite("pp-island text-fg", "bg-(--sky-800) text-white")
                      : bySite("bg-white text-ink shadow-card", "border border-(--sky-card-line) bg-white text-ink")
                  }`}
                >
                  <span className={`flex items-center justify-between opacity-60 ${bySite("font-mono text-[11.5px]", "text-[13px]")}`}>
                    <span>{l.label}</span>
                    <span>SVG · {l.size}</span>
                  </span>
                  <span className="grid flex-1 place-items-center">
                    <Logo
                      className={`h-auto transition-transform duration-500 ease-(--ease-out) group-hover:scale-[1.03] ${bySite(
                        "w-[min(300px,60%)]",
                        "w-[min(280px,56%)]",
                      )}`}
                    />
                  </span>
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-[11.5px] opacity-60">{l.file.split("/")[1]}</span>
                    <span
                      className={`inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium transition-colors ${
                        l.dark ? bySite("bg-fg text-bg group-hover:bg-fg/88", "bg-white text-(--sky-800) group-hover:bg-white/90") : "bg-ink text-white group-hover:bg-black"
                      }`}
                    >
                      Download
                      <DownloadIcon className="size-[12px]" />
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Facts */}
      <section aria-labelledby="facts-title" className={`py-24 sm:py-32 ${bySite("border-t border-edge", "pt-0 sm:pt-0")}`}>
        <div className="wrap">
          <Reveal className="mb-12 grid grid-cols-1 gap-8 sm:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start">
            <h2 id="facts-title" className={H2}>
              {isSky ? (
                <>
                  At a glance. <span className="block text-mute">The figures a story needs.</span>
                </>
              ) : (
                "At a glance."
              )}
            </h2>
            <div>
              <p className={LABEL}>Boilerplate</p>
              <p className={`mt-3 text-[16px] leading-[1.6] ${bySite("text-soft", "text-pretty text-soft")}`}>{BOILERPLATE}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CopyText text={BOILERPLATE} label="Copy boilerplate" />
                <SmartLink href="/about" className="group inline-flex items-center gap-1.5 text-[13px] text-soft hover:text-fg">
                  About the company
                  <ArrowUpRightIcon className="size-[10px] transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </SmartLink>
              </div>
            </div>
          </Reveal>
          <Facts />
          {!isSky && (
            <p className={`mt-5 ${LABEL_SM}`}>
              Live figures come from the public registry. Registered addresses count every address issued, not unique active
              agents, users or customers.
            </p>
          )}
        </div>
      </section>

      {/* Research */}
      {isSky ? (
        // Sky: a split section. What the papers are on paper; the papers themselves on the hatching.
        <SkySplit
          labelledBy="research-title"
          className="pb-24 sm:pb-32"
          text={
            <Reveal>
              <h2 id="research-title" className={SKY_H2}>
                The papers <span className="block text-mute">behind the protocol.</span>
              </h2>
              <p className={`mt-6 max-w-[460px] ${SKY_LEDE}`}>
                The protocol&apos;s wire specification, and a study of how 626 agents on the network formed trust on their own.
              </p>
              <ul className="mt-10 border-t border-(--sky-card-line)">
                {papers.map((p) => (
                  <li key={p.href} className="border-b border-(--sky-card-line) py-4">
                    <p className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{p.title}</p>
                    <p className="mt-1 text-[14px] leading-5 text-mute">{p.meta}</p>
                  </li>
                ))}
              </ul>
              <TextLink href="/docs/research" className="mt-8">
                Research documentation
              </TextLink>
            </Reveal>
          }
          visual={
            <div className="grid w-full max-w-[520px] grid-cols-2 gap-4 sm:gap-6">
              {papers.map((p, i) => (
                <Reveal key={p.href} delay={i * 80}>
                  <a href={p.href} className="group flex flex-col" aria-label={`${p.title}, PDF, ${p.size}`}>
                    <span className="relative block aspect-[420/520] overflow-hidden rounded-[12px] border border-(--sky-card-line) bg-white transition-[border-color] duration-300 group-hover:border-fg/25">
                      <img
                        src={p.img.src}
                        alt=""
                        width={p.img.width}
                        height={p.img.height}
                        loading="lazy"
                        className="w-full transition-transform duration-700 ease-(--ease-out) group-hover:-translate-y-2"
                      />
                      <span className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 rounded-full bg-(--sky-800) px-2.5 py-1 text-[12px] leading-4 font-medium text-white">
                        PDF · {p.size}
                        <DownloadIcon className="size-[11px]" />
                      </span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          }
        />
      ) : (
      <section aria-labelledby="research-title" className="pp-invert py-24 sm:py-32">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <Reveal>
            <h2 id="research-title" className={H2}>
              Papers.
            </h2>
            <p className="mt-5 max-w-[360px] text-[16px] leading-[1.55] text-mute">
              The protocol&apos;s wire specification, and a study of how 626 agents on the network formed trust on their own.
            </p>
            <TextLink href="/docs/research" className="mt-6">
              Research documentation
            </TextLink>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {papers.map((p, i) => (
              <Reveal key={p.href} delay={i * 80}>
                <a href={p.href} className="group flex flex-col">
                  <span className={`relative block aspect-[420/520] overflow-hidden bg-white shadow-card ${bySite("rounded-[16px]", "rounded-[20px]")}`}>
                    <img
                      src={p.img.src}
                      alt={`First page of ${p.title}`}
                      width={p.img.width}
                      height={p.img.height}
                      loading="lazy"
                      className="w-full transition-transform duration-700 ease-(--ease-out) group-hover:-translate-y-2"
                    />
                    {isSky && (
                      <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-(--sky-800) px-2.5 py-1 text-[12px] leading-4 font-medium text-white">
                        PDF · {p.size}
                        <DownloadIcon className="size-[11px]" />
                      </span>
                    )}
                  </span>
                  <span className="mt-4 text-[14px] leading-[1.3] font-medium text-balance text-fg sm:text-[16px]">{p.title}</span>
                  {!isSky && (
                    <span className="mt-1.5 flex flex-col justify-between gap-1 font-mono text-[11px] text-dim sm:flex-row sm:gap-3 sm:text-[11.5px]">
                      <span>{p.meta}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        PDF · {p.size}
                        <DownloadIcon className="size-[11px]" />
                      </span>
                    </span>
                  )}
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Rules + archive */}
      <section aria-labelledby="rules-title" className={bySite("py-24 sm:py-32", "pb-24 sm:pb-32")}>
        <div className={`wrap grid grid-cols-1 lg:grid-cols-2 ${bySite("gap-16 lg:gap-16", "gap-3 sm:gap-4")}`}>
          <Reveal className={bySite("", `p-6 sm:p-8 ${FLAT_CARD}`)}>
            <h2 id="rules-title" className="text-[28px] leading-[1.1] font-medium tracking-[-0.03em] text-fg">
              Quick rules
            </h2>
            {isSky ? (
              <Rules />
            ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {[
                { t: "Do", items: DO, mark: bySite("bg-lime", "rounded-full bg-(--sky-400)") },
                { t: "Don’t", items: DONT, mark: bySite("border border-fg", "rounded-full border-[1.5px] border-fg") },
              ].map((c) => (
                <div key={c.t}>
                  <p className={`flex items-center gap-2.5 border-b pb-2.5 text-[15px] font-medium text-fg ${bySite("border-edge-3", "border-fg/20")}`}>
                    <span aria-hidden className={`size-2 ${c.mark}`} />
                    {c.t}
                  </p>
                  <ul>
                    {c.items.map((it) => (
                      <li key={it} className={`border-b py-3 text-[14.5px] leading-[1.5] text-soft ${bySite("border-edge", "border-(--sky-card-line)")}`}>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            )}
            <TextLink href="/brand" className="mt-8">
              Full brand guidelines
            </TextLink>
          </Reveal>

          <Reveal delay={80} className={bySite("", `p-6 sm:p-8 ${FLAT_CARD}`)}>
            <h2 className="text-[28px] leading-[1.1] font-medium tracking-[-0.03em] text-fg">Archive</h2>
            <p className="mt-3 max-w-[440px] text-[14.5px] leading-[1.55] text-mute">
              Brand kit v1.0 (2026, design by Artemii Amelin) and its illustrated logo, kept for reference.
            </p>
            <ul className={`mt-6 border-t ${bySite("border-edge", "border-(--sky-card-line)")}`}>
              {archive.map((f) => (
                <li key={f.href} className={`border-b ${bySite("border-edge", "border-(--sky-card-line) last:border-b-0")}`}>
                  <a href={`/${f.href}`} download className={`group flex items-center justify-between gap-4 ${isSky ? "py-2.5" : "py-3.5"}`}>
                    <span className="flex min-w-0 items-center gap-3.5 text-[14.5px] text-soft transition-colors group-hover:text-fg">
                      {isSky && <FileThumb note={f.note} />}
                      {f.label}
                    </span>
                    <span className={`flex items-center gap-4 ${bySite("font-mono text-[12px] text-dim", "text-[13px] text-mute")}`}>
                      <span>{f.note}</span>
                      <span className="w-14 text-right tabular-nums">{f.size}</span>
                      <DownloadIcon
                        className={`size-[12px] transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-y-0.5 ${bySite("group-hover:text-lime-ink", "group-hover:text-(--sky-accent)")}`}
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      {/* Sky: the closing address on the page itself, after a hairline, so the page doesn't end on a band. */}
      <section aria-labelledby="press-contact" className={bySite("bg-lime text-ink", "")}>
        {isSky && (
          <div className="wrap">
            <SkyRule />
          </div>
        )}
        <div className="wrap flex flex-col gap-8 py-20 sm:py-24">
          <Reveal>
            <p className={bySite("font-mono text-[12px] text-ink/70", "text-[15px] text-mute")}>Press enquiries</p>
            <h2
              id="press-contact"
              className={`mt-4 text-[clamp(30px,5.2vw,68px)] leading-[1] font-medium ${bySite("tracking-[-0.045em]", "tracking-[-0.06em] text-fg")}`}
            >
              <a
                href={`mailto:${PRESS_EMAIL}`}
                className={`underline decoration-2 underline-offset-[0.12em] ${bySite(
                  "decoration-ink/25 hover:decoration-ink",
                  "decoration-fg/20 transition-[text-decoration-color] duration-200 hover:decoration-fg",
                )}`}
              >
                press@
                <wbr />
                pilotprotocol.network
              </a>
            </h2>
          </Reveal>
          <Reveal delay={80} className={`max-w-[320px] text-[15px] leading-[1.5] ${bySite("text-ink/75", "text-mute")}`}>
            For anything that isn&apos;t press,{" "}
            <SmartLink
              href="/contact"
              className={`underline underline-offset-2 ${bySite("decoration-ink/30 hover:decoration-ink", "text-fg decoration-fg/30 hover:decoration-fg")}`}
            >
              write to the team
            </SmartLink>{" "}
            instead.
          </Reveal>
        </div>
      </section>
    </>
  );
}
