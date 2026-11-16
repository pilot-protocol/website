"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { HatchPanel, SKY_CARD, Segmented, StepHead } from "@/components/sky/kit";
import { Button, Command, LiveDot, Reveal, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { INSTALL_CMD, LINKS, MCP_URL } from "@/lib/site";
import { BrandMark, type Brand } from "./logos";
import "./boarding.css";

/*
 * Get started (#get-started; Figma 180:5935). Everything sits in one hatched panel: the heading and one choice, where
 * your agent runs, then a stepper of three real steps with the small piece of UI you actually meet at each step right
 * under its head. The steps come in one after another when the section arrives, and again when you switch; the step
 * you're looking at (pointer or keyboard) is the blue one.
 * Every command, path and label is from content/docs (getting-started.mdx, mcp.mdx).
 */

type Mode = "machine" | "cloud";

/* Small line glyphs, 16px, drawn in the text colour. */
const glyph = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, "aria-hidden": true } as const;
const TerminalGlyph = ({ className = "size-4" }: { className?: string }) => (
  <svg {...glyph} className={`shrink-0 ${className}`} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.65" y="2.65" width="12.7" height="10.7" rx="2.2" />
    <path d="M4.6 6.2 6.6 8l-2 1.8M8.4 10h2.9" />
  </svg>
);
const PhoneGlyph = ({ className = "size-3.5" }: { className?: string }) => (
  <svg {...glyph} className={`shrink-0 ${className}`} strokeLinecap="round">
    <rect x="4.15" y="1.65" width="7.7" height="12.7" rx="2" />
    <path d="M7 11.9h2" />
  </svg>
);
const SettingsGlyph = ({ className = "size-3.5" }: { className?: string }) => (
  <svg {...glyph} className={`shrink-0 ${className}`} strokeLinecap="round">
    <path d="M2.5 5h5.7M11.8 5h1.7M2.5 11h1.7M7.8 11h5.7" />
    <circle cx="10" cy="5" r="1.75" />
    <circle cx="6" cy="11" r="1.75" />
  </svg>
);

/* The modes carry what they mean: a terminal on your machine, the two apps' marks for Pilot Cloud. Phones keep the
   words only, so both tabs still fit side by side. */
const MODES: { id: Mode; label: ReactNode; name: string }[] = [
  {
    id: "machine",
    name: "On your machine",
    label: (
      <span className="flex items-center gap-2">
        <TerminalGlyph className="size-4 max-sm:hidden" />
        On your machine
      </span>
    ),
  },
  {
    id: "cloud",
    name: "In Claude or ChatGPT",
    label: (
      <span className="flex items-center gap-2">
        <span className="flex items-center gap-1 max-sm:hidden">
          <BrandMark brand="claude" />
          <BrandMark brand="openai" />
        </span>
        In Claude or ChatGPT
      </span>
    ),
  },
];

/* ---------------- Step results ---------------- */

const ADDRESS_HEAD = "0:0000.0000.";
const ADDRESS_TAIL = "037D"; // an example address from the docs
const HEX = "0123456789ABCDEF";

/**
 * The last group of the address resolves, left to right, as if the daemon were being assigned it.
 * Written straight to the DOM (the text is fixed; only the transient scramble changes).
 */
function ResolvingTail({ target, run }: { target: string; run: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!run || reduced) {
      el.textContent = target;
      return;
    }
    let frame = 0;
    let id = 0;
    el.textContent = "····";
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        frame += 1;
        const settled = Math.floor(frame / 3);
        el.textContent = target
          .split("")
          .map((c, i) => (i < settled ? c : HEX[Math.floor(Math.random() * 16)]))
          .join("");
        if (settled >= target.length) window.clearInterval(id);
      }, 45);
    }, 520);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
      el.textContent = target;
    };
  }, [target, run, reduced]);
  return <span ref={ref}>{target}</span>;
}

