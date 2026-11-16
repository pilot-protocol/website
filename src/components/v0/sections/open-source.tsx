import type { ReactNode } from "react";
import { Button, Packet, Reveal, TextLink } from "@/components/ui";
import { LINKS } from "@/lib/site";

const S = { stroke: "currentColor", strokeWidth: 1.6, fill: "none" } as const;

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Private networks",
    body: "Members reach each other; joining can need a token or an invite.",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" {...S} strokeDasharray="2.5 2" />
        <rect x="7" y="7" width="3.5" height="3.5" fill="currentColor" />
        <rect x="13.5" y="13.5" width="3.5" height="3.5" fill="currentColor" />
      </>
    ),
  },
  {
    title: "Roles",
    body: "Owner, admin and member, per network.",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" {...S} />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" {...S} />
      </>
    ),
  },
  {
    title: "OIDC and JWT",
    body: "Tokens checked against your identity provider's JWKS.",
    icon: (
      <>
        <circle cx="8" cy="12" r="4" {...S} />
        <path d="M12 12h9M17 12v3.5M20 12v2.5" {...S} />
      </>
    ),
  },
  {
    title: "Policy",
    body: "Membership caps, port allowlists and rules per network.",
    icon: <path d="M5 4h14v16H5zM8.5 9h7M8.5 12.5h7M8.5 16h4" {...S} />,
  },
  {
    title: "Audit export",
    body: "Splunk HEC, CEF/syslog or JSON.",
    icon: <path d="M12 3v11M7.5 9.5 12 14l4.5-4.5M4 17v3.5h16V17" {...S} />,
  },
  {
    title: "Blueprints and key expiry",
    body: "A network, its roles and policy from one file. Keys that expire.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" {...S} />
        <path d="M12 7v5l3.5 2" {...S} />
      </>
    ),
  },
];

export function OpenSource() {
  return (
    <section id="open-source" aria-labelledby="oss-title" className="pp-invert border-t border-edge pb-24 sm:pb-32">
      <div className="wrap pt-24 sm:pt-32">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="flex items-center justify-center gap-2.5 font-mono text-[13px] text-dim">
            <Packet /> Open source · AGPL-3.0
          </p>
          <h2 id="oss-title" className="mt-5 text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg">
            Open source. Run your own network.
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.5] text-mute">
            The daemon, <code className="font-mono text-[14.5px] text-fg">pilotctl</code>, the registry and the beacon
            are open source. The public backbone is one registry and one beacon, run by Vulture Labs. Run your own and
            you get what a private deployment needs.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Button href={LINKS.selfHosting}>Self-hosting guide</Button>
            <TextLink href={LINKS.github}>Source on GitHub</TextLink>
          </div>
        </Reveal>

        <ul className="mx-auto mt-16 grid max-w-[1000px] grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} delay={(i % 3) * 60} className="flex flex-col items-center text-center">
              <span className="grid size-11 place-items-center rounded-[6px] border border-edge-2 text-fg">
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-[16px] font-medium text-fg">{f.title}</h3>
              <p className="mt-1.5 max-w-[260px] text-[14.5px] leading-[1.5] text-mute">{f.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
