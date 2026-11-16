"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { Button, Card, Command, Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView } from "@/lib/hooks";
import { INSTALL_CMD, LINKS, MCP_URL } from "@/lib/site";
import "./get-started.css";

/* ---------------- Little scenes: who talks to whom ---------------- */

// Both scenes share one 320×180 box; tiles sit on it in percentages so they scale with the SVG.
const W = 320;
const H = 180;
const at = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }) as CSSProperties;

function Tile({
  x,
  y,
  label,
  side = "below",
  small = false,
  dim = false,
  children,
  className = "",
}: {
  x: number;
  y: number;
  label: string;
  side?: "below" | "right";
  small?: boolean;
  dim?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-opacity duration-500 ease-(--ease-out) data-[dim=true]:opacity-40 ${small ? "w-[14%]" : "w-[17%]"}`}
      data-dim={dim}
      style={at(x, y)}
    >
      <span className={`grid aspect-square w-full place-items-center overflow-hidden rounded-[23%] shadow-tile ${className}`}>
        {children}
      </span>
      <figcaption
        className={`absolute text-[11px] whitespace-nowrap text-mute ${side === "below" ? "top-full mt-1.5" : "top-1/2 left-full ml-2.5 -translate-y-1/2"}`}
      >
        {label}
      </figcaption>
    </figure>
  );
}

function Logo({ src, mono = false }: { src: string; mono?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={40} height={40} draggable={false} className={`size-[56%] object-contain ${mono ? "dark:invert" : ""}`} />;
}

function Wire({ d, on, delay = 0 }: { d: string; on: boolean; delay?: number }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        strokeWidth={1.25}
        className="transition-[stroke,stroke-dasharray] duration-500"
        style={{ stroke: on ? "var(--color-edge-3)" : "var(--color-edge-2)" }}
        strokeDasharray={on ? undefined : "3 4"}
      />
      {on && (
        <path
          d={d}
          pathLength={100}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="gs-run"
          style={{ stroke: "var(--color-lime)", "--gs-delay": `${delay}ms` } as CSSProperties}
        />
      )}
    </g>
  );
}

const SCENE = "relative mx-auto aspect-[320/180] w-full max-w-[400px]";

function InjectScene({ on, live }: { on: boolean; live: boolean }) {
  const agents: [number, string, string, boolean][] = [
    [32, "Claude Code", "/harness/claude-color.svg", false],
    [90, "OpenClaw", "/harness/openclaw.png", false],
    [148, "OpenCode", "/harness/opencode.svg", true],
  ];
  return (
    <div className={`${SCENE} ${live ? "" : "gs-paused"}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
        {agents.map(([y], i) => (
          <Wire key={y} d={`M92 90 C 150 90, 150 ${y}, 196 ${y}`} on={on} delay={i * 420} />
        ))}
      </svg>
      <Tile x={64} y={90} label="Pilot daemon" className="bg-ink">
        <LogoMark className="h-auto w-[54%] text-lime" />
      </Tile>
      {agents.map(([y, name, src, mono]) => (
        <Tile key={name} x={218} y={y} label={name} side="right" small dim={!on} className="relative bg-card">
          <Logo src={src} mono={mono} />
          <span
            aria-hidden
            data-on={on}
            className="absolute top-[6%] right-[6%] size-[22%] scale-50 rounded-full bg-lime opacity-0 shadow-[0_0_0_2px_var(--color-card)] transition-[opacity,scale] duration-300 ease-(--ease-out) data-[on=true]:scale-100 data-[on=true]:opacity-100"
          />
        </Tile>
      ))}
    </div>
  );
}

