import { CheckIcon, XIcon } from "@/components/icons";
import { PageHeader } from "@/components/page/page-header";
import { EGRESS } from "@/components/pages/compatibility/data";
import { Deployments } from "@/components/pages/compatibility/deployments";
import { EgressTable } from "@/components/pages/compatibility/egress-sky";
import { Tile, type IconName } from "@/components/pages/compatibility/marks";
import { Matrix } from "@/components/pages/compatibility/matrix";
import { SingleSocket } from "@/components/pages/compatibility/sni";
import { ModeSpecs, Transport } from "@/components/pages/compatibility/transport";
import { Code, FLAT_CARD, SectionHead, SKY, SKY_H2, SKY_LABEL as LABEL, SKY_LEDE, Soft } from "@/components/pages/security/kit";
import { HatchPanel, SkyRule } from "@/components/sky/kit";
import { Button, Command, Reveal, TextLink } from "@/components/ui";
import { INSTALL_CMD } from "@/lib/site";
import "@/components/pages/compatibility/sky.css";

const RELEASES = "https://github.com/pilot-protocol/pilotprotocol/releases/latest";
const ISSUES = "https://github.com/pilot-protocol/pilotprotocol/issues";
const inline = "text-fg underline decoration-fg/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg";

/** Sky site: the seven egress models as one flat table card, with round marks. */
function SkyEgress() {
  const works = EGRESS.filter((e) => e.ok).length;
  return (
    <section aria-labelledby="egress-title" className="py-24 sm:py-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHead
            id="egress-title"
            kicker="Corporate networks"
            title={
              <>
                Egress models. <span className="block text-mute">What works today.</span>
              </>
            }
            lede="Seven ways a network lets traffic out, from open egress to protocol allowlists, and what Pilot needs on each."
          />
          <Reveal delay={60} className="flex items-center gap-3 lg:pb-1.5">
            <span className="flex gap-1" aria-hidden>
              {EGRESS.map((e) =>
                e.ok ? (
                  <span key={e.model} className="size-3 rounded-full bg-(--sky-fill)" />
                ) : (
                  <span key={e.model} className="size-3 rounded-full border-[1.5px] border-fg/25" />
                ),
              )}
            </span>
            <span className="text-[14px] text-mute">
              <span className="font-medium text-fg tabular-nums">
                {works} of {EGRESS.length}
              </span>{" "}
              work today
            </span>
          </Reveal>
        </div>

        <EgressTable />
      </div>
    </section>
  );
}

