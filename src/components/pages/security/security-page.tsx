import type { ReactNode } from "react";
import { PageHeader } from "@/components/page/page-header";
import { Architecture, BackboneSees } from "@/components/pages/security/architecture";
import { Controls } from "@/components/pages/security/controls";
import { DISCLOSURE_MAILTO, SECURITY_EMAIL } from "@/components/pages/security/contact";
import { CopyButton, FLAT_CARD, SKY, SKY_H2, SKY_LEDE } from "@/components/pages/security/kit";
import { DataHandling, Documents, Status } from "@/components/pages/security/ledgers";
import { Metrics } from "@/components/pages/security/metrics";
import { Packages } from "@/components/pages/security/packages";
import { Responsibility } from "@/components/pages/security/responsibility";
import { HatchPanel } from "@/components/sky/kit";
import { Button, Packet, Reveal, TextLink } from "@/components/ui";
import { LINKS } from "@/lib/site";

const FACTS: [string, ReactNode, string][] = [
  ["Source", "AGPL-3.0", "The daemon, pilotctl, registry and beacon are public."],
  ["Default", "Private", "A daemon’s endpoint stays hidden from peers it doesn’t trust."],
  [
    "Tunnels",
    <>
      X25519 + <span className="whitespace-nowrap">AES-256-GCM</span>
    </>,
    "A key per pair of peers. Relays carry ciphertext only.",
  ],
  ["Certification", "None", "Pilot has no SOC 2 report or other independent certification."],
];

/* The sky hero's strip (the certification fact is in the documents ledger further down). */
const SKY_STATS = [
  { value: "AGPL-3.0", label: "Source you can read" },
  { value: "Private", label: "Endpoints by default" },
  { value: "256-bit", label: "AES-GCM per tunnel" },
  { value: "Ed25519", label: "Identity per agent" },
];

function Facts() {
  if (SKY) {
    // One white card on the sky site: four quiet facts, hairlines between them.
    return (
      <dl className={`rise-in grid grid-cols-2 overflow-hidden [--delay:240ms] lg:w-[480px] ${FLAT_CARD}`}>
        {FACTS.map(([k, v, note], i) => (
          <div
            key={k}
            className={`flex flex-col border-(--sky-card-line) p-4 sm:p-5 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""}`}
          >
            <dt className="text-[13px] leading-5 text-mute">{k}</dt>
            <dd className="mt-2.5 text-[17px] leading-[1.2] font-medium tracking-[-0.02em] text-fg sm:text-[19px]">{v}</dd>
            <dd className="mt-1.5 text-[13.5px] leading-[1.45] text-mute">{note}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className="rise-in grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge [--delay:240ms] lg:w-[480px]">
      {FACTS.map(([k, v, note]) => (
        <div key={k} className="flex flex-col bg-bg p-4 sm:p-5">
          <dt className="font-mono text-[12px] text-dim">{k}</dt>
          <dd className="mt-3 text-[17px] leading-[1.2] font-medium tracking-[-0.02em] text-fg sm:text-[19px]">{v}</dd>
          <dd className="mt-1.5 text-[13.5px] leading-[1.45] text-mute">{note}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Sky site (Figma 233:1195): the page ends on a hatched showcase panel, one place to report with the address you
 * can copy, and the footer's sky rises under it.
 */
function SkyReport() {
  return (
    <section aria-labelledby="report-title" className="py-24 sm:py-32">
      <div className="wrap">
        <HatchPanel className="px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
          <Reveal className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
            <div>
              <h2 id="report-title" className={SKY_H2}>
                Found something? <span className="block text-mute">Tell us privately.</span>
              </h2>
              <p className={`mt-4 max-w-[540px] ${SKY_LEDE}`}>
                Send security issues, privacy concerns and bugs through the disclosure form, or by email. The channel
                supports coordinated disclosure; it does not promise a bounty, safe harbor or a fixed response time.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className={`flex items-center gap-2.5 py-1.5 pr-1.5 pl-3.5 ${FLAT_CARD}`}>
                <a
                  href={DISCLOSURE_MAILTO}
                  className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg underline decoration-fg/0 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg/50"
                >
                  {SECURITY_EMAIL}
                </a>
                <CopyButton value={SECURITY_EMAIL} label="Copy email address" />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href="/security/disclosure">Report a vulnerability</Button>
                <TextLink href="/.well-known/security.txt">security.txt</TextLink>
                <TextLink href="/docs/security">Security documentation</TextLink>
              </div>
            </div>
          </Reveal>
        </HatchPanel>
      </div>
    </section>
  );
}

function Report() {
  if (SKY) return <SkyReport />;
  return (
    <section aria-labelledby="report-title" className="relative overflow-hidden border-t border-edge py-24 sm:py-32">
      <span aria-hidden className="absolute -top-1 left-[22%] size-2 bg-lime" />
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <Reveal>
          <p className="flex items-center gap-2.5 font-mono text-[13px] text-dim">
            <Packet /> Report a vulnerability
          </p>
          <h2
            id="report-title"
            className="mt-5 text-[clamp(40px,5.4vw,72px)] leading-[1] font-medium tracking-[-0.04em] text-balance text-fg"
          >
            Found something? <span className="text-lime-ink">Tell us privately.</span>
          </h2>
          <p className="mt-6 max-w-[560px] text-[16px] leading-[1.55] text-mute sm:text-[17px]">
            Send security issues, privacy concerns and bugs through the disclosure form, or by email. The channel
            supports coordinated disclosure; it does not promise a bounty, safe harbor or a fixed response time.
          </p>
        </Reveal>
        <Reveal delay={80} className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5 rounded-md border border-edge-3 py-1.5 pr-1.5 pl-3">
            <a
              href={DISCLOSURE_MAILTO}
              className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg underline decoration-fg/0 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg/50"
            >
              {SECURITY_EMAIL}
            </a>
            <CopyButton value={SECURITY_EMAIL} label="Copy email address" />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href="/security/disclosure">Report a vulnerability</Button>
            <TextLink href="/.well-known/security.txt">security.txt</TextLink>
            <TextLink href="/docs/security">Security documentation</TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SecurityPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Protocol", href: "/docs/concepts" }, { label: "Security" }]}
        title={
          <>
            What Pilot secures, <span className={SKY ? "text-mute" : "text-lime-ink"}>and what it doesn’t.</span>
          </>
        }
        lede="How Pilot handles identity, encryption, trust and reachability, what the public backbone can see, and which decisions stay with your application. All of it can be checked against the source."
        aside={SKY ? undefined : <Facts />}
        stats={SKY ? SKY_STATS : undefined}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="/security/disclosure">Report a vulnerability</Button>
          <TextLink href="/docs/security">Security documentation</TextLink>
          <TextLink href={LINKS.githubOrg}>Inspect the source</TextLink>
          <TextLink href="#metrics">Metric definitions</TextLink>
        </div>
      </PageHeader>
      <Controls />
      <Architecture />
      <BackboneSees />
      <Responsibility />
      <Packages />
      <Status />
      <Documents />
      <DataHandling />
      <Metrics />
      <Report />
    </>
  );
}
