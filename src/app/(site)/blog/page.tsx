import type { Metadata } from "next";
import { ArticleIndex } from "@/components/article/article-index";
import { PageHeader } from "@/components/page/page-header";
import { TextLink } from "@/components/ui";
import { listPosts } from "@/lib/posts";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides and field notes on connecting AI agents over a real network: peer-to-peer communication, NAT traversal, encrypted tunnels, trust and the Pilot App Store.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/feed.xml" } },
};

export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  const articles = await listPosts("blog");
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        title={
          <>
            AI agent networking, <span className="text-lime-ink">explained.</span>
          </>
        }
        lede="Guides and field notes on connecting agents over a real network: direct peer-to-peer, NAT traversal without a VPN, encrypted tunnels and per-peer trust, with working pilotctl commands."
      >
        <TextLink href="/blog/feed.xml">RSS feed</TextLink>
      </PageHeader>
      <section className="wrap py-12 sm:py-16">
        <ArticleIndex articles={articles} topics={TOPICS} />
      </section>
    </>
  );
}
