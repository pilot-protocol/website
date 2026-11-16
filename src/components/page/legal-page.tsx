import Link from "next/link";
import { PageHeader } from "@/components/page/page-header";
import { Prose } from "@/components/page/prose";
import { bySite, isSky, LABEL } from "@/components/page/sky";
import { Toc } from "@/components/page/toc";
import { getPage } from "@/lib/content";

const LEGAL = [
  { slug: "terms", label: "Terms of Service" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "aup", label: "Acceptable Use" },
  { slug: "publisher-agreement", label: "Publisher Agreement" },
];

/** Legal documents: the migrated text verbatim, with the effective date lifted into the header. */
export function LegalPage({ slug }: { slug: string }) {
  const page = getPage(slug);
  // The migrated body opens with the document title and its "Effective: … · Last updated: …" line.
  const titleMatch = page.html.match(/^<h2[^>]*>.*?<\/h2>/);
  let html = titleMatch ? page.html.slice(titleMatch[0].length) : page.html;
  const effective = html.match(/^<p>((?:Effective|Initial)[^<]*)<\/p>/);
  if (effective) html = html.slice(effective[0].length);
  const toc = page.toc.slice(titleMatch ? 1 : 0).filter((t) => t.level === 2);

  return (
    <>
      <PageHeader
        compact
        crumbs={[{ label: "Home", href: "/" }, { label: "Legal" }, { label: page.title }]}
        title={page.title}
        lede={
          effective ? <span className={bySite("font-mono text-[13px] text-dim", "text-[15px] text-mute")}>{effective[1]}</span> : undefined
        }
      />
      <div className="wrap grid grid-cols-1 gap-12 py-14 sm:py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-10">
            <nav aria-label="Legal documents">
              <p className={LABEL}>Legal</p>
              <ul className={`mt-4 flex flex-col ${bySite("gap-2", "gap-0.5")}`}>
                {LEGAL.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/${l.slug}`}
                      aria-current={l.slug === slug ? "page" : undefined}
                      className={`flex items-center gap-2.5 text-[14px] text-mute transition-colors hover:text-fg aria-[current=page]:text-fg ${bySite(
                        "",
                        "relative -ml-3 rounded-[9px] py-[7px] pl-3 aria-[current=page]:bg-card aria-[current=page]:font-medium aria-[current=page]:shadow-tile",
                      )}`}
                    >
                      {!isSky && <span aria-hidden className={`size-1.5 ${l.slug === slug ? "bg-lime" : "bg-edge-2"}`} />}
                      {/* Sky site: the docs sidebar's current page (Figma 227:4354), a blue tick beside the white pill. */}
                      {isSky && l.slug === slug && (
                        <span aria-hidden className="absolute top-1/2 -left-[5px] h-3.5 w-[3px] -translate-y-1/2 rounded-full bg-(--sky-fill)" />
                      )}
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Toc items={toc} />
          </div>
        </aside>
        <Prose html={html} className={`max-w-[760px] [&_h2]:text-[22px] ${bySite("", "pb-10 sm:pb-16")}`} />
      </div>
    </>
  );
}
