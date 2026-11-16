import type { ReactNode } from "react";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { PageHeader } from "@/components/page/page-header";
import { bySite, isSky, LABEL, LABEL_SM, LABEL_XS } from "@/components/page/sky";
import { FLAT_CARD, SKY_H2, SKY_LEDE } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { NavIcon } from "@/components/sky/nav-icons";
import { BrandMark } from "@/components/v4/logos";
import { Reveal, SmartLink, TextLink } from "@/components/ui";
import { getPost, listPosts } from "@/lib/posts";
import { source } from "@/lib/source";
import { formatDate } from "@/lib/format";
import { Glyph } from "./glyphs";
import { SkyPeople } from "./people";
import { Standard } from "./standard";
import { Ways } from "./ways";
import socialPaper from "./paper-social-structures.webp";
import wirePaper from "./paper-wire-spec.webp";
import "./about.css";

/* eslint-disable @next/next/no-img-element */

const H2 = bySite("text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg", SKY_H2);
const EDITORIAL = "Pilot Protocol editorial team";

const COMPANY: {
  title: string;
  body: string;
  link: { label: string; href: string };
  /** Sky: the object at the head of the row. */
  icon: ReactNode;
}[] = [
  {
    title: "Legal operator",
    body: "The operator identified in the site’s terms, privacy policy, and publisher agreement.",
    link: { label: "Terms of service", href: "/terms" },
    icon: <Glyph name="file" />,
  },
  {
    title: "Open source, AGPL-3.0",
    body: "The source of the daemon, pilotctl, the registry and the beacon, with releases, issue history and license.",
    link: {
      label: "Review the repositories",
      href: "https://github.com/pilot-protocol",
    },
    icon: <BrandMark brand="github" className="size-[18px]" />,
  },
  {
    title: "Direct to the team",
    body: "Questions, app publishing, partnerships, press, corrections and security reports reach the people operating Pilot.",
    link: { label: "Contact Pilot Protocol", href: "/contact" },
    icon: <Glyph name="envelope" />,
  },
];

const PAPERS = [
  {
    img: wirePaper,
    title: "Wire Specification and Architecture",
    meta: "v2.1 · October 2026 · 22 pages",
    pages: "22 pages",
    href: "/research/WHITEPAPER.pdf",
  },
  {
    img: socialPaper,
    title: "Emergent Social Structures in Autonomous AI Agent Networks",
    meta: "February 2026 · 10 pages",
    pages: "10 pages",
    href: "/research/social-structures.pdf",
  },
];

const EVIDENCE: { note: string; title: string; href: string; icon: ReactNode }[] = [
  { note: "What Pilot secures", title: "Security", href: "/security", icon: <NavIcon href="/security" /> },
  {
    note: "Run your own registry",
    title: "Self-hosting",
    href: "/self-hosting",
    icon: <NavIcon href="/self-hosting" />,
  },
  {
    note: "Shipped and in progress",
    title: "Product roadmap",
    href: "/roadmap",
    icon: <Glyph name="map" />,
  },
  {
    note: "Responsible reporting",
    title: "Security disclosure",
    href: "/security/disclosure",
    icon: <Glyph name="bug" />,
  },
];

function Person({ role, name, children, artifact }: { role: string; name: string; children: ReactNode; artifact: ReactNode }) {
  if (isSky)
    // Sky: a flat bordered card, the name first and the role under it as a byline.
    return (
      <div className={`flex flex-col p-6 sm:p-7 ${FLAT_CARD}`}>
        <h3 className="text-[22px] leading-[1.2] font-medium tracking-[-0.035em] text-fg">{name}</h3>
        <p className="mt-1 text-[14px] leading-5 text-mute">{role}</p>
        <p className="mt-4 text-[15px] leading-[1.55] text-pretty text-mute">{children}</p>
        <div className="mt-8 flex flex-1 flex-col justify-end">{artifact}</div>
      </div>
    );
  return (
    <div className="flex flex-col bg-bg p-6 sm:p-8">
      <p className={LABEL}>{role}</p>
      <h3 className="mt-2 text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-fg">{name}</h3>
      <p className="mt-3 text-[15px] leading-[1.55] text-mute">{children}</p>
      <div className="mt-8 flex flex-1 flex-col justify-end">{artifact}</div>
    </div>
  );
}

