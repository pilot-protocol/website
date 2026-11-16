import type { ReactNode } from "react";
import { ArrowRightIcon, ArrowUpRightIcon, KeyIcon, XIcon } from "@/components/icons";
import { PageHeader } from "@/components/page/page-header";
import { ObjTile, Tile } from "@/components/pages/security/infra";
import { Code, FLAT_CARD, SectionHead, SKY, Soft } from "@/components/pages/security/kit";
import { Blueprint } from "@/components/pages/self-hosting/blueprint";
import { Hardening } from "@/components/pages/self-hosting/hardening";
import { SameProtocol } from "@/components/pages/self-hosting/operator";
import { RegistryControls } from "@/components/pages/self-hosting/registry-controls";
import { Run } from "@/components/pages/self-hosting/run";
import { Button, GhostButton, Packet, Reveal, SmartLink, TextLink } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";

const REPO = "https://github.com/pilot-protocol/rendezvous";
const BEACON = "https://github.com/pilot-protocol/beacon";
const inline = "text-fg underline decoration-fg/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg";

/* The sky hero's strip. */
const SKY_STATS = [
  { value: "AGPL-3.0", label: "License" },
  { value: "One", label: "Process: registry and beacon" },
  { value: "Yours", label: "The admin token" },
  { value: "None", label: "Support plan or SLA" },
];

const FACTS: [string, ReactNode, ReactNode][] = [
  ["License", "AGPL-3.0", "The code behind the public backbone’s registry and beacon."],
  [
    "Process",
    "Registry + beacon",
    <>
      <Code>rendezvous</Code> runs both in one process. A standalone beacon is available too.
    </>,
  ],
  ["Admin", "Your token", "Creating networks and every registry-wide setting need it."],
  ["Support", "None", "No hosted option, support plan or SLA. You operate it."],
];

