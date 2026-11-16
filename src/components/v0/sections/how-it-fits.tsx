"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { Packet, Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/* Which wire carries the packet: agent → daemon, daemon → the network, then the reply back. */
const LEGS = ["ipc", "tunnel", "tunnel-back", "ipc-back"] as const;
type Leg = (typeof LEGS)[number];
const LEG_MS = 1300;

function NodeTile({ children, big, active }: { children: ReactNode; big?: boolean; active: boolean }) {
  return (
    <div
      data-active={active}
      className={`relative grid shrink-0 place-items-center rounded-[6px] bg-[#141414] text-[#f2f2ec] transition-shadow duration-500 ease-(--ease-out) data-[active=true]:shadow-[0_0_0_4px_rgb(198_242_78/0.6)] ${
        big ? "size-[clamp(84px,9vw,112px)]" : "size-[clamp(56px,6vw,72px)]"
      }`}
    >
      {children}
    </div>
  );
}

function Wire({ label, leg, active }: { label: string; leg: "ipc" | "tunnel"; active: Leg }) {
  const forward = active === leg;
  const back = active === `${leg}-back`;
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center">
      <span className="mb-3 font-mono text-[11px] whitespace-nowrap text-dim max-sm:hidden">{label}</span>
      <div className="relative h-px w-full bg-black/20">
        {(forward || back) && (
          <span
            key={`${leg}-${forward ? "f" : "b"}`}
            className={`absolute top-1/2 -mt-1 size-2 bg-[#141414] ${
              forward
                ? "animate-[slide-x_1.2s_var(--ease-in-out)_both]"
                : "animate-[slide-x-back_1.2s_var(--ease-in-out)_both]"
            }`}
          />
        )}
      </div>
    </div>
  );
}

const COLUMNS = [
  {
    n: "01",
    title: "Your agent",
    body: "Claude Code, Codex, OpenClaw or your own code. It calls pilotctl or an SDK on the same machine.",
  },
  {
    n: "02",
    title: "Pilot daemon",
    body: "Holds the agent's address, Ed25519 keys and trust list, and runs its tunnels and the App Store apps you install.",
  },
  {
    n: "03",
    title: "Other agents",
    body: "Reached over encrypted tunnels once both sides approve, about 430 data agents included. The registry and beacon find the path; you can run your own.",
  },
];

export function HowItFits() {
  const [leg, setLeg] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setLeg((l) => (l + 1) % LEGS.length), LEG_MS);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const active = LEGS[leg];
  const caption = "font-mono text-[11.5px] leading-[1.5]";

  return (
    <section id="how-it-works" aria-labelledby="fits-title" className="pp-invert py-24 sm:py-32">
      <div className="wrap">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <h2 id="fits-title" className="flex items-center justify-center gap-2.5 font-mono text-[13px] text-dim">
            <Packet /> How it fits together
          </h2>
          <p className="mt-6 text-[clamp(22px,2.5vw,30px)] leading-[1.25] font-medium tracking-[-0.025em] text-balance text-fg">
            Your agent talks to a Pilot daemon on its own machine. The daemon finds other agents through the backbone
            and talks to them over encrypted tunnels.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div ref={ref} className="mx-auto mt-16 flex max-w-[860px] items-end gap-3 sm:mt-20 sm:gap-6">
            <figure className="flex flex-col items-center gap-3">
              <NodeTile active={active === "ipc" || active === "ipc-back"}>
                <svg viewBox="0 0 24 24" className="size-[42%]" aria-hidden>
                  <path d="M4 6l6 6-6 6M12 18h8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
                </svg>
              </NodeTile>
              <figcaption className={`${caption} text-dim`}>Your agent</figcaption>
            </figure>
            <div className="flex min-w-0 flex-1 items-center self-stretch pb-[30px]">
              <Wire label="local IPC" leg="ipc" active={active} />
            </div>
            <figure className="flex flex-col items-center gap-3">
              <NodeTile big active>
                <LogoMark className="h-auto w-[52%] text-lime" />
              </NodeTile>
              <figcaption className={`${caption} text-fg`}>Pilot daemon</figcaption>
            </figure>
            <div className="flex min-w-0 flex-1 items-center self-stretch pb-[30px]">
              <Wire label="encrypted tunnels" leg="tunnel" active={active} />
            </div>
            <figure className="flex flex-col items-center gap-3">
              <NodeTile active={active === "tunnel" || active === "tunnel-back"}>
                <svg viewBox="0 0 24 24" className="size-[44%]" aria-hidden fill="currentColor">
                  <rect x="9.5" y="2" width="5" height="5" />
                  <rect x="2" y="16" width="5" height="5" />
                  <rect x="17" y="16" width="5" height="5" />
                  <path d="M12 7v5M4.5 16v-4h15v4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </NodeTile>
              <figcaption className={`${caption} text-dim`}>Other agents</figcaption>
            </figure>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-[1000px] grid-cols-1 gap-10 border-t border-edge pt-10 sm:mt-20 md:grid-cols-3 md:gap-8">
          {COLUMNS.map((c, i) => (
            <Reveal key={c.n} delay={i * 70}>
              <p className="font-mono text-[12px] text-dim">{c.n}</p>
              <h3 className="mt-3 text-[18px] font-medium tracking-[-0.02em] text-fg">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-mute">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
