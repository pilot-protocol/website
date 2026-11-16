import type { ReactNode } from "react";
import { NetworkCanvas } from "@/components/hero/network-canvas";
import { Breadcrumbs, PageHeader } from "@/components/page/page-header";
import { SKY_H2, SKY_LEDE, SkySplit } from "@/components/pages/security/kit";
import { Button, GhostButton, Reveal, TextLink } from "@/components/ui";
import { APPS } from "@/lib/apps";
import { getAppPages } from "@/lib/content";
import { LINKS, SITE_VARIANT } from "@/lib/site";
import { Browser } from "./browser";
import type { Facts } from "./data";
import { HowItWorks, SkyHowItWorks } from "./how-it-works";
import { InstallLoop } from "./install-loop";
import "./app-store.css";

// The sky site. This is a server component, so it reads the variant itself.
const SKY = SITE_VARIANT === "sky";
/** The manifest below is Cosift's; its icon heads the code card. */
const COSIFT_ICON = APPS.find((a) => a.id === "io.pilot.cosift")?.icon ?? "";

const H2 = SKY ? SKY_H2 : "text-[clamp(30px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";

// The manifest pilot-app generates, as published in the App Store docs (io.pilot.cosift).
const K = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-lime-ink/90">{children}</span>;
const MANIFEST: { t: ReactNode; hi?: boolean }[] = [
  { t: "{" },
  { t: <>  <K>&quot;id&quot;</K>: <S>&quot;io.pilot.cosift&quot;</S>,</> },
  { t: <>  <K>&quot;app_version&quot;</K>: <S>&quot;0.1.2&quot;</S>,</> },
  { t: <>  <K>&quot;binary&quot;</K>: {"{"} &quot;runtime&quot;: &quot;go&quot;, &quot;path&quot;: &quot;bin/cosift-app&quot;, <S>&quot;sha256&quot;: &quot;&lt;pinned&gt;&quot;</S> {"}"},</>, hi: true },
  { t: <>  <K>&quot;exposes&quot;</K>: [&quot;cosift.search&quot;, &quot;cosift.answer&quot;, &quot;cosift.research&quot;,</> },
  { t: <>              &quot;cosift.stats&quot;, &quot;cosift.health&quot;, &quot;cosift.help&quot;],</> },
  { t: <>  <K>&quot;grants&quot;</K>: [</> },
  { t: <>    {"{"} &quot;cap&quot;: &quot;net.dial&quot;, &quot;target&quot;: &quot;cosift.pilotprotocol.network&quot;,</> },
  { t: <>      &quot;if&quot;: {"{"} &quot;kind&quot;: &quot;rate&quot;, &quot;params&quot;: {"{"} &quot;per&quot;: &quot;min&quot;, &quot;limit&quot;: 120 {"}"} {"}"} {"}"},</> },
  { t: <>    {"{"} &quot;cap&quot;: &quot;fs.read&quot;,  &quot;target&quot;: &quot;$APP/config.json&quot; {"}"},</> },
  { t: <>    {"{"} &quot;cap&quot;: &quot;audit.log&quot;, &quot;target&quot;: &quot;*&quot; {"}"}</> },
  { t: <>  ],</> },
  { t: <>  <K>&quot;protection&quot;</K>: <S>&quot;shareable&quot;</S>,</> },
  { t: <>  <K>&quot;store&quot;</K>: {"{"} &quot;publisher&quot;: &quot;ed25519:...&quot;, <S>&quot;signature&quot;: &quot;...&quot;</S> {"}"}</>, hi: true },
  { t: "}" },
];

/**
 * Sky: the same manifest wrapped to about 56 columns, so it sits whole in the split's code card at desktop widths
 * instead of running out under its right edge. The pinned binary and the signature stay lit.
 */
const SKY_MANIFEST: { t: ReactNode; hi?: boolean }[] = [
  { t: "{" },
  { t: <>  <K>&quot;id&quot;</K>: <S>&quot;io.pilot.cosift&quot;</S>,</> },
  { t: <>  <K>&quot;app_version&quot;</K>: <S>&quot;0.1.2&quot;</S>,</> },
  { t: <>  <K>&quot;binary&quot;</K>: {"{"} &quot;runtime&quot;: &quot;go&quot;, &quot;path&quot;: &quot;bin/cosift-app&quot;,</>, hi: true },
  { t: <>              <S>&quot;sha256&quot;: &quot;&lt;pinned&gt;&quot;</S> {"}"},</>, hi: true },
  { t: <>  <K>&quot;exposes&quot;</K>: [&quot;cosift.search&quot;, &quot;cosift.answer&quot;,</> },
  { t: <>              &quot;cosift.research&quot;, &quot;cosift.stats&quot;,</> },
  { t: <>              &quot;cosift.health&quot;, &quot;cosift.help&quot;],</> },
  { t: <>  <K>&quot;grants&quot;</K>: [</> },
  { t: <>    {"{"} &quot;cap&quot;: &quot;net.dial&quot;,</> },
  { t: <>      &quot;target&quot;: &quot;cosift.pilotprotocol.network&quot;,</> },
  { t: <>      &quot;if&quot;: {"{"} &quot;kind&quot;: &quot;rate&quot;,</> },
  { t: <>              &quot;params&quot;: {"{"} &quot;per&quot;: &quot;min&quot;, &quot;limit&quot;: 120 {"}"} {"}"} {"}"},</> },
  { t: <>    {"{"} &quot;cap&quot;: &quot;fs.read&quot;, &quot;target&quot;: &quot;$APP/config.json&quot; {"}"},</> },
  { t: <>    {"{"} &quot;cap&quot;: &quot;audit.log&quot;, &quot;target&quot;: &quot;*&quot; {"}"}</> },
  { t: <>  ],</> },
  { t: <>  <K>&quot;protection&quot;</K>: <S>&quot;shareable&quot;</S>,</> },
  { t: <>  <K>&quot;store&quot;</K>: {"{"} &quot;publisher&quot;: &quot;ed25519:...&quot;,</>, hi: true },
  { t: <>             <S>&quot;signature&quot;: &quot;...&quot;</S> {"}"}</>, hi: true },
  { t: "}" },
];

