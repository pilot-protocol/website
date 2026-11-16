"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { HatchPanel, SKY_CARD } from "@/components/sky/kit";
import { AppIcon, Button, Reveal, SmartLink } from "@/components/ui";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./apps.css";

/* eslint-disable @next/next/no-img-element */

/*
 * The App Store (Figma 213:20181), told as what an app adds to your agent, on the hatched showcase panel. On the
 * left a featured app with its Get button; on the right your agent and what it can call. Installing plays the real
 * path: the button fills, the install is verified, and the app's real methods (from its catalogue page) light up in
 * the agent's list. A shelf of every app sits underneath; tapping one features it.
 */

// AEGIS has no artwork of its own yet; every other app is on the shelf.
const GRID = APPS.filter((a) => a.id !== "io.pilot.aegis");
const byId = (id: string) => {
  const a = GRID.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown app ${id}`);
  return a;
};

/** The ones the tour installs, in order. They lead the shelf. */
const FEATURED = ["io.pilot.agentphone", "io.pilot.postgres", "io.pilot.plainweb", "io.pilot.wallet", "io.pilot.otto"].map(byId);
const SHELF = [...FEATURED, ...GRID.filter((a) => !FEATURED.includes(a))];

/** Three or four of each app's real methods (content/apps/<id>.json), with what each does in a few words. */
const METHODS: Record<string, [string, string][]> = {
  "io.pilot.agentphone": [
    ["agentphone.place_call", "Run an AI voice call"],
    ["agentphone.send_message", "Text over SMS or iMessage"],
    ["agentphone.list_conversations", "List conversation threads"],
    ["agentphone.get_transcript", "Read a call's transcript"],
  ],
  "io.pilot.postgres": [
    ["postgres.start", "Start a local server"],
    ["postgres.createdb", "Create a database"],
    ["postgres.query", "Run SQL, get a table"],
    ["postgres.query_csv", "Run SQL, get CSV"],
  ],
  "io.pilot.smol": [
    ["smol.exec", "Run code in a local microVM"],
    ["smol.push", "Push a VM to the cloud and start it"],
    ["smol.list", "List your cloud machines"],
    ["smol.balance", "Your cloud credit balance"],
  ],
  "io.pilot.plainweb": [
    ["plainweb.fetch", "Any web page as clean Markdown"],
    ["plainweb.help", "Every method with its params"],
  ],
  "io.pilot.wallet": [
    ["wallet.balance", "USDC balance"],
    ["wallet.pay", "Pay an x402 USDC request"],
    ["wallet.request", "Create a payment request"],
    ["wallet.spend_caps", "Show the enforced spend caps"],
  ],
  "io.pilot.primitive": [
    ["primitive.signup", "Provision an account and inbox"],
    ["primitive.send_email", "Send outbound email"],
    ["primitive.search_emails", "Search inbound email"],
    ["primitive.get_email", "Read one email"],
  ],
  "io.pilot.otto": [
    ["otto.extract", "A page as Markdown, from a real tab"],
    ["otto.screenshot", "Viewport or full-page screenshot"],
    ["otto.cmd", "Open, navigate and query tabs"],
    ["otto.status", "Relay and connected nodes"],
  ],
  "io.pilot.sixtyfour": [
    ["sixtyfour.people_intelligence", "Enrich a person, source-backed"],
    ["sixtyfour.company_intelligence", "A full company profile"],
    ["sixtyfour.find_email", "Find a verified email"],
    ["sixtyfour.deep_search", "Agentic deep search"],
  ],
  "io.pilot.dial": [
    ["dial.buy_number", "Provision a US number"],
    ["dial.place_call", "Place an AI voice call"],
    ["dial.send_message", "Send a text"],
    ["dial.list_messages", "Inbound and outbound messages"],
  ],
  "io.pilot.docker": [
    ["docker.pull", "Pull an image"],
    ["docker.ps", "List containers"],
    ["docker.images", "List local images"],
    ["docker.exec", "Run the docker CLI"],
  ],
  "io.pilot.bowmark": [
    ["bowmark.get_library", "Callable functions for a task"],
    ["bowmark.run", "Run a script on real websites"],
    ["bowmark.flights.search", "Search fares across sites"],
  ],
  "io.pilot.redis": [
    ["redis.start", "Start a local server"],
    ["redis.set", "Set a key"],
    ["redis.get", "Get a key"],
    ["redis.dbsize", "Count the keys"],
  ],
  "io.pilot.orthogonal": [
    ["orthogonal.search", "Describe a task, find the API"],
    ["orthogonal.run", "Call it and see the exact price"],
    ["orthogonal.integrate", "Code snippets for one endpoint"],
    ["orthogonal.balance", "What's left of your budget"],
  ],
  "io.pilot.duckdb": [
    ["duckdb.query", "Run SQL, get a table"],
    ["duckdb.query_json", "Run SQL, get JSON"],
    ["duckdb.tables", "List tables and views"],
    ["duckdb.schema", "Print the schema"],
  ],
  "io.pilot.deadsimple": [
    ["deadsimple.create_inbox", "Create a real inbox"],
    ["deadsimple.send_email", "Send from an inbox"],
    ["deadsimple.get_verification_code", "Read a signup code"],
    ["deadsimple.list_inboxes", "List your inboxes"],
  ],
  "io.pilot.didit": [
    ["didit.create_session", "Start a verification session"],
    ["didit.list_sessions", "List your sessions"],
    ["didit.list_workflows", "List verification workflows"],
    ["didit.billing_balance", "Your credit balance"],
  ],
  "io.pilot.upfile": [
    ["upfile.upload", "Upload, get a permanent URL"],
    ["upfile.upload_expiring", "Upload with a time-to-live"],
    ["upfile.list", "List your files"],
    ["upfile.remove", "Delete a file"],
  ],
  "io.pilot.miren": [
    ["miren.deploy", "Build and deploy an app"],
    ["miren.apps", "List apps on the cluster"],
    ["miren.rollback", "Roll back a deploy"],
    ["miren.doctor", "Diagnose the environment"],
  ],
  "io.pilot.tldr": [
    ["tldr.search", "Full-text search across pages"],
    ["tldr.get", "A command's page, rendered"],
    ["tldr.list", "The whole directory"],
  ],
  "io.pilot.rentahuman": [
    ["rentahuman.create_request", "Ask for a task in plain language"],
    ["rentahuman.get_request", "Status and the ops thread"],
    ["rentahuman.list_requests", "Everything in flight"],
  ],
  "io.pilot.kinetic": [
    ["kinetic.study_create", "Set up a pricing study"],
    ["kinetic.study_launch", "Take it live"],
    ["kinetic.study_progress_get", "Responses so far"],
    ["kinetic.narrative_generate", "Explain the results"],
  ],
  "io.telepat.ideon-free": [
    ["ideon-free.generate", "Start an article from an idea"],
    ["ideon-free.poll", "Fetch the finished article"],
  ],
  "io.pilot.mysql": [
    ["mysql.start", "Start a local server"],
    ["mysql.createdb", "Create a database"],
    ["mysql.query", "Run SQL, get a table"],
    ["mysql.tables", "List the tables"],
  ],
  "io.pilot.sqlite": [
    ["sqlite.query", "Run SQL, rows as JSON"],
    ["sqlite.tables", "List the tables"],
    ["sqlite.schema", "Print the schema"],
  ],
  "io.pilot.cosift": [
    ["cosift.search", "Keyword and semantic search"],
    ["cosift.contents", "A document's full contents"],
    ["cosift.research", "A multi-step research report"],
  ],
  "io.pilot.insforge": [
    ["insforge.db_create_table", "Create a Postgres table"],
    ["insforge.db_query", "Query records"],
    ["insforge.db_insert", "Insert records"],
    ["insforge.storage_create_bucket", "Create a storage bucket"],
  ],
  "io.pilot.slipstream": [
    ["slipstream.leaderboard", "Polymarket leaderboard"],
    ["slipstream.signals", "Current market signals"],
    ["slipstream.tape", "Recent market activity"],
    ["slipstream.markets", "Market records"],
  ],
  "io.pilot.generallegal": [
    ["generallegal.formation_start_llc", "File a Delaware LLC"],
    ["generallegal.formation_status", "Poll a filing"],
    ["generallegal.deal_open", "Open a legal matter"],
    ["generallegal.deals_list", "List your matters"],
  ],
  "com.comos-federation.connector": [
    ["comos.search", "Route an intent to platforms"],
    ["comos.platforms", "The platform catalogue"],
    ["comos.agents", "The agent catalogue"],
    ["comos.pricesheet", "Per-operation prices"],
  ],
};

/** What claude-code can already call through pilot-mcp, before any app. */
const BASE_TOOLS = ["pilot_send", "pilot_handshake", "pilot_query", "pilot_inbox"];

/** True of the whole catalogue (docs/app-store, content/pages/app-store.json). */

const platforms = (app: App) => [app.mac && "macOS", app.linux && "Linux"].filter(Boolean).join(" · ");
const installCmd = (app: App) => `pilotctl appstore install ${app.id}`;

/* ---------------- The tour ---------------- */

type Phase = "idle" | "installing" | "verified" | "added";
const IDLE_MS = 800;
const INSTALL_MS = 1500;
const VERIFY_MS = 900;
const HOLD_MS = 3600;

/**
 * Installs the featured apps one after another while the section is on screen. A tap on the shelf (or on Get)
 * takes over: that app installs and the tour stops. Reduced motion shows the installed state and nothing moves.
 */
function useAppTour(running: boolean, reduced: boolean) {
  const [featured, setFeatured] = useState<App>(FEATURED[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [installed, setInstalled] = useState<string[]>([]);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!running || reduced) return;
    let ms = 0;
    let next: () => void;
    if (phase === "idle") {
      if (held) return;
      ms = IDLE_MS;
      next = () => setPhase("installing");
    } else if (phase === "installing") {
      ms = INSTALL_MS;
      next = () => {
        setPhase("verified");
        setInstalled((list) => (list.includes(featured.id) ? list : [...list, featured.id]));
      };
    } else if (phase === "verified") {
      ms = VERIFY_MS;
      next = () => setPhase("added");
    } else {
      if (held) return;
      ms = HOLD_MS;
      next = () => {
        const i = FEATURED.indexOf(featured);
        if (i === -1 || i === FEATURED.length - 1) setInstalled([]); // start the round again, fresh
        setFeatured(FEATURED[(i + 1) % FEATURED.length]);
        setPhase("idle");
      };
    }
    const id = window.setTimeout(next, ms);
    return () => window.clearTimeout(id);
  }, [running, reduced, phase, featured, held]);

  function pick(app: App) {
    setHeld(true);
    setFeatured(app);
    if (reduced || installed.includes(app.id)) {
      setInstalled((list) => (list.includes(app.id) ? list : [...list, app.id]));
      setPhase("added");
    } else {
      setPhase("installing");
    }
  }

  function get() {
    if (phase !== "idle") return;
    setHeld(true);
    setPhase(reduced ? "added" : "installing");
    if (reduced) setInstalled((list) => (list.includes(featured.id) ? list : [...list, featured.id]));
  }

  const shownPhase: Phase = reduced ? "added" : phase;
  const shownInstalled = reduced && !installed.includes(featured.id) ? [...installed, featured.id] : installed;
  return { featured, phase: shownPhase, installed: shownInstalled, held, pick, get };
}

/* ---------------- Pieces ---------------- */

const swap = { animation: "appsd-swap 420ms var(--ease-out) both" } as CSSProperties;

function Ring() {
  return (
    <svg viewBox="0 0 16 16" className="size-[15px] -rotate-90" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" />
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        style={{ animation: `appsd-fill ${INSTALL_MS - 150}ms var(--ease-in-out) both` }}
      />
    </svg>
  );
}

/** The App Store's Get button: Get → filling ring → Installed. */
function GetButton({ app, phase, onGet }: { app: App; phase: Phase; onGet: () => void }) {
  const label = phase === "idle" ? "Get" : phase === "installing" ? "Installing" : "Installed";
  return (
    <button
      type="button"
      onClick={onGet}
      aria-disabled={phase !== "idle"}
      aria-label={phase === "idle" ? `Get ${app.name}` : `${app.name}: ${label}`}
      data-phase={phase}
      className="pressable inline-flex h-9 min-w-[124px] shrink-0 items-center justify-center gap-2 rounded-full bg-(--sky-fill) px-4 text-[14px] font-medium text-white aria-disabled:cursor-default data-[phase=verified]:bg-(--sky-tint) data-[phase=verified]:text-(--sky-accent) data-[phase=added]:bg-(--sky-tint) data-[phase=added]:text-(--sky-accent) data-[phase=installing]:bg-(--sky-tint) data-[phase=installing]:text-(--sky-accent)"
    >
      <span key={label} style={swap} className="inline-flex items-center gap-2">
        {phase === "installing" && <Ring />}
        {(phase === "verified" || phase === "added") && <CheckIcon className="size-[13px]" />}
        {label}
      </span>
    </button>
  );
}

function FeaturedCard({ app, phase, onGet }: { app: App; phase: Phase; onGet: () => void }) {
  const done = phase === "verified" || phase === "added";
  return (
    <div className={`flex h-full flex-col rounded-[20px]! p-5 sm:p-7 ${SKY_CARD}`}>
      <Link key={app.id} href={`/apps/${app.id}`} style={swap} className="group/app flex min-w-0 items-center gap-4 sm:gap-5">
        <img
          src={app.icon}
          alt=""
          width={160}
          height={160}
          className="size-16 shrink-0 rounded-[23%] bg-card shadow-(--shadow-tile) sm:size-20"
        />
        <div className="min-w-0">
          <h3 className="truncate text-[20px] leading-7 font-medium tracking-[-0.02em] text-fg decoration-fg/25 underline-offset-[5px] group-hover/app:underline sm:text-[24px] sm:leading-8">
            {app.name}
          </h3>
          <p className="truncate text-[13px] leading-5 text-mute">
            {app.publisher} · {platforms(app)}
          </p>
        </div>
      </Link>
      <p key={`d-${app.id}`} style={swap} className="mt-5 min-h-[4.5em] text-[15.5px] leading-[1.5] text-pretty text-soft">
        {app.description}
      </p>
      {/* The one command, in full. Wrapped lines hang under the command, not the prompt. */}
      <p key={`c-${app.id}`} style={swap} className="mt-5 flex gap-2 border-t border-edge pt-4 font-mono text-[12.5px] leading-[1.6] text-mute">
        <span aria-hidden className="text-faint select-none">
          $
        </span>
        <span className="min-w-0 break-words">{installCmd(app)}</span>
      </p>
      <div className="mt-auto flex flex-col items-start gap-3 pt-6 sm:flex-row sm:items-center sm:gap-4">
        <GetButton app={app} phase={phase} onGet={onGet} />
        <p key={`${app.id}-${done ? "done" : phase}`} style={swap} className="min-w-0 max-w-full text-[13px] leading-5">
          {done ? (
            <span className="flex items-center gap-1.5 text-(--sky-accent)">
              <CheckIcon className="size-[12px] shrink-0" />
              SHA-256 pinned · signature verified
            </span>
          ) : phase === "installing" ? (
            <span className="text-mute">Checking the SHA-256 and the signature…</span>
          ) : (
            <span className="text-mute">Reviewed and signed before it&apos;s listed</span>
          )}
        </p>
      </div>
    </div>
  );
}

function AgentCard({ app, phase, installed }: { app: App; phase: Phase; installed: string[] }) {
  const added = phase === "added";
  const methods = METHODS[app.id] ?? [];
  const icons = installed.map(byId).slice(-5);
  return (
    <div className={`flex h-full flex-col rounded-[20px]! p-5 sm:p-7 ${SKY_CARD}`}>
      <div className="flex items-center gap-3.5">
        <AppIcon src="/harness/claude-color.svg" size={44} pad className="shadow-(--shadow-tile)!" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[15px] leading-5 text-fg">claude-code</p>
          <p className="text-[13px] leading-5 text-mute">Your agent</p>
        </div>
        <span role="img" aria-label={`${installed.length} apps installed`} className="flex shrink-0 -space-x-2">
          {icons.map((a) => (
            <img
              key={a.id}
              src={a.icon}
              alt=""
              width={56}
              height={56}
              className="size-7 rounded-[23%] bg-card shadow-(--shadow-tile) ring-2 ring-card"
              style={{ animation: "appsd-badge 420ms var(--ease-out) both" }}
            />
          ))}
        </span>
      </div>

      <p className="mt-6 text-[13px] leading-5 text-mute">Can call</p>
      <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12.5px] leading-5 text-soft">
        {BASE_TOOLS.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-edge pt-4">
        <img src={app.icon} alt="" width={40} height={40} className="size-5 rounded-[23%] bg-card" />
        <p className="min-w-0 flex-1 truncate text-[13px] leading-5 text-mute">From {app.name}</p>
        <p
          key={`${app.id}-${added}`}
          style={swap}
          className={`shrink-0 text-[13px] leading-5 ${added ? "text-(--sky-accent)" : "text-mute"}`}
        >
          {added ? `${methods.length} added` : phase === "idle" ? "Not installed" : "Installing…"}
        </p>
      </div>
      {/* Reserved for four rows, so the card never changes height between apps. */}
      <ul key={app.id} className="mt-1 min-h-[176px] sm:min-h-[128px]">
        {methods.map(([name, what], i) => (
          <li
            key={name}
            data-on={added}
            style={{ transitionDelay: added ? `${i * 60}ms` : "0ms" }}
            className="flex flex-col gap-0.5 py-1.5 opacity-30 transition-[opacity,transform] duration-500 ease-(--ease-out) data-[on=false]:translate-x-[-4px] data-[on=true]:opacity-100 motion-reduce:transition-none motion-reduce:data-[on=false]:translate-x-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <span className="min-w-0 truncate font-mono text-[13px] leading-5 text-fg">{name}</span>
            <span className="min-w-0 truncate text-[13px] leading-5 text-mute sm:text-right">{what}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Shelf({ featured, installed, onPick }: { featured: App; installed: string[]; onPick: (app: App) => void }) {
  const ref = useRef<HTMLUListElement>(null);

  // Keep the featured app in view on the shelf (scrolls the shelf only, never the page).
  useEffect(() => {
    const list = ref.current;
    const item = list?.querySelector<HTMLElement>(`[data-id="${featured.id}"]`);
    if (!list || !item) return;
    const left = item.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft + 16 || left + item.offsetWidth > list.scrollLeft + list.clientWidth - 16) {
      list.scrollTo({ left: Math.max(0, left - 24), behavior: "smooth" });
    }
  }, [featured]);

  return (
    <div className="mt-6 sm:mt-8">
      <ul
        ref={ref}
        aria-label="Apps in the App Store"
        className="no-scrollbar flex snap-x gap-1 overflow-x-auto px-1 pt-1 pb-2 [mask-image:linear-gradient(90deg,transparent,black_20px,black_calc(100%-20px),transparent)]"
      >
        {SHELF.map((app) => {
          const on = app.id === featured.id;
          return (
            <li key={app.id} data-id={app.id} className="shrink-0 snap-start first:pl-3 last:pr-3">
              <button
                type="button"
                onClick={() => onPick(app)}
                aria-pressed={on}
                aria-label={`${app.name}: see what it adds`}
                data-on={on}
                className="group flex w-[64px] flex-col items-center gap-1.5 rounded-[14px] pt-1.5 pb-1 sm:w-[72px]"
              >
                <span className="relative block size-11 transition-transform duration-300 ease-(--ease-out) group-hover:-translate-y-0.5 group-active:scale-[0.96] sm:size-12">
                  <img
                    src={app.icon}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="size-full rounded-[23%] bg-card shadow-(--shadow-tile)"
                  />
                  {installed.includes(app.id) && (
                    <span
                      aria-hidden
                      className="appsd-badge absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-(--sky-fill) text-white"
                      style={{ animation: "appsd-badge 420ms var(--ease-out) both" }}
                    >
                      <CheckIcon className="size-[10px]" />
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate text-[11.5px] leading-4 text-soft transition-colors group-data-[on=true]:font-medium group-data-[on=true]:text-fg">
                  {app.name}
                </span>
                <span
                  aria-hidden
                  className="size-1 rounded-full bg-(--sky-fill) opacity-0 transition-opacity duration-300 group-data-[on=true]:opacity-100"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function AppStoreD() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const reduced = usePrefersReducedMotion();
  const { featured, phase, installed, held, pick, get } = useAppTour(inView, reduced);
  const added = phase === "added";

  return (
    <section id="app-store" aria-labelledby="apps-d-title" className="overflow-x-clip pt-10 pb-20 sm:pt-[72px] sm:pb-24 lg:pb-[104px]">
      <div className="wrap">
        <HatchPanel className="px-4 pt-10 pb-6 sm:px-10 sm:pt-14 sm:pb-10 lg:px-[62px] lg:pt-[70px] lg:pb-[64px] xl:px-[86px]">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <Reveal className="max-w-[540px]">
              <h2
                id="apps-d-title"
                className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
              >
                Apps your agent installs <span className="block text-mute">with one command.</span>
              </h2>
              <p className="mt-5 max-w-[508px] text-[17px] leading-[1.5] tracking-[-0.024em] text-pretty text-mute sm:mt-8 sm:text-[18px]">
                Give your agent a Postgres database, a phone number, an inbox, a real Chrome tab or a USDC wallet. Each app
                runs on your machine, next to the daemon.
              </p>
            </Reveal>
            <Reveal delay={80} className="flex shrink-0 flex-wrap gap-2">
              <Button href={LINKS.appStore} className="rounded-[8px]!">
                Browse all {APPS.length} apps
              </Button>
              <SmartLink
                href={LINKS.publish}
                className="appsd-ghost pressable inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-[14px] leading-[21px] font-semibold whitespace-nowrap"
              >
                Publish your app
              </SmartLink>
            </Reveal>
          </div>

          <Reveal delay={60} className="mt-8 sm:mt-10 lg:mt-8">
            <div ref={ref}>
              <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,5fr)_auto_minmax(0,6fr)] lg:gap-5">
                <FeaturedCard app={featured} phase={phase} onGet={get} />
                {/* Install → it can call these. Lights up as the methods land. */}
                <span
                  aria-hidden
                  data-on={added}
                  className="grid size-9 place-items-center self-center justify-self-center rounded-full bg-card text-(--sky-accent) shadow-(--shadow-tile) transition-colors duration-300 data-[on=true]:bg-(--sky-fill) data-[on=true]:text-white"
                >
                  <ArrowRightIcon className="size-3.5 rotate-90 lg:rotate-0" />
                </span>
                <AgentCard app={featured} phase={phase} installed={installed} />
              </div>
              <p className="sr-only" aria-live="polite">
                {held && added ? `${featured.name} installed. claude-code can now call ${METHODS[featured.id]?.length ?? 0} of its methods.` : ""}
              </p>
              <Shelf featured={featured} installed={installed} onPick={pick} />
            </div>
          </Reveal>
        </HatchPanel>
      </div>
    </section>
  );
}
