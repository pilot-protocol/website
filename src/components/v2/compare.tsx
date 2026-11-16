"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import "./compare.css";
import { CheckIcon, LockIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { Reveal } from "@/components/ui";
import { useFitScale, useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * Built for people vs built for agents, after PilotLink's comparison: four chores an agent runs into,
 * the way the internet usually handles each one on the left, what the Pilot daemon does on the right.
 * Only the agent side carries figures, and only true ones.
 */

type Figure = { word?: string; num?: number; prefix?: string; unit?: string; caption: string };
type Step = { label: string; ms: number; people: Figure; agents: Figure; People: () => ReactNode; Agents: () => ReactNode };

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/* ---------------------------------------------------------------- small parts */

function Tape() {
  return <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-fg/[0.08]" />;
}

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

function WifiGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden className={className}>
      <path d="M1.75 6.25a9 9 0 0 1 12.5 0M4 8.75a5.75 5.75 0 0 1 8 0M6.25 11.1a2.5 2.5 0 0 1 3.5 0" />
      <circle cx="8" cy="13.25" r="0.6" fill="currentColor" />
    </svg>
  );
}

function MachineGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" aria-hidden className={className}>
      <rect x="2.5" y="3" width="11" height="7.5" rx="1.25" />
      <path d="M1 13h14" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------- 1. getting found */

const PLACES = [
  { place: "Home Wi‑Fi", ip: "192.168.1.24" },
  { place: "Café Wi‑Fi", ip: "10.0.0.87" },
  { place: "Office network", ip: "172.16.4.12" },
];