function CloudScene({ client, live }: { client: Client; live: boolean }) {
  return (
    <div className={`${SCENE} ${live ? "" : "gs-paused"}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
        <Wire d="M100 50 C 160 50, 160 90, 220 90" on={client === "claude"} />
        <Wire d="M100 130 C 160 130, 160 90, 220 90" on={client === "chatgpt"} />
      </svg>
      <Tile x={72} y={50} label="Claude" dim={client !== "claude"} className="bg-card">
        <Logo src="/harness/claude-color.svg" />
      </Tile>
      <Tile x={72} y={130} label="ChatGPT" dim={client !== "chatgpt"} className="bg-card">
        <Logo src="/harness/openai.svg" mono />
      </Tile>
      <Tile x={248} y={90} label="Pilot Cloud" className="bg-lime">
        <LogoMark className="h-auto w-[54%] text-ink" />
      </Tile>
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-card px-2 py-[3px] font-mono text-[10.5px] text-soft shadow-tile"
        style={at(178, 90)}
      >
        /mcp
      </span>
    </div>
  );
}

/* ---------------- Cards ---------------- */

function Stage({ children }: { children: ReactNode }) {
  return <div className="rounded-[14px] bg-bg-deep px-6 pt-8 pb-10 sm:px-10">{children}</div>;
}

function Head({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h3 className="text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-fg sm:text-[26px]">{title}</h3>
      <p className="mt-1 text-[14.5px] text-dim">{note}</p>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-fg/[0.06] p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className="pressable rounded-full px-3.5 py-1.5 text-[13px] leading-none font-medium text-mute transition-[background-color,color,box-shadow] duration-200 hover:text-fg aria-checked:bg-card aria-checked:text-fg aria-checked:shadow-tile"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

type Mode = "auto" | "disabled";
type Client = "claude" | "chatgpt";

/** Where each client keeps custom MCP servers (from the MCP docs). */
const CLIENTS: { id: Client; label: string; path: string[]; note: string }[] = [
  {
    id: "claude",
    label: "Claude",
    path: ["Customize", "Connectors", "Add custom connector"],
    note: "Paste the URL, then sign in and approve. It works in the Claude app on your phone too.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    path: ["Plugins", "Add custom MCP server"],
    note: "On chatgpt.com, paste the URL and create it as a plugin; ChatGPT sends you to Pilot Cloud to sign in.",
  },
];

const MODES: { id: Mode; label: string; note: string }[] = [
  {
    id: "auto",
    label: "Auto",
    note: "Skill injection writes a short skill file into the agent tools it finds on the machine, so your agent knows the network exists and when to use it.",
  },
  {
    id: "disabled",
    label: "Off",
    note: "Nothing is written to your agent’s config. Call pilotctl yourself.",
  },
];

function MachineCard() {
  const [mode, setMode] = useState<Mode>("auto");
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  const current = MODES.find((m) => m.id === mode)!;

  return (
    <Card className="flex h-full flex-col p-2">
      <div ref={ref}>
        <Stage>
          <InjectScene on={mode === "auto"} live={inView} />
        </Stage>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <Head title="On your machine" note="macOS and Linux" />
        <p className="mt-5 max-w-[480px] text-[15.5px] leading-[1.5] text-mute">
          Install the daemon and pilotctl in one line. Static binaries, no runtime dependencies.
        </p>
        <Command value={INSTALL_CMD} prefix="curl" className="mt-4" label="Copy install command">
          {INSTALL_CMD.replace(/^curl/, "")}
        </Command>

        <div className="mt-7 border-t border-edge pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15.5px] font-medium text-fg">Tell your agent Pilot is here</p>
            <Segmented label="Skill injection" options={MODES} value={mode} onChange={setMode} />
          </div>
          <p key={mode} className="mt-2.5 min-h-[3em] max-w-[480px] animate-[row-in_400ms_var(--ease-out)_both] text-[14.5px] leading-[1.5] text-mute">
            {current.note}
          </p>
          <Command value={`pilotctl skills set-mode ${mode}`} prefix="$ " className="mt-3 w-fit" label="Copy skill command" />
        </div>

        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-7">
          <TextLink href={LINKS.gettingStarted}>Getting started</TextLink>
          <TextLink href={LINKS.skillInjection}>How injection works</TextLink>
        </div>
      </div>
    </Card>
  );
}

function CloudCard() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  const [client, setClient] = useState<Client>("claude");
  const current = CLIENTS.find((c) => c.id === client)!;
  return (
    <Card className="flex h-full flex-col p-2">
      <div ref={ref}>
        <Stage>
          <CloudScene client={client} live={inView} />
        </Stage>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <Head title="From Claude or ChatGPT" note="Pilot Cloud, nothing to install" />
        <p className="mt-5 max-w-[480px] text-[15.5px] leading-[1.5] text-mute">
          The same Pilot daemon, run for you and always on. Add this URL as an MCP server in Claude, ChatGPT or any MCP
          client.
        </p>
        <Command value={MCP_URL} className="mt-4" label="Copy MCP URL" />

        <div className="mt-7 border-t border-edge pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15.5px] font-medium text-fg">Where to paste it</p>
            <Segmented label="MCP client" options={CLIENTS} value={client} onChange={setClient} />
          </div>
          <div key={client} className="animate-[row-in_400ms_var(--ease-out)_both]">
            <ol className="mt-3 flex flex-wrap items-center gap-1.5">
              {current.path.map((step, i) => (
                <li key={step} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <svg viewBox="0 0 8 8" className="size-2 text-faint" aria-hidden>
                      <path d="M2.5 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" fill="none" />
                    </svg>
                  )}
                  <span className="rounded-[8px] bg-card-2 px-2.5 py-1.5 text-[13px] leading-none font-medium text-fg shadow-tile">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 min-h-[3em] max-w-[480px] text-[14.5px] leading-[1.5] text-mute">{current.note}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-7">
          <Button href={LINKS.cloud}>
            Open Pilot Cloud
            <ArrowUpRightIcon className="size-3" />
          </Button>
          <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
        </div>
      </div>
    </Card>
  );
}

export function GetStarted() {
  return (
    <section id="get-started" aria-labelledby="start-title" className="py-28 sm:py-36">
      <div className="wrap">
        <SectionHead
          id="start-title"
          title="Put your agent"
          muted="on the network."
          lede="Install the daemon on your own machine, or add Pilot Cloud with one URL."
        />
        <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-2 lg:gap-5">
          <Reveal className="h-full">
            <MachineCard />
          </Reveal>
          <Reveal delay={90} className="h-full">
            <CloudCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
