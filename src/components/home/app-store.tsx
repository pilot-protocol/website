"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRightIcon, CheckIcon, CopyIcon } from "@/components/icons";
import { Button, GhostButton, Reveal, SectionHead, SmartLink } from "@/components/ui";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./app-store.css";

/* eslint-disable @next/next/no-img-element */

// AEGIS has no artwork of its own yet; everything else goes on the home screen.
const GRID = APPS.filter((a) => a.id !== "io.pilot.aegis");
// Phones show the first rows only (4 × 5 with the publish tile), so every app in the tour sits in them.
const PHONE_LIMIT = 19;
const TOUR = ["io.pilot.agentphone", "io.pilot.plainweb", "io.pilot.wallet", "io.pilot.otto", "io.pilot.docker", "io.pilot.redis", "io.pilot.duckdb", "io.pilot.upfile"]
  .map((id) => GRID.find((a) => a.id === id))
  .filter((a): a is App => Boolean(a));

const INSTALL_MS = 1600;
const DONE_MS = 1100;
const HOLD_MS = 2600;

const platforms = (app: App) => [app.mac && "macOS", app.linux && "Linux"].filter(Boolean).join(" · ");
const installCmd = (app: App) => `pilotctl appstore install ${app.id}`;

/** Steps through the tour: even steps install an app, odd steps show it installed, the last one holds. */
function useTour(running: boolean) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) return;
    const last = TOUR.length * 2;
    const ms = step === last ? HOLD_MS : step % 2 === 0 ? INSTALL_MS : DONE_MS;
    const id = window.setTimeout(() => setStep((s) => (s >= last ? 0 : s + 1)), ms);
    return () => window.clearTimeout(id);
  }, [running, step]);

  const holding = step >= TOUR.length * 2;
  const current = holding ? null : TOUR[Math.floor(step / 2)];
  const phase: "installing" | "done" | "hold" = holding ? "hold" : step % 2 === 0 ? "installing" : "done";
  const installed = new Set(TOUR.slice(0, Math.floor((step + 1) / 2)).map((a) => a.id));
  return { current, phase, installed, step };
}

function ProgressRing({ runKey }: { runKey: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[42%] -rotate-90" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="rgb(255 255 255 / 0.32)" strokeWidth="2.6" />
      <circle
        key={runKey}
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        style={{ animation: `appstore-fill ${INSTALL_MS - 150}ms var(--ease-in-out) both` }}
      />
    </svg>
  );
}

function Tile({
  app,
  index,
  installing,
  installed,
  dimmed,
  runKey,
  onInspect,
}: {
  app: App;
  index: number;
  installing: boolean;
  installed: boolean;
  dimmed: boolean;
  runKey: number;
  onInspect: (app: App) => void;
}) {
  return (
    <li
      data-dimmed={dimmed}
      className={`transition-[opacity,scale,filter] duration-300 ease-(--ease-out) data-[dimmed=true]:scale-[0.94] data-[dimmed=true]:opacity-25 data-[dimmed=true]:grayscale ${index >= PHONE_LIMIT ? "max-sm:hidden" : ""}`}
    >
      <button
        type="button"
        onMouseEnter={() => onInspect(app)}
        onFocus={() => onInspect(app)}
        onClick={() => onInspect(app)}
        aria-label={`${app.name} by ${app.publisher}`}
        aria-describedby="appstore-info"
        className="group flex w-full flex-col items-center gap-2 rounded-2xl px-1 pt-2 pb-1.5 outline-offset-0"
      >
        <span
          data-installing={installing}
          className="relative block size-[52px] transition-transform duration-300 ease-(--ease-out) group-hover:-translate-y-1 data-[installing=true]:-translate-y-1 sm:size-14 lg:size-[60px]"
        >
          <span className="block size-full overflow-hidden rounded-[23%] bg-card shadow-tile">
            <img src={app.icon} alt="" width={120} height={120} loading="lazy" decoding="async" draggable={false} className="size-full object-cover" />
          </span>
          <span
            aria-hidden
            data-on={installing}
            className="absolute inset-0 grid place-items-center rounded-[23%] bg-black/50 opacity-0 transition-opacity duration-300 data-[on=true]:opacity-100"
          >
            {installing && <ProgressRing runKey={runKey} />}
          </span>
          {installed && (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-1.5 grid size-[20px] place-items-center rounded-full bg-lime text-ink ring-[2.5px] ring-bg-deep"
              style={{ animation: "appstore-badge 420ms var(--ease-out) both" }}
            >
              <CheckIcon className="size-[11px]" />
            </span>
          )}
        </span>
        <span className="max-w-full truncate text-[11.5px] leading-[16px] text-soft transition-colors group-hover:text-fg sm:text-[12.5px]">
          {app.name}
        </span>
      </button>
    </li>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="pressable grid size-9 shrink-0 place-items-center rounded-[10px] text-mute hover:bg-fg/[0.07] hover:text-fg"
    >
      <CopyIcon
        className="col-start-1 row-start-1 size-[14px] transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
        data-hidden={copied}
      />
      <CheckIcon
        className="col-start-1 row-start-1 size-[15px] text-lime-ink transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
        data-hidden={!copied}
      />
    </button>
  );
}

