import type * as PageTree from "fumadocs-core/page-tree";
import Link from "next/link";
import DOCS_INDEX from "../../../content/docs-index.json";
import { ArrowRightIcon } from "@/components/icons";
import { bySite, isSky } from "@/components/page/sky";
import { Command, TextLink } from "@/components/ui";
import { InstallField } from "./install-field";
import { INSTALL_CMD } from "@/lib/site";
import { source } from "@/lib/source";

const BLURBS: Record<string, string> = Object.fromEntries((DOCS_INDEX as { slug: string; blurb: string }[]).map((d) => [d.slug, d.blurb]));
const blurbFor = (url: string) => BLURBS[url.replace(/^\/docs\/?/, "") || "index"];

const FIRST_STEPS = [
  { icon: "microvm", title: "Install", body: "The daemon and pilotctl, one line.", href: "/docs/getting-started" },
  { icon: "data", title: "Ask a specialist", body: "Get live data from one of about 430 agents.", href: "/docs/service-agents" },
  { icon: "sms", title: "Hand pilot-mom a task", body: "Plain English in, a plan of calls out.", href: "/docs/pilot-mom" },
];

/** The sidebar's groups (separators in meta.json) with their pages, minus the overview itself. */
function groups(tree: PageTree.Root) {
  const out: { title: string; items: PageTree.Item[] }[] = [];
  for (const node of tree.children) {
    if (node.type === "separator") out.push({ title: typeof node.name === "string" ? node.name : "", items: [] });
    else if (node.type === "page" && node.url !== "/docs") out.at(-1)?.items.push(node);
  }
  return out.filter((g) => g.items.length);
}

