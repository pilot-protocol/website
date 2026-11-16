"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon, LockIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { Beam } from "@/components/sky/beam";
import { HatchPanel } from "@/components/sky/kit";
import { AppIcon, Reveal } from "@/components/ui";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { DataAgentGlyph } from "./glyphs";
import "./fits.css";

/*
 * How it fits together (Figma 160:1771): your agent talks to a Pilot daemon on its own machine; the daemon finds
 * other agents through the backbone (registry + beacon) and talks to them over encrypted tunnels. The heading and
 * the picture share one hatched panel; the picture's cards are flat and bordered, and the one the packet is at
 * gets a blue hairline. One packet walks the whole trip, one step at a time, and the caption beside the backbone
 * says what is happening. The steps are buttons, so the trip can be read at your own pace (and with reduced
 * motion, without anything moving).
 */

type Step = "ipc" | "lookup" | "punch" | "tunnel" | "accept" | "reply";

const STEPS: { key: Step; ms: number; text: string }[] = [
  { key: "ipc", ms: 1700, text: "Your agent hands a message to its daemon over local IPC." },
  { key: "lookup", ms: 1900, text: "The daemon asks the registry where the other agent is." },
  { key: "punch", ms: 2000, text: "The beacon helps both daemons punch through NAT, or relays when they can't." },
  { key: "tunnel", ms: 1800, text: "The message crosses an encrypted tunnel, X25519 and AES-256-GCM." },
  { key: "accept", ms: 1900, text: "The other daemon lets it in, because both sides approved." },
  { key: "reply", ms: 2600, text: "The reply comes back the same way." },
];
const AT = Object.fromEntries(STEPS.map((s, i) => [s.key, i])) as Record<Step, number>;

/** The reduced-motion picture: the tunnel open and the message let in. */
const FINAL = AT.accept;

type Peer = { name: string; note: string; logo?: string; pad?: boolean };

const PEERS: Peer[] = [
  { name: "openclaw", note: "On another machine", logo: "/harness/openclaw.png", pad: true },
  { name: "open-meteo-forecast", note: "Data agent, auto-approves" },
  { name: "hermes", note: "A friend's agent", logo: "/harness/hermes.png" },
];

const AGENTS = [
  { src: "/harness/claude-color.svg", name: "Claude Code", pad: true },
  { src: "/harness/codex.svg", name: "Codex" },
  { src: "/harness/openclaw.png", name: "OpenClaw", pad: true },
  { src: "/harness/hermes.png", name: "Hermes" },
];

const DAEMON_APPS = ["io.pilot.postgres", "io.pilot.agentphone", "io.pilot.plainweb"]
  .map((id) => APPS.find((a) => a.id === id))
  .filter((a): a is App => Boolean(a));

/* ---------------- The timeline ---------------- */

function useTrip(running: boolean) {
  const [s, setS] = useState({ step: 0, cycle: 0, nonce: 0, touched: false, hold: false });

  // Autoplay: each step for its own time, then the next peer.
  useEffect(() => {
    if (!running || s.hold) return;
    const id = window.setTimeout(
      () =>
        setS((v) =>
          v.step + 1 >= STEPS.length ? { ...v, step: 0, cycle: v.cycle + 1 } : { ...v, step: v.step + 1 },
        ),
      STEPS[s.step].ms,
    );
    return () => window.clearTimeout(id);
  }, [running, s.hold, s.step, s.cycle]);

  // A step picked by hand stays up a while, then autoplay carries on from there.
  useEffect(() => {
    if (!s.hold) return;
    const id = window.setTimeout(() => setS((v) => ({ ...v, hold: false })), 9000);
    return () => window.clearTimeout(id);
  }, [s.hold, s.nonce]);

  const pick = (step: number) => setS((v) => ({ ...v, step, nonce: v.nonce + 1, touched: true, hold: true }));
  return { ...s, pick };
}

/* ---------------- Pieces ---------------- */

type Run = { reverse?: boolean; delay?: number; duration: number };

