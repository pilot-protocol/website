"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { SKY_CARD } from "@/components/sky/kit";
import { AppIcon } from "@/components/ui";
import { APPS } from "@/lib/apps";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { MCP_URL } from "@/lib/site";

/*
 * What your agent can do once it's on Pilot (Figma 208:11249): the index into the sections that follow. A pinned
 * list lights up one line at a time as you scroll, with its 3D clay icon after the last word. Beside it (under it on
 * phones) the line is made concrete on a flat card with a registration mark in each corner: the real apps or agents
 * behind it, one sentence, and the command that gets it.
 */

type Tile = { src: string; name: string; pad?: boolean; mono?: boolean; href?: string };

const app = (id: string): Tile => {
  const a = APPS.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown app ${id}`);
  return { src: a.icon, name: a.name, href: `/apps/${a.id}` };
};

const install = (id: string) => `pilotctl appstore install ${id}`;

type Item = {
  icon: string;
  text: string;
  tiles?: Tile[];
  chips?: string[];
  note: string;
  /** The literal command (or URL) behind the line. Commands get a prompt; the URL doesn't. */
  code: string;
  url?: boolean;
};

const ITEMS: Item[] = [
  {
    icon: "agents",
    text: "Reach other agents",
    tiles: [
      { src: "/harness/claude-color.svg", name: "Claude Code", pad: true },
      { src: "/harness/codex.svg", name: "Codex" },
      { src: "/harness/openclaw.png", name: "OpenClaw", pad: true },
    ],
    note: "Claude Code, Codex, OpenClaw or your own code, over encrypted tunnels once both sides approve.",
    code: "pilotctl handshake agent-alpha",
  },
  {
    icon: "data",
    text: "Query live data agents",
    chips: ["open-meteo-forecast", "coingecko-markets-simple", "usgs-earthquakes", "bvg-berlin-departures", "nasa-apod"],
    note: "About 430 agents, one per data source. Each takes a query and replies with JSON.",
    code: "pilotctl handshake open-meteo-forecast",
  },
  {
    icon: "apps",
    text: "Install apps with one command",
    tiles: ["io.pilot.agentphone", "io.pilot.plainweb", "io.pilot.wallet", "io.pilot.otto"].map(app),
    note: "30 apps so far, each installed with one pilotctl command.",
    code: install("io.pilot.otto"),
  },
  {
    icon: "sql",
    text: "Run SQL on a real database",
    tiles: ["io.pilot.postgres", "io.pilot.mysql", "io.pilot.sqlite", "io.pilot.duckdb"].map(app),
    note: "PostgreSQL and MySQL run as real servers on your machine. SQLite and DuckDB run in-process, over files.",
    code: install("io.pilot.postgres"),
  },
  {
    icon: "microvm",
    text: "Run code in a microVM",
    tiles: [app("io.pilot.smol")],
    note: "Fast, hardware-isolated microVMs, local and cloud, from Smol Machines.",
    code: install("io.pilot.smol"),
  },
  {
    icon: "phone",
    text: "Get its own phone number",
    tiles: ["io.pilot.agentphone", "io.pilot.dial"].map(app),
    note: "A real number for your agent: voice calls, SMS and iMessage.",
    code: install("io.pilot.agentphone"),
  },
  {
    icon: "sms",
    text: "Send an SMS",
    tiles: ["io.pilot.agentphone", "io.pilot.dial"].map(app),
    note: "Texts and iMessage from the agent's own number, and the conversations over REST.",
    code: install("io.pilot.dial"),
  },
  {
    icon: "markdown",
    text: "Read any web page as Markdown",
    tiles: [app("io.pilot.plainweb")],
    note: "Plainweb fetches a web page and hands your agent clean Markdown, in one call.",
    code: install("io.pilot.plainweb"),
  },
  {
    icon: "usdc",
    text: "Pay in USDC over x402",
    tiles: [app("io.pilot.wallet")],
    note: "USDC across Base, Ethereum and Polygon, over x402, with spend caps.",
    code: install("io.pilot.wallet"),
  },
  {
    icon: "mcp",
    text: "Connect over MCP",
    tiles: [
      { src: "/harness/claude-color.svg", name: "Claude", pad: true },
      { src: "/harness/openai.svg", name: "ChatGPT", pad: true, mono: true },
    ],
    note: "Add Pilot Cloud's URL to Claude, ChatGPT or any MCP client.",
    code: MCP_URL,
    url: true,
  },
];

/* The active detail rises out of a soft blur; reduced motion keeps the fade and drops the movement. */
const swap =
  "col-start-1 row-start-1 transition-[opacity,transform,filter] duration-500 ease-(--ease-out) data-[active=false]:pointer-events-none data-[active=false]:translate-y-2 data-[active=false]:opacity-0 data-[active=false]:blur-[4px] motion-reduce:transition-opacity motion-reduce:data-[active=false]:translate-y-0 motion-reduce:data-[active=false]:blur-none";

/** What the active line is made of: the real apps (or agents) behind it, one sentence, and the command. */
function Detail({ item, active }: { item: Item; active: boolean }) {
  return (
    <div aria-hidden={!active} data-active={active} className={`flex flex-col ${swap}`}>
      {item.tiles && (
        <ul className="flex flex-wrap gap-x-3 gap-y-4">
          {item.tiles.map((t) => {
            const body = (
              <>
                <AppIcon
                  src={t.src}
                  size={60}
                  pad={t.pad}
                  className={`shadow-(--shadow-tile)! transition-transform duration-200 ease-(--ease-out) ${t.href ? "group-hover/tile:-translate-y-0.5" : ""} ${t.mono ? "dark:[&_img]:invert" : ""}`}
                />
                <span className={`text-center text-[12px] whitespace-nowrap text-mute ${t.href ? "group-hover/tile:text-fg" : ""}`}>{t.name}</span>
              </>
            );
            return (
              <li key={t.name} className="min-w-[66px]">
                {/* Apps open their App Store page; the agents and AI apps have none of their own here. */}
                {t.href ? (
                  <Link href={t.href} tabIndex={active ? undefined : -1} className="group/tile flex flex-col items-center gap-2.5">
                    {body}
                  </Link>
                ) : (
                  <span className="flex flex-col items-center gap-2.5">{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {item.chips && (
        <ul className="flex flex-wrap gap-1.5">
          {item.chips.map((c) => (
            <li key={c} className="rounded-full bg-(--sky-tint) px-3 py-1.5 font-mono text-[12px] leading-4 text-(--sky-accent)">
              {c}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 mb-6 text-[17px] leading-[1.5] text-pretty text-soft">{item.note}</p>
      {/* Wrapped commands hang under their first character, not under the prompt. */}
      <p className="mt-auto flex gap-2 border-t border-edge pt-4 font-mono text-[12px] leading-[1.6] text-mute">
        {!item.url && (
          <span aria-hidden className="text-faint select-none">
            $
          </span>
        )}
        <span className="min-w-0">{item.code}</span>
      </p>
    </div>
  );
}

export function CapabilitiesD() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(ITEMS.length - 1, Math.max(0, Math.floor(p * ITEMS.length))));
  });

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + span * ((i + 0.5) / ITEMS.length), behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <section id="capabilities" ref={ref} aria-labelledby="capabilities-d-title" className="relative h-[340vh]">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="wrap grid grid-cols-1 items-center gap-16 [--row:min(clamp(38px,4.4vw,60px),calc((100dvh-190px)/10))] lg:grid-cols-[minmax(0,1fr)_368px] xl:grid-cols-[minmax(0,1fr)_432px]">
          <div>
            <div className="flex items-center gap-4">
              <h2
                id="capabilities-d-title"
                className="text-[16px] leading-[1.5] tracking-[-0.024em] text-pretty text-mute sm:text-[18px] short:text-[15px]"
              >
                With Pilot and the apps in its App Store, your agent can
              </h2>
              {/* Ten segments, one per line: where you are in the list. */}
              <span aria-hidden className="flex gap-1 lg:hidden">
                {ITEMS.map((item, i) => (
                  <span
                    key={item.icon}
                    data-on={i <= active}
                    className="h-[3px] w-2.5 rounded-full bg-fg/12 transition-colors duration-500 data-[on=true]:bg-(--sky-fill)"
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
                      className="group flex h-full items-center text-left text-[min(clamp(22px,3.1vw,44px),calc(6vw-3px),calc(var(--row)*0.76))] leading-none font-medium tracking-[-0.043em] whitespace-nowrap text-fg/20 transition-colors duration-500 ease-(--ease-out) hover:text-fg/45 data-[state=done]:text-fg/[0.34] data-[state=now]:text-fg"
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
            {/* Phones: the active line's sentence under the list (the card beside it is desktop only). */}
            <div className="mt-6 grid max-w-[460px] lg:hidden short:hidden">
              {ITEMS.map((item, i) => (
                <p
                  key={item.icon}
                  aria-hidden={i !== active}
                  data-active={i === active}
                  className={`text-[15px] leading-[1.5] text-pretty text-mute ${swap}`}
                >
                  {item.note}
                </p>
              ))}
            </div>
          </div>

          <div className={`relative hidden p-10 lg:block xl:p-12 ${SKY_CARD}`}>
            {/* Registration marks, one in each corner. */}
            {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "right-3 bottom-3"].map((at) => (
              <span key={at} aria-hidden className={`absolute size-1.5 rounded-full bg-[rgb(43_49_59/0.12)] dark:bg-white/14 ${at}`} />
            ))}
            <span aria-hidden className="flex gap-1">
              {ITEMS.map((item, i) => (
                <span
                  key={item.icon}
                  data-on={i <= active}
                  className="h-[3px] flex-1 rounded-full bg-fg/10 transition-colors duration-500 data-[on=true]:bg-(--sky-fill)"
                />
              ))}
            </span>
            <div className="mt-7 grid min-h-[268px]">
              {ITEMS.map((item, i) => (
                <Detail key={item.icon} item={item} active={i === active} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
