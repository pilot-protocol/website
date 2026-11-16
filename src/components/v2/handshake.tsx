"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import { Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./handshake.css";

/* eslint-disable @next/next/no-img-element */

type Side = "a" | "b";

const AGENTS: Record<Side, { host: string; name: string; logo: string }> = {
  a: { host: "claude-code", name: "Claude Code", logo: "/harness/claude-color.svg" },
  b: { host: "openclaw", name: "OpenClaw", logo: "/harness/openclaw.png" },
};

const PILOT = [
  { title: "Identity", body: "A persistent Ed25519 keypair, stable across IP, cloud and container changes." },
  { title: "Encryption", body: "X25519 key exchange and AES-256-GCM per tunnel, with separate nonce spaces and replay checks." },
  { title: "Trust", body: "Agents start private. A peer becomes reachable after a handshake both sides approve." },
  { title: "Reachability", body: "STUN and hole punching connect peers directly; when that fails, the beacon relays, still encrypted." },
];

const YOURS = [
  { title: "Permissions", body: "What a trusted peer may ask your agent to do." },
  { title: "Spending", body: "Budgets and payments, including any App Store app that costs money." },
  { title: "Approvals", body: "When a person has to sign off before the agent acts." },
  { title: "Data", body: "What the agent sends, to whom, and what it keeps." },
];

/* ---------------- Pieces ---------------- */

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      data-on={on}
      className="hs-switch group relative h-[38px] w-[64px] shrink-0 rounded-full bg-fg/[0.12] p-[3px] transition-colors duration-300 ease-(--ease-out) data-[on=true]:bg-lime"
    >
      <span className="hs-knob block h-[32px] w-[32px] rounded-full bg-paper shadow-[0_2px_6px_rgb(0_0_0/0.22),0_0_0_0.5px_rgb(0_0_0/0.06)]" />
    </button>
  );
}

function Lock({ closed }: { closed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-[22px]">
      <path
        data-closed={closed}
        className="hs-shackle"
        d="M7.75 11V8a4.25 4.25 0 0 1 8.5 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="currentColor" />
      <circle cx="12" cy="15.5" r="1.4" className="fill-[var(--hs-hole)]" />
    </svg>
  );
}

function AgentCard({
  side,
  on,
  other,
  trusted,
  revoked,
  onChange,
}: {
  side: Side;
  on: boolean;
  other: Side;
  trusted: boolean;
  revoked: boolean;
  onChange: (v: boolean) => void;
}) {
  const me = AGENTS[side];
  const them = AGENTS[other];
  const state = trusted ? "trusted" : on ? "waiting" : revoked ? "revoked" : "private";

  return (
    <div className="relative z-10 w-full max-w-[380px] rounded-[24px] bg-card p-5 shadow-float lg:w-[340px] lg:p-6">
      <div className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-bg-deep">
          <img src={me.logo} alt="" width={28} height={28} className={`size-7 object-contain ${me.logo.endsWith(".png") ? "rounded-[7px]" : ""}`} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate font-mono text-[15px] leading-[20px] tracking-[-0.01em] text-fg">{me.host}</p>
          <p className="mt-0.5 text-[13px] leading-[18px] text-mute">{me.name}</p>
        </div>
        <span
          key={state}
          data-state={state}
          className="hs-chip flex h-[26px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap data-[state=private]:bg-fg/[0.06] data-[state=private]:text-mute data-[state=revoked]:bg-fg/[0.06] data-[state=revoked]:text-mute data-[state=trusted]:bg-lime data-[state=trusted]:text-ink data-[state=waiting]:bg-fg/[0.06] data-[state=waiting]:text-soft"
        >
          {state === "trusted" && <CheckIcon className="size-[11px]" />}
          {state === "waiting" && <span aria-hidden className="hs-dots" />}
          {state === "trusted" ? "Trusted" : state === "waiting" ? "Waiting" : state === "revoked" ? "Revoked" : "Private"}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-[16px] bg-bg-deep py-3 pr-3 pl-4">
        <div className="min-w-0">
          <p className="text-[14.5px] leading-[20px] font-medium text-fg">
            Approve <span className="font-mono text-[13.5px]">{them.host}</span>
          </p>
          <p className="mt-0.5 truncate text-[12.5px] leading-[18px] text-mute">
            {trusted ? "Tunnel open" : on ? `Waiting for ${them.host}…` : "Nobody can reach it"}
          </p>
        </div>
        <Switch on={on} onChange={onChange} label={`${me.host}: approve ${them.host}`} />
      </div>
    </div>
  );
}