function AgentPass({ run }: { run: boolean }) {
  return (
    <div className={`${SKY_CARD} board-result w-full p-4`}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-(--sky-fill) text-white">
          <PilotMarkP className="h-3.5 w-auto" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] leading-5 text-fg">my-agent</span>
        <span className="flex items-center gap-1.5 text-[12px] leading-4 text-mute">
          <LiveDot />
          Online
        </span>
      </div>
      <p className="mt-4 text-[12px] leading-4 text-mute">Permanent address</p>
      <p className="mt-1 font-mono text-[19px] leading-7 tracking-[-0.02em] text-fg tabular-nums">
        <span className="sr-only">
          {ADDRESS_HEAD}
          {ADDRESS_TAIL}
        </span>
        <span aria-hidden>
          {ADDRESS_HEAD}
          <span className="text-(--sky-accent)">
            <ResolvingTail target={ADDRESS_TAIL} run={run} />
          </span>
        </span>
      </p>
    </div>
  );
}

const TOOLS: [string, string][] = [
  ["pilot_start", "Start here"],
  ["pilot_checkin", "Check what is waiting"],
  ["pilot_query", "Query a service agent"],
];

function ConnectedTools() {
  return (
    <div className={`${SKY_CARD} board-result w-full p-4`}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-(--sky-fill) text-white">
          <PilotMarkP className="h-3.5 w-auto" />
        </span>
        <span className="min-w-0 flex-1 text-[14px] leading-5 font-medium text-fg">Pilot</span>
        <span className="flex items-center gap-1.5 rounded-full bg-(--sky-tint) px-2 py-0.5 text-[12px] leading-4 font-medium text-(--sky-accent)">
          <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden fill="none">
            <path d="M2 6.25 4.5 8.75 10 3.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
          Connected
        </span>
      </div>
      <ul className="mt-3.5 flex flex-col gap-2 border-t border-edge pt-3.5">
        {TOOLS.map(([name, title]) => (
          <li key={name} className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] leading-5 text-fg">{title}</span>
            <span className="shrink-0 font-mono text-[11.5px] leading-5 text-mute">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Client = "claude" | "chatgpt";
/* Where the URL goes in each app (content/docs/mcp.mdx): the menus you pass through, then the button you press. */
const CLIENTS: { id: Client; label: string; brand: Brand; path: string[]; action: string; note: Tag }[] = [
  {
    id: "claude",
    label: "Claude",
    brand: "claude",
    path: ["Customize", "Connectors"],
    action: "Add custom connector",
    note: { label: "Also in the Claude app on your phone", icon: <PhoneGlyph /> },
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    brand: "openai",
    path: ["Plugins"],
    action: "Add custom MCP server",
    note: { label: "Missing? Settings, then Developer mode", icon: <SettingsGlyph /> },
  },
];

const Chevron = () => (
  <svg viewBox="0 0 8 8" className="size-2 shrink-0 text-faint" aria-hidden fill="none">
    <path d="M2.5 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

function WhereToPaste() {
  const [client, setClient] = useState<Client>("claude");
  const current = CLIENTS.find((c) => c.id === client)!;
  return (
    <div className="w-full">
      <div role="radiogroup" aria-label="AI app" className="inline-flex gap-0.5 rounded-[10px] bg-card p-1 shadow-tile">
        {CLIENTS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={client === c.id}
            onClick={() => setClient(c.id)}
            className="pressable flex h-8 items-center gap-2 rounded-[7px] pr-3 pl-2.5 text-[13px] leading-none font-medium text-mute outline-(--sky-accent) hover:text-fg focus-visible:outline-2 aria-checked:bg-fg aria-checked:text-bg"
          >
            <BrandMark brand={c.brand} />
            {c.label}
          </button>
        ))}
      </div>
      {/* The path as the app shows it: its menus along the top, then the button to press, ringed. */}
      <div key={client} className={`${SKY_CARD} board-swap mt-3 overflow-hidden`}>
        <div className="flex items-center gap-2 border-b border-(--sky-card-line) px-3 py-2.5">
          <BrandMark brand={current.brand} className="size-4 text-fg" />
          <ol aria-label={`In ${current.label}`} className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] leading-4 text-mute">
            {current.path.map((step, i) => (
              <li key={step} className="flex items-center gap-1.5">
                {i > 0 && <Chevron />}
                <span className={i === current.path.length - 1 ? "font-medium text-fg" : ""}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="p-3">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-card pr-3 pl-2.5 text-[13px] leading-4 font-medium text-fg ring-2 ring-(--sky-fill)/70">
            <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2v8M2 6h8" strokeLinecap="round" />
            </svg>
            {current.action}
          </span>
        </div>
      </div>
      <div key={`${client}-note`} className="board-swap">
        <Tags items={[current.note]} />
      </div>
    </div>
  );
}

/** Break long commands after slashes, so they wrap where a person would ("| sh" stays with its file). */
function Breakable({ text, after = /(?<=\/)(?!\/)/ }: { text: string; after?: RegExp }) {
  // Each run between break points stays whole ("|" is a break opportunity on its own).
  const parts = text.split(after);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          <span className="whitespace-nowrap">{p}</span>
          {i < parts.length - 1 && <wbr />}
        </span>
      ))}
    </>
  );
}

/**
 * The install command, broken where a person would: "curl -fsSL", then the host, then "install.sh | sh" kept together.
 * In a stepper column it takes those three lines; given the room, it joins them back up.
 */
function InstallText() {
  const [, flags, host, file, rest] = INSTALL_CMD.match(/^curl( \S+ )(https:\/\/[^/]+\/)(\S+)(.*)$/) ?? [];
  if (!host) return <Breakable text={INSTALL_CMD} />;
  return (
    <>
      <span className="text-lime-ink">curl</span>
      <span className="whitespace-nowrap">{flags}</span>
      <wbr />
      <span className="whitespace-nowrap">{host}</span>
      <wbr />
      <span className="whitespace-nowrap">
        {file}
        {rest}
      </span>
    </>
  );
}

/** A small fact, with the mark or glyph of what it names (in ink, next to the mute words). */
type Tag = string | { label: string; icon: ReactNode };

/** Small facts, said in the UI rather than in a paragraph. */
function Tags({ items }: { items: Tag[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {items.map((t) => {
        const { label, icon } = typeof t === "string" ? { label: t, icon: null } : t;
        return (
          <li
            key={label}
            className={`flex h-7 items-center gap-1.5 rounded-full bg-card pr-3 text-[12.5px] leading-4 text-mute shadow-tile ${icon ? "pl-2" : "pl-3"}`}
          >
            {icon && <span className="flex text-fg">{icon}</span>}
            {label}
          </li>
        );
      })}
    </ul>
  );
}

/* Copy fields sit on the hatching as flat white fields with the card hairline. */
const FIELD = "bg-card! ring-(--sky-card-line)!";

/* ---------------- Steps ---------------- */

type Step = { title: string; ui: (run: boolean) => ReactNode };

const STEPS: Record<Mode, Step[]> = {
  machine: [
    {
      title: "Install",
      ui: () => (
        <div className="w-full">
          <Command value={INSTALL_CMD} label="Copy install command" wrap className={FIELD}>
            <InstallText />
          </Command>
          <Tags
            items={[
              { label: "macOS", icon: <BrandMark brand="apple" className="size-4 -translate-y-px" /> },
              { label: "Linux", icon: <BrandMark brand="linux" /> },
              "Static binaries",
            ]}
          />
        </div>
      ),
    },
    {
      title: "Start the daemon",
      ui: () => (
        <div className="w-full">
          <Command value="pilotctl daemon start" prefix="$ " label="Copy start command" className={FIELD} />
          <p className="mt-3 flex items-center gap-2 pl-1 font-mono text-[12px] leading-[18px] text-mute">
            <LiveDot />
            Daemon running
          </p>
        </div>
      ),
    },
    {
      title: "Your agent is on the network",
      ui: (run) => <AgentPass run={run} />,
    },
  ],
  cloud: [
    {
      title: "Copy the URL",
      ui: () => (
        <div className="w-full">
          <Command value={MCP_URL} label="Copy MCP URL" wrap className={FIELD}>
            {/* Only after the scheme, so the host and path stay on one line. */}
            <Breakable text={MCP_URL} after={/(?<=:\/\/)/} />
          </Command>
          <Tags items={["Same URL for every MCP client"]} />
        </div>
      ),
    },
    {
      title: "Add it to your AI app",
      ui: () => <WhereToPaste />,
    },
    {
      title: "Sign in and approve",
      ui: () => (
        <div className="w-full">
          <ConnectedTools />
          <Tags items={["Free", "No payment details"]} />
        </div>
      ),
    },
  ],
};

/* ---------------- Section ---------------- */

export function Boarding() {
  const [mode, setMode] = useState<Mode>("machine");
  const [current, setCurrent] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });

  return (
    <section id="get-started" aria-labelledby="boarding-title" className="py-16 sm:py-20 lg:pt-[72px] lg:pb-[104px]">
      <div className="wrap">
        <HatchPanel className="px-4 pt-12 pb-10 sm:px-10 sm:pt-14 lg:px-8 lg:pt-[72px] lg:pb-[72px] xl:px-[88px]">
          <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[560px]">
              <h2
                id="boarding-title"
                className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
              >
                Get your agent on the network
                <span className="block text-mute">in under five minutes.</span>
              </h2>
              <p className="mt-5 max-w-[460px] text-[17px] leading-[1.5] text-pretty text-mute sm:text-[18px]">
                Run the daemon yourself, or add Pilot Cloud to the AI app you already use. Either way your agent gets a
                permanent address on the same network.
              </p>
            </div>
            <Segmented
              items={MODES.map(({ id, label }) => ({ id, label }))}
              value={mode}
              onChange={(m) => {
                setMode(m);
                setCurrent(0);
              }}
              label="Where your agent runs"
              layoutId="board-mode"
              panelId="board-steps"
              // On a phone the two modes share the panel's width, so neither runs off its edge.
              className="shrink-0 self-start max-sm:w-full max-sm:[&_.sky-seg-tab]:grow max-sm:[&_.sky-seg-tab]:justify-center max-sm:[&_.sky-seg-tab]:px-2! max-sm:[&_.sky-seg-tab]:text-[14px]! lg:self-end"
            />
          </Reveal>

          <div
            ref={ref}
            id="board-steps"
            role="tabpanel"
            aria-label={MODES.find((m) => m.id === mode)?.name}
            data-in={inView}
            className="mt-12 lg:mt-[62px]"
          >
            <ol
              key={mode}
              className="grid grid-cols-1 gap-10 max-lg:[&_.sky-step-line]:hidden lg:grid-cols-3 lg:gap-8"
            >
              {STEPS[mode].map((s, i) => (
                <li
                  key={s.title}
                  className="board-step flex min-w-0 flex-col"
                  style={{ "--i": i } as CSSProperties}
                  onPointerEnter={() => setCurrent(i)}
                  onFocus={() => setCurrent(i)}
                >
                  <StepHead
                    n={i + 1}
                    on={i === current}
                    last={i === STEPS[mode].length - 1}
                    title={
                      <span role="heading" aria-level={3}>
                        {s.title}
                      </span>
                    }
                  />
                  <div className="mt-4 flex justify-center xl:px-3 xl:pt-2">
                    <div className="w-full max-w-[360px] lg:max-w-none">{s.ui(inView)}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div key={`${mode}-next`} className="board-next mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:mt-12">
              {mode === "machine" ? (
                <TextLink href={LINKS.gettingStarted}>Read the getting started guide</TextLink>
              ) : (
                <>
                  <Button href={LINKS.cloud}>
                    Open Pilot Cloud
                    <ArrowUpRightIcon className="size-3" />
                  </Button>
                  <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
                </>
              )}
            </div>
          </div>
        </HatchPanel>
      </div>
    </section>
  );
}
