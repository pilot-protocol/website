import type { Metadata } from "next";
import { ArticleIndex } from "@/components/article/article-index";
import { PageHeader } from "@/components/page/page-header";
import { listPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Learning center",
  description: "Focused technical guides to the network layer for AI agents: addresses, tunnels, discovery, trust and where Pilot fits.",
  alternates: { canonical: "/learn" },
};

export const dynamic = "force-dynamic";

export default async function LearnIndex() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Learning center" }]}
        title={
          <>
            Understand the <span className="text-lime-ink">network layer.</span>
          </>
        }
        lede="Short paths through the decisions that matter when agents need to find and reach one another across machines, clouds and networks."
      />
      <section className="wrap py-12 sm:py-16">
        <ArticleIndex articles={await listPosts("learn")} topics={[]} />
      </section>
    </>
  );
}