const swap = { animation: "appstore-swap 420ms var(--ease-out) both" } as CSSProperties;

/** The bar under the grid: the install in progress, or the app you're pointing at. */
function InfoBar({
  inspect,
  current,
  phase,
  reduced,
  query,
  matches,
  onClear,
}: {
  inspect: App | null;
  current: App | null;
  phase: string;
  reduced: boolean;
  query: string;
  matches: App[];
  onClear: () => void;
}) {
  if (query && !inspect) {
    return (
      <div key={`q-${matches.length}`} style={swap} className="flex items-center gap-3.5 sm:gap-4">
        <span className="flex shrink-0 -space-x-3">
          {matches.slice(0, 3).map((a) => (
            <img key={a.id} src={a.icon} alt="" width={88} height={88} className="size-11 rounded-[23%] shadow-tile ring-2 ring-card" />
          ))}
          {matches.length === 0 && (
            <span className="grid size-11 place-items-center rounded-[23%] bg-fg/[0.05] text-mute ring-1 ring-edge-2 ring-inset">?</span>
          )}
        </span>
        <p className="min-w-0 flex-1 text-[15px] leading-[20px] text-fg">
          {matches.length === 0 ? (
            <>Nothing matches “{query}” yet</>
          ) : (
            <>
              {matches.length} {matches.length === 1 ? "app matches" : "apps match"} “{query}”
            </>
          )}
          <span className="block text-[13.5px] text-mute">
            {matches.length === 0 ? (
              <SmartLink href={LINKS.publish} className="underline decoration-fg/30 underline-offset-2 hover:text-fg">
                Publish the app that should be here
              </SmartLink>
            ) : (
              "Point at one to read what it does."
            )}
          </span>
        </p>
        <button
          type="button"
          onClick={onClear}
          className="pressable h-8 shrink-0 rounded-full px-3 text-[13px] text-mute hover:bg-fg/[0.07] hover:text-fg"
        >
          Clear
        </button>
      </div>
    );
  }

  if (inspect) {
    return (
      <div key={`i-${inspect.id}`} style={swap} className="flex items-start gap-3.5 sm:items-center sm:gap-4">
        <img src={inspect.icon} alt="" width={88} height={88} className="size-11 shrink-0 rounded-[23%] shadow-tile" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[15px] leading-[20px] font-medium text-fg">
            {inspect.name}
            <span className="text-[13px] font-normal text-dim">
              {inspect.publisher} · {platforms(inspect)}
            </span>
          </p>
          <p className="mt-0.5 line-clamp-2 text-[14px] leading-[20px] text-mute">{inspect.description}</p>
        </div>
        <div className="flex shrink-0 items-center max-sm:-mt-1 max-sm:-mr-1">
          <CopyButton value={installCmd(inspect)} label={`Copy the install command for ${inspect.name}`} />
          <SmartLink
            href={`/apps/${inspect.id}`}
            aria-label={`View ${inspect.name}`}
            className="pressable grid size-9 place-items-center rounded-[10px] text-mute hover:bg-fg/[0.07] hover:text-fg"
          >
            <ArrowUpRightIcon className="size-[13px]" />
          </SmartLink>
        </div>
      </div>
    );
  }

  const app = current ?? TOUR[0];
  const done = phase === "done";
  if (phase === "hold" && !reduced) {
    return (
      <div key="hold" style={swap} className="flex items-center gap-3.5 sm:gap-4">
        <span className="flex shrink-0 -space-x-3">
          {TOUR.slice(0, 4).map((a) => (
            <img key={a.id} src={a.icon} alt="" width={88} height={88} className="size-11 rounded-[23%] shadow-tile ring-2 ring-card" />
          ))}
        </span>
        <p className="min-w-0 text-[15px] leading-[20px] text-fg">
          {TOUR.length} apps installed
          <span className="block text-[13.5px] text-mute">Each runs on your machine, next to the daemon.</span>
        </p>
      </div>
    );
  }
  return (
    <div key={`${app.id}-${done ? "d" : "i"}`} style={reduced ? undefined : swap} className="flex items-center gap-3.5 sm:gap-4">
      <img src={app.icon} alt="" width={88} height={88} className="size-11 shrink-0 rounded-[23%] shadow-tile" />
      <div className="min-w-0 flex-1">
        {done ? (
          <p className="text-[15px] leading-[20px] font-medium text-fg">{app.name} installed</p>
        ) : (
          <p className="truncate font-mono text-[12.5px] leading-[20px] text-fg sm:text-[13px]">
            <span className="text-dim">$ </span>
            {installCmd(app)}
          </p>
        )}
        <p className="truncate text-[13.5px] leading-[20px] text-mute">
          {done ? app.description : reduced ? `${app.publisher} · ${platforms(app)}` : "Downloading, checking the SHA-256 and the signature…"}
        </p>
      </div>
      {!reduced && (
        <span className="grid size-6 shrink-0 place-items-center" aria-hidden>
          {done ? (
            <span className="grid size-6 place-items-center rounded-full bg-lime text-ink" style={{ animation: "appstore-badge 420ms var(--ease-out) both" }}>
              <CheckIcon className="size-[12px]" />
            </span>
          ) : (
            <span className="size-[18px] animate-spin rounded-full border-2 border-fg/15 border-t-fg/70" />
          )}
        </span>
      )}
    </div>
  );
}

