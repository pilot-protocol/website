import type * as PageTree from "fumadocs-core/page-tree";
import { findNeighbour } from "fumadocs-core/page-tree";
import { DocsBody, DocsPage, DocsTitle, MarkdownCopyButton, ViewOptionsPopover } from "fumadocs-ui/layouts/docs/page";
import { DocsContainer } from "@/components/docs/container";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsHome } from "@/components/docs/docs-home";
import { ArrowRightIcon } from "@/components/icons";
import { getMDXComponents } from "@/components/mdx";
import { SITE_URL } from "@/lib/site";
import { source } from "@/lib/source";

/** The sidebar group a page sits under (the separator before it in meta.json). */
function groupOf(tree: PageTree.Root, url: string) {
  let group: string | undefined;
  for (const node of tree.children) {
    if (node.type === "separator") group = typeof node.name === "string" ? node.name : undefined;
    else if (node.type === "page" && node.url === url) return group;
  }
  return undefined;
}

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const { slug } = await props.params;

  // The docs root is a designed overview rather than an MDX page.
  if (!slug?.length) {
    return (
      <DocsPage full toc={[]} footer={{ enabled: false }} breadcrumb={{ enabled: false }} slots={{ container: DocsContainer }}>
        <DocsHome />
      </DocsPage>
    );
  }

  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  const tree = source.getPageTree();
  const group = groupOf(tree, page.url);
  const { previous, next } = findNeighbour(tree, page.url);
  const markdownUrl = `${page.url}.mdx`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContent={{ style: "normal" }}
      slots={{ container: DocsContainer }}
      className="docs-page"
    >
      <header className="docs-head">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-dim">
          <Link href="/docs" className="transition-colors hover:text-fg">
            Docs
          </Link>
          {group && (
            <>
              <span aria-hidden className="text-faint">
                /
              </span>
              <span>{group}</span>
            </>
          )}
        </nav>
        <DocsTitle className="docs-title">{page.data.title}</DocsTitle>
        <div className="docs-actions">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover markdownUrl={markdownUrl} pageUrl={`${SITE_URL}${page.url}`} />
        </div>
      </header>

      <DocsBody className="docs-body">
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>

      {(previous || next) && (
        <nav aria-label="More docs" className="docs-pager">
          {previous ? <PagerLink item={previous} dir="prev" /> : <span />}
          {next && <PagerLink item={next} dir="next" />}
        </nav>
      )}
    </DocsPage>
  );
}

function PagerLink({ item, dir }: { item: PageTree.Item; dir: "prev" | "next" }) {
  return (
    <Link href={item.url} data-dir={dir} className="group docs-pager-link">
      <span className="flex items-center gap-1.5 text-[12.5px] text-dim">
        {dir === "prev" && <ArrowRightIcon className="size-3 rotate-180 transition-transform duration-300 ease-(--ease-out) group-hover:-translate-x-0.5" />}
        {dir === "prev" ? "Previous" : "Next"}
        {dir === "next" && <ArrowRightIcon className="size-3 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5" />}
      </span>
      <span className="mt-1.5 text-[16px] font-medium tracking-[-0.015em] text-fg">{item.name}</span>
    </Link>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug?.length) {
    return {
      title: "Documentation",
      description: "From install to your first peer connection in under five minutes: CLI, SDKs, the App Store, Pilot Cloud and the trust model.",
      alternates: { canonical: "/docs" },
    };
  }
  const page = source.getPage(slug);
  if (!page) notFound();
  const image = `/og/docs/${slug.join("/")}`;
  return {
    title: { absolute: `${page.data.title} · Pilot Protocol docs` },
    description: page.data.description,
    alternates: { canonical: page.url, types: { "text/markdown": `${page.url}.mdx` } },
    openGraph: { images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}
