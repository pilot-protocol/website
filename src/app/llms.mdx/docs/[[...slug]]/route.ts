import { notFound } from "next/navigation";
import { source } from "@/lib/source";

// Each docs page as Markdown (served at /docs/<page>.mdx through a rewrite). Built once, at build time.
export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<"/llms.mdx/docs/[[...slug]]">) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  // Drop Fumadocs' custom heading ids ("## Title [#id]"); they mean nothing outside the site.
  const body = (await page.data.getText("processed")).replace(/^(#{1,6} .*?)\s*\[#[^\]]+\]\s*$/gm, "$1");
  const head = [`# ${page.data.title}`, page.data.description, `Source: https://pilotprotocol.network${page.url}`]
    .filter(Boolean)
    .join("\n\n");
  return new Response(`${head}\n\n${body}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
