import { renderOgImage } from "@/lib/og";
import { getPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: RouteContext<"/learn/[slug]/og.png">) {
  const a = await getPost("learn", (await params).slug);
  const res = await renderOgImage({ title: a?.title ?? "Pilot Protocol", kicker: "Learning center" });
  res.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800");
  return res;
}