export function AppStore() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const reduced = usePrefersReducedMotion();
  const [inspect, setInspect] = useState<App | null>(null);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q ? GRID.filter((a) => `${a.name} ${a.publisher} ${a.description}`.toLowerCase().includes(q)) : GRID;
  const matchIds = new Set(matches.map((a) => a.id));
  const { current, phase, installed, step } = useTour(inView && !reduced && !q);

  return (
    <section id="app-store" aria-labelledby="apps-title" className="py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="apps-title"
            title="Apps your agent installs"
            muted="with one command."
            lede="Give your agent a Postgres database, a phone number, an inbox, a real Chrome tab or a USDC wallet. Each app runs on your machine, next to the daemon."
          />
          <Reveal delay={80} className="flex shrink-0 flex-wrap gap-2 lg:pb-1">
            <Button href={LINKS.appStore}>Browse all {APPS.length} apps</Button>
            <GhostButton href={LINKS.publish}>Publish your app</GhostButton>
          </Reveal>
        </div>

        <Reveal delay={60} className="mt-12 sm:mt-16">
          <div ref={ref} className="rounded-[28px] bg-bg-deep p-3 sm:p-5 lg:p-6">
            <label className="mx-auto mt-2 flex h-11 w-full max-w-[380px] items-center gap-2.5 rounded-full bg-card px-4 shadow-tile ring-lime-ink/60 transition-shadow focus-within:shadow-card focus-within:ring-2 sm:mt-3">
              <svg viewBox="0 0 20 20" className="size-[17px] shrink-0 text-dim" aria-hidden>
                <circle cx="8.75" cy="8.75" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setInspect(null);
                }}
                placeholder="Search the App Store"
                aria-label="Search the apps"
                aria-controls="appstore-info"
                className="min-w-0 flex-1 bg-transparent outline-none text-[15px] text-fg placeholder:text-dim [&::-webkit-search-cancel-button]:hidden"
              />
            </label>
            <ul
              onMouseLeave={() => setInspect(null)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInspect(null);
              }}
              className="grid grid-cols-4 gap-x-1 gap-y-3 px-1 pt-3 pb-4 sm:grid-cols-5 sm:gap-y-5 sm:px-4 sm:pt-6 md:grid-cols-6 lg:grid-cols-10 lg:gap-y-7 lg:px-6 lg:pt-8 lg:pb-8"
            >
              {GRID.map((app, i) => (
                <Tile
                  key={app.id}
                  app={app}
                  index={i}
                  installing={!reduced && !q && phase === "installing" && current?.id === app.id}
                  installed={installed.has(app.id)}
                  dimmed={Boolean(q) && !matchIds.has(app.id)}
                  runKey={step}
                  onInspect={setInspect}
                />
              ))}
              <li
                data-dimmed={Boolean(q) && matches.length > 0}
                className="transition-[opacity,scale] duration-300 ease-(--ease-out) data-[dimmed=true]:scale-[0.94] data-[dimmed=true]:opacity-25"
              >
                <SmartLink
                  href={LINKS.publish}
                  className="group flex w-full flex-col items-center gap-2 rounded-2xl px-1 pt-2 pb-1.5"
                >
                  <span className="grid size-[52px] place-items-center rounded-[23%] bg-fg/[0.05] text-mute ring-1 ring-edge-2 transition-[translate,color,background-color] duration-300 ease-(--ease-out) ring-inset group-hover:-translate-y-1 group-hover:bg-fg/[0.08] group-hover:text-fg sm:size-14 lg:size-[60px]">
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="max-w-full truncate text-[11.5px] leading-[16px] text-mute group-hover:text-fg sm:text-[12.5px]">
                    Yours next
                  </span>
                </SmartLink>
              </li>
            </ul>

            <div
              id="appstore-info"
              aria-live={inspect || q ? "polite" : "off"}
              className="mx-auto min-h-[76px] max-w-[680px] rounded-[18px] bg-card px-4 py-4 shadow-card sm:px-5"
            >
              <InfoBar
                inspect={inspect}
                current={current}
                phase={phase}
                reduced={reduced}
                query={q ? query.trim() : ""}
                matches={matches}
                onClear={() => setQuery("")}
              />
            </div>
            <p className="mt-3 mb-1 text-center text-[12.5px] text-dim">
              <span className="pointer-coarse:hidden">Point at</span>
              <span className="hidden pointer-coarse:inline">Tap</span> an app to read what it does.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-7 sm:mt-14 md:grid-cols-3">
          <Reveal className="flex gap-3.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-lime text-ink">
              <CheckIcon className="size-[12px]" />
            </span>
            <p className="text-[15px] leading-[1.55] text-mute">
              <span className="font-medium text-fg">Curated.</span> Every app is reviewed, SHA-256 pinned and
              signature-verified before installation.
            </p>
          </Reveal>
          <Reveal delay={70} className="flex gap-3.5">
            <span className="mt-0.5 grid h-7 shrink-0 place-items-center rounded-full bg-card px-2.5 font-mono text-[12px] text-fg shadow-tile">
              $5
            </span>
            <p className="text-[15px] leading-[1.55] text-mute">
              <span className="font-medium text-fg">Mostly free.</span> A few are metered against a per-user USD 5
              budget and list their prices in their <code className="font-mono text-[13.5px] text-soft">help</code>{" "}
              method.
            </p>
          </Reveal>
          <Reveal delay={140} className="flex gap-3.5">
            <img src="/apps/wallet.webp" alt="" width={56} height={56} className="mt-0.5 size-7 shrink-0 rounded-[23%] shadow-tile" />
            <p className="text-[15px] leading-[1.55] text-mute">
              <span className="font-medium text-fg">Payments are an app too.</span> Wallet holds USDC on Base, Ethereum
              and Polygon, pays over x402 and enforces spend caps.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
