import type { ReactNode } from "react";
import { LockIcon } from "@/components/icons";
import { ConnectionPath } from "@/components/pages/security/connection-path";
import { SeesBento } from "@/components/pages/security/sees";
import { Code, SectionHead, SKY, Soft } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Reveal, SmartLink, TextLink } from "@/components/ui";

/**
 * Sky site (Figma 233:1195, the "fits" panel 160:1771): the heading and the diagram share one hatched showcase panel.
 */
function SkyArchitecture() {
  return (
    <section aria-labelledby="architecture-title" className="py-24 sm:py-32">
      <div className="wrap">
        <HatchPanel className="px-4 py-14 sm:px-10 sm:py-20 lg:px-14">
          <SectionHead
            center
            id="architecture-title"
            title={
              <>
                Peer traffic. <span className="block text-mute">Separate coordination.</span>
              </>
            }
            lede={
              <>
                Agent traffic runs in encrypted tunnels between peers. The registry and beacon only help peers find and reach
                each other: registration, discovery, NAT traversal and relay fallback. Both are open source, so you can point{" "}
                <Code>--registry</Code> and <Code>--beacon</Code> at your own.
              </>
            }
          >
            <TextLink href="/self-hosting" className="mt-6">
              Self-hosting
            </TextLink>
          </SectionHead>
          <Reveal delay={80} className="mt-12 sm:mt-16">
            <ConnectionPath />
          </Reveal>
        </HatchPanel>
      </div>
    </section>
  );
}

export function Architecture() {
  if (SKY) return <SkyArchitecture />;
  return (
    <section aria-labelledby="architecture-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHead
            id="architecture-title"
            kicker="Architecture"
            title={
              <>
                Peer traffic. <Soft>Separate coordination.</Soft>
              </>
            }
            lede="Agent traffic runs in encrypted tunnels between peers. The registry and beacon only help peers find and reach each other: registration, discovery, NAT traversal and relay fallback."
          />
        </div>

        <Reveal delay={80} className="mt-14 sm:mt-20">
          <ConnectionPath />
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-4 border-t border-edge pt-6 text-[14.5px] leading-[1.55] text-mute sm:flex-row sm:items-baseline sm:justify-between">
          <p className="max-w-[720px]">
            <span className="text-fg">What you can change.</span> Registry and beacon addresses are settings (
            <Code>--registry</Code>, <Code>--beacon</Code>). Both servers are open source, so you can run your own.
          </p>
          <TextLink href="/self-hosting" className="shrink-0">
            Self-hosting
          </TextLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What the backbone can see                                           */
/* ------------------------------------------------------------------ */

type Part = { part: string; sees: string[]; sealed?: boolean; note: ReactNode };

const PARTS: Part[] = [
  {
    part: "Registry",
    sees: [
      "Node ID",
      "Public key",
      "Version",
      "Hostname and tags, if set",
      "Public or private flag",
      "Advertised endpoints",
      "Network membership",
      "Which nodes trust each other",
      "Heartbeat times",
      "Recovery email, if given",
    ],
    note: "Traffic between agents never passes through it.",
  },
  {
    part: "Beacon",
    sees: ["Your public IP and port", "Hole-punch requests", "Timing and size of relayed packets"],
    note: "Relayed payloads are ciphertext; the beacon has no tunnel keys.",
  },
  {
    part: "Peer tunnel",
    sees: [],
    sealed: true,
    note: "Only the two peers can read the payload.",
  },
  {
    part: "Data service agents",
    sees: ["Your query"],
    note: (
      <>
        The <SmartLink href="/service-agents" className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">agent you query</SmartLink> calls its upstream data source.{" "}
        <Code>/summary</Code> and free-text queries are also sent to Google Gemini.
      </>
    ),
  },
  {
    part: "App Store broker",
    sees: ["Contents of brokered requests"],
    note: "Some apps route calls through Pilot’s broker, which forwards them to the provider named in the app’s listing.",
  },
  {
    part: "Usage events",
    sees: ["Catalogue views", "App views", "Installs", "Reviews"],
    note: (
      <>
        Signed events from <Code>pilotctl</Code>. Turn them off with <Code>{`{"consent": {"telemetry": false}}`}</Code> in{" "}
        <Code>~/.pilot/config.json</Code>; see{" "}
        <SmartLink href="/docs/consent" className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
          consent
        </SmartLink>
        .
      </>
    ),
  },
];

function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-md border border-edge-2 px-2 py-[5px] font-mono text-[12px] leading-none whitespace-nowrap text-soft">
      {children}
    </li>
  );
}

