"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  BranchIcon,
  CloudIcon,
  DatabaseIcon,
  FingerprintIcon,
  GridIcon,
  MessageDotsIcon,
  PlugIcon,
} from "@/components/icons";
import { Reveal } from "@/components/ui";
import { APPS } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/* ------------------------------------------------------------------ */
/* Card shell                                                          */
/* ------------------------------------------------------------------ */

function Card({
  href,
  icon,
  title,
  badge,
  children,
  className = "",
  delay = 0,
  onHover,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  onHover?: (hovered: boolean) => void;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <a
        href={href}
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(true)}
        onPointerLeave={() => onHover?.(false)}
        className="group relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[2px] border border-edge p-7 transition-[border-color,background-color] duration-300 hover:border-edge-2 hover:bg-[#1c1c1b]"
      >
        <h3 className="flex items-center gap-2.5 text-[17px] leading-[26px] font-medium text-fg">
          <span className="text-fg/60 transition-colors duration-300 group-hover:text-lime">{icon}</span>
          {title}
          {badge && (
            <span className="rounded-[2px] bg-lime px-1.5 py-[5px] font-mono text-[12px] leading-[9px] font-medium tracking-[0.07em] text-bg uppercase">
              {badge}
            </span>
          )}
        </h3>
        {children}
      </a>
    </Reveal>
  );
}

function Lead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`mt-3.5 max-w-[248px] text-[16px] leading-[23.2px] text-mute ${className}`}>{children}</p>;
}

const Hi = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;

/** Runs `tick` on an interval while the element is on screen and motion is allowed. */
function useTicker<T extends Element>(ms: number, tick: () => void) {
  const [ref, inView] = useInView<T>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(tick, ms);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, ms]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* 1 · Pilot Protocol                                                  */
/* ------------------------------------------------------------------ */

const HEX = "0123456789ABCDEF";
const ADDRESSES = ["4BB9", "1F0A", "77C2", "0D3E", "A9F1"];

function ScrambleAddress({ word }: { word: string }) {
  const [shown, setShown] = useState(word);
  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      setShown(
        word
          .split("")
          .map((c, i) => (frame > 3 + i * 2 ? c : HEX[Math.floor(Math.random() * 16)]))
          .join(""),
      );
      if (frame > 12) window.clearInterval(id);
    }, 38);
    return () => window.clearInterval(id);
  }, [word]);
  return <span className="text-lime tabular-nums">{shown}</span>;
}

function ProtocolVisual() {
  const [i, setI] = useState(0);
  const ref = useTicker<HTMLDivElement>(3200, () => setI((v) => (v + 1) % ADDRESSES.length));

  return (
    <div ref={ref} className="flex flex-col items-center justify-center gap-1">
      <svg viewBox="0 0 247 247" className="size-[clamp(200px,22vw,247px)]" aria-hidden>
        {[
          "M64.22 27.99h118.56a36.23 36.23 0 0 1 36.23 36.23v118.56a36.23 36.23 0 0 1-36.23 36.23H64.22a36.23 36.23 0 0 1-36.23-36.23V64.22a36.23 36.23 0 0 1 36.23-36.23Z",
          "M67.51 31.29h115.27a34.58 34.58 0 0 1 34.58 34.58v116.91a34.58 34.58 0 0 1-34.58 34.58H67.51a34.58 34.58 0 0 1-34.58-34.58V65.87a34.58 34.58 0 0 1 34.58-34.58Z",
          "M70.81 36.23h110.32a32.93 32.93 0 0 1 32.94 32.93v110.33a32.93 32.93 0 0 1-32.94 32.93H70.81a32.93 32.93 0 0 1-32.94-32.93V69.16a32.93 32.93 0 0 1 32.94-32.93Z",
          "M64.22 37.87h116.91a32.93 32.93 0 0 1 32.94 32.94v111.97a32.93 32.93 0 0 1-32.94 32.93H64.22a32.93 32.93 0 0 1-32.93-32.93V70.81a32.93 32.93 0 0 1 32.93-32.94Z",
        ].map((d) => (
          <path key={d} d={d} stroke="#F2F2EC" strokeOpacity="0.07" strokeWidth="0.988" fill="none" />
        ))}
        <g stroke="#3A3A37" strokeWidth="10.7" strokeLinecap="round" fill="none">
          <circle cx="123.5" cy="133.38" r="27.99" />
          <circle cx="72.45" cy="79.04" r="12.35" />
          <circle cx="174.55" cy="79.04" r="12.35" />
          <path d="M81.51 88.92 101.27 110.33M165.49 88.92 145.73 110.33M123.5 161.37v23.06" />
        </g>
        {/* Packets riding the edges: a peer reaches the agent, the agent answers out to the network. */}
        <g
          key={i}
          stroke="#C6F24E"
          strokeWidth="10.7"
          strokeLinecap="round"
          fill="none"
          className="motion-reduce:hidden"
        >
          <path
            d={i % 2 ? "M165.49 88.92 145.73 110.33" : "M81.51 88.92 101.27 110.33"}
            pathLength={100}
            strokeDasharray="0 300"
            className="animate-[edge-run_900ms_var(--ease-in-out)_both]"
          />
          <circle
            cx="123.5"
            cy="133.38"
            r="27.99"
            pathLength={100}
            strokeDasharray="0 300"
            transform="rotate(-132 123.5 133.38)"
            className="animate-[ring-run_1100ms_var(--ease-out)_700ms_both]"
          />
          <path
            d="M123.5 161.37v23.06"
            pathLength={100}
            strokeDasharray="0 300"
            className="animate-[edge-run_700ms_var(--ease-in-out)_1500ms_both]"
          />
        </g>
        <circle cx="123.5" cy="133.38" r="5.76" className="fill-[#3A3A37] transition-colors duration-300 group-hover:fill-lime" />
      </svg>
      <p className="rounded-full border border-edge-2 bg-bg px-3.5 py-1.5 font-mono text-[13px] text-mute">
        0:0000.0000.
        <ScrambleAddress word={ADDRESSES[i]} />
      </p>
    </div>
  );
}

