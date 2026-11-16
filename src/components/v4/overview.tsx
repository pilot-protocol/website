"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BranchIcon,
  CheckIcon,
  CloudIcon,
  DatabaseIcon,
  FingerprintIcon,
  GridIcon,
  LockIcon,
  MessageDotsIcon,
  PlugIcon,
} from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { SKY_CARD } from "@/components/sky/kit";
import { AppIcon, Reveal } from "@/components/ui";
import { AGENT_CATEGORIES } from "@/lib/agents";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { DataAgentGlyph } from "./glyphs";
import "./overview.css";

/*
 * The whole product on one screen (Figma 141:34645): a centred two-tone heading with a lede, then seven flat
 * bordered cards. Row one: the protocol (two columns wide), the data agents and the App Store. Row two: Pilot Cloud,
 * pilot-mom, skill injection and the open-source backbone. Each card is a link to the section that explains it
 * (the round button says which way: down the page, or out to another page), and each carries one small live visual
 * that shows the idea rather than describing it.
 */

/** Where each card leads on the sky home page. */
const TARGET = {
  protocol: "#how-it-fits",
  data: "#directory",
  apps: "#app-store",
  cloud: "#cloud",
  mom: "/service-agents#data-agents",
  skills: "#get-started",
  oss: "#open-source",
} as const;

/* ---------------- Shared ---------------- */

/** Loops run only while the card is on screen; reduced motion shows the final state. */
function useRun<T extends Element>() {
  const [ref, inView] = useInView<T>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  return { ref, run: inView && !reduced, reduced };
}

/** Steps through a fixed timeline (one duration per step), counting completed cycles. */
function useSteps(durations: readonly number[], running: boolean) {
  const [s, setS] = useState({ step: 0, cycle: 0 });
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(
      () => setS(({ step, cycle }) => (step + 1 >= durations.length ? { step: 0, cycle: cycle + 1 } : { step: step + 1, cycle })),
      durations[s.step],
    );
    return () => window.clearTimeout(id);
  }, [running, s.step, s.cycle, durations]);
  return s;
}

const Hi = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;

