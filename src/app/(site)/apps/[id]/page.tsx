import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SkyBand } from "@/components/page/page-header";
import { Prose } from "@/components/page/prose";
import { Toc } from "@/components/page/toc";
import { Command, TextLink } from "@/components/ui";
import { APPS } from "@/lib/apps";
import { getAppPage, getAppPages } from "@/lib/content";
import { SITE_VARIANT } from "@/lib/site";

/* eslint-disable @next/next/no-img-element */

export const dynamicParams = false;

export function generateStaticParams() {
  return getAppPages().map((a) => ({ id: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apps/[id]">): Promise<Metadata> {
  const a = getAppPage((await params).id);
  if (!a) return {};
  return { title: { absolute: a.seoTitle || a.name }, description: a.description, alternates: { canonical: `/apps/${a.slug}` }, openGraph: { images: [`/apps/${a.slug}/og.png`] }, twitter: { card: "summary_large_image", images: [`/apps/${a.slug}/og.png`] } };
}

// The sky site (flight design): the header sits on the sky band, facts and related apps on white cards.
const SKY = SITE_VARIANT === "sky";

const METRICS: [string, string][] = [
  ["version", "Version"],
  ["methods", "Methods"],
  ["size", "Size"],
  ["permissions", "Permissions"],
  ["platforms", "Platforms"],
];

export default async function AppDetail({ params }: PageProps<"/apps/[id]">) {
  const page = getAppPage((await params).id);
  if (!page) notFound();
  const app = APPS.find((a) => a.id === page.slug);
  // headText is the old page header flattened: name, publisher, ·, id, description, category, status, …
  const category = page.headText[5] ?? "";
  const publisher = app?.publisher ?? page.headText[1] ?? "";
  const related = page.related.map((id) => APPS.find((a) => a.id === id)).filter((a) => a !== undefined);

  if (SKY) {
    return (
      <>
        <SkyBand>
          <div className="wrap pt-12 pb-12 sm:pt-16 sm:pb-16">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "App Store", href: "/app-store" }, { label: page.name }]} />
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {app && (
                  <span className="size-24 shrink-0 overflow-hidden rounded-[23%] bg-card shadow-float sm:size-28">
                    <img src={app.icon} alt="" width={112} height={112} className="size-full object-cover" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-[13.5px] text-mute">
                    {publisher} · <span className="font-mono text-[12.5px]">{page.slug}</span>
                  </p>
                  <h1 className="mt-2 text-[clamp(38px,5vw,64px)] leading-[1.02] font-medium tracking-[-0.045em] text-fg">{page.name}</h1>
                  <p className="mt-3 max-w-[560px] text-[17px] leading-[1.5] text-pretty text-mute">{page.description}</p>
                </div>
              </div>
              <div className="rounded-[20px] bg-card p-4 shadow-card sm:p-5">
                <p className="flex items-center gap-2 text-[13px] text-mute">
                  <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
                  {category ? `${category} · ` : ""}Live on the catalogue
                </p>
                <Command value={`pilotctl appstore install ${page.slug}`} prefix="$ " className="mt-3" label="Copy install command" />
              </div>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-edge shadow-card sm:mt-12 sm:grid-cols-3 lg:grid-cols-5">
              {METRICS.map(([key, label], i) => (
                <div key={key} className={`bg-card px-5 py-4 sm:px-6 sm:py-5 ${i === METRICS.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}>
                  <dt className="text-[13px] text-mute">{label}</dt>
                  <dd className="mt-1 text-[17px] text-fg tabular-nums">{page.metrics[key] ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </SkyBand>

        <div className="wrap grid grid-cols-1 gap-12 pt-8 pb-12 sm:pt-10 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-20">
          <Prose html={page.html} className="max-w-[760px]" />
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Toc items={page.toc.filter((t) => t.level === 2)} />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-apps" className="py-16 sm:py-20">
            <div className="wrap">
              <div className="flex items-end justify-between gap-6">
                <h2 id="related-apps" className="text-[28px] font-medium tracking-[-0.035em] text-fg">
                  {category ? `More in ${category}` : "You might also like"}
                </h2>
                <TextLink href="/app-store">All apps</TextLink>
              </div>
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/apps/${r.id}`}
                      className="group flex h-full items-start gap-4 rounded-[20px] bg-card p-5 shadow-tile transition-shadow duration-300 hover:shadow-card"
                    >
                      <img src={r.icon} alt="" width={48} height={48} className="size-12 shrink-0 rounded-[23%] shadow-tile" loading="lazy" />
                      <span className="min-w-0">
                        <span className="block text-[16px] font-medium text-fg">{r.name}</span>
                        <span className="mt-1 block text-[14px] leading-[1.45] text-mute">{r.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <header className="border-b border-edge">
        <div className="wrap pt-14 pb-12 sm:pt-20">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "App Store", href: "/app-store" }, { label: page.name }]} />
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {app && (
                <img
                  src={app.icon}
                  alt=""
                  width={112}
                  height={112}
                  className="size-24 shrink-0 rounded-[22%] shadow-float sm:size-28"
                />
              )}
              <div className="min-w-0">
                <p className="font-mono text-[12px] text-dim">
                  {publisher} · {page.slug}
                </p>
                <h1 className="mt-2 text-[clamp(38px,5vw,64px)] leading-[1.02] font-medium tracking-[-0.035em] text-fg">{page.name}</h1>
                <p className="mt-3 max-w-[560px] text-[17px] leading-[1.5] text-mute">{page.description}</p>
              </div>
            </div>
            <div>
              <p className="flex items-center gap-2 font-mono text-[12px] text-dim">
                <span aria-hidden className="size-1.5 bg-lime" />
                {category ? `${category} · ` : ""}Live on the catalogue
              </p>
              <Command value={`pilotctl appstore install ${page.slug}`} prefix="$ " className="mt-3" label="Copy install command" />
            </div>
          </div>
        </div>

        <dl className="wrap grid grid-cols-2 border-t border-edge sm:grid-cols-3 lg:grid-cols-5">
          {METRICS.map(([key, label], i) => (
            <div
              key={key}
              className={`border-edge py-5 sm:px-6 ${i % 2 === 1 ? "border-l pl-5" : ""} sm:border-l sm:first:border-l-0 sm:first:pl-0 lg:[&:nth-child(4)]:border-l`}
            >
              <dt className="font-mono text-[11.5px] text-dim">{label}</dt>
              <dd className="mt-1.5 text-[17px] text-fg tabular-nums">{page.metrics[key] ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="wrap grid grid-cols-1 gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-20">
        <Prose html={page.html} className="max-w-[760px]" />
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc items={page.toc.filter((t) => t.level === 2)} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-apps" className="border-t border-edge py-16 sm:py-20">
          <div className="wrap">
            <div className="flex items-end justify-between gap-6">
              <h2 id="related-apps" className="text-[24px] font-medium tracking-[-0.025em] text-fg">
                {category ? `More in ${category}` : "You might also like"}
              </h2>
              <TextLink href="/app-store">All apps</TextLink>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} className="bg-bg">
                  <Link href={`/apps/${r.id}`} className="group flex h-full items-start gap-4 p-5 transition-colors hover:bg-fg/[0.03]">
                    <img src={r.icon} alt="" width={48} height={48} className="size-12 shrink-0 rounded-[22%]" loading="lazy" />
                    <span className="min-w-0">
                      <span className="block text-[16px] text-fg">{r.name}</span>
                      <span className="mt-1 block text-[14px] leading-[1.45] text-mute">{r.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
