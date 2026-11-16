import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleView, relatedTo } from "@/components/article/article-view";
import { getPost, listPosts } from "@/lib/posts";

// Posts come from Payload (D1) at request time, so edits show up without a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const a = await getPost("news", (await params).slug);
  if (!a) return {};
  const image = `/news/${a.slug}/og.png`;
  return {
    title: { absolute: a.seoTitle || `${a.title} · Pilot Protocol` },
    description: a.description,
    alternates: { canonical: `/news/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.date, authors: a.author ? [a.author] : undefined, images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function Page({ params }: PageProps<"/news/[slug]">) {
  const { isEnabled: draft } = await draftMode();
  const a = await getPost("news", (await params).slug, draft);
  if (!a) notFound();
  return <ArticleView a={a} related={relatedTo(a, await listPosts("news"))} />;
}
