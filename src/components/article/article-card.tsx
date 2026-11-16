import Link from "next/link";
import { ArticleCover } from "@/components/page/article-cover";
import { bySite } from "@/components/page/sky";
import { formatDate } from "@/lib/format";
import type { PostSummary } from "@/lib/posts-types";
import "@/components/sky/kit.css";
import "./article.css";

/**
 * `heading` follows the page outline: h2 in the blog index (straight under the page title), h3 under "Related".
 * Sky site: the kit's flat card (a hairline border, no shadow; 12px corners, 20px for the featured post), with the
 * border darkening on hover instead of the card lifting.
 */
export function ArticleCard({ a, large, heading: Heading = "h3" }: { a: PostSummary; large?: boolean; heading?: "h2" | "h3" }) {
  const href = `/${a.kind}/${a.slug}`;
  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden ${bySite(
        "rounded-[20px] bg-card shadow-card transition-shadow duration-300 hover:shadow-float",
        `sky-card article-card ${large ? "article-card-lg" : ""}`,
      )} ${large ? "lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : ""}`}
    >
      <div className={`relative overflow-hidden ${large ? bySite("", "lg:h-full") : ""}`}>
        <ArticleCover
          seed={a.slug}
          tags={a.tags}
          className={`aspect-[1200/630] transition-transform duration-700 ease-(--ease-out) group-hover:scale-[1.02] ${
            large ? bySite("", "lg:aspect-auto lg:h-full") : ""
          }`}
        />
      </div>
      <div className={`flex flex-1 flex-col ${bySite("p-5", "p-6")} ${large ? "sm:p-8" : ""}`}>
        <p className={bySite("font-mono text-[11.5px] text-dim", "text-[13px] leading-5 text-mute")}>
          {formatDate(a.date)} · {a.minutes} min
        </p>
        <Heading
          className={`mt-3 font-medium text-balance text-fg ${
            large
              ? bySite("text-[clamp(24px,2.6vw,34px)] leading-[1.1] tracking-[-0.025em]", "text-[clamp(26px,2.8vw,36px)] leading-[1.1] tracking-[-0.045em]")
              : bySite("text-[18px] leading-[1.25] tracking-[-0.025em]", "text-[17px] leading-[1.3] tracking-[-0.025em]")
          }`}
        >
          {a.title}
        </Heading>
        <p className={`mt-3 leading-[1.5] text-mute ${bySite("text-[14.5px]", "text-[14px]")} ${large ? "" : "line-clamp-3"}`}>
          {a.description}
        </p>
        {large && (
          <p className={`mt-auto pt-8 ${bySite("font-mono text-[12px] text-soft", "text-[14px] font-medium text-fg")}`}>
            Read the post <span className="text-lime-ink transition-[margin] duration-300 group-hover:ml-1">→</span>
          </p>
        )}
      </div>
    </Link>
  );
}