/** The gap between the two agents: empty while private, half-lit from whoever approved, a sealed tunnel once both did. */
function Tunnel({ a, b, trusted, reduced }: { a: boolean; b: boolean; trusted: boolean; reduced: boolean }) {
  return (
    <div className="relative flex h-[132px] w-full items-center justify-center lg:h-auto lg:w-auto lg:flex-1 lg:self-stretch">
      <div
        data-open={trusted}
        className="hs-pipe relative h-full w-[48px] overflow-hidden rounded-full bg-bg ring-1 ring-edge-2 ring-inset lg:h-[48px] lg:w-full"
      >
        {/* Each side's half fills toward the middle when that side approves. */}
        <span data-on={a} className="hs-fill hs-fill-a absolute bg-lime" />
        <span data-on={b} className="hs-fill hs-fill-b absolute bg-lime" />
        {trusted && !reduced && (
          <span aria-hidden className="absolute inset-0">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`hs-packet hs-packet-${i % 2 ? "back" : "fwd"}`} style={{ animationDelay: `${i * 0.42}s` }} />
            ))}
          </span>
        )}
      </div>

      <span
        data-closed={trusted}
        className="hs-lock absolute top-1/2 left-1/2 grid size-[52px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-mute shadow-float transition-colors duration-300 data-[closed=true]:bg-ink data-[closed=true]:text-lime [--hs-hole:var(--color-card)] data-[closed=true]:[--hs-hole:var(--color-ink)]"
      >
        <Lock closed={trusted} />
      </span>

      <p
        data-open={trusted}
        className="absolute top-[calc(50%+40px)] left-1/2 hidden -translate-x-1/2 font-mono text-[11.5px] whitespace-nowrap text-dim transition-colors duration-300 data-[open=true]:text-lime-ink lg:block"
      >
        X25519 · AES-256-GCM
      </p>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function Handshake() {
  const reduced = usePrefersReducedMotion();
  const [stageRef, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -30% 0px" });
  const [sides, setSides] = useState({ a: false, b: false });
  // Which side just turned trust off, so the card and the status line can say so for a moment.
  const [revoked, setRevoked] = useState<Side | null>(null);
  const [touched, setTouched] = useState(false);
  const revokeTimer = useRef<number>(undefined);

  // Show the finished handshake to anyone who'd rather not watch it happen.
  const shown = reduced && !touched ? { a: true, b: true } : sides;
  const trusted = shown.a && shown.b;

  function set(side: Side, value: boolean) {
    setTouched(true);
    const next = { ...shown, [side]: value };
    window.clearTimeout(revokeTimer.current);
    if (trusted && !value) {
      setRevoked(side);
      revokeTimer.current = window.setTimeout(() => setRevoked(null), 2600);
    } else {
      setRevoked(null);
    }
    setSides(next);
  }

  // Play it once, the first time the stage scrolls into view, unless someone got there first.
  useEffect(() => {
    if (!inView || reduced || touched) return;
    const t1 = window.setTimeout(() => setSides((s) => ({ ...s, a: true })), 900);
    const t2 = window.setTimeout(() => setSides({ a: true, b: true }), 2300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [inView, reduced, touched]);

  useEffect(() => () => window.clearTimeout(revokeTimer.current), []);

  const status = trusted
    ? "Trusted · both sides approved. The tunnel is open."
    : revoked
      ? `${AGENTS[revoked].host} revoked trust. The tunnel is closed.`
      : shown.a
      ? `${AGENTS.a.host} approved. Waiting for ${AGENTS.b.host}…`
      : shown.b
        ? `${AGENTS.b.host} approved. Waiting for ${AGENTS.a.host}…`
        : "Private. Flip both switches to open a tunnel.";

  return (
    <section id="security" aria-labelledby="hs-title" className="py-28 sm:py-36">
      <div className="wrap">
        <SectionHead
          id="hs-title"
          center
          title="Private until"
          muted="both sides approve."
          lede="Agents start private. Nobody can reach yours until both sides approve a trust handshake, and either side can revoke it at any time."
        />

        <Reveal delay={80} className="mt-14 sm:mt-16">
          <div
            ref={stageRef}
            className="relative overflow-hidden rounded-[28px] bg-bg-deep px-5 py-10 [background-image:radial-gradient(var(--color-edge-2)_1px,transparent_1.2px)] [background-size:22px_22px] sm:px-10 sm:py-14 lg:px-14 lg:py-20"
          >
            <div className="mx-auto flex max-w-[1000px] flex-col items-center lg:flex-row lg:items-center">
              <AgentCard side="a" other="b" on={shown.a} trusted={trusted} revoked={revoked === "a"} onChange={(v) => set("a", v)} />
              <Tunnel a={shown.a} b={shown.b} trusted={trusted} reduced={reduced} />
              <AgentCard side="b" other="a" on={shown.b} trusted={trusted} revoked={revoked === "b"} onChange={(v) => set("b", v)} />
            </div>

            <p
              aria-live="polite"
              data-trusted={trusted}
              className="mx-auto mt-10 flex w-fit max-w-full items-center gap-2.5 rounded-[16px] bg-card py-2 pr-4 pl-3 sm:rounded-full text-center text-[13.5px] leading-[20px] text-soft shadow-tile data-[trusted=true]:text-fg sm:mt-12"
            >
              <span
                aria-hidden
                data-trusted={trusted}
                className="size-2 shrink-0 rounded-[2px] bg-fg/25 transition-colors duration-300 data-[trusted=true]:bg-packet"
              />
              <span key={status} className="hs-status">
                {status}
              </span>
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-[1000px] grid-cols-1 gap-10 sm:mt-20 md:grid-cols-2 md:gap-12">
          {[
            { label: "Pilot secures", items: PILOT, mark: "bg-packet" },
            { label: "You keep", items: YOURS, mark: "ring-[1.5px] ring-fg/40 ring-inset" },
          ].map((col, c) => (
            <Reveal key={col.label} delay={c * 70}>
              <h3 className="flex items-center gap-2.5 text-[15px] font-medium text-fg">
                <span aria-hidden className={`size-2.5 rounded-[3px] ${col.mark}`} />
                {col.label}
              </h3>
              <dl className="mt-4 border-t border-edge">
                {col.items.map((it) => (
                  <div key={it.title} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-edge py-3.5 max-sm:grid-cols-1 max-sm:gap-1">
                    <dt className="text-[14.5px] font-medium text-fg">{it.title}</dt>
                    <dd className="text-[14.5px] leading-[1.5] text-mute">{it.body}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-10 flex justify-center">
          <TextLink href={LINKS.security}>Read the security page</TextLink>
        </Reveal>
      </div>
    </section>
  );
}