export async function AboutPage() {
  const [blog, learn, seed] = await Promise.all([listPosts("blog"), listPosts("learn"), getPost("news", "pilot-raises-4-5m-seed")]);
  const editorialPosts = blog.filter((a) => a.author === EDITORIAL).length;
  const editorialGuides = learn.filter((a) => a.author === EDITORIAL).length;
  const docs = source.getPages().length;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title={
          <>
            Building the network <span className="text-lime-ink">agents can use.</span>
          </>
        }
        lede={
          <>
            Pilot Protocol is an open-source network for AI agents: persistent identity and addressing, encrypted peer connectivity and
            explicit trust, with live data agents, an App Store and a hosted version on the same network.
          </>
        }
      >
        {isSky ? (
          <p className="text-[14px] leading-5 text-mute">Operated by Vulture Labs, Inc., a Delaware corporation.</p>
        ) : (
          <p className="flex items-center gap-2.5 font-mono text-[12.5px] text-soft">
            <span aria-hidden className="size-2 bg-lime" />
            Operated by Vulture Labs, Inc., a Delaware corporation
          </p>
        )}
      </PageHeader>

      {/* Four ways in */}
      {isSky ? (
        // Sky: the four products and their wires into the one network, on a hatched showcase panel.
        <section aria-labelledby="ways-title" className="py-24 sm:py-32">
          <div className="wrap">
            <HatchPanel className="px-4 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <Reveal className="mb-10 sm:mb-12">
                <h2 id="ways-title" className={H2}>
                  One network, <span className="block text-mute">four ways in.</span>
                </h2>
              </Reveal>
              <Ways />
            </HatchPanel>
          </div>
        </section>
      ) : (
        <section aria-labelledby="ways-title" className="py-24 sm:py-32">
          <div className="wrap">
            <Reveal className="mb-14 sm:mb-16">
              <h2 id="ways-title" className={H2}>
                One network,
                <br />
                four ways in.
              </h2>
            </Reveal>
            <Ways />
          </div>
        </section>
      )}

      {/* The company */}
      {/* Sky: on the paper (the page header and the footer already carry the deep blue), after the panel's rule. */}
      <section aria-labelledby="company-title" className={bySite("pp-invert py-24 sm:py-28", "")}>
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            {!isSky && <p className={LABEL}>The company</p>}
            {isSky ? (
              <>
                <h2 id="company-title" className={SKY_H2}>
                  Vulture Labs, Inc. <span className="block text-mute">A Delaware corporation.</span>
                </h2>
                <p className={`mt-5 max-w-[420px] ${SKY_LEDE}`}>
                  It operates the service and this website, and runs the public backbone at no charge.
                </p>
              </>
            ) : (
              <>
                <h2 id="company-title" className="mt-4 text-[clamp(36px,4.4vw,56px)] leading-[1] font-medium tracking-[-0.04em] text-fg">
                  Vulture Labs, Inc.
                </h2>
                <p className="mt-5 max-w-[400px] text-[16px] leading-[1.55] text-mute">
                  A Delaware corporation. It operates the service and this website, and runs the public backbone at no charge.
                </p>
              </>
            )}
          </Reveal>
          <ul className={`border-t ${bySite("border-edge-2", "border-(--sky-card-line) lg:mt-2")}`}>
            {COMPANY.map((c, i) => (
              <Reveal
                as="li"
                key={c.title}
                delay={i * 60}
                className={`grid grid-cols-1 gap-3 border-b py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-8 ${bySite("border-edge", "border-(--sky-card-line)")}`}
              >
                <div className={isSky ? "flex gap-4" : ""}>
                  {isSky && (
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-card text-fg shadow-tile">
                      {c.icon}
                    </span>
                  )}
                  <div>
                    <h3 className={`text-[17px] font-medium tracking-[-0.015em] text-fg ${isSky ? "pt-0.5" : ""}`}>{c.title}</h3>
                    <p className="mt-1.5 max-w-[460px] text-[14.5px] leading-[1.55] text-mute">{c.body}</p>
                  </div>
                </div>
                <TextLink href={c.link.href}>{c.link.label}</TextLink>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* People */}
      <section aria-labelledby="people-title" className="py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
            <h2 id="people-title" className={H2}>
              {isSky ? (
                <>
                  Put a name <span className="block text-mute">behind the work.</span>
                </>
              ) : (
                <>
                  Put a name behind
                  <br />
                  the work.
                </>
              )}
            </h2>
            <p className={bySite("text-[15.5px] leading-[1.55] text-mute", "text-[15.5px] leading-[1.55] text-pretty text-mute lg:pb-1.5")}>
              Each name below is attached to something you can read: an announcement, the protocol&apos;s papers, and the docs and articles
              published under the organization.
            </p>
          </Reveal>

          {isSky ? (
            <Reveal delay={80}>
              <SkyPeople
                seed={seed ? { title: seed.title, description: seed.description, date: formatDate(seed.date) } : null}
                docs={docs}
                posts={editorialPosts}
                guides={editorialGuides}
              />
            </Reveal>
          ) : (
            <Reveal
              delay={80}
              className={`mt-14 grid grid-cols-1 sm:mt-16 lg:grid-cols-3 ${bySite("gap-px overflow-hidden rounded-[20px] border border-edge bg-edge", "gap-3 sm:gap-4")}`}
            >
              <Person
                role="Leadership"
                name="Razvan Roman"
                artifact={
                  seed && (
                    <SmartLink
                      href="/news/pilot-raises-4-5m-seed"
                      className={`group flex flex-col gap-3 p-5 transition-colors duration-300 ${bySite(
                        "rounded-[16px] border border-edge-2 hover:border-edge-3",
                        "rounded-[10px] border border-(--sky-card-line) bg-bg hover:border-fg/20",
                      )}`}
                    >
                      <span className={`flex items-center justify-between ${LABEL_SM}`}>
                        <span>Company news · {formatDate(seed.date)}</span>
                        <ArrowUpRightIcon className="size-[10px] transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                      <span className="text-[19px] leading-[1.2] font-medium tracking-[-0.02em] text-balance text-fg">{seed.title}</span>
                      <span className="text-[13.5px] leading-[1.5] text-mute">{seed.description}</span>
                    </SmartLink>
                  )
                }
              >
                Co-founder and CEO. Author of the company&apos;s July 2026 launch and financing announcement.
              </Person>

              <Person
                role="Technical authorship"
                name="Teodor-Ioan Calin"
                artifact={
                  <div className="grid grid-cols-2 gap-4">
                    {PAPERS.map((p) => (
                      <a key={p.href} href={p.href} className="group flex flex-col">
                        <span
                          className={`relative block aspect-[420/560] overflow-hidden bg-white ${bySite(
                            "rounded-[16px] border border-edge-2 transition-[border-color] duration-300 group-hover:border-edge-3",
                            "rounded-[10px] border border-(--sky-card-line) transition-[border-color] duration-300 group-hover:border-fg/20",
                          )}`}
                        >
                          <img
                            src={p.img.src}
                            alt={`First page of ${p.title}`}
                            width={p.img.width}
                            height={p.img.height}
                            loading="lazy"
                            className="w-full transition-transform duration-500 ease-(--ease-out) group-hover:-translate-y-1"
                          />
                          <span
                            className={`absolute right-1.5 bottom-1.5 ${bySite(
                              "rounded-md bg-ink px-1.5 py-0.5 font-mono text-[10px] text-lime",
                              "rounded-full bg-(--sky-800) px-2 py-0.5 text-[10.5px] font-medium text-white",
                            )}`}
                          >
                            {isSky ? `PDF · ${p.pages}` : "PDF"}
                          </span>
                        </span>
                        <span className="mt-3 line-clamp-2 text-[13.5px] leading-[1.35] font-medium text-fg">{p.title}</span>
                        {!isSky && <span className={`mt-1 ${LABEL_XS}`}>{p.meta}</span>}
                      </a>
                    ))}
                  </div>
                }
              >
                Named author on Pilot Protocol technical papers and specifications collected in the{" "}
                <SmartLink href="/docs/research" className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
                  research documentation
                </SmartLink>
                .
              </Person>

              <Person
                role="Product publishing"
                name="Pilot Protocol editorial team"
                artifact={
                  <ul
                    className={`grid grid-cols-3 ${bySite("gap-px overflow-hidden rounded-[20px] border border-edge-2 bg-edge-2", "gap-2")}`}
                  >
                    {[
                      [docs, "docs pages", "/docs"],
                      [editorialPosts, "blog posts", "/blog"],
                      [editorialGuides, "guides", "/learn"],
                    ].map(([n, label, href]) => (
                      <li key={label} className={bySite("bg-bg", "")}>
                        <SmartLink
                          href={String(href)}
                          className={`flex flex-col p-4 transition-colors ${bySite(
                            "hover:bg-raised",
                            "rounded-[10px] border border-(--sky-card-line) bg-bg hover:border-fg/20",
                          )}`}
                        >
                          <span className="text-[30px] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums">{n}</span>
                          <span className={`mt-2 ${LABEL_XS}`}>{label}</span>
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                }
              >
                Documentation and product articles are published under the organization when no individual byline is assigned.
              </Person>
            </Reveal>
          )}
        </div>
      </section>

      {/* Publishing standard */}
      {isSky ? (
        // Sky: a split section. The rules on paper, the page they shaped on the hatching.
        <Standard
          date={seed ? formatDate(seed.date) : "July 27, 2026"}
          head={
            <Reveal>
              <h2 id="publishing-title" className={SKY_H2}>
                Who, how, <span className="block text-mute">and why.</span>
              </h2>
              <p className={`mt-6 max-w-[520px] ${SKY_LEDE}`}>
                <span className="text-fg">Why we publish:</span> to help builders and evaluators decide whether Pilot fits a deployment,
                not to blur connectivity, application authorization, governance, and business authority into one promise.
              </p>
            </Reveal>
          }
        />
      ) : (
      <section id="publishing" aria-labelledby="publishing-title" className={`py-24 sm:py-32 ${bySite("border-t border-edge", "")}`}>
        <div className="wrap">
          <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end">
            <h2 id="publishing-title" className={H2}>
              Who, how,
              <br />
              and why.
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-mute">
              <span className="text-fg">Why we publish:</span> to help builders and evaluators decide whether Pilot fits a deployment, not
              to blur connectivity, application authorization, governance, and business authority into one promise.
            </p>
          </Reveal>
          <div className="mt-14 sm:mt-16">
            <Standard date={seed ? formatDate(seed.date) : "July 27, 2026"} />
          </div>
        </div>
      </section>
      )}

      {/* Evidence */}
      {isSky ? (
        <section aria-label="Engineering evidence" className="py-24 sm:py-32">
          <ul className="wrap grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {EVIDENCE.map((e, i) => (
              <Reveal as="li" key={e.href} delay={i * 50}>
                <SmartLink
                  href={e.href}
                  className="group flex h-full flex-col gap-8 rounded-[12px] border border-(--sky-card-line) bg-card p-6 transition-[border-color] duration-300 hover:border-fg/20"
                >
                  <span className="flex items-center gap-3 text-[13px] leading-5 text-mute">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-bg text-fg ring-1 ring-(--sky-card-line)">
                      {e.icon}
                    </span>
                    {e.note}
                  </span>
                  <span className="flex items-center justify-between gap-4 text-[20px] font-medium tracking-[-0.02em] text-fg">
                    {e.title}
                    <ArrowRightIcon className="size-4 text-dim transition-[transform,color] duration-300 ease-(--ease-out) group-hover:translate-x-1 group-hover:text-(--sky-accent)" />
                  </span>
                </SmartLink>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-label="Engineering evidence" className="border-t border-edge">
          <div className="wrap">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {EVIDENCE.map((e, i) => (
                <Reveal
                  as="li"
                  key={e.href}
                  delay={i * 50}
                  className="border-b border-edge sm:odd:border-r sm:even:pl-6 lg:border-b-0 lg:not-first:pl-6 lg:not-last:border-r"
                >
                  <SmartLink href={e.href} className="group flex h-full flex-col gap-10 py-8 sm:pr-6">
                    <span className={LABEL}>{e.note}</span>
                    <span className="flex items-center justify-between gap-4 text-[20px] font-medium tracking-[-0.02em] text-fg">
                      {e.title}
                      <ArrowRightIcon className="size-4 text-dim transition-[transform,color] duration-300 ease-(--ease-out) group-hover:translate-x-1 group-hover:text-lime-ink" />
                    </span>
                  </SmartLink>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
