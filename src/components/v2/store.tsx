"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import { AppIcon, Button, GhostButton, Reveal, SectionHead, TextLink } from "@/components/ui";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./store.css";

/*
 * Variant B, "Store": the App Store as Apple would lay it out. A featured app card and a list of apps,
 * each with an Install button that shows the real pilotctl command it stands for.
 */

const INSTALL_MS = 1800;

function app(id: string): App {
  const found = APPS.find((a) => a.id === id);
  if (!found) throw new Error(`Unknown app ${id}`);
  return found;
}

const FEATURED = app("io.pilot.agentphone");
const LIST = ["io.pilot.wallet", "io.pilot.postgres", "io.pilot.plainweb", "io.pilot.otto", "io.pilot.smol", "io.pilot.primitive"].map(app);

const platforms = (a: App) => (a.mac && a.linux ? "macOS and Linux" : a.mac ? "macOS" : "Linux");

type Phase = "idle" | "busy" | "done";

/* ---------------- Install button ---------------- */

function Ring() {
  return (
    <span className="relative grid size-[22px] place-items-center">
      <svg viewBox="0 0 24 24" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={2.2} />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          pathLength={1}
          className="store-ring"
          style={{ animationDuration: `${INSTALL_MS}ms` } as CSSProperties}
        />
      </svg>
      <span className="size-[6px] rounded-[1.5px] bg-current" />
    </span>
  );
}

function InstallButton({ a, phase, onPress, primary = false }: { a: App; phase: Phase; onPress: () => void; primary?: boolean }) {
  const tone =
    phase === "done"
      ? "bg-lime/20 text-lime-ink"
      : phase === "busy"
        ? "bg-transparent text-fg"
        : primary
          ? "bg-fg text-bg hover:bg-fg/88"
          : "bg-fg/[0.07] text-fg hover:bg-fg/[0.12]";
  return (
    <button
      type="button"
      onClick={onPress}
      aria-disabled={phase !== "idle"}
      aria-label={phase === "done" ? `${a.name} installed` : phase === "busy" ? `Installing ${a.name}` : `Install ${a.name}`}
      className={`pressable grid shrink-0 place-items-center rounded-full font-semibold transition-colors duration-300 ${
        primary ? "h-10 min-w-[104px] px-4 text-[14px] sm:min-w-[112px] sm:px-5" : "h-8 min-w-[96px] px-4 text-[13px]"
      } ${tone}`}
    >
      <span className="store-swap col-start-1 row-start-1" data-on={phase === "idle"}>
        Install
      </span>
      <span className="store-swap col-start-1 row-start-1" data-on={phase === "busy"}>
        {phase === "busy" && <Ring />}
      </span>
      <span className="store-swap col-start-1 row-start-1 flex items-center gap-1.5" data-on={phase === "done"}>
        <CheckIcon className="size-3.5" />
        Installed
      </span>
    </button>
  );
}

/* ---------------- Featured card ---------------- */

