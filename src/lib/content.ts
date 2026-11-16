import "server-only";
import { APP_FILES, PAGE_FILES } from "@/generated/content";

/* Pages and apps migrated from the previous site (scripts/migrate-content.py), read at build time.
   Docs are MDX under content/docs (Fumadocs); blog, learn and news posts live in Payload. */

export type TocItem = { id: string; text: string; level: number };



export type Page = { kind: "page"; slug: string; title: string; seoTitle: string; description: string; toc: TocItem[]; html: string };

export type AppPage = {
  kind: "app";
  slug: string;
  name: string;
  seoTitle: string;
  description: string;
  headText: string[];
  metrics: Record<string, string>;
  icon: string;
  related: string[];
  toc: TocItem[];
  html: string;
};

function readAll<T>(folder: "pages" | "apps"): T[] {
  return (folder === "pages" ? PAGE_FILES : APP_FILES) as T[];
}





export function getPage(slug: string): Page {
  const page = readAll<Page>("pages").find((p) => p.slug === slug);
  if (!page) throw new Error(`Missing migrated page: ${slug}`);
  return page;
}

export function getAppPages(): AppPage[] {
  return readAll<AppPage>("apps");
}

export function getAppPage(id: string): AppPage | undefined {
  return readAll<AppPage>("apps").find((a) => a.slug === id);
}