function ProtocolCard() {
  return (
    <Card
      href="#protocol"
      icon={<FingerprintIcon />}
      title="Pilot Protocol"
      className="md:col-span-2"
    >
      <div className="grid grid-cols-1 flex-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col">
          <Lead>
            Each agent gets <Hi>a permanent 48-bit address</Hi> and an Ed25519 identity, so it stays reachable across
            IP, cloud and container changes.
          </Lead>
          <ul className="mt-auto flex flex-col pt-[18px] text-[15.5px] leading-6 text-fg">
            {["Encrypted tunnels, X25519 + AES-256-GCM", "Private until both sides approve", "Static binaries, no dependencies"].map(
              (item) => (
                <li key={item} className="relative py-1 pl-6">
                  <span aria-hidden className="absolute top-1 left-0">
                    ✓
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="order-first -mx-2 grid place-items-center md:order-none md:mx-0">
          <ProtocolVisual />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Data service agents                                             */
/* ------------------------------------------------------------------ */

const AGENT_ROWS: [string, string][] = [
  ["open-meteo-forecast", "open-meteo-flood"],
  ["coingecko-markets-simple", "ecb-exchange-rates"],
  ["open-meteo-air-quality", "pilot-mom"],
  ["usgs-earthquakes", "tfl-line-status"],
  ["sec-company-facts", "nasa-apod"],
  ["espn-nba-scoreboard", "aviation-weather-metar"],
  ["wikipedia-summary", "github-search-repos"],
  ["openfda-drug-label", "iss-position"],
];

function AgentChip({ name, blurred }: { name: string; blurred?: boolean }) {
  const highlight = name === "pilot-mom";
  return (
    <div
      className={`flex h-[62px] min-w-0 items-center overflow-hidden rounded-[2px] border px-[18px] even:justify-start odd:justify-end ${
        highlight ? "border-lime/50" : "border-edge"
      }`}
    >
      <span
        className={`font-mono text-[15px] whitespace-nowrap ${
          blurred ? "text-faint blur-[7px]" : highlight ? "text-lime" : "text-dim"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function DataAgentsCard() {
  const rows = AGENT_ROWS.map((r, i) => r.map((name, j) => ({ name, blurred: (i + j) % 3 === 1 && name !== "pilot-mom" })));
  return (
    <Card href="#data-agents" icon={<DatabaseIcon />} title="Data service agents" delay={60}>
      <Lead>
        <Hi>About 430 agents</Hi> that answer with live data, one per source.
      </Lead>
      <div
        aria-hidden
        className="absolute inset-x-0 top-[144px] bottom-0 overflow-hidden [mask-image:linear-gradient(transparent,#000_16%,#000_78%,transparent)]"
      >
        <div className="absolute top-0 -left-[16.5%] w-[132%] animate-[ticker-y_38s_linear_infinite] group-hover:[animation-duration:16s] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="grid grid-cols-2 gap-3 pb-3">
              {rows.flat().map((chip, k) => (
                <AgentChip key={`${copy}-${k}`} name={chip.name} blurred={chip.blurred} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · App Store                                                       */
/* ------------------------------------------------------------------ */

// Fifteen apps with their own artwork, in the Figma's 5 × 3 tile grid.
const TILES = APPS.filter((a) => a.icon && a.id !== "io.pilot.aegis").slice(0, 15);

function AppStoreCard() {
  const [active, setActive] = useState(0);
  const ref = useTicker<HTMLDivElement>(1700, () =>
    setActive((v) => {
      let next = v;
      while (next === v) next = Math.floor(Math.random() * TILES.length);
      return next;
    }),
  );

  return (
    <Card href="#app-store" icon={<GridIcon />} title="App Store" delay={120}>
      <Lead>
        <Hi>30 apps</Hi> your agent installs with one command, from email to databases.
      </Lead>
      <div ref={ref} aria-hidden className="absolute top-[144px] left-[18px] grid w-max grid-cols-[repeat(5,64px)] gap-3">
        {TILES.map((t, i) => {
          const lit = i === active;
          return (
            <div
              key={t.id}
              className={`relative grid size-16 place-items-center rounded-[2px] border transition-[background-color,border-color] duration-300 ${
                lit ? "border-lime bg-lime/[0.08]" : "border-edge bg-bg"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.icon}
                alt=""
                width={36}
                height={36}
                loading="lazy"
                className={`size-9 rounded-[8px] transition-[scale,opacity] duration-300 ease-(--ease-out) group-hover:opacity-100 ${
                  lit ? "scale-110 opacity-100" : "opacity-70"
                }`}
              />
              {lit && <span className="absolute -top-px -right-px size-1.5 bg-lime" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Pilot Cloud                                                     */
/* ------------------------------------------------------------------ */

const CLOUD_PATHS = [
  "M138.21 0V58.88",
  "M138.21 58.88C110.61 82.8 64.61 101.2 27.81 117.76",
  "M138.21 58.88C165.81 75.44 202.61 103.04 213.65 143.52C224.69 161.92 250.45 167.44 267.01 167.44",
];

function CloudCard() {
  return (
    <Card href="#cloud" icon={<CloudIcon />} title="Pilot Cloud" badge="new" delay={0}>
      <Lead>
        The same daemon, <Hi>run for you and always on.</Hi> Nothing to install.
      </Lead>
      <svg
        aria-hidden
        viewBox="0 0 276 163.445"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="xMinYMax meet"
      >
        <image href="/figma/cloud-globe.svg" x="-60.48" y="-38.9" width="507.36" height="537.79" />
        <g stroke="#F2F2EC" strokeOpacity="0.55" strokeWidth="1.012" fill="none">
          {CLOUD_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {/* A request comes in through the MCP URL and fans out to two agents. */}
        <g stroke="#C6F24E" strokeWidth="1.6" strokeLinecap="round" fill="none" className="motion-reduce:hidden">
          {CLOUD_PATHS.map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength={100}
              strokeDasharray="14 100"
              strokeDashoffset={14}
              style={{ animationDelay: i === 0 ? "0ms" : "1100ms" }}
              className="animate-[dash-run_3.6s_var(--ease-in-out)_infinite] group-hover:[animation-duration:2.4s]"
            />
          ))}
        </g>
        <g fill="#F2F2EC">
          <circle cx="138.21" cy="58.88" r="3.68" />
          <circle cx="27.81" cy="117.76" r="3.68" className="animate-[node-flash_3.6s_linear_infinite] motion-reduce:animate-none" />
          <circle cx="267.01" cy="167.44" r="3.68" />
        </g>
      </svg>
      <p className="absolute bottom-[150px] left-[11.5px] rounded-full border border-edge-2 bg-bg px-3.5 py-2 font-mono text-[12px] text-soft">
        cloud.pilotprotocol.network<span className="text-lime">/mcp</span>
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · pilot-mom                                                       */
/* ------------------------------------------------------------------ */

const PROMPT = "weather in Paris tomorrow";

function Cursor({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-6 ${className}`} style={style} aria-hidden>
      <path d="M5 3 19 11l-6.2 1.6L10 19 5 3Z" fill="#1A1A1A" stroke="#F2F2EC" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function PilotMomVisual() {
  // 0 idle → typing → thinking → planned
  const [phase, setPhase] = useState<"idle" | "typing" | "thinking" | "planned">("planned");
  const [typed, setTyped] = useState(PROMPT.length);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    let t: number;
    let n = 0;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    function run() {
      setPhase("idle");
      setTyped(0);
      n = 0;
      at(700, () => {
        setPhase("typing");
        t = window.setInterval(() => {
          n++;
          setTyped(n);
          if (n >= PROMPT.length) window.clearInterval(t);
        }, 52);
      });
      const typedAt = 700 + PROMPT.length * 52;
      at(typedAt + 350, () => setPhase("thinking"));
      at(typedAt + 1500, () => setPhase("planned"));
      at(typedAt + 5200, run);
    }
    run();
    return () => {
      window.clearInterval(t);
      timers.forEach(window.clearTimeout);
    };
  }, [inView, reduced]);

  const showReply = phase === "thinking" || phase === "planned";

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-[212px] overflow-hidden border-t border-edge/60"
    >
      <div className="absolute top-[72px] left-[26px] flex gap-1.5">
        <Cursor
          className="transition-transform duration-700 ease-(--ease-out)"
          style={{ transform: phase === "idle" ? "translate(70px, 60px)" : "none" }}
        />
        <div className="pt-[18px]">
          <p className="flex h-[35px] items-center rounded-full border border-edge-2 bg-bg px-3.5 font-mono text-[13px] whitespace-nowrap text-soft">
            {PROMPT.slice(0, typed)}
            {phase === "typing" && <span className="caret-blink ml-px inline-block h-[15px] w-[7px] bg-lime" />}
            {phase === "idle" && <span className="w-[160px]" />}
          </p>
        </div>
      </div>
      <div
        className="absolute top-[142px] left-[28px] flex items-end gap-1.5 transition-[opacity,transform,filter] duration-500 ease-(--ease-out)"
        style={{
          opacity: showReply ? 1 : 0,
          transform: showReply ? "none" : "translateY(8px)",
          filter: showReply ? "none" : "blur(4px)",
        }}
      >
        <p className="grid h-[35px] items-center rounded-full border border-edge-2 bg-bg px-3.5 font-mono text-[13px] whitespace-nowrap text-soft">
          <span
            className="col-start-1 row-start-1 flex gap-1 transition-opacity duration-300"
            style={{ opacity: phase === "thinking" ? 1 : 0 }}
          >
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="size-1 rounded-full bg-soft animate-[blink-soft_1s_ease-in-out_infinite]"
                style={{ animationDelay: `${d * 160}ms` }}
              />
            ))}
          </span>
          <span
            className="col-start-1 row-start-1 transition-[opacity,filter] duration-300"
            style={{ opacity: phase === "planned" ? 1 : 0, filter: phase === "planned" ? "none" : "blur(3px)" }}
          >
            <span className="text-lime">✓</span> plan ready · 1 call
          </span>
        </p>
        <Cursor className="-mb-3.5 -scale-x-100" />
      </div>
    </div>
  );
}

function PilotMomCard() {
  return (
    <Card href="#pilot-mom" icon={<MessageDotsIcon />} title="pilot-mom" delay={60}>
      <Lead>
        Describe the task in plain English. <Hi>pilot-mom replies with a plan.</Hi>
      </Lead>
      <PilotMomVisual />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 6 · Skill injection                                                 */
/* ------------------------------------------------------------------ */

const HARNESSES = ["Claude Code", "OpenClaw", "OpenCode"];

function SkillCard() {
  const [step, setStep] = useState(3);
  const ref = useTicker<HTMLUListElement>(1100, () => setStep((s) => (s + 1) % 5));

  return (
    <Card href="#get-started" icon={<PlugIcon />} title="Skill injection" delay={120}>
      <Lead>
        One command lets your agent <Hi>know the network is there</Hi> and when to use it.
      </Lead>
      <svg
        aria-hidden
        viewBox="0 0 203.475 133.858"
        className="absolute top-[152px] -right-9 w-[204px]"
      >
        <g fill="#F2F2EC" fillOpacity="0.35">
          <circle cx="1.69" cy="35.21" r="1.69" />
          <circle cx="189.59" cy="18.28" r="1.69" />
          <circle cx="201.44" cy="85.99" r="2.03" />
          <circle cx="148.97" cy="1.35" r="1.35" />
          <circle cx="27.08" cy="111.39" r="1.35" />
          <circle cx="179.44" cy="128.31" r="1.35" />
        </g>
        <g stroke="#F2F2EC" strokeOpacity="0.4" strokeWidth="0.93" strokeDasharray="1.6 2.6" className="animate-[march_1.4s_linear_infinite] motion-reduce:animate-none">
          <path d="M167.59 62.3 94.8 72.45M55.86 30.13 94.8 72.45" />
        </g>
        <g stroke="#F2F2EC" strokeOpacity="0.55" strokeWidth="0.93" strokeLinejoin="round" fill="none">
          <path d="M94.8 14.9 147.27 43.67v60.94L94.8 133.39 42.32 104.61V43.67L94.8 14.9Z" className="transition-[stroke-opacity] duration-300 group-hover:[stroke-opacity:0.9]" />
          <path d="M42.32 43.67 94.8 72.45l52.47-28.78M94.8 72.45v60.94" />
        </g>
        <g fill="#C6F24E">
          <circle cx="116.8" cy="40.29" r="2.2" className="animate-[blink-soft_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
          <circle cx="76.18" cy="92.77" r="2.2" className="animate-[blink-soft_2.4s_ease-in-out_800ms_infinite] motion-reduce:animate-none" />
          <circle cx="133.73" cy="87.69" r="2.71" className="animate-[blink-soft_2.4s_ease-in-out_1600ms_infinite] motion-reduce:animate-none" />
          <circle cx="55.86" cy="30.13" r="1.69" />
          <circle cx="167.59" cy="62.3" r="1.69" />
        </g>
      </svg>
      <ul ref={ref} className="absolute top-[253px] left-7 flex flex-col">
        {HARNESSES.map((name, i) => {
          const done = step > i && step < 4;
          return (
            <li key={name} className="flex h-[34px] items-center gap-2.5 py-1 text-[17px] leading-[26px] text-fg">
              <span
                aria-hidden
                className={`grid size-6 place-items-center rounded-[6px] border text-[11px] transition-colors duration-300 ${
                  done ? "border-lime bg-lime/10 text-lime" : "border-edge-3 text-mute"
                }`}
              >
                {done ? "✓" : "✦"}
              </span>
              {name}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 7 · Open source                                                     */
/* ------------------------------------------------------------------ */

const PARTS: { part: string; where: ReactNode; x: string }[] = [
  { part: "daemon", where: "your machine", x: "48.6%" },
  { part: "pilotctl", where: "CLI", x: "58.3%" },
  { part: "registry", where: <>run <span className="text-lime">your own</span></>, x: "51.1%" },
  { part: "beacon", where: <>run <span className="text-lime">your own</span></>, x: "51.5%" },
  { part: "license", where: "AGPL-3.0", x: "49.8%" },
];

function PartIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden>
      <rect x="1" y="1" width="10" height="10" stroke="currentColor" fill="none" />
      <path d="M3 4h6M3 6h6M3 8h6" stroke="currentColor" />
    </svg>
  );
}

function OpenSourceCard() {
  return (
    <Card href="#open-source" icon={<BranchIcon />} title="Open source" delay={180}>
      <Lead>
        AGPL-3.0, end to end. <Hi>Run your own registry.</Hi>
      </Lead>
      <div aria-hidden className="absolute inset-x-0 top-[151px] bottom-0 flex flex-col justify-center gap-3">
        {PARTS.map(({ part, where, x }, i) => (
          <div key={part} className="relative h-[31px]">
            <div className="absolute inset-x-0 top-[15.5px] border-t border-dashed border-edge-2" />
            <span
              className="absolute inset-x-0 top-[12px] h-2 animate-[row-run_5s_var(--ease-in-out)_infinite] opacity-0 motion-reduce:hidden"
              style={{ animationDelay: `${i * 1000}ms` }}
            >
              <span className="absolute -left-2 size-2 bg-lime" />
            </span>
            <span className="absolute top-0 left-7 flex items-center gap-1.5 rounded-[6px] border border-edge bg-bg px-[11px] py-1.5 font-mono text-[12.5px] leading-[17px] text-dim transition-colors duration-300 group-hover:text-soft">
              <PartIcon />
              {part}
            </span>
            <span
              className="absolute top-0 rounded-full border border-edge bg-bg px-[11px] py-1.5 font-mono text-[12.5px] leading-[17px] text-soft"
              style={{ left: x }}
            >
              {where}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

export function Bento() {
  return (
    <section id="overview" aria-label="What Pilot gives your agent" className="border-t border-edge pt-16 pb-24 sm:pt-20 sm:pb-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ProtocolCard />
          <DataAgentsCard />
          <AppStoreCard />
          <CloudCard />
          <PilotMomCard />
          <SkillCard />
          <OpenSourceCard />
        </div>
        <Reveal as="p" className="mt-6 text-[clamp(20px,2vw,24px)] leading-[1.23] tracking-[-0.01em] text-fg">
          Private by default. <span className="text-mute">Encrypted peer tunnels. Explicit trust.</span>
        </Reveal>
      </div>
    </section>
  );
}