function Egress() {
  if (SKY) return <SkyEgress />;
  const works = EGRESS.filter((e) => e.ok).length;
  return (
    <section aria-labelledby="egress-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHead
            id="egress-title"
            kicker="Corporate networks"
            title={
              <>
                Egress models. <Soft>What works today.</Soft>
              </>
            }
          />
          <Reveal delay={60} className="flex flex-col gap-3 lg:items-end">
            <span className="flex gap-1.5" aria-hidden>
              {EGRESS.map((e) =>
                e.ok ? (
                  <span key={e.model} className="size-5 bg-lime" />
                ) : (
                  <span key={e.model} className="grid size-5 place-items-center border border-edge-3 text-mute">
                    <XIcon className="size-2.5" />
                  </span>
                ),
              )}
            </span>
            <span className="font-mono text-[12px] text-dim">
              {works} of {EGRESS.length} work today
            </span>
          </Reveal>
        </div>

        <div className="mt-14 sm:mt-16">
          <div className="hidden grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] gap-8 border-b border-edge-2 pb-3 font-mono text-[12px] text-dim md:grid">
            <span>Model</span>
            <span>Today</span>
            <span>What’s needed</span>
          </div>
          <ul>
            {EGRESS.map((e, i) => (
              <Reveal
                as="li"
                key={e.model}
                delay={i * 40}
                className="grid grid-cols-1 gap-3 border-b border-edge py-6 md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] md:gap-8"
              >
                <div>
                  <p className={`text-[17px] leading-[1.35] font-medium tracking-[-0.015em] ${e.ok ? "text-fg" : "text-soft"}`}>{e.model}</p>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-dim">{e.examples}</p>
                </div>
                <p className="flex gap-3 text-[15px] leading-[1.55] text-soft">
                  {e.ok ? (
                    <span className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] bg-lime text-ink">
                      <CheckIcon className="size-3" />
                    </span>
                  ) : (
                    <span className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-edge-3 text-mute">
                      <XIcon className="size-2.5" />
                    </span>
                  )}
                  <span className={e.ok ? "" : "text-mute"}>{e.today}</span>
                </p>
                <p className="md:pt-[2px]">
                  <span className={`inline-block rounded-md border px-2 py-1 font-mono text-[12px] leading-[1.4] ${e.ok ? "border-edge-2 text-fg" : "border-dashed border-edge-2 text-dim"}`}>
                    {e.needed}
                  </span>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const PROTECTIONS: [string, string, IconName][] = [
  ["TLS", "Protects the compat hop between daemon and rendezvous.", "lock"],
  ["Ed25519", "Authenticates peer identity.", "key"],
  ["AES-256-GCM", "From an X25519-derived key, protects tunnel payloads, as in UDP mode.", "shield"],
];

const portPill = "rounded-full px-2.5 py-1 font-mono text-[12.5px] leading-none";

/**
 * Sky site: the section on a hatch panel (Figma 233:1195), its heading centred over the nginx diagram, and the two
 * facts the diagram proves as flat cards under it.
 */
function SkySinglePort() {
  return (
    <section aria-labelledby="sni-title" className="py-24 sm:py-32">
      <div className="wrap">
        <HatchPanel className="cpx-bleed px-4 py-12 sm:px-10 sm:py-16 lg:px-[72px] lg:py-[88px]">
          <SectionHead
            id="sni-title"
            center
            title={
              <>
                How <span className="whitespace-nowrap">single-port-443</span> works. <span className="block text-mute">One socket, two services.</span>
              </>
            }
            lede="Since v1.10.3 the registry channel is TLS on TCP/443, multiplexed by SNI on the same nginx listener as the beacon."
          />
          <Reveal delay={80} className="mt-12 sm:mt-16 lg:px-2">
            <SingleSocket />
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-3 sm:mt-16 lg:grid-cols-2">
            <Reveal className={`flex flex-col p-5 sm:p-7 ${FLAT_CARD}`}>
              <p className={LABEL}>Outbound ports a compat daemon needs</p>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3.5">
                <span className="flex items-center gap-3 text-[15px] text-mute">
                  <Tile icon="laptop" size="sm" off />
                  Before v1.10.3
                </span>
                <span className="flex gap-1.5">
                  <span className={`${portPill} bg-fg/[0.06] text-soft`}>TCP/443</span>
                  <span className={`${portPill} bg-fg/[0.06] text-soft`}>TCP/9000</span>
                </span>
                <span className="flex items-center gap-3 text-[15px] font-medium text-fg">
                  <Tile icon="laptop" size="sm" accent />
                  v1.10.3 and later
                </span>
                <span className="flex gap-1.5">
                  <span className={`${portPill} bg-(--sky-tint) text-(--sky-accent)`}>TCP/443</span>
                </span>
              </div>
              <p className="mt-6 border-t border-edge pt-5 text-[14.5px] leading-[1.6] text-mute">
                Two ports worked for most “UDP blocked but TCP open” environments, but not for airport wifi or strict
                corporate firewalls that allow only TCP/443. A compat daemon’s <Code>lsof</Code> now shows exactly one
                outbound port: 443.
              </p>
            </Reveal>
            <Reveal delay={60} className={`flex flex-col p-5 sm:p-7 ${FLAT_CARD}`}>
              <p className={LABEL}>End-to-end protections are unchanged</p>
              <ul className="mt-3">
                {PROTECTIONS.map(([k, v, icon]) => (
                  <li key={k} className="flex items-start gap-3.5 border-b border-edge py-4 text-[15px] leading-[1.5] last:border-b-0 last:pb-0">
                    <Tile icon={icon} accent size="sm" className="mt-px" />
                    <span className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:gap-4">
                      <span className="shrink-0 pt-[3px] font-mono text-[13px] text-fg sm:w-[100px]">{k}</span>
                      <span className="text-mute">{v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </HatchPanel>
      </div>
    </section>
  );
}

const modesHead = (
  <SectionHead
    id="modes-title"
    kicker="Two modes"
    title={
      <>
        UDP for direct paths. <span className={SKY ? "block text-mute" : "text-mute"}>Compat for everything else.</span>
      </>
    }
    lede="Auto mode probes the beacon over UDP and picks for you. Here is what it picks on three kinds of network."
    className={SKY ? "lg:max-w-[620px]" : ""}
  />
);

const deployHead = (
  <SectionHead
    id="deploy-title"
    kicker="Worked examples"
    title={
      <>
        Six <Soft>deployments.</Soft>
      </>
    }
  />
);

export function CompatibilityPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Protocol", href: "/docs/concepts" }, { label: "Compatibility" }]}
        title={
          <>
            Where {SKY ? <span className="whitespace-nowrap">pilot-daemon</span> : "pilot-daemon"} runs.{" "}
            <span className={SKY ? "text-mute" : "text-lime-ink"}>Pick the right mode.</span>
          </>
        }
        lede={
          <>
            One daemon, two transports. <span className="text-fg">UDP</span> gives direct peer paths and the lowest
            latency. <span className="text-fg">Compat</span> tunnels everything through a single outbound TCP/443,
            through an HTTPS proxy if that is the only way out. With nothing configured,{" "}
            <Code>pilotctl daemon start</Code> uses <span className="text-fg">auto</span>: UDP when the beacon answers
            over UDP, otherwise compat.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="/docs/firewalls">Read the docs</Button>
          <TextLink href={RELEASES}>Latest release</TextLink>
        </div>
      </PageHeader>

      <section aria-labelledby="modes-title" className="py-24 sm:py-32">
        <div className="wrap">
          {SKY ? (
            <Reveal>
              <Transport head={modesHead} />
            </Reveal>
          ) : (
            <>
              {modesHead}
              <Reveal delay={80} className="mt-14 sm:mt-20">
                <Transport />
              </Reveal>
            </>
          )}
          <Reveal className="mt-16">
            <ModeSpecs />
          </Reveal>
        </div>
      </section>

      {SKY && <SkyRule />}
      <section id="platforms" aria-labelledby="platforms-title" className={`${SKY ? "" : "border-t border-edge"} py-24 sm:py-32`}>
        <div className="wrap">
          <SectionHead
            id="platforms-title"
            kicker="Per-platform"
            title={
              <>
                Where it runs. <span className={SKY ? "block text-mute" : "text-mute"}>What flag to set.</span>
              </>
            }
            lede={
              SKY ? (
                <>
                  Our best-effort reading of each vendor&apos;s network policy. Vendors change their rules, so check your
                  platform&apos;s current docs, and{" "}
                  <a href={ISSUES} className={inline}>
                    tell us
                  </a>{" "}
                  if a cell is wrong.
                </>
              ) : undefined
            }
          />
          <div className="mt-12 sm:mt-14">
            <Matrix />
          </div>
          {!SKY && (
          <Reveal className="mt-6 max-w-[860px] border-t border-edge pt-6 text-[13.5px] leading-[1.6] text-dim">
            These per-platform notes are our best-effort understanding of each vendor’s network policy, not continuously
            tested guarantees. Vendors change their rules, so verify against your platform’s current docs and{" "}
            <a href={ISSUES} className={inline}>
              tell us
            </a>{" "}
            if a cell is wrong.
          </Reveal>
          )}
        </div>
      </section>

      {SKY && <SkyRule />}
      <Egress />

      {SKY ? (
        <SkySinglePort />
      ) : (
      <section aria-labelledby="sni-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            id="sni-title"
            kicker="Single-port 443"
            title={
              <>
                How <Soft>single-port-443</Soft> works.
              </>
            }
            lede="Since v1.10.3 the registry channel is TLS on TCP/443, multiplexed by SNI on the same nginx listener as the beacon."
          />
            <>
              <Reveal delay={80} className="mt-14 sm:mt-20">
                <SingleSocket />
              </Reveal>

              <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
                <Reveal className="flex flex-col">
                  <p className="font-mono text-[12px] text-dim">Outbound ports a compat daemon needs</p>
                  <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 border-t border-edge pt-5">
                    <span className="text-[15px] text-mute">Before v1.10.3</span>
                    <span className="flex gap-1.5 font-mono text-[12px]">
                      <span className="rounded-md border border-edge-3 px-2 py-1 text-soft">TCP/443</span>
                      <span className="rounded-md border border-edge-3 px-2 py-1 text-soft">TCP/9000</span>
                    </span>
                    <span className="text-[15px] text-fg">v1.10.3 and later</span>
                    <span className="flex gap-1.5 font-mono text-[12px]">
                      <span className="rounded-md bg-lime px-2 py-1 text-ink">TCP/443</span>
                    </span>
                  </div>
                  <p className="mt-5 text-[14.5px] leading-[1.6] text-mute">
                    Two ports worked for most “UDP blocked but TCP open” environments, but not for airport wifi or strict
                    corporate firewalls that allow only TCP/443. A compat daemon’s <Code>lsof</Code> now shows exactly one
                    outbound port: 443.
                  </p>
                </Reveal>
                <Reveal delay={60}>
                  <p className="font-mono text-[12px] text-dim">End-to-end protections are unchanged</p>
                  <ul className="mt-4 border-t border-edge">
                    {[
                      ["TLS", "protects the compat hop between daemon and rendezvous"],
                      ["Ed25519", "authenticates peer identity"],
                      ["AES-256-GCM", "from an X25519-derived key protects tunnel payloads, as in UDP mode"],
                    ].map(([k, v]) => (
                      <li key={k} className="flex gap-4 border-b border-edge py-4 text-[15px] leading-[1.5]">
                        <span className="w-[110px] shrink-0 font-mono text-[12.5px] text-fg">{k}</span>
                        <span className="text-mute">{v}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </>
        </div>
      </section>
      )}

      {SKY ? (
        <Deployments head={deployHead} />
      ) : (
        <section aria-labelledby="deploy-title" className="border-t border-edge py-24 sm:py-32">
          <div className="wrap">
            {deployHead}
            <Reveal delay={80} className="mt-14 sm:mt-16">
              <Deployments />
            </Reveal>
          </div>
        </section>
      )}

      {/* Sky site: the closing call sits on the page (the split's rule above it), so the footer's blue starts under it. */}
      <section aria-labelledby="cta-title" className={SKY ? "pt-4 pb-24 sm:pb-32" : "pp-invert py-24 sm:py-32"}>
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <Reveal>
            <h2
              id="cta-title"
              className={SKY ? SKY_H2 : "text-[clamp(36px,4.6vw,60px)] leading-[1.02] font-medium tracking-[-0.04em] text-balance text-fg"}
            >
              One daemon. <span className={SKY ? "block text-mute" : "text-mute"}>Two transport modes.</span>
            </h2>
            <p className={SKY ? `mt-5 max-w-[560px] ${SKY_LEDE}` : "mt-6 max-w-[560px] text-[16px] leading-[1.55] text-mute"}>
              On a supported runtime, install Pilot and start the daemon: auto picks UDP or compat, through{" "}
              <Code>HTTPS_PROXY</Code> when there is one. Set <Code>transport=compat</Code> to skip the UDP probe. Check
              the platform notes above before deployment.
            </p>
          </Reveal>
          <Reveal delay={80} className="flex flex-col gap-5">
            <Command value={INSTALL_CMD} className={`w-full ${SKY ? "bg-card!" : ""}`} label="Copy install command" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/docs/getting-started">Install Pilot</Button>
              <TextLink href="/docs/firewalls">Firewalls &amp; compat mode</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