function Facts() {
  if (SKY) {
    // One white card: a quiet sentence-case label, the value, one line of detail.
    return (
      <dl className="rise-in grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-(--sky-card-line) bg-(--sky-card-line) [--delay:240ms] lg:w-[480px]">
        {FACTS.map(([k, v, note]) => (
          <div key={k} className="flex flex-col bg-card p-4 sm:p-5">
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

const LIMITS: { t: string; b: ReactNode }[] = [
  {
    t: "Source, not a product",
    b: "The rendezvous and beacon READMEs describe the repositories as published for transparency, not as a hosting guide. There is no installer; you build from source and follow the repository yourself.",
  },
  { t: "One identity provider", b: "The identity-provider setting is registry-wide. Setting a new provider replaces the previous one." },
  {
    t: "Finite buffers",
    b: "The audit buffer holds the latest 1,000 events and the webhook dead-letter queue the latest 100. Export to a store you keep; failed webhooks are not replayed automatically.",
  },
  {
    t: "Separate from the backbone",
    b: (
      <>
        Nodes on your registry can’t reach the public backbone’s{" "}
        <SmartLink href="/service-agents" className={inline}>
          data service agents
        </SmartLink>{" "}
        or its peers. A daemon talks to one registry at a time.
      </>
    ),
  },
  {
    t: "Security is yours",
    b: (
      <>
        Keep the admin token secret: it can create and change every network. See{" "}
        <SmartLink href="/security" className={inline}>
          security
        </SmartLink>{" "}
        for what each component sees.
      </>
    ),
  },
  {
    t: "AGPL-3.0",
    b: "If you modify the registry or beacon and let others use it over a network, the license requires you to offer them your source.",
  },
];

const REFERENCE: [string, string, string][] = [
  ["Overview", "Registry controls", "/docs/enterprise"],
  ["Administration", "Roles and keys", "/docs/enterprise-rbac"],
  ["Identity", "OIDC, webhooks, directory sync", "/docs/enterprise-identity"],
  ["Policy", "Network policy", "/docs/enterprise-policies"],
  ["Evidence", "Audit log and export", "/docs/enterprise-audit"],
  ["Provisioning", "Blueprints", "/docs/enterprise-blueprints"],
];

/** A brand's mark on an object tile. */
function MarkTile({ brand, size = 44 }: { brand: Brand; size?: number }) {
  return (
    <Tile size={size}>
      <BrandMark brand={brand} className="size-5" />
    </Tile>
  );
}

const ARROW = <ArrowRightIcon className="size-3.5 shrink-0 text-fg/50" />;

/* Each limit, drawn: the repositories you build from, a provider replacing the last, the two buffers, two registries
   that don't connect, the token that's yours to keep, the license. */
const LIMIT_ART: ReactNode[] = [
  <>
    <MarkTile key="gh" brand="github" />
    <Tile key="go" size={44}>
      <BrandMark brand="go" className="size-7" />
    </Tile>
  </>,
  <>
    <ObjTile key="a" name="idBadge" size={44} dim />
    {ARROW}
    <ObjTile key="b" name="idBadge" size={44} lit />
  </>,
  <span key="buf" className="flex flex-col gap-2">
    {(
      [
        ["1,000 events", "w-[132px]"],
        ["100 dead letters", "w-[52px]"],
      ] as const
    ).map(([label, w]) => (
      <span key={label} className="flex items-center gap-2.5">
        <span className={`h-2 rounded-full bg-white/85 ${w}`} />
        <span className="font-mono text-[11.5px] leading-none whitespace-nowrap text-mute">{label}</span>
      </span>
    ))}
  </span>,
  <>
    <ObjTile key="a" name="server" size={44} />
    <span key="x" className="flex items-center gap-1">
      <span className="h-px w-3 bg-white/40" />
      <XIcon className="size-3 text-fg/70" />
      <span className="h-px w-3 bg-white/40" />
    </span>
    <ObjTile key="b" name="globe" size={44} dim />
  </>,
  <ObjTile key="k" name="key" size={44} />,
  <ObjTile key="s" name="scroll" size={44} />,
];

function Limits() {
  return (
    <section aria-labelledby="limits-title" className="pp-invert py-24 sm:py-32">
      <div className="wrap">
        <SectionHead
          id="limits-title"
          kicker="Before you run it"
          center={SKY}
          title={
            SKY ? (
              <>
                Limits <span className="block text-mute">worth knowing.</span>
              </>
            ) : (
              <>
                Limits <Soft>worth knowing.</Soft>
              </>
            )
          }
          lede="The registry is the same small service that runs the public backbone. It wasn’t packaged for other operators."
        />
        <ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {LIMITS.map((l, i) => (
            <Reveal as="li" key={l.t} delay={(i % 3) * 60} className={`border-t pt-5 ${SKY ? "border-edge-2" : "border-fg"}`}>
              {SKY ? (
                <span aria-hidden className="flex h-12 items-center gap-2">
                  {LIMIT_ART[i]}
                </span>
              ) : (
                <p className="font-mono text-[12px] text-dim">0{i + 1}</p>
              )}
              <p className={SKY ? "mt-4 text-[18px] leading-[1.3] font-medium tracking-[-0.03em] text-fg" : "mt-3 text-[19px] leading-[1.25] font-medium tracking-[-0.02em] text-fg"}>
                {l.t}
              </p>
              <p className="mt-2 text-[15px] leading-[1.55] text-mute">{l.b}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Reference() {
  return (
    <section aria-labelledby="reference-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-24 sm:py-32"}>
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col">
          <SectionHead
            id="reference-title"
            kicker="Reference"
            title={
              SKY ? (
                <>
                  Each control <span className="block text-mute">in detail.</span>
                </>
              ) : (
                <>
                  Each control <Soft>in detail.</Soft>
                </>
              )
            }
            lede="The reference docs describe the commands and fields for each control on a registry you run."
          />
          <Reveal delay={80} className="mt-10 flex flex-wrap items-center gap-3 lg:mt-auto lg:pt-12">
            <Button href={REPO}>
              rendezvous on GitHub
              <ArrowUpRightIcon className="size-3" />
            </Button>
            <GhostButton href={BEACON}>beacon</GhostButton>
            <TextLink href="/docs/getting-started" className="ml-2">
              Install the daemon
            </TextLink>
          </Reveal>
        </div>
        {SKY ? (
          <Reveal delay={60} as="ul" className={`${FLAT_CARD} self-start px-5 sm:px-6`}>
            {REFERENCE.map(([cat, t, href]) => (
              <li key={href} className="border-b border-(--sky-card-line) last:border-b-0">
                <SmartLink href={href} className="group flex items-center gap-6 py-4 sm:py-5">
                  <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                    <span className="shrink-0 text-[13px] text-mute sm:w-[120px]">{cat}</span>
                    <span className="min-w-0 text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{t}</span>
                  </span>
                  <ArrowUpRightIcon className="size-3 shrink-0 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--sky-accent)" />
                </SmartLink>
              </li>
            ))}
          </Reveal>
        ) : (
        <Reveal delay={60} as="ul" className="border-t border-edge">
          {REFERENCE.map(([cat, t, href]) => (
            <li key={href} className="border-b border-edge">
              <SmartLink href={href} className="group flex items-center gap-6 py-5">
                <span className="w-[120px] shrink-0 font-mono text-[12px] text-dim">{cat}</span>
                <span className="min-w-0 flex-1 text-[17px] font-medium tracking-[-0.015em] text-fg">{t}</span>
                <ArrowUpRightIcon className="size-3 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime-ink" />
              </SmartLink>
            </li>
          ))}
        </Reveal>
        )}
      </div>
    </section>
  );
}

export function SelfHostingPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Protocol", href: "/docs/concepts" }, { label: "Self-hosting" }]}
        title={
          <>
            Run your own <span className={SKY ? "text-mute" : "text-lime-ink"}>registry.</span>
          </>
        }
        lede="The registry (rendezvous) and beacon that coordinate the public backbone are open source under AGPL-3.0. Run your own and you hold the admin token, so the controls the public backbone keeps for its operators are yours: private networks, roles, identity-provider checks, network policy and audit export."
        aside={SKY ? undefined : <Facts />}
        stats={SKY ? SKY_STATS : undefined}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="#run">Build and run it</Button>
          <TextLink href={REPO}>rendezvous on GitHub</TextLink>
          <TextLink href="/docs/enterprise">Registry reference docs</TextLink>
        </div>
      </PageHeader>

      {SKY ? (
        <div className="wrap py-10 sm:py-12">
          <Reveal className={`${FLAT_CARD} grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 p-5 sm:gap-x-5 sm:p-6 lg:grid-cols-[auto_minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-x-8`}>
            <span className="grid size-10 place-items-center rounded-[12px] bg-(--sky-tint) text-(--sky-accent) lg:row-span-1">
              <KeyIcon className="size-[18px]" />
            </span>
            <p className="self-center text-[16px] leading-[1.35] font-medium tracking-[-0.01em] text-fg">
              Nobody runs registries for customers.
            </p>
            <p className="col-span-2 text-[15px] leading-[1.55] text-mute lg:col-span-1">
              Vulture Labs runs the public backbone and nothing else. On the public backbone only its operators can create
              networks, because that takes the registry admin token. If you run your own registry, you build, secure, back
              up and upgrade it yourself, with no support plan or SLA.
            </p>
          </Reveal>
        </div>
      ) : (
      <div className="wrap py-10 sm:py-12">
        <Reveal className="grid grid-cols-1 gap-4 border-l-2 border-lime-ink bg-lime/[0.045] px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:px-6">
          <p className="flex items-center gap-2.5 text-[16px] font-medium text-fg">
            <Packet /> Nobody runs registries for customers.
          </p>
          <p className="text-[15px] leading-[1.55] text-mute">
            Vulture Labs runs the public backbone and nothing else. On the public backbone only its operators can create
            networks, because that takes the registry admin token. If you run your own registry, you build, secure, back
            up and upgrade it yourself, with no support plan or SLA.
          </p>
        </Reveal>
      </div>
      )}

      <SameProtocol />
      <RegistryControls />
      <Run />
      <Blueprint />
      <Hardening />
      <Limits />
      <Reference />
    </>
  );
}