function Tile({
  href,
  icon,
  title,
  badge,
  lead,
  children,
  className = "",
  center = false,
  delay = 0,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  badge?: string;
  lead: ReactNode;
  children: ReactNode;
  className?: string;
  /** Centre the visual in its area instead of sitting it on the card's foot. */
  center?: boolean;
  delay?: number;
}) {
  const away = !href.startsWith("#");
  return (
    <Reveal delay={delay} className={className}>
      <a href={href} className={`ovd-card group relative flex h-full flex-col overflow-hidden p-6 ${SKY_CARD}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-[16px] leading-7 font-medium tracking-[-0.03em] text-fg">
            <span className="text-(--sky-accent)">{icon}</span>
            {title}
            {badge && (
              <span className="rounded-full bg-(--sky-fill) px-2 py-0.5 text-[11.5px] leading-4 font-medium tracking-[-0.01em] text-white">
                {badge}
              </span>
            )}
          </h3>
          <span aria-hidden data-away={away} className="ovd-jump grid size-7 shrink-0 place-items-center rounded-full bg-fg/[0.05] text-mute">
            {away ? <ArrowUpRightIcon className="size-3" /> : <ArrowRightIcon className="size-3 rotate-90" />}
          </span>
        </div>
        <p className="mt-2.5 max-w-[440px] text-[14.5px] leading-[1.5] tracking-[-0.013em] text-pretty text-mute">{lead}</p>
        <div aria-hidden className={`relative mt-6 flex h-[204px] flex-col ${center ? "justify-center" : "justify-end"}`}>
          {children}
        </div>
      </a>
    </Reveal>
  );
}

/* ---------------- 1 · Pilot Protocol: a route between two agents ---------------- */

type Agent = { name: string; address: string; logo?: string; pad?: boolean; mono?: boolean };

const SELF: Agent = { name: "claude-code", address: "A9F1", logo: "/harness/claude-color.svg", pad: true };
const PEERS: Agent[] = [
  { name: "open-meteo-forecast", address: "4BB9" },
  { name: "openclaw", address: "1F0A", logo: "/harness/openclaw.png", pad: true },
  { name: "hermes", address: "77C2", logo: "/harness/hermes.png" },
];

// Handshake sent · both sides approved · the tunnel open · reset to the next peer.
const ROUTE_MS = [1300, 1300, 3400, 500] as const;
const STATUS = ["Handshake sent", "Both sides approved", "Encrypted tunnel open", ""];
const HEX = "0123456789ABCDEF";

/** The last group of a new address resolving out of noise, as if just looked up. */
function Scramble({ word, run }: { word: string; run: boolean }) {
  const [noise, setNoise] = useState<string | null>(null);
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      if (frame > 12) {
        window.clearInterval(id);
        setNoise(null);
        return;
      }
      setNoise(
        word
          .split("")
          .map((c, i) => (frame > 3 + i * 2 ? c : HEX[Math.floor(Math.random() * 16)]))
          .join(""),
      );
    }, 40);
    return () => window.clearInterval(id);
  }, [word, run]);
  return <>{run && noise ? noise : word}</>;
}

function AgentTile({ agent, size }: { agent: Agent; size: number }) {
  return agent.logo ? (
    <AppIcon src={agent.logo} size={size} pad={agent.pad} className={agent.mono ? "dark:[&_img]:invert" : ""} />
  ) : (
    <DataAgentGlyph size={size} glyph={0.46} />
  );
}

function Endpoint({ agent, approved, right, scramble }: { agent: Agent; approved: boolean; right?: boolean; scramble: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col ${right ? "items-end text-right" : "items-start"}`}>
      <span key={agent.name} className="ovd-swap relative">
        <AgentTile agent={agent} size={60} />
        <span
          data-on={approved}
          className="ovd-pop absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full bg-(--sky-fill) text-white ring-[2.5px] ring-card"
        >
          <CheckIcon className="size-[11px]" />
        </span>
      </span>
      <p key={`n-${agent.name}`} className="ovd-swap mt-4 max-w-full truncate font-mono text-[13px] leading-[18px] text-fg">
        {agent.name}
      </p>
      <p className="mt-0.5 font-mono text-[12.5px] leading-[18px] whitespace-nowrap text-mute tabular-nums">
        0:0000.0000.
        <span className="text-(--sky-accent)">
          <Scramble word={agent.address} run={scramble} />
        </span>
      </p>
    </div>
  );
}

function Packet({ dir, k }: { dir: "out" | "loop-out" | "loop-back"; k?: number }) {
  return (
    <span key={k} data-dir={dir} className="ovd-track">
      <span className="absolute -top-1 -left-1 size-2 rounded-[2.5px] bg-(--ovd-blue)" />
    </span>
  );
}

