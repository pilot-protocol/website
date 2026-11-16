import { PostBody } from "@/components/article/post-body";
import { ArticleCover } from "@/components/page/article-cover";
import { Breadcrumbs, SkyBand } from "@/components/page/page-header";
import { bySite, isSky, LABEL } from "@/components/page/sky";
import { Toc } from "@/components/page/toc";
import { SkyRule } from "@/components/sky/kit";
import { Command } from "@/components/ui";
import type { Post, PostSummary } from "@/lib/posts";
import { ArticleCard } from "@/components/article/article-card";
import { formatDate } from "@/lib/format";
import { INSTALL_CMD } from "@/lib/site";

const SECTION = {
  blog: { label: "Blog", href: "/blog" },
  learn: { label: "Learning center", href: "/learn" },
  news: { label: "Newsroom", href: "/news" },
} as const;

export function ArticleView({ a, related }: { a: Post; related: PostSummary[] }) {
  const section = SECTION[a.kind];
  const head = (
    <div className={bySite("wrap pt-14 pb-12 sm:pt-20", "wrap pt-12 pb-12 sm:pt-[72px] sm:pb-14")}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: section.label, href: section.href }, { label: a.title }]} />
      <p
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${bySite(
          "mt-10 font-mono text-[12px] text-dim",
          "mt-10 text-[13px] leading-5 text-mute sm:mt-12",
        )}`}
      >
        <time dateTime={a.date}>{formatDate(a.date)}</time>
        <span aria-hidden>·</span>
        <span>{a.minutes} min read</span>
        {a.author && (
          <>
            <span aria-hidden>·</span>
            <span className={bySite("text-soft", "text-fg/80")}>{a.author}</span>
          </>
        )}
      </p>
      <h1
        className={`mt-5 max-w-[920px] font-medium text-balance text-fg ${bySite(
          "text-[clamp(34px,4.6vw,60px)] leading-[1.04] tracking-[-0.035em]",
          "text-[clamp(34px,4.6vw,56px)] leading-[1.05] tracking-[-0.045em]",
        )}`}
      >
        {a.title}
      </h1>
      {a.description && (
        <p className={`mt-6 max-w-[680px] text-[18px] leading-[1.55] text-mute ${bySite("", "tracking-[-0.01em] text-pretty")}`}>
          {a.description}
        </p>
      )}
      {a.tags.length > 0 && (
        <ul className={bySite("mt-8 flex flex-wrap gap-1.5", "mt-8 flex flex-wrap gap-2")}>
          {a.tags.map((t) => (
            <li
              key={t}
              className={bySite(
                "rounded-md border border-edge px-2 py-1 font-mono text-[11.5px] text-dim",
                "rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12.5px] leading-4 text-(--sky-accent)",
              )}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  const cover = (
    <div className="wrap pb-0">
      <ArticleCover
        seed={a.slug}
        tags={a.tags}
        className={bySite("aspect-[21/7] rounded-[20px]", "aspect-[21/8] rounded-[20px]")}
      />
    </div>
  );
  return (
    <article>
      {isSky ? (
        <>
          <SkyBand>{head}</SkyBand>
          {cover}
        </>
      ) : (
        <header className="border-b border-edge">
          {head}
          {cover}
        </header>
      )}

      <div className="wrap grid grid-cols-1 gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-20">
        <PostBody content={a.content} className="max-w-[720px]" />
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc items={a.toc} />
            <div className="mt-10 border-t border-edge pt-6">
              <p className={LABEL}>Try it</p>
              <Command value={INSTALL_CMD} prefix="curl" className="mt-3" label="Copy install command">
                {INSTALL_CMD.replace(/^curl/, "")}
              </Command>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className={bySite("border-t border-edge py-16 sm:py-20", "pb-24 sm:pb-32")}>
          <div className="wrap">
            {isSky && <SkyRule className="mb-14 sm:mb-20" />}
            <h2 id="related-title" className="text-[24px] font-medium tracking-[-0.025em] text-fg">
              Keep reading
            </h2>
            <div className={`mt-8 grid grid-cols-1 md:grid-cols-3 ${bySite("gap-4", "gap-3")}`}>
              {related.map((r) => (
                <ArticleCard key={r.slug} a={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

/** Up to three posts that share the most tags with this one, newest first on ties. */
export function relatedTo(a: PostSummary, pool: PostSummary[]) {
  return pool
    .filter((p) => p.slug !== a.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => a.tags.includes(t)).length }))
    .sort((x, y) => y.score - x.score || y.p.date.localeCompare(x.p.date))
    .slice(0, 3)
    .map((x) => x.p);
}