/** The docs root: first steps, then every section of the docs with a one-line description. */
export function DocsHome() {
  if (isSky) return <SkyDocsHome />;
  return (
    <div className="pt-6 pb-10">
      <h1 className="max-w-[760px] text-[clamp(36px,4.6vw,56px)] leading-[1.03] font-medium tracking-[-0.04em] text-balance text-fg">
        From install to your first peer in <span className={bySite("text-lime-ink", "text-mute")}>five minutes.</span>
      </h1>
      <p className="mt-6 max-w-[620px] text-[18px] leading-[1.55] text-pretty text-mute">
        CLI commands, SDK references, the App Store, Pilot Cloud and the complete trust model. The whitepaper documents the
        wire format, addressing, transport and encryption.
      </p>
      <Command value={INSTALL_CMD} prefix="curl" className="mt-8 w-fit" label="Copy install command">
        {INSTALL_CMD.replace(/^curl/, "")}
      </Command>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        <TextLink href="/research/WHITEPAPER.pdf">Read the whitepaper</TextLink>
        <TextLink href="/docs/cli-reference">CLI reference</TextLink>
      </div>

      <ol className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-3">
        {FIRST_STEPS.map((s, i) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="group flex h-full flex-col rounded-[18px] bg-card p-5 shadow-card transition-[transform,box-shadow] duration-300 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-float"
            >
              {isSky ? (
                // The sky site numbers its steps the way the home page's "Get started" does.
                <span className="grid size-8 place-items-center rounded-full bg-(--sky-tint) text-[14px] leading-none font-medium text-(--sky-accent) tabular-nums">
                  {i + 1}
                </span>
              ) : (
                <span className="flex items-start justify-between">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons3d/${s.icon}.webp`} alt="" width={48} height={48} className="size-12 object-contain" />
                  <span className="text-[12.5px] text-dim tabular-nums">Step {i + 1}</span>
                </span>
              )}
              <span className={`${isSky ? "mt-5" : "mt-6"} text-[18px] font-medium tracking-[-0.02em] text-fg`}>{s.title}</span>
              <span className="mt-1 text-[14.5px] leading-[1.45] text-mute">{s.body}</span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex flex-col gap-12">
        {groups(source.getPageTree()).map((g) => (
          <section key={g.title} aria-labelledby={`g-${g.title}`}>
            <h2 id={`g-${g.title}`} className="text-[14px] font-medium text-dim">
              {g.title}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[18px] bg-edge shadow-card sm:grid-cols-2">
              {g.items.map((item) => (
                <li key={item.url} className="bg-card sm:last:odd:col-span-2">
                  <Link href={item.url} className="group flex h-full flex-col px-5 py-4 transition-colors duration-150 hover:bg-fg/[0.025]">
                    <span className="flex items-center justify-between gap-4 text-[15.5px] font-medium tracking-[-0.01em] text-fg">
                      {item.name}
                      <ArrowRightIcon className="size-3 shrink-0 text-faint transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-lime-ink" />
                    </span>
                    {blurbFor(item.url) && (
                      <span className="mt-1 text-[14px] leading-[1.45] text-pretty text-mute">{blurbFor(item.url)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/*
 * The sky site's docs root (Figma 233:289): a centred head with the install command, a dashed rule, the three first
 * steps as a stepper (the kit's step dots, left-aligned as in the design), another rule, then every group of the docs
 * as flat bordered cards in two columns.
 */
function SkyDocsHome() {
  return (
    <div className="pt-2 pb-10 xl:-mt-4 xl:pt-0">
      <div className="flex flex-col items-center pt-4 pb-6 text-center sm:pb-10">
        <h1 className="max-w-[620px] text-[clamp(38px,5.2vw,56px)] leading-[1.1] font-medium tracking-[-0.0536em] text-balance text-fg">
          From install to your first peer in <span className="text-mute">five minutes</span>
        </h1>
        <p className="mt-6 max-w-[620px] text-[17px] leading-[26px] tracking-[-0.0244em] text-pretty text-mute sm:text-[18px] sm:leading-[27px]">
          CLI commands, SDK references, the App Store, Pilot Cloud and the complete trust model. The whitepaper documents the
          wire format, addressing, transport and encryption.
        </p>
        <InstallField className="mt-8" />
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <TextLink href="/research/WHITEPAPER.pdf">Read the whitepaper</TextLink>
          <TextLink href="/docs/cli-reference">CLI reference</TextLink>
        </div>
      </div>

      <span aria-hidden className="docs-dash my-4 block" />
      <ol aria-label="First steps" className="docs-steps grid grid-cols-1 gap-6 py-8 sm:grid-cols-3 sm:gap-8 sm:py-10">
        {FIRST_STEPS.map((s, i) => {
          const last = i === FIRST_STEPS.length - 1;
          return (
            <li key={s.title} className="relative min-w-0">
              {/* Phones: the steps stack, joined by a line running down from each dot to the next. */}
              {!last && <span aria-hidden className="docs-step-rail absolute top-[33px] -bottom-[15px] left-[11.5px] w-px sm:hidden" />}
              <Link href={s.href} className="group flex gap-4 rounded-[6px] sm:flex-col sm:gap-3">
                <span className="relative flex shrink-0 items-center self-start sm:w-full">
                  <span className="sky-step-dot tabular-nums" data-on={i === 0}>
                    {i + 1}
                  </span>
                  {!last && (
                    // From the dot to just short of the next step's dot (the column plus the 32px gap).
                    <span aria-hidden className="sky-step-line absolute top-1/2 left-[33px] w-[calc(100%-9px)] max-sm:hidden" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-1.5 max-sm:pt-px sm:gap-2">
                  <span className="text-[16px] leading-[22px] font-medium tracking-[-0.0295em] text-fg underline decoration-transparent underline-offset-[3px] transition-[text-decoration-color] duration-200 group-hover:decoration-fg/35">
                    {s.title}
                  </span>
                  <span className="text-[15px] leading-[1.4] tracking-[-0.0275em] text-pretty text-mute sm:text-[16px]">{s.body}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <span aria-hidden className="docs-dash my-4 block" />

      <div className="mt-4 flex flex-col gap-7">
        {groups(source.getPageTree()).map((g) => (
          <section key={g.title} aria-labelledby={`g-${g.title}`}>
            <h2 id={`g-${g.title}`} className="text-[16px] leading-[1.4] tracking-[-0.0275em] text-mute">
              {g.title}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {g.items.map((item) => (
                <li key={item.url} className="min-w-0">
                  <Link href={item.url} className="docs-card sky-card group flex h-full flex-col p-5 sm:p-6">
                    <span className="flex items-center justify-between gap-4 text-[15.5px] leading-[23.25px] tracking-[-0.0276em] text-fg">
                      {item.name}
                      <ArrowRightIcon className="size-3 shrink-0 text-faint transition-[color,translate] duration-200 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:text-(--sky-accent)" />
                    </span>
                    {blurbFor(item.url) && (
                      <span className="pt-1 text-[14px] leading-[20.3px] tracking-[-0.0107em] text-pretty text-mute">{blurbFor(item.url)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
