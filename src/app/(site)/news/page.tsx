import type { Metadata } from "next";
import { ArticleIndex } from "@/components/article/article-index";
import { PageHeader } from "@/components/page/page-header";
import { TextLink } from "@/components/ui";
import { listPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Newsroom",
  description: "Official announcements and company updates from the team building Pilot Protocol.",
  alternates: { canonical: "/news" },
};

export const dynamic = "force-dynamic";

export default async function NewsIndex() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Newsroom" }]}
        title="Company news."
        lede="Official announcements and company updates from the team building Pilot Protocol."
      >
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <TextLink href="mailto:press@pilotprotocol.network">Press inquiries</TextLink>
          <TextLink href="/press">Media resources</TextLink>
        </div>
      </PageHeader>
      <section className="wrap py-12 sm:py-16">
        <ArticleIndex articles={await listPosts("news")} topics={[]} />
      </section>
    </>
  );
}