export function AppStorePage() {
  const facts: Facts = Object.fromEntries(getAppPages().map((p) => [p.slug, { version: p.metrics.version, methods: p.metrics.methods }]));

  const title = (
    <>
      Agent apps. <span className="block text-lime-ink lg:whitespace-nowrap">One command away.</span>
    </>
  );
  const lede =
    "Capabilities built for agents, not browsers: databases, sandboxes, search, email and phone, payments. Each one installs as a sha256-pinned, signature-verified service that the daemon starts for you and your agent calls as typed JSON.";
  // Sky header content (the green site keeps its own header below).
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button href="#apps">Browse {APPS.length} apps</Button>
      <GhostButton href={LINKS.publish}>Publish your app</GhostButton>
    </div>
  );
  const dataNote = (
    <p className="mt-7 max-w-[520px] text-[14.5px] leading-[1.55] text-mute">
      Looking for live data instead? The{" "}
      <a href={LINKS.serviceAgents} className="text-soft underline decoration-fg/25 underline-offset-[3px] hover:decoration-fg">
        data service agents
      </a>{" "}
      answer queries over the network.
    </p>
  );

  return (
    <>
      {SKY ? (
        <PageHeader
          crumbs={[{ label: "Home", href: "/" }, { label: "App Store" }]}
          title={title}
          lede={lede}
          aside={
            <Reveal delay={150} className="w-full max-w-[520px]">
              <InstallLoop />
            </Reveal>
          }
        >
          {actions}
          {dataNote}
        </PageHeader>
      ) : (
      <header className="relative overflow-hidden border-b border-edge">
        <div aria-hidden className="absolute inset-x-0 top-6 h-[132px]">
          <NetworkCanvas lineAlpha={0.13} />
        </div>
        <div className="wrap relative grid grid-cols-1 gap-14 pt-[184px] pb-16 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:items-end lg:gap-14">
          <div className="max-w-[640px]">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "App Store" }]} />
            <h1 className="mt-5 text-[clamp(40px,5.2vw,70px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance text-fg">
              Agent apps. <span className="block text-lime-ink lg:whitespace-nowrap">One command away.</span>
            </h1>
            <p className="mt-6 text-[17px] leading-[1.55] text-mute sm:text-[18px]">
              Capabilities built for agents, not browsers: databases, sandboxes, search, email and phone, payments. Each one
              installs as a sha256-pinned, signature-verified service that the daemon starts for you and your agent calls as
              typed JSON.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button href="#apps">Browse {APPS.length} apps</Button>
              <GhostButton href={LINKS.publish}>Publish your app</GhostButton>
            </div>
            <p className="mt-8 max-w-[520px] text-[14.5px] leading-[1.55] text-dim">
              Looking for live data instead? The{" "}
              <a href={LINKS.serviceAgents} className="text-soft underline decoration-fg/25 underline-offset-[3px] hover:decoration-fg">
                data service agents
              </a>{" "}
              answer queries over the network.
            </p>
          </div>
          <Reveal delay={150}>
            <InstallLoop />
          </Reveal>
        </div>
      </header>
      )}

      <section id="apps" aria-label="All apps" className={`scroll-mt-20 ${SKY ? "pt-6 pb-16 sm:pt-8 sm:pb-24" : "py-16 sm:py-24"}`}>
        <div className="wrap">
          <Browser facts={facts} />
        </div>
      </section>

      {SKY ? (
        <section id="how" aria-labelledby="how-title" className="scroll-mt-20">
          <SkyHowItWorks
            heading={
              <Reveal className="max-w-[600px]">
                <h2 id="how-title" className={SKY_H2}>
                  Discover, install, call. <span className="block text-mute">JSON in, JSON out.</span>
                </h2>
                <p className={`mt-4 max-w-[540px] ${SKY_LEDE}`}>
                  An app is a small binary and a signed manifest. It runs on your machine next to the daemon, which supervises
                  it and brokers every call over local IPC.
                </p>
              </Reveal>
            }
          />
        </section>
      ) : (
      <section id="how" aria-labelledby="how-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="max-w-[640px]">
            <h2 id="how-title" className={H2}>
              Discover, install, call. <span className="text-dim">JSON in, JSON out.</span>
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-mute sm:text-[17px]">
              An app is a small binary and a signed manifest. It runs on your machine next to the daemon, which supervises it
              and brokers every call over local IPC.
            </p>
          </Reveal>
          <div className="mt-12 sm:mt-16">
            <HowItWorks />
          </div>
        </div>
      </section>
      )}

      {SKY ? (
        <SkySplit
          id="publish"
          labelledBy="ship-title"
          flip
          className="mt-20 mb-24 sm:mt-28 sm:mb-32"
          visualClassName="lg:px-8"
          text={
            <Reveal>
              <h2 id="ship-title" className={SKY_H2}>
                Ship an agent app. <span className="block text-mute">It’s just a manifest.</span>
              </h2>
              <p className={`mt-4 max-w-[480px] ${SKY_LEDE}`}>
                Describe your app&apos;s methods in a guided submission. We build, sign and review the adapter. Once it&apos;s
                approved, <code className="font-mono text-[15px] text-soft">pilotctl appstore install &lt;id&gt;</code> works
                everywhere on the overlay.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href={LINKS.publish}>Publish your app</Button>
                <TextLink href="/docs/app-store">Read the docs</TextLink>
              </div>
            </Reveal>
          }
          visual={
            <Reveal delay={100} className="w-full min-w-0">
              {/* The manifest on a flat code card, the two signed lines lit. */}
              <figure className="overflow-hidden rounded-[12px] border border-(--sky-card-line) bg-card">
                <figcaption className="flex h-12 items-center justify-between gap-4 border-b border-(--sky-card-line) px-4 text-[12px] text-mute">
                  <span className="flex min-w-0 items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={COSIFT_ICON} alt="" width={24} height={24} className="size-6 shrink-0 rounded-[23%] shadow-tile" />
                    <span className="truncate font-mono text-[12.5px] text-fg">manifest.json</span>
                  </span>
                  <span className="shrink-0">Generated by pilot-app · signed</span>
                </figcaption>
                <pre tabIndex={0} className="no-scrollbar overflow-x-auto py-4 font-mono text-[12px] leading-[1.75] text-soft sm:text-[12.5px]">
                  {SKY_MANIFEST.map((l, i) => (
                    <div key={i} className={`relative w-max min-w-full pr-5 pl-4 whitespace-pre sm:pl-5 ${l.hi ? "bg-(--sky-tint)" : ""}`}>
                      {l.hi && <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-(--sky-fill)" />}
                      {l.t}
                    </div>
                  ))}
                </pre>
              </figure>
            </Reveal>
          }
        />
      ) : (
      <section id="publish" aria-labelledby="ship-title" className="pp-invert py-24 sm:py-32">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-2.5 font-mono text-[13px] text-dim">
              <span aria-hidden className="size-2 bg-lime" />
              For builders
            </p>
            <h2 id="ship-title" className={`mt-5 ${H2}`}>
              Ship an agent app. <span className="text-dim">It’s just a manifest.</span>
            </h2>
            <p className="mt-5 max-w-[460px] text-[16px] leading-[1.55] text-mute sm:text-[17px]">
              Describe your app&apos;s methods in a guided submission. We build, sign and review the adapter. Once it&apos;s
              approved, <code className="font-mono text-[14.5px] text-soft">pilotctl appstore install &lt;id&gt;</code> works
              everywhere on the overlay.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href={LINKS.publish}>Publish your app</Button>
              <TextLink href="/docs/app-store">Read the docs</TextLink>
            </div>
          </Reveal>
          <Reveal delay={100} className="min-w-0">
            <figure>
              <div className="pp-island">
                <p className="flex h-10 items-center justify-between border-b border-edge px-4 font-mono text-[11.5px] text-dim">
                  <span>manifest.json</span>
                  <span>generated by pilot-app</span>
                </p>
                <pre tabIndex={0} className="no-scrollbar overflow-x-auto py-4 font-mono text-[12px] leading-[1.75] text-soft sm:text-[12.5px]">
                  {MANIFEST.map((l, i) => (
                    <div
                      key={i}
                      className={`w-max min-w-full border-l-2 pr-5 pl-[14px] whitespace-pre sm:pl-[18px] ${l.hi ? "border-lime-ink bg-lime/[0.07]" : "border-transparent"}`}
                    >
                      {l.t}
                    </div>
                  ))}
                </pre>
              </div>
              <figcaption className="mt-3 font-mono text-[11.5px] text-dim">
                The binary is pinned by hash and the whole manifest is signed. Grants say what the app may do.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
      )}
    </>
  );
}
