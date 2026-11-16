import type { ReactNode } from "react";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { SmartLink } from "@/components/ui";
import { Glyph, Tile, type GlyphName } from "./glyphs";
import socialPaper from "./paper-social-structures.webp";
import wirePaper from "./paper-wire-spec.webp";

/* eslint-disable @next/next/no-img-element */

/*
 * Sky: "Put a name behind the work." Each card is a person (or the team) and the thing with their name on it, drawn
 * as the object itself on a sheet of paper: the announcement as a page, the papers as papers, the docs, posts and
 * guides as a shelf of counts.
 */

const PAPERS = [
  { img: wirePaper, title: "Wire Specification and Architecture", kind: "Wire specification", pages: "22 pages", href: "/research/WHITEPAPER.pdf" },
  {
    img: socialPaper,
    title: "Emergent Social Structures in Autonomous AI Agent Networks",
    kind: "arXiv preprint",
    pages: "10 pages",
    href: "/research/social-structures.pdf",
  },
];

const LINK = "text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg";

/** Initials in a tinted disc, or the Pilot mark for the team. */
function Avatar({ initials }: { initials?: string }) {
  if (!initials)
    return (
      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-(--sky-fill) text-white">
        <LogoMark className="h-[17px] w-auto" />
      </span>
    );
  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center rounded-full bg-(--sky-tint) text-[15px] font-medium tracking-[-0.02em] text-(--sky-accent)"
    >
      {initials}
    </span>
  );
}

function Person({
  initials,
  name,
  role,
  children,
  stage,
}: {
  initials?: string;
  name: string;
  role: string;
  children: ReactNode;
  stage: ReactNode;
}) {
  return (
    // From lg up the three cards share two rows (subgrid), so the sheets at their feet line up whatever the text above.
    <div className="sky-card flex flex-col p-3 sm:p-4 lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-2">
      <div className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="flex items-center gap-3.5">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <h3 className="text-[20px] leading-[1.2] font-medium tracking-[-0.035em] text-fg">{name}</h3>
            <p className="mt-0.5 text-[14px] leading-5 text-mute">{role}</p>
          </div>
        </div>
        <p className="mt-4 text-[14.5px] leading-[1.55] text-pretty text-mute">{children}</p>
      </div>
      {/* The work, on its own sheet of paper at the foot of the card. */}
      <div className="mt-6 flex flex-1 flex-col justify-end lg:mt-4">
        <div className="flex min-h-[236px] flex-1 items-center justify-center rounded-[8px] bg-bg p-4 sm:p-5">{stage}</div>
      </div>
    </div>
  );
}

export function SkyPeople({
  seed,
  docs,
  posts,
  guides,
}: {
  seed: { title: string; description: string; date: string } | null;
  docs: number;
  posts: number;
  guides: number;
}) {
  const shelf: [number, string, string, GlyphName][] = [
    [docs, "docs pages", "/docs", "book"],
    [posts, "blog posts", "/blog", "pen"],
    [guides, "guides", "/learn", "compass"],
  ];
  return (
    <div className="mt-14 grid grid-cols-1 gap-3 sm:mt-16 sm:gap-4 lg:grid-cols-3">
      <Person initials="RR" name="Razvan Roman" role="Leadership" stage={seed && <Article seed={seed} />}>
        Co-founder and CEO. Author of the company&apos;s July 2026 launch and financing announcement.
      </Person>

      <Person
        initials="TC"
        name="Teodor-Ioan Calin"
        role="Technical authorship"
        stage={
          <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
            {PAPERS.map((p) => (
              <a key={p.href} href={p.href} className="group flex flex-col" aria-label={`${p.title}, PDF, ${p.pages}`}>
                <span className="relative block aspect-[420/520] overflow-hidden rounded-[6px] bg-white shadow-tile">
                  <img
                    src={p.img.src}
                    alt=""
                    width={p.img.width}
                    height={p.img.height}
                    loading="lazy"
                    className="w-full transition-transform duration-500 ease-(--ease-out) group-hover:-translate-y-1"
                  />
                  <span className="absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded-full bg-(--sky-800) px-2 py-0.5 text-[10.5px] leading-4 font-medium text-white">
                    PDF · {p.pages}
                    <DownloadIcon className="size-[9px]" />
                  </span>
                </span>
                <span className="mt-2.5 text-[12.5px] leading-[1.35] font-medium text-fg">{p.kind}</span>
              </a>
            ))}
          </div>
        }
      >
        Named author on Pilot Protocol technical papers and specifications collected in the{" "}
        <SmartLink href="/docs/research" className={LINK}>
          research documentation
        </SmartLink>
        .
      </Person>

      <Person
        name="Pilot Protocol editorial team"
        role="Product publishing"
        stage={
          <ul className="flex w-full flex-col gap-2">
            {shelf.map(([n, label, href, glyph]) => (
              <li key={label}>
                <SmartLink
                  href={href}
                  className="group flex items-center gap-3.5 rounded-[10px] bg-card p-2.5 pr-4 ring-1 ring-(--sky-card-line) transition-[box-shadow] duration-300 hover:ring-fg/20"
                >
                  <Tile className="size-10 rounded-[9px]">
                    <Glyph name={glyph} />
                  </Tile>
                  <span className="text-[26px] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums">{n}</span>
                  <span className="text-[13.5px] text-mute">{label}</span>
                  <ArrowUpRightIcon className="ml-auto size-[10px] text-mute transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </SmartLink>
              </li>
            ))}
          </ul>
        }
      >
        Documentation and product articles are published under the organization when no individual byline is assigned.
      </Person>
    </div>
  );
}

/** The seed announcement as the page it is: the masthead, the headline, the standfirst and the byline. */
function Article({ seed }: { seed: { title: string; description: string; date: string } }) {
  return (
    <SmartLink
      href="/news/pilot-raises-4-5m-seed"
      className="group block w-full overflow-hidden rounded-[8px] bg-card shadow-tile ring-1 ring-(--sky-card-line) transition-[box-shadow] duration-300 hover:ring-fg/20"
    >
      <span className="flex items-center justify-between gap-3 border-b border-(--sky-card-line) px-4 py-2.5">
        <span className="flex items-center gap-2 text-[12px] leading-4 text-mute">
          <span className="grid size-[18px] place-items-center rounded-[5px] bg-(--sky-fill) text-white">
            <LogoMark className="h-[8px] w-auto" />
          </span>
          Company news
        </span>
        <ArrowUpRightIcon className="size-[10px] text-mute transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
      <span className="block px-4 pt-3.5 pb-4">
        <span className="block text-[16.5px] leading-[1.25] font-medium tracking-[-0.025em] text-balance text-fg">{seed.title}</span>
        <span className="mt-2 line-clamp-2 text-[12.5px] leading-[1.5] text-mute">{seed.description}</span>
        <span className="mt-3.5 flex items-center gap-2 text-[12px] leading-4 text-mute">
          <span aria-hidden className="grid size-5 place-items-center rounded-full bg-(--sky-tint) text-[8.5px] font-medium text-(--sky-accent)">
            RR
          </span>
          <span className="text-fg">Razvan Roman</span>
          <span aria-hidden>·</span>
          {seed.date}
        </span>
      </span>
    </SmartLink>
  );
}