function RouteVisual() {
  const { ref, run, reduced } = useRun<HTMLDivElement>();
  const { step, cycle } = useSteps(ROUTE_MS, run);
  const phase = reduced ? 2 : step;
  const peer = PEERS[cycle % PEERS.length];
  const approved = phase === 1 || phase === 2;
  const tunnel = phase === 2 ? "on" : phase === 3 ? "fade" : "off";

  return (
    <div ref={ref} className="relative pb-1">
      <div className="flex items-start justify-between gap-6">
        <Endpoint agent={SELF} approved={approved} scramble={false} />
        <Endpoint agent={peer} approved={approved} right scramble={run && phase === 0} />
      </div>

      {/* The route, from tile edge to tile edge at the tiles' centre line. */}
      <div className="absolute top-[30px] right-[78px] left-[78px] h-0">
        <span className="absolute inset-x-0 -top-px h-0.5 rounded-full bg-fg/[0.08]" />
        <span
          data-state={tunnel}
          className="absolute inset-x-0 -top-px h-0.5 origin-left rounded-full bg-(--ovd-blue) transition-[transform,opacity] duration-700 ease-(--ease-out) data-[state=fade]:opacity-0 data-[state=fade]:duration-300 data-[state=off]:scale-x-0 data-[state=off]:opacity-0"
        />
        {run && phase === 0 && <Packet dir="out" k={cycle} />}
        {run && phase === 2 && (
          <>
            <Packet dir="loop-out" />
            <Packet dir="loop-back" />
          </>
        )}
        <p
          key={`s-${phase}-${cycle}`}
          className="ovd-swap absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[12.5px] leading-4 font-medium whitespace-nowrap text-fg"
        >
          {phase === 1 && <CheckIcon className="size-3 text-(--sky-accent)" />}
          {phase === 2 && <LockIcon className="size-3 text-(--sky-accent)" />}
          {STATUS[phase]}
        </p>
        <span
          data-on={phase === 2}
          className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-(--sky-tint) px-2 py-0.5 font-mono text-[11px] leading-4 whitespace-nowrap text-(--sky-accent) transition-opacity duration-500 data-[on=false]:opacity-0 max-[420px]:hidden"
        >
          AES-256-GCM
        </span>
      </div>
    </div>
  );
}

/* ---------------- 2 · Data service agents: the directory scrolling past ---------------- */

const HOSTS = AGENT_CATEGORIES.flatMap((c) => c.examples.slice(0, 2));