function FoundPeople() {
  return (
    <div className="cmp-pop w-[300px] rounded-[20px] bg-card p-3 shadow-card" style={i(0)}>
      <div className="flex items-center gap-2 px-1.5 pb-2.5 text-[12px] font-medium text-mute">
        <MachineGlyph className="size-4" />
        Your laptop, over a day
      </div>
      <ul className="flex flex-col gap-1">
        {PLACES.map((p, k) => (
          <li key={p.place} className="cmp-row relative flex items-center justify-between rounded-[12px] px-3 py-2.5" style={i(k)}>
            <span aria-hidden className="cmp-row-bg absolute inset-0 rounded-[12px] bg-bg-deep" />
            <span className="relative flex items-center gap-2 text-[13px] text-fg">
              <WifiGlyph className="size-4 text-mute" />
              {p.place}
            </span>
            <span className="relative font-mono text-[12px] tracking-[-0.02em] text-soft">{p.ip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FoundAgents() {
  return (
    <div className="cmp-pop w-[320px] rounded-[20px] bg-card p-4 shadow-float" style={i(0)}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-[9px] bg-lime/25">
          <span className="size-2 rounded-[2px] bg-packet" />
        </span>
        <span className="leading-tight">
          <span className="block font-mono text-[13px] text-fg">open-meteo-forecast</span>
          <span className="block text-[11px] text-dim">Weather data agent</span>
        </span>
      </div>
      <p className="mt-4 text-[11px] text-dim">Address</p>
      <p className="mt-0.5 font-mono text-[25px] leading-none tracking-[-0.04em] text-fg">
        0:0000.0000.<span className="text-lime-ink">4BB9</span>
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-edge pt-3">
        <span className="flex items-center gap-1.5 text-[11.5px] text-mute">
          Running on
          <span className="grid font-medium text-fg">
            {["Laptop", "Cloud VM", "Container"].map((h, k) => (
              <span key={h} className="cmp-swap col-start-1 row-start-1" style={i(k)}>
                {h}
              </span>
            ))}
          </span>
        </span>
        <Pill className="cmp-pulse bg-lime text-ink">
          <CheckIcon className="size-3" />
          Same address
        </Pill>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 2. getting through */

const NOTES = [
  { text: "Forward port 8080 on the router", x: 4, y: 10, r: -5 },
  { text: "Open a port in the firewall", x: 196, y: 0, r: 4 },
  { text: "Get a static IP?", x: 30, y: 122, r: 3 },
  { text: "Ask IT for an exception", x: 210, y: 112, r: -4 },
];

function ThroughPeople() {
  return (
    <div className="relative h-[220px] w-[380px]">
      {NOTES.map((n, k) => (
        <div
          key={n.text}
          className="cmp-pop absolute w-[160px] rounded-[6px] bg-card px-3.5 pt-4 pb-3.5 text-[13.5px] leading-[1.35] font-medium text-soft shadow-tile"
          style={{ ...i(k), left: n.x, top: n.y, rotate: `${n.r}deg` }}
        >
          <Tape />
          {n.text}
        </div>
      ))}
    </div>
  );
}

function NatBox({ label, host, side }: { label: string; host: string; side: "l" | "r" }) {
  return (
    <div className="relative rounded-[18px] border border-dashed border-edge-3 p-2.5 pt-5">
      <span className="absolute -top-2 left-3 bg-bg px-1 font-mono text-[10px] text-dim">NAT</span>
      <div className={`flex w-[132px] items-center gap-2 rounded-[12px] bg-card p-2.5 shadow-tile ${side === "r" ? "flex-row-reverse text-right" : ""}`}>
        <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-bg-deep text-fg">
          <MachineGlyph className="size-4" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[12px] font-medium text-fg">{label}</span>
          <span className="block truncate font-mono text-[10px] text-dim">{host}</span>
        </span>
      </div>
    </div>
  );
}

function ThroughAgents() {
  return (
    <div className="relative h-[220px] w-[380px]">
      {/* the beacon, for STUN and the relay */}
      <div className="cmp-pop absolute top-0 left-1/2 -translate-x-1/2" style={i(0)}>
        <Pill className="bg-card text-mute shadow-tile">Beacon · STUN</Pill>
      </div>
      <svg viewBox="0 0 380 220" aria-hidden className="absolute inset-0 size-full overflow-visible" fill="none">
        <path className="cmp-probe" d="M80 92 C 110 50, 150 26, 176 22" stroke="var(--color-edge-3)" strokeDasharray="3 4" />
        <path className="cmp-probe" style={i(1)} d="M300 92 C 270 50, 230 26, 204 22" stroke="var(--color-edge-3)" strokeDasharray="3 4" />
        <path className="cmp-draw" d="M140 128 L 240 128" pathLength={1} stroke="var(--color-packet)" strokeWidth={3} strokeLinecap="round" />
      </svg>
      <div className="absolute top-[86px] left-0">
        <NatBox label="Your laptop" host="claude-code" side="l" />
      </div>
      <div className="absolute top-[86px] right-0">
        <NatBox label="Data agent" host="iss-position" side="r" />
      </div>
      <span className="cmp-lock absolute top-[116px] left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-lime text-ink shadow-tile">
        <LockIcon className="size-3" />
      </span>
      <span aria-hidden className="cmp-packet absolute top-[125px] left-[156px] size-[6px] rounded-[2px] bg-packet" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5">
        {["STUN", "Hole punch", "Direct tunnel"].map((s, k) => (
          <span key={s} className="cmp-step rounded-full px-2.5 py-1 text-[11px] font-medium" style={i(k)} data-last={k === 2}>
            {k + 1} {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 3. who's allowed */

function AllowedPeople() {
  return (
    <div className="relative h-[220px] w-[380px]">
      <div className="absolute top-0 left-2 flex flex-col items-start gap-1.5">
        <span className="cmp-pop rounded-[16px] rounded-bl-[5px] bg-card px-3.5 py-2 text-[13px] text-soft shadow-tile" style={i(0)}>
          can you send me the API key?
        </span>
        <span className="cmp-pop ml-10 rounded-[16px] rounded-br-[5px] bg-fg/[0.08] px-3.5 py-2 text-[13px] text-fg" style={i(1)}>
          here: <span className="font-mono text-[12px]">sk_live_••••••••</span>
        </span>
      </div>
      <div className="cmp-pop absolute right-2 bottom-1 w-[230px] rotate-[2deg] rounded-[14px] bg-card p-3 shadow-card" style={i(2)}>
        <p className="flex items-center justify-between font-mono text-[11px] text-dim">
          .env <span className="text-[10px]">copied from Slack</span>
        </p>
        <div className="mt-2 flex flex-col gap-1 font-mono text-[11.5px] text-soft">
          {["WEATHER_API_KEY", "MAPS_API_KEY", "PAYMENTS_KEY"].map((k) => (
            <span key={k} className="truncate">
              {k}=<span className="text-dim">••••••••</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AllowedAgents() {
  return (
    <div className="grid w-[330px]">
      {/* the request, then the same card once both sides have approved */}
      <div className="cmp-request col-start-1 row-start-1 self-center rounded-[18px] bg-card p-3 shadow-float">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-bg-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/harness/claude-color.svg" alt="" width={20} height={20} className="size-5" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[13px] font-medium text-fg">claude-code</span>
            <span className="block text-[11.5px] text-mute">wants to connect to openclaw</span>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5 text-[12px] font-medium">
          <span className="rounded-[9px] bg-fg/[0.06] py-1.5 text-center text-mute">Reject</span>
          <span className="cmp-approve rounded-[9px] bg-lime py-1.5 text-center text-ink">Approve</span>
        </div>
      </div>
      <div className="cmp-trusted col-start-1 row-start-1 self-center rounded-[18px] bg-card p-3.5 shadow-float">
        <div className="flex items-center justify-between">
          <span className="flex items-center -space-x-1.5">
            {["/harness/claude-color.svg", "/harness/openclaw.png"].map((src) => (
              <span key={src} className="grid size-9 place-items-center rounded-full bg-bg-deep ring-2 ring-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" width={20} height={20} className="size-5 rounded-[5px] object-contain" />
              </span>
            ))}
          </span>
          <Pill className="bg-lime text-ink">
            <CheckIcon className="size-3" />
            Trusted
          </Pill>
        </div>
        <p className="mt-3 text-[13px] font-medium text-fg">claude-code and openclaw</p>
        <p className="mt-0.5 text-[11.5px] text-mute">Both sides approved the handshake.</p>
        <div className="mt-3 flex items-center justify-between border-t border-edge pt-2.5 text-[11.5px]">
          <span className="text-dim">Either side can revoke it.</span>
          <span className="rounded-[8px] bg-fg/[0.06] px-2.5 py-1 font-medium text-soft">Revoke</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 4. finding data */

function DataPeople() {
  return (
    <div className="cmp-pop w-[340px] overflow-hidden rounded-[16px] bg-card shadow-card" style={i(0)}>
      <div className="flex items-center gap-2 border-b border-edge bg-bg-deep px-3 py-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-2 rounded-full bg-fg/15" />
          ))}
        </span>
        <span className="flex min-w-0 gap-1">
          {["Sign up", "Pricing", "API keys", "Docs"].map((t, k) => (
            <span
              key={t}
              className={`cmp-pop truncate rounded-[6px] px-2 py-0.5 text-[10.5px] ${k === 0 ? "bg-card text-fg" : "text-dim"}`}
              style={i(k + 1)}
            >
              {t}
            </span>
          ))}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[14px] font-medium text-fg">Create an account</p>
        <div className="mt-3 flex flex-col gap-2">
          {["Email", "Password"].map((f, k) => (
            <span key={f} className="cmp-pop rounded-[8px] px-2.5 py-2 text-[12px] text-dim ring-1 ring-edge-2" style={i(k + 3)}>
              {f}
            </span>
          ))}
        </div>
        <span className="cmp-pop mt-3 block rounded-[8px] bg-fg py-2 text-center text-[12px] font-medium text-bg" style={i(5)}>
          Create account
        </span>
        <p className="cmp-pop mt-2.5 text-center text-[11px] text-dim" style={i(6)}>
          Verify your email to get an API key
        </p>
      </div>
    </div>
  );
}

function DataAgents() {
  return (
    <div className="flex w-[340px] flex-col gap-2">
      <div className="cmp-pop flex items-center gap-2" style={i(0)}>
        <span className="size-2 rounded-[2px] bg-packet" />
        <span className="font-mono text-[12.5px] text-fg">coinbase-spot-price</span>
        <span className="text-[11px] text-dim">Finance and crypto</span>
      </div>
      <div className="cmp-pop self-end rounded-[16px] rounded-br-[5px] bg-fg px-3.5 py-2 font-mono text-[12px] text-bg" style={i(1)}>
        /data {"{"}&quot;currency_pair&quot;:&quot;BTC-USD&quot;{"}"}
      </div>
      <div className="cmp-reply self-start rounded-[16px] rounded-bl-[5px] bg-card p-3 shadow-card">
        <p className="text-[11px] text-dim">Reply, as JSON</p>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          {[
            ["amount", "80832.645"],
            ["base", "BTC"],
            ["currency", "USD"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[9px] bg-bg-deep px-2.5 py-1.5">
              <dt className="font-mono text-[10px] text-dim">{k}</dt>
              <dd className="mt-0.5 font-mono text-[12.5px] text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="cmp-pop text-[11px] text-dim" style={i(4)}>
        A real reply, recorded in October 2026.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- steps */

const STEPS: Step[] = [
  {
    label: "Getting found",
    ms: 7000,
    people: { word: "New IP", caption: "each time the network changes" },
    agents: { num: 48, unit: "-bit", caption: "address that stays put" },
    People: FoundPeople,
    Agents: FoundAgents,
  },
  {
    label: "Getting through",
    ms: 7000,
    people: { word: "Open ports", caption: "before anyone can reach you" },
    agents: { word: "Direct", caption: "through NAT, with an encrypted relay as fallback" },
    People: ThroughPeople,
    Agents: ThroughAgents,
  },
  {
    label: "Who’s allowed",
    ms: 7000,
    people: { word: "Shared keys", caption: "pasted into files and chats" },
    agents: { num: 2, unit: " sides", caption: "approve before a peer can reach your agent" },
    People: AllowedPeople,
    Agents: AllowedAgents,
  },
  {
    label: "Finding data",
    ms: 7000,
    people: { word: "Sign-ups", caption: "often an account and a key for every source" },
    agents: { prefix: "~", num: 430, caption: "data agents, one /data query each" },
    People: DataPeople,
    Agents: DataAgents,
  },
];

/* ---------------------------------------------------------------- figures */

function Rolling({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[...String(value)].map((d, k) => (
        <span key={k} className="relative inline-block [clip-path:inset(0)]">
          <span className="invisible">0</span>
          <span
            className="cmp-roll absolute inset-x-0 top-0 flex flex-col"
            style={{ "--to": `${-Number(d) * 10}%`, "--d": `${k * 80}ms` } as CSSProperties}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="h-[1em] leading-none">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function FigureView({ f, tone }: { f: Figure; tone: "people" | "agents" }) {
  const label = f.word ?? `${f.prefix ?? ""}${f.num}${f.unit ?? ""}`;
  return (
    <div className="cmp-figure flex flex-col items-center text-center">
      <p
        aria-label={label}
        className={`flex items-baseline leading-none font-medium tracking-[-0.05em] ${tone === "agents" ? "text-fg" : "text-faint"}`}
      >
        {f.word ? (
          <span className="text-[clamp(44px,5.6vw,80px)]">{f.word}</span>
        ) : (
          <>
            <span className="text-[clamp(44px,5.6vw,80px)]">
              {f.prefix}
              {f.num !== undefined && <Rolling value={f.num} />}
            </span>
            {f.unit && <span className="ml-0.5 text-[clamp(24px,2.8vw,40px)] tracking-[-0.04em]">{f.unit}</span>}
          </>
        )}
      </p>
      <p className="mt-2 max-w-[300px] text-[14px] leading-[1.45] text-mute sm:text-[15px]">{f.caption}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

/** A 400×240 composition, scaled down to fit narrow columns. */
function Stage({ children }: { children: ReactNode }) {
  const [ref, scale] = useFitScale<HTMLDivElement>(400);
  return (
    <div ref={ref} className="relative w-full" style={{ height: 240 * scale }}>
      <div
        className="absolute top-0 left-1/2 flex h-[240px] w-[400px] items-center justify-center"
        style={{ transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }}
      >
        {children}
      </div>
    </div>
  );
}

export function Compare() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const reduced = usePrefersReducedMotion();
  const running = auto && !reduced;
  const current = STEPS[step];
  const { People, Agents } = current;
  const tabs = useRef<HTMLDivElement>(null);

  // Keep the active pill in view when the row scrolls on phones.
  useEffect(() => {
    const row = tabs.current;
    const tab = row?.children[step] as HTMLElement | undefined;
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - 20, behavior: "smooth" });
  }, [step]);

  function choose(n: number) {
    setAuto(false);
    setStep(n);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? STEPS.length - 1 : (step + delta + STEPS.length) % STEPS.length;
    choose(next);
    (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
  }

  const title = "text-[17px] font-medium tracking-[-0.02em] text-fg sm:text-[19px]";

  return (
    <section id="compare" aria-labelledby="compare-title" className="py-28 sm:py-36">
      <div className="wrap flex flex-col items-center">
        <Reveal className="max-w-[1000px] text-center">
          <h2
            id="compare-title"
            className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-medium tracking-[-0.042em] text-balance text-fg"
          >
            Four chores every agent runs into,
            <span className="block text-mute">and how Pilot handles each one.</span>
          </h2>
        </Reveal>

        <div
          ref={ref}
          data-paused={!inView || hover}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerLeave={() => setHover(false)}
          className="mt-10 flex w-full flex-col items-center sm:mt-12"
          style={{ "--dur": `${current.ms}ms` } as CSSProperties}
        >
          <div
            ref={tabs}
            role="tablist"
            aria-label="Four chores"
            onKeyDown={onKey}
            className="no-scrollbar -mx-5 flex max-w-[calc(100%+40px)] gap-1 overflow-x-auto px-5 sm:mx-0 sm:max-w-full sm:rounded-full sm:bg-fg/[0.045] sm:p-1"
          >
            {STEPS.map((s, n) => {
              const active = n === step;
              return (
                <button
                  key={s.label}
                  type="button"
                  role="tab"
                  id={`cmp-tab-${n}`}
                  aria-selected={active}
                  aria-controls="cmp-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => choose(n)}
                  className="pressable relative flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-full px-3.5 text-[13.5px] font-medium whitespace-nowrap text-mute transition-[background-color,color,box-shadow] duration-300 hover:text-fg aria-selected:bg-card aria-selected:text-fg aria-selected:shadow-tile max-sm:bg-fg/[0.045]"
                >
                  <span className="font-mono text-[11px] text-dim tabular-nums">{n + 1}</span>
                  {s.label}
                  {active && (
                    <span
                      key={`${step}-${running}`}
                      aria-hidden
                      className="cmp-bar absolute inset-x-3 bottom-[3px] h-[2px] origin-left rounded-full bg-lime-ink"
                      data-run={running}
                      onAnimationEnd={() => setStep((k) => (k + 1) % STEPS.length)}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            id="cmp-panel"
            role="tabpanel"
            aria-labelledby={`cmp-tab-${step}`}
            className="mt-12 grid w-full max-w-[1100px] grid-cols-1 items-start gap-y-14 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] lg:gap-y-0"
          >
            <div className="flex flex-col items-center">
              <h3 className={title}>Built for people</h3>
              <div className="cmp-stage mt-6 w-full" key={`p-${step}`}>
                <Stage>
                  <People />
                </Stage>
              </div>
              <div className="mt-8" key={`pf-${step}`}>
                <FigureView f={current.people} tone="people" />
              </div>
            </div>

            <p aria-hidden className="self-center pb-16 text-center text-[22px] font-medium tracking-[-0.02em] text-faint max-lg:hidden">
              Vs
            </p>

            <div className="flex flex-col items-center">
              <h3 className={`${title} flex items-center gap-2`}>
                <LogoMark className="h-auto w-[18px] text-fg" />
                Built for agents
              </h3>
              <div className="cmp-stage mt-6 w-full" key={`a-${step}`}>
                <Stage>
                  <Agents />
                </Stage>
              </div>
              <div className="mt-8" key={`af-${step}`}>
                <FigureView f={current.agents} tone="agents" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
