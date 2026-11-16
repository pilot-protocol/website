import type { ReactNode } from "react";
import { Packet, Reveal, TextLink } from "@/components/ui";
import { LINKS } from "@/lib/site";

const PILOT: [string, string, string][] = [
  ["Identity", "A persistent Ed25519 keypair, stable across IP, cloud and container changes.", "signed handshakes · key rotation"],
  ["Encryption", "X25519 key exchange and AES-256-GCM per tunnel, with separate nonce spaces and replay checks.", "X25519 · AES-256-GCM"],
  ["Trust", "Agents begin private. A peer becomes reachable after a handshake both sides approve.", "approve · reject · revoke"],
  ["Reachability", "STUN and hole punching connect peers directly; when that fails, the beacon relays, still encrypted.", "STUN · relay fallback"],
];

const YOURS: [string, string][] = [
  ["Permissions", "What a trusted peer may ask your agent to do."],
  ["Spending", "Budgets and payments, including any App Store app that costs money."],
  ["Approvals", "When a person has to sign off before the agent acts."],
  ["Data", "What the agent sends, to whom, and what it keeps."],
];

function Column({ title, tone, children }: { title: string; tone: "pilot" | "you"; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <p
        className={`flex h-10 items-center justify-between px-4 font-mono text-[12px] ${
          tone === "pilot" ? "bg-lime text-ink" : "bg-[#f1f1ec] text-mute"
        }`}
      >
        {title}
        <span>{tone === "pilot" ? "Pilot" : "Your application"}</span>
      </p>
      <ul className="flex flex-1 flex-col">{children}</ul>
    </div>
  );
}

export function Security() {
  return (
    <section id="security" aria-labelledby="security-title" className="pp-invert py-24 sm:py-32">
      <div className="wrap">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="flex items-center justify-center gap-2.5 font-mono text-[13px] text-dim">
            <Packet /> Security
          </p>
          <h2 id="security-title" className="mt-5 text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg">
            What Pilot secures, and what you keep.
          </h2>
          <p className="mx-auto mt-5 max-w-[540px] text-[16px] leading-[1.5] text-mute">
            Pilot handles who an agent is, how its traffic is encrypted, who may reach it and how packets get through.
            What a trusted peer may do once connected is up to you.
          </p>
          <div className="mt-6">
            <TextLink href={LINKS.security}>Read the security page</TextLink>
          </div>
        </Reveal>

        <Reveal delay={80} className="mx-auto mt-14 grid max-w-[1000px] grid-cols-1 gap-4 sm:mt-16 md:grid-cols-2 md:gap-6">
          <Column title="What Pilot secures" tone="pilot">
            {PILOT.map(([t, b, tags]) => (
              <li key={t} className="border-b border-edge px-4 py-5">
                <p className="text-[16px] font-medium text-fg">{t}</p>
                <p className="mt-1 text-[14.5px] leading-[1.5] text-mute">{b}</p>
                <p className="mt-2 font-mono text-[11.5px] text-dim">{tags}</p>
              </li>
            ))}
          </Column>
          <Column title="What you keep" tone="you">
            {YOURS.map(([t, b]) => (
              <li key={t} className="flex-1 border-b border-edge px-4 py-5">
                <p className="text-[16px] font-medium text-fg">{t}</p>
                <p className="mt-1 text-[14.5px] leading-[1.5] text-mute">{b}</p>
              </li>
            ))}
          </Column>
        </Reveal>
      </div>
    </section>
  );
}
