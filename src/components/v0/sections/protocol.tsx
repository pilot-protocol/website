"use client";

import { FingerprintIcon, KeyIcon, LockIcon, RouteIcon } from "@/components/icons";
import { Terminal, type TermLine } from "@/components/terminal";
import { Eyebrow, Reveal, TextLink } from "@/components/ui";
import { LINKS } from "@/lib/site";

const FIND_AND_PING: TermLine[] = [
  { cmd: "pilotctl find open-meteo-forecast" },
  { out: "Hostname:  open-meteo-forecast" },
  { out: "Node ID:   19385" },
  {
    out: (
      <>
        Address:   0:0000.0000.<span className="text-lime">4BB9</span>
      </>
    ),
  },
  { out: "Visible:   public" },
  { note: "# after a trust handshake: pilotctl handshake open-meteo-forecast" },
  { cmd: "pilotctl ping open-meteo-forecast --count 3" },
  { out: 'resolved "open-meteo-forecast" → 0:0000.0000.4BB9' },
  { out: "PING 0:0000.0000.4BB9" },
  { out: "seq=0 bytes=6 time=362.89ms  [dial=308.72ms echo=54.14ms]" },
  { out: "seq=1 bytes=6 time=145.05ms  [dial=86.08ms echo=58.87ms]" },
  { out: "seq=2 bytes=6 time=144.99ms  [dial=47.97ms echo=96.99ms]" },
];

const FACTS = [
  { icon: FingerprintIcon, title: "A permanent 48-bit address", body: "Stays put across IP, cloud and container changes." },
  { icon: KeyIcon, title: "An Ed25519 identity", body: "Signed handshakes, keys you can rotate." },
  { icon: LockIcon, title: "Encrypted tunnels", body: "X25519 key exchange, AES-256-GCM per tunnel." },
  { icon: RouteIcon, title: "Gets through NAT", body: "STUN and hole punching, an encrypted relay as fallback." },
];

export function Protocol() {
  return (
    <section id="protocol" aria-labelledby="protocol-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal className="flex flex-col">
          <Eyebrow index="01">Pilot Protocol</Eyebrow>
          <h2 id="protocol-title" className="mt-5 text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg">
            An address, keys and trust for every agent.
          </h2>
          <p className="mt-5 max-w-[440px] text-[16px] leading-[1.5] text-mute">
            The daemon and <code className="font-mono text-[14.5px] text-fg">pilotctl</code> put an agent on the
            network. Static binaries, SDKs for Node, Python, Swift and Go.
          </p>
          <ul className="mt-8 flex flex-col border-t border-edge">
            {FACTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 border-b border-edge py-4">
                <Icon className="mt-[3px] size-[15px] shrink-0 text-lime" />
                <p className="text-[15px] leading-[1.45]">
                  <span className="font-medium text-fg">{title}.</span> <span className="text-mute">{body}</span>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <TextLink href={LINKS.gettingStarted}>Getting started</TextLink>
            <TextLink href={LINKS.concepts}>How the protocol works</TextLink>
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:pt-12">
          <Terminal
            title="agent@node ~ find and ping a peer"
            lines={FIND_AND_PING}
            caption="Real output, recorded in October 2026."
            minHeight={360}
          />
        </Reveal>
      </div>
    </section>
  );
}
