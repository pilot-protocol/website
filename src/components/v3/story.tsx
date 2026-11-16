"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./story.css";
import { Containers, IsoBox, IsoScene, IsoTag, IsoTunnel, Laptop, Server, Tower, iso, type Pt } from "@/components/v3/iso";
import { TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";

/*
 * How Pilot connects two agents, as one isometric island that stays pinned while four
 * chapters scroll past: an address, a move that keeps it, a trust handshake, and NAT.
 * Each chapter has a sub-progress `t` (0 → 1) that drives what's on the island.
 */

const CHAPTERS: { short: string; title: string; body: ReactNode }[] = [
  {
    short: "Address",
    title: "Every agent gets an address.",
    body: (
      <>
        The daemon gives each agent a permanent 48-bit address and an Ed25519 identity, and the registry hands out
        addresses and answers lookups. This one is real: <span className="font-mono text-[0.92em] text-fg">open-meteo-forecast</span>,
        a weather data agent, lives at <span className="font-mono text-[0.92em] text-fg">0:0000.0000.4BB9</span>.
      </>
    ),
  },
  {
    short: "Moves",
    title: "Move it and the address stays.",
    body: "Run the agent on a cloud VM, then move it into a container. Its address and identity stay the same across IP, cloud and container changes, so peers keep reaching it where they always have.",
  },
  {
    short: "Trust",
    title: "Nobody gets in until both sides approve.",
    body: "Agents start private. Nobody can reach yours until both sides approve a trust handshake, and you can reject or revoke a peer at any time. Every tunnel uses X25519 key exchange and AES-256-GCM.",
  },
  {
    short: "NAT",
    title: "Both sides can sit behind NAT.",
    body: "The beacon helps daemons find a direct path with STUN and hole punching. When they can't connect directly, it relays the traffic, still encrypted. Your agent can run on a laptop behind a home router.",
  },
];

/* ---------------- The island ---------------- */

// Grid positions (x runs down-right, y down-left).
const LAPTOP = { x: 1.8, y: 6.6 };
const CLAW = { x: 7.4, y: 7.0 };
const SERVER = { x: 9.0, y: 1.4 };
const BOX2 = { x: 9.8, y: 4.4 };
const REGISTRY = { x: 3.4, y: 0.7 };
const BEACON = { x: 0.8, y: 3.0 };

// Where the moving agent's tag sits on each host.
const HOSTS: { at: Pt; where: string }[] = [
  { at: [SERVER.x + 0.65, SERVER.y + 0.65, 2.55], where: "on a cloud VM" },
  { at: [BOX2.x + 0.9, BOX2.y + 0.55, 2.15], where: "in a container" },
];

const VIEW: [number, number, number, number] = [-372, -96, 816, 508];
// Phones crop the empty edges of the island so the labels stay readable.
const VIEW_COMPACT: [number, number, number, number] = [-272, -96, 700, 470];

function shift(a: Pt, b: Pt) {
  const [ax, ay] = iso(a[0], a[1], a[2] ?? 0);
  const [bx, by] = iso(b[0], b[1], b[2] ?? 0);
  return [bx - ax, by - ay];
}

/** Low NAT walls around a footprint; drawn as back walls (before the machine) or front walls (after). */
function Fence({ x1, y1, x2, y2, part, on }: { x1: number; y1: number; x2: number; y2: number; part: "back" | "front"; on: boolean }) {
  const t = 0.08;
  const h = 0.45;
  return (
    <g className="story-fade" data-on={on}>
      {part === "back" ? (
        <>
          <IsoBox x={x1} y={y1} w={x2 - x1} d={t} h={h} tone="glass" className="story-wall" />
          <IsoBox x={x1} y={y1} w={t} d={y2 - y1} h={h} tone="glass" className="story-wall" />
        </>
      ) : (
        <>
          <IsoBox x={x2 - t} y={y1} w={t} d={y2 - y1} h={h} tone="glass" className="story-wall" />
          <IsoBox x={x1} y={y2 - t} w={x2 - x1} d={t} h={h} tone="glass" className="story-wall" />
        </>
      )}
    </g>
  );
}

/** Shown/hidden group with a fade; `pop` lifts and scales tags in from their base. */
function Show({ on, pop = false, dim = false, children }: { on: boolean; pop?: boolean; dim?: boolean; children: ReactNode }) {
  return (
    <g className={pop ? "story-pop" : "story-fade"} data-on={on} data-dim={dim}>
      {children}
    </g>
  );
}

function IslandScene({ ch, t, still, compact = false }: { ch: number; t: number; still: boolean; compact?: boolean }) {
  const p = (n: number) => (still ? 0 : n);
  const host = ch === 1 ? (t < 0.5 ? 0 : 1) : ch > 1 ? 1 : 0;
  const addr = ch > 0 || t > 0.32;
  const regLine = ch === 0 && t > 0.08 && t < 0.72;
  const ask = ch === 2 && t > 0.06 && t < 0.6;
  const okLaptop = ch === 2 && t > 0.3;
  const okClaw = ch === 2 && t > 0.5;
  const tunnel3 = ch === 2 && t > 0.6;
  const cipher = ch === 2 && t > 0.7;
  const fences = ch === 3;
  const probes = ch === 3 && t > 0.1 && t < 0.56;
  const relay = ch === 3 && t > 0.36 && t < 0.68;
  const direct = ch === 3 && t > 0.6;

  // What each chapter is about stays bright; the rest of the island steps back.
  const focus = {
    laptop: ch !== 1,
    claw: ch >= 2,
    server: ch <= 1,
    box2: ch === 1,
    registry: ch === 0,
    beacon: ch === 3,
  };

  const [dx, dy] = shift(HOSTS[0].at, HOSTS[host].at);
  const tunnelLow: Pt[] = [
    [LAPTOP.x + 2, LAPTOP.y + 0.95, 0.35],
    [CLAW.x, LAPTOP.y + 0.95, 0.35],
  ];
  const tunnelOver: Pt[] = [
    [LAPTOP.x + 2, LAPTOP.y + 0.95, 0.35],
    [LAPTOP.x + 2.85, LAPTOP.y + 0.95, 1.05],
    [CLAW.x - 0.85, LAPTOP.y + 0.95, 1.05],
    [CLAW.x, LAPTOP.y + 0.95, 0.35],
  ];
  const beaconTop: Pt = [BEACON.x + 0.45, BEACON.y + 0.45, 3.05];

  return (
    <IsoScene
      view={compact ? VIEW_COMPACT : VIEW}
      label={`${CHAPTERS[ch].title} An isometric drawing of agents on the Pilot network.`}
      className="story-scene"
    >
      {/* Ground: the island and a faint tile grid */}
      <g className="story-ground">
        <IsoBox x={0} y={0} z={-0.6} w={12} d={10} h={0.6} className="iso-ground" />
      </g>
      <g className="story-grid">
        {Array.from({ length: 11 }, (_, i) => {
          const [a1, b1] = iso(i + 1, 0);
          const [a2, b2] = iso(i + 1, 10);
          return <line key={`x${i}`} x1={a1} y1={b1} x2={a2} y2={b2} />;
        })}
        {Array.from({ length: 9 }, (_, j) => {
          const [a1, b1] = iso(0, j + 1);
          const [a2, b2] = iso(12, j + 1);
          return <line key={`y${j}`} x1={a1} y1={b1} x2={a2} y2={b2} />;
        })}
      </g>

      {/* Backbone */}
      <Show on dim={!focus.registry}>
        <Tower x={REGISTRY.x} y={REGISTRY.y} kind="registry" />
      </Show>
      <Show on dim={!focus.beacon}>
        <Tower x={BEACON.x} y={BEACON.y} kind="beacon" />
      </Show>

      {/* Registry issuing the address */}
      <IsoTunnel
        points={[
          [REGISTRY.x + 0.6, REGISTRY.y + 0.6, 2.9],
          [SERVER.x + 0.65, REGISTRY.y + 0.6, 2.9],
          [SERVER.x + 0.65, SERVER.y + 0.65, 2.3],
        ]}
        dashed
        on={regLine}
        packets={p(1)}
        duration={1.6}
      />

      {/* Your agent on a laptop */}
      <Fence x1={LAPTOP.x - 0.5} y1={LAPTOP.y - 0.5} x2={LAPTOP.x + 2.5} y2={LAPTOP.y + 1.9} part="back" on={fences} />
      <Show on dim={!focus.laptop}>
        <Laptop x={LAPTOP.x} y={LAPTOP.y} lit={ch >= 2} />
      </Show>
      <Fence x1={LAPTOP.x - 0.5} y1={LAPTOP.y - 0.5} x2={LAPTOP.x + 2.5} y2={LAPTOP.y + 1.9} part="front" on={fences} />

      {/* The cloud VM the data agent starts on */}
      <Show on dim={!focus.server}>
        <Server x={SERVER.x} y={SERVER.y} lit={host === 0 && ch <= 1} />
      </Show>

      {/* Tunnels between your agent and OpenClaw */}
      <IsoTunnel points={tunnelLow} on={tunnel3} packets={p(3)} duration={2.4} />
      <Fence x1={CLAW.x - 0.5} y1={CLAW.y - 0.5} x2={CLAW.x + 2.3} y2={CLAW.y + 1.6} part="back" on={fences} />
      <IsoTunnel points={tunnelOver} on={direct} packets={p(3)} duration={2.4} />

      {/* OpenClaw's containers */}
      <Show on dim={!focus.claw}>
        <Containers x={CLAW.x} y={CLAW.y} lime={ch >= 2 ? 1 : -1} />
      </Show>
      <Fence x1={CLAW.x - 0.5} y1={CLAW.y - 0.5} x2={CLAW.x + 2.3} y2={CLAW.y + 1.6} part="front" on={fences} />

      {/* The container the data agent moves into */}
      <Show on dim={!focus.box2}>
        <Containers x={BOX2.x} y={BOX2.y} lime={host === 1 && ch === 1 ? 2 : -1} />
      </Show>

      {/* STUN probes up to the beacon, and the relay fallback through it */}
      <IsoTunnel
        points={[[LAPTOP.x + 1, LAPTOP.y + 0.7, 1.4], beaconTop]}
        dashed
        on={probes}
        packets={p(1)}
        duration={1.4}
        className="story-probe"
      />
      <IsoTunnel
        points={[[CLAW.x + 0.9, CLAW.y + 0.55, 2], beaconTop]}
        dashed
        on={probes}
        packets={p(1)}
        duration={1.4}
        className="story-probe"
      />
      <IsoTunnel
        points={[[LAPTOP.x + 1, LAPTOP.y + 0.7, 1.4], beaconTop, [CLAW.x + 0.9, CLAW.y + 0.55, 2]]}
        dashed
        on={relay}
        packets={p(2)}
        duration={3}
      />

      {/* ---------------- Labels, on top ---------------- */}
      <Show on>
        <IsoTag at={[REGISTRY.x + 0.45, REGISTRY.y + 0.45, 3.45]} label="Registry" sub={ch === 0 ? "hands out addresses" : undefined} />
      </Show>
      <Show on={ch === 3}>
        <IsoTag at={[BEACON.x + 0.45, BEACON.y + 0.45, 3.55]} label="Beacon" sub="STUN · relay" />
      </Show>

      <Show on={!okLaptop}>
        <IsoTag at={[LAPTOP.x + 1, LAPTOP.y + 0.04, 1.62]} label="Claude Code" sub="your agent" logo="/harness/claude-color.svg" />
      </Show>
      <Show on={ch >= 2 && !okClaw}>
        <IsoTag
          at={[CLAW.x + 0.9, CLAW.y + 0.55, 2.05]}
          label="OpenClaw"
          sub={ask ? "asks to connect" : undefined}
          logo="/harness/openclaw.png"
        />
      </Show>

      {/* The data agent's address tag, which travels with it */}
      <g className="story-move" style={{ transform: `translate(${dx}px, ${dy}px)` } as CSSProperties}>
        <Show on={addr && ch <= 1} pop>
          <IsoTag
            at={HOSTS[0].at}
            label="0:0000.0000.4BB9"
            sub={ch === 1 ? `open-meteo-forecast, ${HOSTS[host].where}` : "open-meteo-forecast · node 19385"}
            mono
            tone="lime"
          />
        </Show>
      </g>

      {/* Approvals */}
      <Show on={okLaptop} pop>
        <IsoTag at={[LAPTOP.x + 1, LAPTOP.y + 0.04, 1.62]} label="claude-code approved" tone="lime" />
      </Show>
      <Show on={okClaw} pop>
        <IsoTag at={[CLAW.x + 0.9, CLAW.y + 0.55, 2.05]} label="openclaw approved" tone="lime" />
      </Show>
      <Show on={cipher} pop>
        <IsoTag at={[3.9, LAPTOP.y + 0.95, 0.5]} label="X25519 · AES-256-GCM" mono tone="ink" />
      </Show>

      {/* NAT */}
      <Show on={fences} pop>
        <IsoTag at={[LAPTOP.x - 0.5, LAPTOP.y + 1.9, 0.5]} label="NAT" tone="ink" />
      </Show>
      <Show on={fences} pop>
        <IsoTag at={[CLAW.x + 2.3, CLAW.y + 1.6, 0.5]} label="NAT" tone="ink" />
      </Show>
      <Show on={relay && !direct} pop>
        <IsoTag at={[3.6, 2.0, 2.2]} label="Relay fallback, still encrypted" />
      </Show>
      <Show on={direct} pop>
        <IsoTag at={[(LAPTOP.x + 2 + CLAW.x) / 2, LAPTOP.y + 0.95, 1.25]} label="Direct tunnel" tone="lime" />
      </Show>
    </IsoScene>
  );
}

/* ---------------- Pinned (desktop) ---------------- */

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ ch: 0, t: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const raw = Math.min(0.9999, Math.max(0, v)) * CHAPTERS.length;
    const ch = Math.floor(raw);
    const t = Math.round((raw - ch) * 50) / 50;
    setState((s) => (s.ch === ch && s.t === t ? s : { ch, t }));
  });

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + span * ((i + 0.72) / CHAPTERS.length), behavior: "smooth" });
  }

  const { ch, t } = state;

  return (
    <div ref={ref} className="relative hidden h-[460vh] lg:block">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="wrap grid grid-cols-[minmax(0,4.3fr)_minmax(0,8fr)] items-center gap-8 xl:gap-12">
          <div>
            <p className="text-[14px] text-mute">How Pilot connects two agents</p>
            <div className="mt-6 grid">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.short}
                  data-on={i === ch}
                  aria-hidden={i !== ch}
                  className="story-copy col-start-1 row-start-1"
                >
                  <h3 className="text-[clamp(30px,3vw,44px)] leading-[1.05] font-medium tracking-[-0.04em] text-balance text-fg">
                    {c.title}
                  </h3>
                  <p className="mt-5 max-w-[440px] text-[17px] leading-[1.55] text-pretty text-mute">{c.body}</p>
                </div>
              ))}
            </div>

            <ol className="mt-10 flex flex-col gap-1" aria-label="Chapters">
              {CHAPTERS.map((c, i) => (
                <li key={c.short}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === ch ? "step" : undefined}
                    className="group flex w-full max-w-[300px] items-center gap-3 rounded-[10px] py-1.5 text-left"
                  >
                    <span className="w-4 font-mono text-[12px] text-dim tabular-nums group-aria-[current=step]:text-fg">{i + 1}</span>
                    <span className="relative h-[3px] w-14 overflow-hidden rounded-full bg-fg/10">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-lime-ink transition-[width] duration-150"
                        style={{ width: `${i < ch ? 100 : i === ch ? Math.max(6, t * 100) : 0}%` }}
                      />
                    </span>
                    <span className="text-[14px] text-dim transition-colors group-hover:text-soft group-aria-[current=step]:text-fg">
                      {c.short}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <TextLink href={LINKS.concepts}>How the protocol works</TextLink>
            </div>
          </div>

          <div className="relative origin-center scale-[1.14] xl:scale-[1.2]">
            <IslandScene ch={ch} t={t} still={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Stacked (phones, tablets, reduced motion) ---------------- */

function StackedChapter({ i, still }: { i: number; still: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  const [t, setT] = useState(still ? 1 : 0);

  // Play the chapter once when it scrolls into view.
  useEffect(() => {
    if (still || !inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const v = Math.min(1, (now - start) / 3200);
      setT(Math.round(v * 50) / 50);
      if (v < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, still]);

  const c = CHAPTERS[i];
  return (
    <div ref={ref} className="py-10 sm:py-14">
      <p className="font-mono text-[12px] text-dim">
        {i + 1} / {CHAPTERS.length}
      </p>
      <h3 className="mt-3 text-[clamp(28px,6vw,40px)] leading-[1.05] font-medium tracking-[-0.04em] text-balance text-fg">
        {c.title}
      </h3>
      <p className="mt-4 max-w-[560px] text-[16px] leading-[1.55] text-pretty text-mute">{c.body}</p>
      <div className="-mx-5 mt-8 sm:mx-0">
        <IslandScene ch={i} t={still ? 0.99 : Math.min(0.99, t)} still={still} compact />
      </div>
    </div>
  );
}

export function Story() {
  const reduced = usePrefersReducedMotion();
  return (
    <section id="how-it-works" aria-labelledby="story-title" className="relative py-16 lg:py-0">
      <h2 id="story-title" className="sr-only">
        How Pilot connects two agents
      </h2>
      {!reduced && <Pinned />}
      <div className={`wrap ${reduced ? "" : "lg:hidden"}`}>
        {reduced && <p className="pt-12 text-[14px] text-mute">How Pilot connects two agents</p>}
        <div className="divide-y divide-edge">
          {CHAPTERS.map((c, i) => (
            <StackedChapter key={c.short} i={i} still={reduced} />
          ))}
        </div>
        <div className="pb-8">
          <TextLink href={LINKS.concepts}>How the protocol works</TextLink>
        </div>
      </div>
    </section>
  );
}
