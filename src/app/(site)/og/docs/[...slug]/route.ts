import { renderOgImage } from "@/lib/og";
import { source } from "@/lib/source";

export async function GET(_: Request, { params }: RouteContext<"/og/docs/[...slug]">) {
  const page = source.getPage((await params).slug);
  return renderOgImage({ title: page?.data.title ?? "Documentation", kicker: "Documentation" });
}

export function generateStaticParams() {
  return source
    .getPages()
    .filter((p) => p.slugs.length > 0)
    .map((p) => ({ slug: p.slugs }));
}
