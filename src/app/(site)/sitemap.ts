import type { MetadataRoute } from "next";
import { getAppPages } from "@/lib/content";
import { listPosts } from "@/lib/posts";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const PAGES = [
  "/service-agents",
  "/app-store",
  "/cloud",
  "/publish",
  "/self-hosting",
  "/security",
  "/security/disclosure",
  "/for/compatibility",
  "/for/p2p",
  "/for/mcp",
  "/for/skills",
  "/about",
  "/roadmap",
  "/press",
  "/brand",
  "/contact",
  "/blog",
  "/learn",
  "/news",
  "/docs",
  "/terms",
  "/privacy",
  "/cookies",
  "/aup",
  "/publisher-agreement",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${SITE_URL}${path}`;
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    ...PAGES.map((p) => ({ url: url(p), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...source
      .getPages()
      .filter((p) => p.slugs.length > 0)
      .map((p) => ({ url: url(p.url), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...getAppPages().map((a) => ({ url: url(`/apps/${a.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...(await Promise.all((["blog", "learn", "news"] as const).map((kind) => listPosts(kind)))).flat().map((a) => ({
      url: url(`/${a.kind}/${a.slug}`),
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
