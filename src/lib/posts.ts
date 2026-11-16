import "server-only";
import config from "@payload-config";
import { getPayload, type Where } from "payload";
import type { TocItem } from "@/lib/content";

/* Blog, learning center and newsroom posts, read from Payload (D1). */

import type { PostSummary, Section } from "@/lib/posts-types";

export type { PostSummary, Section };

export type Post = PostSummary & {
  seoTitle: string;
  content: { root: LexicalNode };
  toc: TocItem[];
};

export type LexicalNode = { type: string; tag?: string; text?: string; children?: LexicalNode[]; [k: string]: unknown };

type Doc = {
  section: Section;
  slug: string;
  title: string;
  description: string;
  author?: string | null;
  publishedAt: string;
  tags?: string[] | null;
  minutes?: number | null;
  seoTitle?: string | null;
  content?: { root: LexicalNode };
};

const summary = (d: Doc): PostSummary => ({
  kind: d.section,
  slug: d.slug,
  title: d.title,
  description: d.description,
  author: d.author ?? "",
  date: d.publishedAt?.slice(0, 10) ?? "",
  tags: d.tags ?? [],
  minutes: d.minutes ?? 1,
});

export async function listPosts(section: Section): Promise<PostSummary[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "posts",
    where: { section: { equals: section }, _status: { equals: "published" } } as Where,
    sort: "-publishedAt",
    limit: 0,
    pagination: false,
    depth: 0,
    select: { section: true, slug: true, title: true, description: true, author: true, publishedAt: true, tags: true, minutes: true },
  });
  return (res.docs as unknown as Doc[]).map(summary);
}

export async function getPost(section: Section, slug: string, draft = false): Promise<Post | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "posts",
    where: {
      section: { equals: section },
      slug: { equals: slug },
      ...(draft ? {} : { _status: { equals: "published" } }),
    } as Where,
    limit: 1,
    depth: 0,
    draft,
  });
  const d = res.docs[0] as unknown as Doc | undefined;
  if (!d || !d.content) return null;
  return { ...summary(d), seoTitle: d.seoTitle ?? "", content: d.content, toc: tocFrom(d.content.root) };
}

/** Same ids the renderer puts on headings (see post-body.tsx). */
export function headingId(node: LexicalNode) {
  return (
    plainText(node)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || "section"
  );
}

export function plainText(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(plainText).join("");
}

function tocFrom(root: LexicalNode): TocItem[] {
  const seen = new Map<string, number>();
  return (root.children ?? [])
    .filter((n) => n.type === "heading" && (n.tag === "h2" || n.tag === "h3"))
    .map((n) => {
      const base = headingId(n);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return { id: count ? `${base}-${count}` : base, text: plainText(n), level: n.tag === "h2" ? 2 : 3 };
    });
}