/**
 * Sky site: what each part handles in the clear, as what it actually holds: the registry's entry for a node, the
 * beacon's log lines, the tunnel's ciphertext (set apart in deep blue, the one place nothing is readable in transit).
 */
function SkyBackboneSees() {
  return (
    <section aria-labelledby="sees-title" className="pb-24 sm:pb-32">
      <div className="wrap">
        <SectionHead
          center
          id="sees-title"
          title={
            <>
              What the backbone <span className="block text-mute">can see.</span>
            </>
          }
          lede="On the public backbone, Vulture Labs runs the registry and beacon. This is what each part of the system handles in the clear."
        />

        <SeesBento />
      </div>
    </section>
  );
}

export function BackboneSees() {
  if (SKY) return <SkyBackboneSees />;
  return (
    <section aria-labelledby="sees-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <SectionHead
          id="sees-title"
          kicker="Metadata"
          title={
            <>
              What the backbone <Soft>can see.</Soft>
            </>
          }
          lede="On the public backbone, Vulture Labs runs the registry and beacon. This is what each part of the system handles in the clear."
        />

        <div className="mt-14 sm:mt-16">
          <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,4fr)] gap-8 border-b border-edge-2 pb-3 font-mono text-[12px] text-dim lg:grid">
            <span>Part</span>
            <span>Handled in the clear</span>
            <span>Note</span>
          </div>
          <p className="flex items-center gap-2.5 border-b border-edge py-3 font-mono text-[12px] text-fg">
            <span aria-hidden className="size-1.5 bg-fg" />
            Run by Vulture Labs
          </p>
          <ul>
            {PARTS.filter((p) => !p.sealed).map((p, i) => (
              <Reveal
                as="li"
                key={p.part}
                delay={i * 40}
                className="grid grid-cols-1 gap-4 border-b border-edge py-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,4fr)] lg:gap-8"
              >
                <p className="text-[18px] leading-[1.3] font-medium tracking-[-0.015em] text-fg">{p.part}</p>
                <ul className="flex flex-wrap content-start gap-1.5" aria-label={`What the ${p.part.toLowerCase()} sees`}>
                  {p.sees.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </ul>
                <p className="text-[14.5px] leading-[1.55] text-mute">{p.note}</p>
              </Reveal>
            ))}
          </ul>
          {PARTS.filter((p) => p.sealed).map((p) => (
            <Reveal key={p.part} className="mt-10 border border-lime-ink/40 bg-lime/[0.04]">
              <p className="flex items-center gap-2.5 border-b border-lime-ink/25 px-4 py-3 font-mono text-[12px] text-lime-ink sm:px-5">
                <span aria-hidden className="size-1.5 bg-lime" />
                Run by the two endpoints
              </p>
              <div className="grid grid-cols-1 gap-4 px-4 py-7 sm:px-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,4fr)] lg:gap-8">
                <p className="text-[18px] leading-[1.3] font-medium tracking-[-0.015em] text-fg">{p.part}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-lime-ink/60 px-2.5 py-[7px] font-mono text-[12px] leading-none text-lime-ink">
                    <LockIcon className="size-3" />
                    Payload
                  </span>
                  <span className="font-mono text-[12px] text-dim">readable at A and B only</span>
                </div>
                <p className="text-[14.5px] leading-[1.55] text-mute">{p.note} Neither the registry nor the beacon receives the keys.</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
