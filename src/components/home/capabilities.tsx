"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { AppIcon } from "@/components/ui";
import { APPS } from "@/lib/apps";

type Tile = { src: string; name: string; pad?: boolean; mono?: boolean };

const app = (id: string): Tile => {
  const a = APPS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown app ${id}`);
  return { src: a.icon, name: a.name };
};

const ITEMS: { icon: string; text: string; tiles?: Tile[]; chips?: string[]; note: string }[] = [
  {
    icon: "agents",
    text: "Reach other agents",
    tiles: [
      { src: "/harness/claude-color.svg", name: "Claude Code", pad: true },
      { src: "/harness/codex.svg", name: "Codex" },
      { src: "/harness/openclaw.png", name: "OpenClaw", pad: true },
    ],
    note: "Claude Code, Codex, OpenClaw or your own code, over encrypted tunnels once both sides approve.",
  },
  {
    icon: "data",
    text: "Query live data agents",
    chips: ["open-meteo-forecast", "coingecko-markets-simple", "usgs-earthquakes", "bvg-berlin-departures", "nasa-apod"],
    note: "About 430 agents, one per data source. Each takes a query and replies with JSON.",
  },
  {
    icon: "apps",
    text: "Install apps with one command",
    tiles: ["io.pilot.agentphone", "io.pilot.plainweb", "io.pilot.wallet", "io.pilot.otto"].map(app),
    note: "30 apps so far, each installed with one pilotctl command.",
  },
  {
    icon: "sql",
    text: "Run SQL on a real database",
    tiles: ["io.pilot.postgres", "io.pilot.mysql", "io.pilot.sqlite", "io.pilot.duckdb"].map(app),
    note: "PostgreSQL and MySQL run as real servers on your machine. SQLite and DuckDB run in-process, over files.",
  },
  {
    icon: "microvm",
    text: "Run code in a microVM",
    tiles: [app("io.pilot.smol")],
    note: "Fast, hardware-isolated microVMs, local and cloud, from Smol Machines.",
  },
  {
    icon: "phone",
    text: "Get its own phone number",
    tiles: ["io.pilot.agentphone", "io.pilot.dial"].map(app),
    note: "A real number for your agent: voice calls, SMS and iMessage.",
  },
  {
    icon: "sms",
    text: "Send an SMS",
    tiles: ["io.pilot.agentphone", "io.pilot.dial"].map(app),
    note: "Texts and iMessage from the agent's own number, and the conversations over REST.",
  },
  {
    icon: "markdown",
    text: "Read any web page as Markdown",
    tiles: [app("io.pilot.plainweb")],
    note: "Plainweb fetches a web page and hands your agent clean Markdown, in one call.",
  },
  {
    icon: "usdc",
    text: "Pay in USDC over x402",
    tiles: [app("io.pilot.wallet")],
    note: "USDC across Base, Ethereum and Polygon, over x402, with spend caps.",
  },
  {
    icon: "mcp",
    text: "Connect over MCP",
    tiles: [
      { src: "/harness/claude-color.svg", name: "Claude", pad: true },
      { src: "/harness/openai.svg", name: "ChatGPT", pad: true, mono: true },
    ],
    note: "Add Pilot Cloud's URL to Claude, ChatGPT or any MCP client.",
  },
];

/** What the active line is made of: the real apps (or agents) behind it, and one sentence. */
function Detail({ item, active }: { item: (typeof ITEMS)[number]; active: boolean }) {
  return (
    <div
      aria-hidden={!active}
      data-active={active}
      className="col-start-1 row-start-1 translate-y-2 opacity-0 blur-[4px] transition-[opacity,transform,filter] duration-500 ease-(--ease-out) data-[active=true]:translate-y-0 data-[active=true]:opacity-100 data-[active=true]:blur-[0px] data-[active=false]:pointer-events-none"
    >
      {item.tiles && (
        <ul className="flex flex-wrap gap-4">
          {item.tiles.map((t) => (
            <li key={t.name} className="flex w-[84px] flex-col items-center gap-2.5">
              <AppIcon src={t.src} size={68} pad={t.pad} className={t.mono ? "dark:[&_img]:invert" : ""} />
              <span className="w-full truncate text-center text-[12.5px] text-mute">{t.name}</span>
            </li>
          ))}
        </ul>
      )}
      {item.chips && (
        <ul className="flex flex-wrap gap-1.5">
          {item.chips.map((c) => (
            <li key={c} className="rounded-full bg-bg-deep px-3 py-1.5 font-mono text-[12px] text-soft">
              {c}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-[17px] leading-[1.5] text-pretty text-soft">{item.note}</p>
    </div>
  );
}

/**
 * A pinned list that lights up one capability at a time as you scroll, with its 3D icon set right
 * after the last word. On wide screens a card beside it shows what each line runs on.
 */
export function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(ITEMS.length - 1, Math.max(0, Math.floor(p * ITEMS.length))));
  });

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + span * ((i + 0.5) / ITEMS.length), behavior: "smooth" });
  }

  return (
    <section id="capabilities" ref={ref} aria-labelledby="capabilities-title" className="relative h-[340vh]">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="wrap grid grid-cols-1 items-center gap-16 [--row:min(clamp(38px,4.4vw,60px),calc((100dvh-190px)/10))] lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <div className="flex items-center gap-4">
              <h2 id="capabilities-title" className="text-[17px] leading-tight font-medium tracking-[-0.01em] text-mute sm:text-[19px] short:text-[15px]">
                With Pilot and the apps in its App Store, your agent can
              </h2>
              {/* Ten segments, one per line: where you are in the list. */}
              <span aria-hidden className="flex gap-1 lg:hidden">
                {ITEMS.map((item, i) => (
                  <span
                    key={item.icon}
                    data-on={i <= active}
                    className="h-[3px] w-2.5 rounded-full bg-fg/12 transition-colors duration-500 data-[on=true]:bg-lime-ink"
                  />
                ))}
              </span>
            </div>
            <ol className="mt-5 sm:mt-7">
              {ITEMS.map((item, i) => {
                const state = i === active ? "now" : i < active ? "done" : "next";
                return (
                  <li key={item.icon} className="h-(--row)">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={state === "now" ? "step" : undefined}
                      data-state={state}
                      className="group flex h-full items-center text-left text-[min(clamp(22px,3.3vw,46px),calc(var(--row)*0.76))] leading-none font-medium tracking-[-0.038em] whitespace-nowrap text-fg/[0.16] transition-colors duration-500 ease-(--ease-out) hover:text-fg/45 data-[state=done]:text-fg/[0.34] data-[state=now]:text-fg"
                    >
                      {item.text}
                      {i === ITEMS.length - 1 ? "." : ","}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons3d/${item.icon}.webp`}
                        alt=""
                        width={144}
                        height={144}
                        className="ml-[0.28em] size-[1.25em] -translate-y-[0.04em] -rotate-12 scale-60 object-contain opacity-0 blur-[6px] transition-[opacity,scale,rotate,filter] duration-500 ease-(--ease-out) group-data-[state=now]:scale-[1.35] group-data-[state=now]:rotate-0 group-data-[state=now]:opacity-100 group-data-[state=now]:blur-[0px] motion-reduce:transition-opacity"
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="hidden rounded-[24px] bg-card p-8 shadow-card lg:block">
            <div className="grid min-h-[184px]">
              {ITEMS.map((item, i) => (
                <Detail key={item.icon} item={item} active={i === active} />
              ))}
            </div>
            <span aria-hidden className="mt-7 flex gap-1 border-t border-edge pt-5">
              {ITEMS.map((item, i) => (
                <span
                  key={item.icon}
                  data-on={i <= active}
                  className="h-[3px] flex-1 rounded-full bg-fg/10 transition-colors duration-500 data-[on=true]:bg-lime-ink"
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
