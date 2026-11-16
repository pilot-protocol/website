import type { ReactNode } from "react";
import { PageHeader } from "@/components/page/page-header";
import { FourSteps, SkyFourSteps } from "@/components/pages/p2p/four-steps";
import { HubVsDirect } from "@/components/pages/p2p/hub-vs-direct";
import { SkyPacket } from "@/components/pages/p2p/packet";
import { Traversal } from "@/components/pages/p2p/traversal";
import { Code, SectionHead, SKY, SKY_H2, SKY_LABEL, SkySplit, Soft } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Button, Command, Reveal, TextLink } from "@/components/ui";
import { INSTALL_CMD } from "@/lib/site";

const WHY: { k: string; t: string; b: ReactNode }[] = [
  {
    k: "Latency",
    t: "Zero-hop data path",
    b: "On a direct path, packets travel the exact network RTT between the two machines. Symmetric-NAT peers that can’t hole-punch fall back to an encrypted relay, which adds a hop.",
  },
  {
    k: "Security",
    t: "End-to-end encrypted",
    b: (
      <>
        X25519 key exchange and AES-256-GCM, on by default (disable with <Code>--no-encrypt</Code> if you must).
        Nothing in the middle can read your data.
      </>
    ),
  },
  {
    k: "Ops",
    t: "Hosted coordination by default",
    b: "No broker or gateway fleet to run on the public network. Discovery and NAT traversal use the Pilot-operated registry and beacon; those endpoints are configurable.",
  },
  {
    k: "Scale",
    t: "Linear by construction",
    b: "Each new peer adds one tunnel to whoever it talks to. The payload plane has no central fan-in limit; registry capacity remains a coordination-plane concern.",
  },
];

const NUMBERS: { k: string; v: string; b: ReactNode }[] = [
  { k: "Latency", v: "≈ RTT", b: "A direct tunnel adds little over the raw network round-trip between the two peers." },
  { k: "LAN", v: "Low", b: "Same-subnet agents talk at LAN latency. Pilot stays out of the way." },
  {
    k: "Loss",
    v: "Low",
    b: (
      <>
        The userspace reliability layer recovers lost UDP packets; measure your own path with <Code>pilotctl bench</Code>.
      </>
    ),
  },
  { k: "Header", v: "34 bytes", b: "Per-packet header: flow-control window and CRC32." },
];

/** What rides with every packet. Only the header has a published size, so nothing here is to scale. */
function PacketAnatomy() {
  if (SKY) return <SkyPacket />;
  return (
    <div>
      <p className="mb-4 font-mono text-[12px] text-dim">What rides with every packet · not to scale</p>
      <div className="flex h-12 w-full gap-[3px] font-mono text-[11.5px]" aria-hidden>
        <span className="flex w-[22%] min-w-[96px] items-center bg-lime px-3 text-ink">34 B header</span>
        <span className="flex w-[18%] min-w-[84px] items-center border border-lime-ink/60 px-3 text-lime-ink">envelope</span>
        <span className="flex flex-1 items-center bg-[repeating-linear-gradient(90deg,color-mix(in_srgb,var(--color-fg)_8%,transparent)_0_6px,transparent_6px_9px)] px-3 text-dim">
          payload, encrypted
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-[13.5px] leading-[1.5] sm:grid-cols-3 sm:gap-6">
        <div>
          <dt className="font-mono text-[11.5px] text-fg">Header</dt>
          <dd className="mt-1 text-mute">34 bytes: flow-control window + CRC32.</dd>
        </div>
        <div>
          <dt className="font-mono text-[11.5px] text-fg">Envelope</dt>
          <dd className="mt-1 text-mute">Encryption adds a small, separate envelope: nonce + GCM tag.</dd>
        </div>
        <div>
          <dt className="font-mono text-[11.5px] text-fg">Payload</dt>
          <dd className="mt-1 text-mute">AES-256-GCM, readable only by the two peers.</dd>
        </div>
      </dl>
    </div>
  );
}