function DirectoryVisual() {
  const { ref, run } = useRun<HTMLDivElement>();
  return (
    <div ref={ref} data-run={run} className="ovd-fade-y absolute inset-x-0 -top-2 -bottom-6 overflow-hidden">
      <div className="ovd-ticker">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex flex-wrap gap-1.5 pb-1.5">
            {HOSTS.map((h) => (
              <li key={h} className="rounded-full bg-(--sky-tile) px-3 py-[7px] font-mono text-[12px] leading-4 whitespace-nowrap text-soft">
                {h}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3 · App Store: real icons, one installing at a time ---------------- */

const GRID_IDS = [
  "io.pilot.agentphone",
  "io.pilot.postgres",
  "io.pilot.plainweb",
  "io.pilot.wallet",
  "io.pilot.primitive",
  "io.pilot.otto",
  "io.pilot.docker",
  "io.pilot.redis",
  "io.pilot.duckdb",
  "io.pilot.sixtyfour",
  "io.pilot.upfile",
  "io.pilot.smol",
];
const GRID = GRID_IDS.map((id) => APPS.find((a) => a.id === id)).filter((a): a is App => Boolean(a));
const INSTALL_ORDER = [1, 6, 3, 9, 0, 11, 4, 7, 2, 10, 5, 8];
const INSTALL_MS = [1500] as const;

function AppsVisual() {
  const { ref, run } = useRun<HTMLDivElement>();
  const { cycle } = useSteps(INSTALL_MS, run);
  const active = run ? INSTALL_ORDER[cycle % INSTALL_ORDER.length] : -1;
  return (
    <div ref={ref} className="mx-auto grid w-fit grid-cols-4 gap-4 pb-1">
      {GRID.map((app, i) => (
        <span
          key={app.id}
          data-on={i === active}
          className="relative transition-transform duration-500 ease-(--ease-out) data-[on=true]:-translate-y-[3px]"
        >
          <AppIcon src={app.icon} size={48} />
          <span
            data-on={i === active}
            className="ovd-pop absolute -top-1.5 -right-1.5 grid size-[18px] place-items-center rounded-full bg-(--sky-fill) text-white ring-2 ring-card"
          >
            <CheckIcon className="size-[10px]" />
          </span>
        </span>
      ))}
    </div>
  );
}

/* ---------------- 4 · Pilot Cloud: Claude and ChatGPT reach the daemon through one URL ---------------- */

const WIRES = ["M52 44C52 72 120 64 120 92", "M188 44C188 72 120 64 120 92"];

function CloudVisual() {
  const { ref, run } = useRun<HTMLDivElement>();
  return (
    <div ref={ref} data-run={run} className="relative mx-auto h-[188px] w-[240px]">
      <svg viewBox="0 0 240 188" className="absolute inset-0 size-full overflow-visible" fill="none">
        <g className="text-fg/15" stroke="currentColor" strokeWidth="1.25">
          {WIRES.map((d) => (
            <path key={d} d={d} />
          ))}
          <path d="M120 122v24" />
        </g>
        <g stroke="var(--ovd-blue)" strokeWidth="2" strokeLinecap="round">
          {WIRES.map((d, i) => (
            <path key={d} d={d} pathLength={100} className="ovd-wire" style={{ animationDelay: `${i * 1400}ms` }} />
          ))}
          <path d="M120 122v24" pathLength={100} className="ovd-wire" style={{ animationDuration: "1.4s", animationDelay: "800ms" }} />
        </g>
      </svg>
      <span className="absolute top-0 left-[32px]">
        <AppIcon src="/harness/claude-color.svg" size={40} pad />
      </span>
      <span className="absolute top-0 left-[168px]">
        <AppIcon src="/harness/openai.svg" size={40} pad className="dark:[&_img]:invert" />
      </span>
      <p className="absolute top-[92px] left-1/2 h-[30px] -translate-x-1/2 rounded-full bg-card px-3 font-mono text-[11px] leading-[30px] whitespace-nowrap text-soft shadow-tile">
        cloud.pilotprotocol.network<span className="text-(--sky-accent)">/mcp</span>
      </p>
      <span className="absolute top-[146px] left-[100px] grid size-10 place-items-center rounded-[11px] bg-(--sky-fill) text-white shadow-tile">
        <PilotMarkP className="h-[17px] w-auto" />
      </span>
    </div>
  );
}

/* ---------------- 5 · pilot-mom: ask in plain English, get a plan ---------------- */

const PROMPT = "weather in Paris tomorrow";
const CHAR_MS = 55;
const TYPED_AT = 600 + PROMPT.length * CHAR_MS;
const MOM_LOOP = TYPED_AT + 1200 + 4000;
const TICK = 50;

function MomVisual() {
  const { ref, run, reduced } = useRun<HTMLDivElement>();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!run) return;
    const id = window.setInterval(() => setT((v) => (v + TICK >= MOM_LOOP ? 0 : v + TICK)), TICK);
    return () => window.clearInterval(id);
  }, [run]);

  const time = reduced ? MOM_LOOP - 1 : t;
  const chars = Math.max(0, Math.min(PROMPT.length, Math.floor((time - 600) / CHAR_MS)));
  const typing = time >= 600 && time < TYPED_AT + 150;
  const thinking = time >= TYPED_AT + 250 && time < TYPED_AT + 1200;
  const replied = time >= TYPED_AT + 1200;
  const appear =
    "transition-[opacity,transform,filter] duration-500 ease-(--ease-out) data-[on=false]:translate-y-1.5 data-[on=false]:opacity-0 data-[on=false]:blur-[3px] motion-reduce:data-[on=false]:translate-y-0 motion-reduce:data-[on=false]:blur-none";

  return (
    <div ref={ref} className="flex flex-col pb-1">
      <div data-on={time >= 500} className={`ml-auto flex max-w-[92%] flex-col items-end ${appear}`}>
        <p className="pr-1 text-[11.5px] leading-4 text-mute">Your agent</p>
        <p className="mt-1 min-h-[34px] rounded-[17px] rounded-br-[6px] bg-(--sky-fill) px-3.5 py-[7px] text-[13.5px] leading-5 whitespace-nowrap text-white">
          {PROMPT.slice(0, chars)}
          {typing && <span className="caret-blink ml-px inline-block h-[14px] w-[1.5px] translate-y-[2px] bg-white" />}
        </p>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span
          data-on={thinking || replied}
          className={`grid size-7 shrink-0 place-items-center rounded-full bg-(--sky-deep) text-white ${appear}`}
        >
          <PilotMarkP className="h-[13px] w-auto" />
        </span>
        <div className="relative min-w-0">
          <p data-on={thinking || replied} className={`pl-1 text-[11.5px] leading-4 text-mute ${appear}`}>
            pilot-mom
          </p>
          <div className="relative mt-1 min-h-[56px]">
            <div
              data-on={thinking}
              className={`absolute top-0 left-0 flex h-[34px] items-center gap-1 rounded-[17px] rounded-bl-[6px] bg-(--sky-tile) px-3.5 ${appear}`}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-mute motion-safe:animate-[ovd-dot_1.1s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <div data-on={replied} className={`rounded-[17px] rounded-bl-[6px] bg-(--sky-tile) px-3.5 pt-2 pb-2.5 ${appear}`}>
              <p className="text-[12px] leading-[18px] text-mute">
                1 call · <span className="font-medium text-(--sky-accent)">achievable</span>
              </p>
              <p className="mt-0.5 font-mono text-[12px] leading-[18px] text-fg">
                <span className="whitespace-nowrap">
                  send-message <span className="text-dim">→</span>
                </span>{" "}
                <span className="whitespace-nowrap">open-meteo-forecast</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 6 · Skill injection: the skill lands in each agent tool ---------------- */

const HARNESSES: (Agent & { label: string })[] = [
  { name: "claude", label: "Claude Code", address: "", logo: "/harness/claude-color.svg", pad: true },
  { name: "openclaw", label: "OpenClaw", address: "", logo: "/harness/openclaw.png", pad: true },
  { name: "hermes", label: "Hermes", address: "", logo: "/harness/hermes.png" },
  { name: "opencode", label: "OpenCode", address: "", logo: "/harness/opencode.svg", pad: true, mono: true },
];
// Nothing written yet · one tool after another · hold with all four.
const SKILL_MS = [700, 650, 650, 650, 2800] as const;

function SkillsVisual() {
  const { ref, run, reduced } = useRun<HTMLUListElement>();
  const { step } = useSteps(SKILL_MS, run);
  const done = reduced ? HARNESSES.length : step;
  return (
    <ul ref={ref} className="flex flex-col gap-1 pb-1">
      {HARNESSES.map((h, i) => {
        const on = i < done;
        return (
          <li key={h.name} className="flex h-10 items-center gap-3">
            <AgentTile agent={h} size={32} />
            <span className="min-w-0 flex-1 truncate text-[14px] text-fg">{h.label}</span>
            <span
              data-on={on}
              className="flex items-center gap-1.5 font-mono text-[11.5px] text-fg transition-colors duration-300 data-[on=false]:text-faint"
            >
              SKILL.md
              <span
                data-on={on}
                className="ovd-pop grid size-4 place-items-center rounded-full bg-(--sky-fill) text-white"
              >
                <CheckIcon className="size-[9px]" />
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- 7 · Open source: the same daemon, either backbone ---------------- */

const BACKBONES = [
  {
    label: "Public backbone",
    registry: "registry.pilotprotocol.network",
    beacon: "beacon.pilotprotocol.network",
    note: "Free, run by Vulture Labs",
  },
  {
    label: "Your own",
    registry: "registry.example.com:9000",
    beacon: "registry.example.com:9001",
    note: "You hold the admin token",
  },
];
const OSS_MS = [3200, 3200] as const;

function OssVisual() {
  const { ref, run } = useRun<HTMLDivElement>();
  const { step } = useSteps(OSS_MS, run);
  const b = BACKBONES[step];
  return (
    <div ref={ref} className="pb-1">
      <div className="relative grid grid-cols-2 rounded-full bg-fg/[0.06] p-1">
        <span
          data-own={step === 1}
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-card shadow-tile transition-transform duration-500 ease-(--ease-in-out) data-[own=true]:translate-x-full"
        />
        {BACKBONES.map((x, i) => (
          <span
            key={x.label}
            data-active={i === step}
            className="relative py-1.5 text-center text-[12.5px] leading-4 whitespace-nowrap text-mute transition-colors duration-300 data-[active=true]:text-fg"
          >
            {x.label}
          </span>
        ))}
      </div>
      <dl className="mt-4 flex flex-col gap-2.5 px-1">
        {(["registry", "beacon"] as const).map((k) => (
          <div key={k}>
            <dt className="text-[12.5px] leading-4 text-mute">{k === "registry" ? "Registry" : "Beacon"}</dt>
            <dd key={`${k}-${step}`} className="ovd-swap mt-1 truncate font-mono text-[12px] leading-4 text-fg">
              {b[k]}
            </dd>
          </div>
        ))}
      </dl>
      <span
        key={`note-${step}`}
        className="ovd-swap mt-3.5 ml-1 inline-flex rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12px] leading-4 font-medium text-(--sky-accent)"
      >
        {b.note}
      </span>
    </div>
  );
}

/* ---------------- The grid ---------------- */

export function OverviewD({ children }: { children?: ReactNode }) {
  const icon = "size-[15px]";
  return (
    <section id="overview" aria-labelledby="overview-d-title" className="ovd pt-8 pb-20 sm:pb-24">
      <div className="wrap">
        <Reveal className="mx-auto max-w-[700px] text-center">
          <h2
            id="overview-d-title"
            className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
          >
            One network for AI agents, <span className="block text-mute">and everything that runs on it.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.5] tracking-[-0.024em] text-pretty text-mute sm:mt-8 sm:text-[18px] sm:leading-[27px]">
            Install the daemon once and your agent can use the data agents,{" "}
            <span className="whitespace-nowrap">pilot-mom</span> and the App Store through it.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 md:grid-cols-2 lg:gap-5 xl:grid-cols-4">
          <Tile
            href={TARGET.protocol}
            icon={<FingerprintIcon className={icon} />}
            title="Pilot Protocol"
            className="md:col-span-2"
            center
            lead={
              <>
                Each agent gets <Hi>a permanent 48-bit address</Hi> and an Ed25519 identity, so it stays reachable across
                IP, cloud and container changes.
              </>
            }
          >
            <RouteVisual />
          </Tile>
          <Tile
            href={TARGET.data}
            icon={<DatabaseIcon className={icon} />}
            title="Data service agents"
            delay={60}
            lead={
              <>
                <Hi>About 430 agents</Hi> that answer with live data, one per source.
              </>
            }
          >
            <DirectoryVisual />
          </Tile>
          <Tile
            href={TARGET.apps}
            icon={<GridIcon className={icon} />}
            title="App Store"
            delay={120}
            lead={
              <>
                <Hi>{APPS.length} apps</Hi> your agent installs with one command, from email to databases.
              </>
            }
          >
            <AppsVisual />
          </Tile>
          <Tile
            href={TARGET.cloud}
            icon={<CloudIcon className={icon} />}
            title="Pilot Cloud"
            badge="New"
            lead={
              <>
                The same daemon, <Hi>run for you and always on.</Hi> Nothing to install.
              </>
            }
          >
            <CloudVisual />
          </Tile>
          <Tile
            href={TARGET.mom}
            icon={<MessageDotsIcon className={icon} />}
            title="pilot-mom"
            delay={60}
            lead={
              <>
                Describe the task in plain English. <Hi>pilot-mom replies with a plan.</Hi>
              </>
            }
          >
            <MomVisual />
          </Tile>
          <Tile
            href={TARGET.skills}
            icon={<PlugIcon className={icon} />}
            title="Skill injection"
            delay={120}
            lead={
              <>
                One command lets your agent <Hi>know the network is there</Hi> and when to use it.
              </>
            }
          >
            <SkillsVisual />
          </Tile>
          <Tile
            href={TARGET.oss}
            icon={<BranchIcon className={icon} />}
            title="Open source"
            delay={180}
            lead={
              <>
                AGPL-3.0, end to end. <Hi>Run your own registry.</Hi>
              </>
            }
          >
            <OssVisual />
          </Tile>
        </div>
        {children}
      </div>
    </section>
  );
}