function Chip({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`store-float absolute flex items-center gap-2 rounded-full bg-card/90 py-2 pr-3.5 pl-2.5 text-[13px] font-medium whitespace-nowrap text-fg shadow-float backdrop-blur-md ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

const glyph = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Featured({ phase, onInstall }: { phase: Phase; onInstall: () => void }) {
  return (
    <div
      className="relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-[32px] p-5 shadow-card sm:p-9"
      style={
        {
          "--app": "#2db469",
          background:
            "radial-gradient(80% 70% at 82% 34%, color-mix(in srgb, var(--app) 26%, transparent), transparent 70%), linear-gradient(165deg, color-mix(in srgb, var(--app) 13%, var(--color-card)) 0%, var(--color-card) 62%)",
        } as CSSProperties
      }
    >
      <p className="flex items-center gap-2 text-[13px] font-medium text-soft">
        <span className="size-1.5 rounded-full bg-[var(--app)]" />
        Featured app
      </p>
      <h3 className="mt-4 max-w-[400px] text-[clamp(28px,3.2vw,40px)] leading-[1.04] font-medium tracking-[-0.04em] text-balance text-fg">
        A real phone number for your agent
      </h3>
      <p className="mt-3 max-w-[360px] text-[15px] leading-[1.5] text-pretty text-soft">
        Voice calls, SMS and iMessage, and the conversations over REST.
      </p>

      {/* The app, with what it gives your agent floating around it. */}
      <div className="relative mx-auto my-6 min-h-[250px] w-full max-w-[460px] flex-1 sm:min-h-[270px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[8deg]">
          <AppIcon src={FEATURED.icon} alt="" size={148} className="shadow-float" />
        </div>
        <Chip className="top-[6%] left-[2%]" style={{ "--d": "0s" } as CSSProperties}>
          <svg viewBox="0 0 20 20" className="size-4 text-[var(--app)]" aria-hidden>
            <path d="M6.2 2.8 4 3.4a1.7 1.7 0 0 0-1.2 1.9c.9 5.7 5.2 10 10.9 10.9a1.7 1.7 0 0 0 1.9-1.2l.6-2.2-3.4-1.7-1.4 1.6a9.4 9.4 0 0 1-4.2-4.2l1.6-1.4-1.7-3.4Z" {...glyph} />
          </svg>
          Voice calls
        </Chip>
        <Chip className="top-[12%] right-[0%]" style={{ "--d": "-1.4s" } as CSSProperties}>
          <svg viewBox="0 0 20 20" className="size-4 text-[var(--app)]" aria-hidden>
            <path d="M3.5 5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 3v-3a2 2 0 0 1-2-2v-6Z" {...glyph} />
          </svg>
          SMS
        </Chip>
        <Chip className="bottom-[14%] left-[0%]" style={{ "--d": "-2.6s" } as CSSProperties}>
          <svg viewBox="0 0 20 20" className="size-4 text-[var(--app)]" aria-hidden>
            <path d="M10 3.5c3.9 0 7 2.5 7 5.7s-3.1 5.7-7 5.7c-.8 0-1.6-.1-2.3-.3L4 16l.9-3.1A5.3 5.3 0 0 1 3 9.2c0-3.2 3.1-5.7 7-5.7Z" {...glyph} />
          </svg>
          iMessage
        </Chip>
        <Chip className="right-[4%] bottom-[6%] font-mono text-[12px]" style={{ "--d": "-0.7s" } as CSSProperties}>
          <span className="rounded-[5px] bg-[var(--app)]/15 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--app)]">REST</span>
          conversations
        </Chip>
      </div>

      <div className="relative mt-auto flex items-center gap-3 rounded-[22px] bg-card/80 p-3 pr-3.5 shadow-tile backdrop-blur-md sm:gap-4">
        <AppIcon src={FEATURED.icon} alt="" size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-fg">{FEATURED.name}</p>
          <p className="truncate text-[13px] text-mute">
            {FEATURED.publisher} · {platforms(FEATURED)}
          </p>
        </div>
        <InstallButton a={FEATURED} phase={phase} onPress={onInstall} primary />
      </div>
    </div>
  );
}

/* ---------------- List ---------------- */

function Row({ a, phase, onInstall, divider }: { a: App; phase: Phase; onInstall: () => void; divider: boolean }) {
  return (
    <li
      className={`relative flex items-center gap-3.5 rounded-[18px] px-2 py-2.5 transition-colors duration-200 hover:bg-fg/[0.03] ${
        divider ? "before:absolute before:top-0 before:right-2 before:left-[78px] before:h-px before:bg-edge" : ""
      }`}
    >
      <AppIcon src={a.icon} alt="" size={52} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-fg">
          {a.name} <span className="font-normal text-dim max-sm:hidden">· {a.publisher}</span>
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-[1.4] text-mute">{a.description}</p>
      </div>
      <InstallButton a={a} phase={phase} onPress={onInstall} />
    </li>
  );
}

function StatusBar({ current, reduced }: { current: { a: App; done: boolean } | null; reduced: boolean }) {
  return (
    <div className="pp-island flex h-12 items-center gap-2.5 rounded-[16px]! px-4 font-mono text-[12.5px]" aria-live="polite">
      {current ? (
        <span key={`${current.a.id}-${current.done}`} className={`flex min-w-0 items-center gap-2.5 ${reduced ? "" : "store-in"}`}>
          {current.done ? (
            <>
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime text-ink">
                <CheckIcon className="size-3" />
              </span>
              <span className="truncate font-sans text-[13.5px] text-fg">{current.a.name} installed</span>
            </>
          ) : (
            <>
              <span className="shrink-0 text-lime">$</span>
              <span className="truncate text-fg">
                pilotctl appstore install <span className="text-soft">{current.a.id}</span>
              </span>
              <span className="caret-blink h-4 w-[7px] shrink-0 bg-fg/70" />
            </>
          )}
        </span>
      ) : (
        <span className="truncate font-sans text-[13px] text-mute">Press Install to see the command it runs.</span>
      )}
    </div>
  );
}

/* ---------------- Section ---------------- */

const NOTES: { lead: string; body: string; mark: ReactNode }[] = [
  {
    lead: "Curated.",
    body: "Every app is reviewed, SHA-256 pinned and signature-verified before installation.",
    mark: (
      <span className="grid size-7 place-items-center rounded-full bg-lime/25 text-lime-ink">
        <CheckIcon className="size-3.5" />
      </span>
    ),
  },
  {
    lead: "Mostly free.",
    body: "A few are metered against a per-user USD 5 budget and list their prices in their help method.",
    mark: (
      <span className="grid h-7 min-w-7 place-items-center rounded-full bg-fg/[0.07] px-1.5 text-[11.5px] font-semibold text-fg tabular-nums">
        $5
      </span>
    ),
  },
  {
    lead: "Payments are an app too.",
    body: "Wallet holds USDC on Base, Ethereum and Polygon, pays over x402 and enforces spend caps.",
    mark: <AppIcon src={app("io.pilot.wallet").icon} alt="" size={28} />,
  },
];

export function Store() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Record<string, Phase>>({});
  const [current, setCurrent] = useState<{ a: App; done: boolean; n: number } | null>(null);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);
  const [gridRef, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function install(a: App) {
    if (phase[a.id]) return;
    const n = ++seq.current;
    const ms = reduced ? 0 : INSTALL_MS;
    setPhase((p) => ({ ...p, [a.id]: "busy" }));
    setCurrent({ a, done: false, n });
    timers.current.push(
      window.setTimeout(() => {
        setPhase((p) => ({ ...p, [a.id]: "done" }));
        setCurrent((c) => (c?.n === n ? { ...c, done: true } : c));
      }, ms),
      window.setTimeout(() => setCurrent((c) => (c?.n === n ? null : c)), ms + 2600),
    );
  }

  // Show it once without being asked: AgentPhone, then Wallet. Stays put with reduced motion.
  const installRef = useRef(install);
  useEffect(() => {
    installRef.current = install;
  });
  useEffect(() => {
    if (!inView || reduced) return;
    const a = window.setTimeout(() => installRef.current(FEATURED), 900);
    const b = window.setTimeout(() => installRef.current(LIST[0]), 900 + INSTALL_MS + 1100);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [inView, reduced]);

  return (
    <section id="app-store" aria-labelledby="store-title" className="py-28 sm:py-36">
      <div className="wrap">
        <SectionHead
          center
          id="store-title"
          title="Apps your agent installs"
          muted="with one command."
          lede="Give your agent a database, a phone number, an inbox or a wallet. Each app runs on your machine, next to the daemon."
        />

        <Reveal delay={60}>
          <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Featured phase={phase[FEATURED.id] ?? "idle"} onInstall={() => install(FEATURED)} />
            </div>
            <div className="flex flex-col rounded-[32px] bg-card p-3 shadow-card sm:p-4 lg:col-span-5">
              <div className="flex items-center justify-between px-2 pt-2 pb-3">
                <p className="text-[17px] font-medium tracking-[-0.015em] text-fg">In the App Store</p>
                <TextLink href={LINKS.appStore} className="text-[13px]">
                  See all {APPS.length}
                </TextLink>
              </div>
              <ul className="flex flex-col">
                {LIST.map((a, i) => (
                  <Row key={a.id} a={a} divider={i > 0} phase={phase[a.id] ?? "idle"} onInstall={() => install(a)} />
                ))}
              </ul>
              <div className="mt-auto pt-3">
                <StatusBar current={current} reduced={reduced} />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} as="ul" className="mt-12 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
          {NOTES.map((note) => (
            <li key={note.lead} className="flex gap-3.5">
              <span className="mt-0.5 shrink-0">{note.mark}</span>
              <p className="text-[14px] leading-[1.5] text-pretty text-mute">
                <span className="font-medium text-fg">{note.lead}</span> {note.body}
              </p>
            </li>
          ))}
        </Reveal>

        <Reveal delay={140} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <Button href={LINKS.appStore} className="h-11 px-5 text-[15px]">
            Browse all {APPS.length} apps
          </Button>
          <GhostButton href={LINKS.publish} className="h-11 px-5 text-[15px]">
            Publish your app
          </GhostButton>
        </Reveal>
      </div>
    </section>
  );
}