export function P2PPage() {
  if (SKY) return <SkyP2PPage />;
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Protocol", href: "/docs/concepts" }, { label: "Peer-to-peer" }]}
        title={
          <>
            Direct <span className="whitespace-nowrap">peer-to-peer</span> <span className={SKY ? "text-mute" : "text-lime-ink"}>for AI agents.</span>
          </>
        }
        lede={
          <>
            A direct peer-to-peer data path. No API gateway. No message broker. A thin registry handles discovery, then
            agents connect <span className="text-fg">directly</span>: encrypted, NAT-traversing, zero config.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="/docs/getting-started">Install in one line</Button>
          <TextLink href="/docs/concepts">Read the architecture</TextLink>
        </div>
      </PageHeader>

      <section aria-labelledby="why-title" className="py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            id="why-title"
            kicker="Why direct"
            title={
              <>
                Hub-and-spoke is <Soft>a bottleneck.</Soft>
              </>
            }
            lede={
              SKY
                ? "Through a broker, every message goes in and back out through its queue. With Pilot, a thin registry handles discovery, then the packet goes straight to the peer, and each new peer adds one tunnel."
                : undefined
            }
          />
          <Reveal delay={80} className="mt-14 sm:mt-16">
            <HubVsDirect />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.k} delay={i * 60} className="border-t border-edge-2 pt-5">
                <p className={SKY ? SKY_LABEL : "font-mono text-[12px] text-dim"}>{w.k}</p>
                <p className="mt-3 text-[18px] leading-[1.25] font-medium tracking-[-0.02em] text-fg">{w.t}</p>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-mute">{w.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="numbers-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            id="numbers-title"
            kicker="The numbers"
            title={
              <>
                No middleman, <Soft>no middleman overhead.</Soft>
              </>
            }
          />
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((n, i) => (
              <Reveal key={n.k} delay={i * 60} className="relative border-l border-edge-2 pl-5">
                <span aria-hidden className={`absolute top-0 -left-px h-4 w-px ${SKY ? "bg-(--sky-fill)" : "bg-lime"}`} />
                <p className={SKY ? SKY_LABEL : "font-mono text-[12px] text-dim"}>{n.k}</p>
                <p className="mt-3 text-[clamp(40px,4.4vw,56px)] leading-none font-medium tracking-[-0.04em] text-fg">{n.v}</p>
                <p className="mt-4 text-[14.5px] leading-[1.55] text-mute">{n.b}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <PacketAnatomy />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="nat-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            id="nat-title"
            kicker="Any NAT"
            title={
              <>
                Three tiers <Soft>of traversal.</Soft>
              </>
            }
            lede={
              SKY ? (
                <>
                  The daemon works its way down the ladder by itself, direct, then hole-punch, then relay, without having
                  to classify the NAT it’s behind. Cloud VMs with static IPs can skip STUN with{" "}
                  <Code>--endpoint host:port</Code>.
                </>
              ) : (
                "The daemon works its way down the ladder by itself, direct, then hole-punch, then relay, without having to classify the NAT it’s behind."
              )
            }
          />
          <Reveal delay={80} className="mt-14 sm:mt-20">
            <Traversal />
          </Reveal>
          {!SKY && (
            <Reveal className="mt-8 text-[14px] leading-[1.6] text-dim">
              Cloud VMs with static IPs can skip STUN with <Code>--endpoint host:port</Code>.
            </Reveal>
          )}
        </div>
      </section>

      <section aria-labelledby="steps-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <SectionHead
            id="steps-title"
            kicker="Up and running"
            title={
              <>
                Four steps. <Soft>About a minute.</Soft>
              </>
            }
            lede={
              <>
                No Docker. No Kubernetes. No YAML. Just a <span className="text-fg">binary</span> and a{" "}
                <span className="text-fg">hostname</span>.
              </>
            }
          />
          <Reveal delay={80} className="mt-14 sm:mt-16">
            <FourSteps />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="go-title" className="relative overflow-hidden border-t border-edge py-24 sm:py-32">
        {!SKY && <span aria-hidden className="absolute -top-1 right-[30%] size-2 bg-lime" />}
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <Reveal>
            <h2 id="go-title" className="text-[clamp(40px,5.4vw,72px)] leading-[1] font-medium tracking-[-0.04em] text-balance text-fg">
              Go direct. <span className={SKY ? "text-mute" : "text-lime-ink"}><span className="whitespace-nowrap">Peer-to-peer</span> by default.</span>
            </h2>
          </Reveal>
          <Reveal delay={80} className="flex flex-col gap-5">
            <Command value={INSTALL_CMD} prefix="curl" className="w-full" label="Copy install command">
              {INSTALL_CMD.replace(/^curl/, "")}
            </Command>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/docs/getting-started">Install now</Button>
              <TextLink href="/blog/peer-to-peer-agent-communication-no-server">Read the deep dive</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site (Figma 233:1195): hatched panels and splits, as the home   */
/* and service pages.                                                  */
/* ------------------------------------------------------------------ */

function SkyP2PPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Protocol", href: "/docs/concepts" }, { label: "Peer-to-peer" }]}
        title={
          <>
            Direct <span className="whitespace-nowrap">peer-to-peer</span> <span className="text-mute">for AI agents.</span>
          </>
        }
        lede={
          <>
            A direct peer-to-peer data path. A thin registry handles discovery, then agents connect{" "}
            <span className="text-fg">directly</span>: encrypted, NAT-traversing, zero config.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href="/docs/getting-started">Install in one line</Button>
          <TextLink href="/docs/concepts">Read the architecture</TextLink>
        </div>
      </PageHeader>

      {/* Why direct: the two pictures on a hatched panel, the four reasons under it. */}
      <section id="why" aria-labelledby="why-title" className="scroll-mt-20 py-16 sm:py-20 lg:py-[88px]">
        <div className="wrap">
          <HatchPanel className="px-4 pt-12 pb-5 sm:px-8 sm:pt-16 sm:pb-8 lg:px-12 lg:pt-[72px] lg:pb-12">
            <SectionHead
              center
              id="why-title"
              title={
                <>
                  Hub-and-spoke is <span className="block text-mute">a bottleneck.</span>
                </>
              }
              lede="Through a broker, every message goes in and back out through its queue. With Pilot, a thin registry handles discovery, then the packet goes straight to the peer, and each new peer adds one tunnel."
            />
            <Reveal delay={80} className="mt-12 sm:mt-14">
              <HubVsDirect />
            </Reveal>
          </HatchPanel>
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.k} delay={i * 60}>
                <p className={SKY_LABEL}>{w.k}</p>
                <p className="mt-2 text-[18px] leading-[1.3] font-medium tracking-[-0.03em] text-fg">{w.t}</p>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-pretty text-mute">{w.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The numbers: a split, the figures on paper and the packet on the hatching. */}
      <SkySplit
        id="numbers"
        labelledBy="numbers-title"
        text={
          <>
            <SectionHead
              id="numbers-title"
              title={
                <>
                  No middleman, <span className="block text-mute">no middleman overhead.</span>
                </>
              }
            />
            <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {NUMBERS.map((n, i) => (
                <Reveal key={n.k} delay={i * 60} className="border-t border-(--sky-card-line) pt-4">
                  <dt className={SKY_LABEL}>{n.k}</dt>
                  <dd>
                    <span className="mt-2 block text-[40px] leading-none font-medium tracking-[-0.05em] text-fg">{n.v}</span>
                    <span className="mt-3 block text-[14.5px] leading-[1.55] text-pretty text-mute">{n.b}</span>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </>
        }
        visual={
          <Reveal delay={80} className="flex w-full justify-center">
            <SkyPacket />
          </Reveal>
        }
      />

      {/* Three tiers of traversal: the ladder on a hatched panel, the tiers as a stepper. */}
      <section id="nat" aria-labelledby="nat-title" className="scroll-mt-20 py-16 sm:py-20 lg:py-[88px]">
        <div className="wrap">
          <HatchPanel className="px-4 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-10 lg:px-12 lg:pt-[72px] lg:pb-12">
            <SectionHead
              center
              id="nat-title"
              title={
                <>
                  Three tiers <span className="block text-mute">of traversal.</span>
                </>
              }
              lede={
                <>
                  The daemon works its way down the ladder by itself, direct, then hole-punch, then relay, without having to
                  classify the NAT it’s behind. Cloud VMs with static IPs can skip STUN with <Code>--endpoint host:port</Code>.
                </>
              }
            />
            <Reveal delay={80} className="mt-12 sm:mt-16">
              <Traversal />
            </Reveal>
          </HatchPanel>
        </div>
      </section>

      {/* Up and running: a split, the steps on paper and the two sessions on the hatching. */}
      <SkyFourSteps
        id="steps"
        labelledBy="steps-title"
        head={
          <SectionHead
            id="steps-title"
            title={
              <>
                Four steps. <span className="block text-mute">About a minute.</span>
              </>
            }
            lede="By the end, agent B reaches agent A by hostname, over a direct tunnel encrypted end to end."
          />
        }
      />

      {/* The close: on the page itself, so the footer's sky rises out of paper. */}
      <section aria-labelledby="go-title" className="py-24 sm:py-32">
        <div className="wrap flex flex-col items-center text-center">
          <Reveal>
            <h2 id="go-title" className={SKY_H2}>
              Go direct. <span className="block text-mute"><span className="whitespace-nowrap">Peer-to-peer</span> by default.</span>
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-9 flex w-full max-w-[560px] flex-col items-center gap-6">
            <Command value={INSTALL_CMD} prefix="curl" className="w-full" label="Copy install command">
              {INSTALL_CMD.replace(/^curl/, "")}
            </Command>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Button href="/docs/getting-started">Install now</Button>
              <TextLink href="/blog/peer-to-peer-agent-communication-no-server">Read the deep dive</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
