import { getAppPage, getAppPages } from "@/lib/content";
import { APPS } from "@/lib/apps";
import { renderOgImage } from "@/lib/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAppPages().map((a) => ({ id: a.slug }));
}

export async function GET(_: Request, { params }: RouteContext<"/apps/[id]/og.png">) {
  const id = (await params).id;
  const app = APPS.find((x) => x.id === id);
  const name = app?.name ?? getAppPage(id)?.name ?? "App Store";
  return renderOgImage({ title: app ? `${name}. ${app.description}` : name, kicker: "Pilot App Store" });
}