/* How a message crosses each wire: there, back, or back after the far side has answered. */
const WIRE_RUNS: Record<"fwd" | "back" | "back-late", Run[]> = {
  fwd: [{ duration: 1100 }],
  back: [{ reverse: true, duration: 1000 }],
  "back-late": [{ reverse: true, delay: 1050, duration: 1000 }],
};
/* Down to the backbone and back up (a lookup), or up from it (the beacon's punch). */
const DROP_RUNS: Record<"down-up" | "up", Run[]> = {
  "down-up": [{ duration: 700 }, { reverse: true, delay: 760, duration: 700 }],
  up: [{ reverse: true, delay: 150, duration: 1050 }],
};

/**
 * The shared beam along an HTML wire: an SVG the wire's exact size, with a path down its middle (across on wide
 * screens, down on phones), so the light follows the line the reader sees.
 */
function WireBeams({ runs, runKey, lit }: { runs: Run[] | null; runKey: string; lit?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const across = box ? box.w >= box.h : true;
  const length = box ? Math.max(box.w, box.h) : 0;
  const d = box ? (across ? `M0 ${box.h / 2} H${box.w}` : `M${box.w / 2} 0 V${box.h}`) : null;
  return (
    <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {box && d && runs && (
        <svg width={box.w} height={box.h} className="absolute inset-0 overflow-visible">
          {runs.map((r, k) => (
            <Beam
              key={k}
              d={d}
              run={runKey}
              reverse={r.reverse}
              delay={r.delay}
              duration={r.duration}
              width={2}
              tail={Math.round(Math.min(56, Math.max(24, length * 0.34)))}
              // On the lit (blue) tunnel the light is pale, so it shows against the line.
              color={lit ? "var(--sky-200)" : "var(--fitd-packet)"}
            />
          ))}
        </svg>
      )}
    </span>
  );
}

function Wire({
  area,
  label,
  lit,
  packet,
  runKey,
}: {
  area: "w1" | "w2";
  label: ReactNode;
  lit?: boolean;
  packet: null | "fwd" | "back" | "back-late";
  runKey: string;
}) {
  return (
    <div aria-hidden className="fitd-wire" style={{ gridArea: area }}>
      <span className="fitd-line" />
      <span className="fitd-lit" data-on={Boolean(lit)} />
      <WireBeams runs={packet ? WIRE_RUNS[packet] : null} runKey={runKey} lit={lit} />
      <span className="fitd-label flex items-center gap-1.5 text-[12.5px] leading-4 text-mute">{label}</span>
    </div>
  );
}

function Drop({ packet, runKey }: { packet: null | "down-up" | "up"; runKey: string }) {
  return (
    <span aria-hidden className="fitd-drop">
      <WireBeams runs={packet ? DROP_RUNS[packet] : null} runKey={runKey} />
    </span>
  );
}

/* Line glyphs for the machine and the backbone (Nucleo UI outline, on its 18px grid). */
function Glyph({ className = "size-[18px]", children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}

function LaptopGlyph({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M4.25 14.75c-1.105 0-2-.895-2-2V4.75c0-1.105.895-2 2-2h9.5c1.105 0 2 .895 2 2v8c0 1.105-.895 2-2 2" />
      <path d="M.75 14.75h16.5" />
    </Glyph>
  );
}

/** A server: the registry. */
function ServerGlyph() {
  return (
    <Glyph>
      <rect x="1.75" y="2.75" width="14.5" height="5" rx="1.5" />
      <rect x="1.75" y="10.25" width="14.5" height="5" rx="1.5" />
      <circle cx="4.25" cy="5.25" r=".75" fill="currentColor" stroke="none" />
      <circle cx="6.75" cy="5.25" r=".75" fill="currentColor" stroke="none" />
      <circle cx="4.25" cy="12.75" r=".75" fill="currentColor" stroke="none" />
      <circle cx="6.75" cy="12.75" r=".75" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** A radio mast: the beacon. */
function BeaconGlyph() {
  return (
    <Glyph>
      <circle cx="9" cy="7" r="2.25" />
      <path d="M4.581 2.581a6.25 6.25 0 0 0 0 8.838M13.419 11.419a6.25 6.25 0 0 0 0-8.838M9 9.25V15M12 15.25H6" />
    </Glyph>
  );
}

/** Infrastructure as the home page draws objects: a white tile with the tile shadow. */
function InfraTile({ children }: { children: ReactNode }) {
  return <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-card text-(--sky-accent) shadow-tile">{children}</span>;
}

function PeerIcon({ peer, size }: { peer: Peer; size: number }) {
  return peer.logo ? <AppIcon src={peer.logo} size={size} pad={peer.pad} /> : <DataAgentGlyph size={size} glyph={0.52} />;
}

/** Small honest facts, set as tags in the UI rather than as fine print. */
function Tag({ children, mono, href }: { children: ReactNode; mono?: boolean; href?: string }) {
  const cls = `rounded-full bg-(--sky-tint) px-2 py-0.5 leading-4 font-medium whitespace-nowrap text-(--sky-accent) ${mono ? "font-mono text-[11.5px]" : "text-[12px]"}`;
  if (href)
    return (
      <Link href={href} className={`${cls} transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--sky-fill)_16%,transparent)]`}>
        {children}
        <span aria-hidden> →</span>
      </Link>
    );
  return <span className={cls}>{children}</span>;
}

function Row({ label, active, children }: { label: string; active?: boolean; children: ReactNode }) {
  return (
    <div
      data-active={Boolean(active)}
      className="fitd-hl -mx-2 flex h-9 items-center justify-between gap-3 rounded-[10px] px-2 text-mute data-[active=true]:text-fg"
    >
      <span className="text-[13px] leading-4">{label}</span>
      <span className="flex min-w-0 items-center text-fg">{children}</span>
    </div>
  );
}

/* ---------------- The picture ---------------- */

function Diagram() {
  // The trip runs only once the picture is properly on screen (its top above 60% of the window), so a reader who
  // stops on the heading while the picture peeks in below still arrives at step 1.
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-12% 0px -40% 0px" });
  const reduced = usePrefersReducedMotion();
  const trip = useTrip(inView && !reduced);
  const step = reduced && !trip.touched ? FINAL : trip.step;
  const key = STEPS[step].key;
  const peerIndex = trip.cycle % PEERS.length;
  const run = `${trip.cycle}-${step}-${trip.nonce}`;
  const moving = !reduced && (inView || trip.touched);

  const tunnelOpen = step >= AT.tunnel;
  const looking = step >= AT.lookup;
  const accepted = step >= AT.accept;

  return (
    <div ref={ref} className="fitd">
      <div className="fitd-grid">
        {/* Where things run: your agent and its daemon share one machine, framed as one; the others are elsewhere. */}
        <div aria-hidden className="fitd-machine">
          <span className="fitd-legend flex items-center gap-1.5 text-[13px] leading-4 text-mute">
            <LaptopGlyph className="size-4" />
            Your machine
          </span>
        </div>
        <span className="sr-only" style={{ gridArea: "mlab" }}>
          Your machine
        </span>
        <div style={{ gridArea: "olab" }} className="mb-5 hidden items-center gap-3 lg:flex">
          <span className="h-px flex-1 bg-(--fitd-line)" />
          <span className="text-[13px] leading-4 text-mute">Other machines</span>
          <span className="h-px flex-1 bg-(--fitd-line)" />
        </div>

        {/* Your agent */}
        <div className="fitd-cell" style={{ gridArea: "agent" }}>
          <div className="fitd-node p-5" data-active={key === "ipc" || key === "reply"}>
            <div className="flex gap-1.5">
              {AGENTS.map((a) => (
                <AppIcon key={a.name} src={a.src} size={34} pad={a.pad} />
              ))}
            </div>
            <p className="mt-4 text-[15.5px] leading-5 font-medium tracking-[-0.01em] text-fg">Your agent</p>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-pretty text-mute">Claude Code, Codex, OpenClaw or your own code.</p>
            <p className="mt-3 flex flex-wrap gap-1.5">
              <Tag mono>pilotctl</Tag>
              <Tag>SDK</Tag>
            </p>
          </div>
        </div>

        <Wire
          area="w1"
          label="Local IPC"
          packet={moving ? (key === "ipc" ? "fwd" : key === "reply" ? "back-late" : null) : null}
          runKey={run}
        />

        {/* The daemon */}
        <div className="fitd-cell" style={{ gridArea: "daemon" }}>
          <div className="fitd-node fitd-focal p-5" data-active={key === "ipc" || key === "tunnel" || key === "reply"}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-(--sky-fill) text-white shadow-tile">
                <PilotMarkP className="h-[17px] w-auto" />
              </span>
              <div className="min-w-0">
                <p className="text-[15.5px] leading-5 font-medium tracking-[-0.01em] text-fg">Pilot daemon</p>
                <p className="mt-0.5 text-[12.5px] leading-4 text-mute">Runs next to your agent</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col">
              <Row label="Address">
                <span className="font-mono text-[12.5px] whitespace-nowrap tabular-nums">
                  0:0000.0000.<span className="text-(--sky-accent)">A9F1</span>
                </span>
              </Row>
              <Row label="Keys">
                <span className="text-[13px]">Ed25519</span>
              </Row>
              <Row label="Trust list" active={key === "accept"}>
                <span className="flex gap-1">
                  {PEERS.map((p) => (
                    <PeerIcon key={p.name} peer={p} size={20} />
                  ))}
                </span>
              </Row>
              <Row label="Tunnels" active={key === "punch" || key === "tunnel"}>
                <span className="flex gap-1.5">
                  {PEERS.map((p, i) => (
                    <span
                      key={p.name}
                      data-on={tunnelOpen && i === peerIndex}
                      className="size-2 rounded-full bg-fg/15 transition-colors duration-300 data-[on=true]:bg-(--fitd-lit)"
                    />
                  ))}
                </span>
              </Row>
              <Row label="Apps">
                <span className="flex gap-1">
                  {DAEMON_APPS.map((a) => (
                    <AppIcon key={a.id} src={a.icon} size={20} />
                  ))}
                </span>
              </Row>
            </div>
          </div>
          <Drop packet={moving && key === "lookup" ? "down-up" : moving && key === "punch" ? "up" : null} runKey={run} />
        </div>

        <Wire
          area="w2"
          label={
            <>
              <LockIcon className="size-3" />
              Encrypted tunnel
            </>
          }
          lit={tunnelOpen}
          packet={moving ? (key === "tunnel" ? "fwd" : key === "reply" ? "back" : null) : null}
          runKey={run}
        />

        {/* Other agents */}
        <div className="fitd-cell" style={{ gridArea: "others" }}>
          <div className="fitd-node p-5" data-active={key === "accept"}>
            <p className="text-[15.5px] leading-5 font-medium tracking-[-0.01em] text-fg">Other agents</p>
            <ul className="mt-3 flex flex-col">
              {PEERS.map((p, i) => {
                const target = looking && i === peerIndex;
                return (
                  <li
                    key={p.name}
                    data-active={target}
                    className="fitd-hl -mx-2 flex items-center gap-3 rounded-[12px] px-2 py-2"
                  >
                    <span className="relative">
                      <PeerIcon peer={p} size={30} />
                      <span
                        data-on={target && accepted}
                        className="fitd-pop absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-(--sky-fill) text-white"
                        style={{ boxShadow: "0 0 0 2px var(--fitd-node-bg)" }}
                      >
                        <CheckIcon className="size-[9px]" />
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-[12.5px] leading-4 text-fg">{p.name}</span>
                      <span className="mt-0.5 block truncate text-[12px] leading-4 text-mute">{p.note}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <Drop packet={moving && key === "punch" ? "up" : null} runKey={run} />
        </div>

        {/* The backbone */}
        <div className="fitd-bb">
          <div className="fitd-node overflow-hidden" data-active={key === "lookup" || key === "punch"}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 pt-4 pb-3.5">
              <p className="text-[15.5px] leading-5 font-medium tracking-[-0.01em] text-fg">The backbone</p>
              <p className="flex flex-wrap gap-1.5">
                <Tag>Free, run by Vulture Labs</Tag>
                <Tag href="/self-hosting">Or run your own</Tag>
              </p>
            </div>
            <div className="grid grid-cols-1 border-t border-edge sm:grid-cols-2">
              <div data-active={key === "lookup"} className="fitd-hl px-5 py-4">
                <p className="flex items-center gap-2.5 text-[13.5px] leading-5 font-medium text-fg">
                  <InfraTile>
                    <ServerGlyph />
                  </InfraTile>
                  Registry
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.5] text-pretty text-mute">
                  Hands out addresses, keeps public keys and answers lookups.
                </p>
                <p className="mt-2 truncate font-mono text-[11.5px] leading-4 text-soft">registry.pilotprotocol.network</p>
              </div>
              <div data-active={key === "punch"} className="fitd-hl border-t border-edge px-5 py-4 sm:border-t-0 sm:border-l">
                <p className="flex items-center gap-2.5 text-[13.5px] leading-5 font-medium text-fg">
                  <InfraTile>
                    <BeaconGlyph />
                  </InfraTile>
                  Beacon
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.5] text-pretty text-mute">
                  Finds a path through NAT, and relays when there is no direct one.
                </p>
                <p className="mt-2 truncate font-mono text-[11.5px] leading-4 text-soft">beacon.pilotprotocol.network</p>
              </div>
            </div>
          </div>
        </div>

        {/* The caption: what the packet is doing now. The steps are buttons. */}
        <div className="fitd-cap">
          <ol className="flex w-full max-w-[340px] gap-1.5 max-lg:mx-auto" aria-label="The steps of one message">
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i > step ? "todo" : trip.hold || reduced || !inView ? "held" : "now";
              return (
                <li key={s.key} className="flex-1">
                  <button
                    type="button"
                    onClick={() => trip.pick(i)}
                    aria-label={`Step ${i + 1} of ${STEPS.length}: ${s.text}`}
                    aria-current={i === step ? "step" : undefined}
                    className="group flex h-6 w-full items-center"
                  >
                    <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-fg/10 transition-colors duration-200 group-hover:bg-fg/20">
                      <span
                        key={state === "now" ? run : state}
                        data-state={state}
                        className="fitd-fill absolute inset-0 rounded-full bg-(--fitd-lit)"
                        style={{ "--fitd-ms": `${s.ms}ms` } as CSSProperties}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p aria-hidden className="mt-3 text-[13px] leading-4 text-mute tabular-nums">
            Step {step + 1} of {STEPS.length}
          </p>
          <p aria-hidden key={run} className="fitd-swap mt-1 min-h-[44px] text-[15px] leading-[22px] tracking-[-0.01em] text-pretty text-fg lg:mt-1.5 lg:min-h-[52px] lg:text-[17px] lg:leading-[26px]">
            {STEPS[step].text}
          </p>
          <span className="sr-only" aria-live="polite">
            {trip.touched ? STEPS[step].text : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FitsD() {
  return (
    <section id="how-it-fits" aria-labelledby="fits-d-title" className="py-20 sm:py-24 lg:py-[88px]">
      <div className="wrap">
        <HatchPanel className="px-4 pt-14 pb-10 sm:px-8 sm:pt-16 sm:pb-12 lg:py-[72px] xl:px-12">
          <Reveal className="mx-auto max-w-[700px] text-center">
            <h2
              id="fits-d-title"
              className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
            >
              Your agent talks to a Pilot daemon <span className="block text-mute">on its own machine.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[600px] text-[17px] leading-[1.5] tracking-[-0.024em] text-pretty text-mute sm:mt-8 sm:text-[18px] sm:leading-[27px]">
              The daemon finds other agents through the backbone and talks to them over encrypted tunnels.
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-12 sm:mt-16 lg:mt-[100px]">
            <Diagram />
          </Reveal>
        </HatchPanel>
      </div>
    </section>
  );
}
