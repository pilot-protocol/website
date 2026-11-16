"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import { SKY_H2, SkySplit } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { HatchPanel, StepHead } from "@/components/sky/kit";
import { Command, Reveal } from "@/components/ui";
import { PilotMarkP } from "@/components/logo";
import { BrandMark } from "@/components/v4/logos";
import { APPS } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { COSIFT, COSIFT_HELP, LATENCY, byId } from "./data";
import { Glyph, PlatformMarks } from "./parts";

/* eslint-disable @next/next/no-img-element */

// A client component (the sky stepper plays on its own and takes the keyboard). The page picks HowItWorks or SkyHowItWorks.

/** Sky: a flat card with the focal 20px corners (composed: the kit's unlayered `.sky-card` would win over a radius utility). */
const FOCAL = "rounded-[20px] border border-(--sky-card-line) bg-card";

/* From docs/app-store: the discover → install → call loop, the help convention, integrity, metering. */

const LOOP: { n: string; title: string; cmds: string[]; body: ReactNode }[] = [
  {
    n: "1",
    title: "Discover",
    cmds: ["pilotctl appstore catalogue", "pilotctl appstore view io.pilot.cosift"],
    body: "view is the app's detail page: vendor, changelog, size, source, methods and the permissions it asks for, installed or not.",
  },
  {
    n: "2",
    title: "Install",
    cmds: ["pilotctl appstore install io.pilot.cosift"],
    body: "Fetch, verify, install. The daemon spawns the app and keeps it running. No config step.",
  },
  {
    n: "3",
    title: "Call",
    cmds: [`pilotctl appstore call io.pilot.cosift cosift.search '{"q":"raft consensus","k":"5"}'`],
    body: "JSON in, JSON out on stdout. Hints for the next command go to stderr, so the JSON stays pipeable.",
  },
];

const RINGS = [
  { name: "catalogue", seal: "ed25519 signature", fails: "a substituted app list fails" },
  { name: "tarball", seal: "sha256 pinned by the catalogue", fails: "a swapped CDN byte fails" },
  { name: "binary", seal: "sha256 pinned in the signed manifest", fails: "re-checked before every spawn" },
];

/** Three integrity layers, drawn as what they are: each one sealed inside the last. */
function Rings() {
  return (
    <figure className="min-w-0">
      <div className="rounded-[16px] border border-edge-2 p-3 sm:p-4">
        {RINGS.reduceRight<ReactNode>(
          (inner, r, i) => (
            <div className={`rounded-[14px] border ${i === RINGS.length - 1 ? "border-lime-ink/60 bg-lime/[0.04]" : "border-edge-2"} p-3 sm:p-4`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-mono text-[12.5px] text-fg">
                  <span className="mr-2 text-dim">{i + 1}</span>
                  {r.name}
                </p>
                <p className="font-mono text-[11.5px] text-dim">{r.seal}</p>
              </div>
              <p className="mt-1 font-mono text-[11.5px] text-faint">{r.fails}</p>
              {inner && <div className="mt-3 sm:mt-4">{inner}</div>}
            </div>
          ),
          null,
        )}
      </div>
      <figcaption className="mt-3 font-mono text-[11.5px] text-dim">Every install checks all three, outside in.</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site                                                            */
/* ------------------------------------------------------------------ */

const COSIFT_APP = byId(COSIFT.id);
const BY_NAME = [...APPS].sort((a, b) => a.name.localeCompare(b.name));
/** The first rows of the catalogue, A to Z: Cosift is the fifth. */
const CATALOGUE_ROWS = BY_NAME.slice(0, 7);

/** Each step's sentence, with the command names set as code. The words are the same as LOOP's. */
const SKY_BODY: ReactNode[] = [
  <>
    <code className="font-mono text-[0.9em] text-soft">view</code> is the app&apos;s detail page: vendor, changelog, size, source,
    methods and the permissions it asks for, installed or not.
  </>,
  LOOP[1].body,
  LOOP[2].body,
];

/** How long each step stays up while the loop plays on its own: long enough for its picture to finish. */
const DWELL = [4800, 5000, 5000];

/** A tile on the sky diagrams: white, the tile shadow, 12px corners. */
const TILE = "grid shrink-0 place-items-center rounded-[12px] bg-card shadow-tile";

/** Plays a short sequence once per mount: 0, 1, 2 … `steps`, one every `ms`. With reduced motion it starts at the end. */
function useSequence(steps: number, ms: number, delay = 0) {
  const reduced = usePrefersReducedMotion();
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduced || k >= steps) return;
    const id = window.setTimeout(() => setK((v) => v + 1), k === 0 ? delay || ms : ms);
    return () => window.clearTimeout(id);
  }, [k, steps, ms, delay, reduced]);
  return reduced ? steps : k;
}

/** Step 1: the catalogue, then Cosift's detail page as `view` shows it. */
function DiscoverPanel() {
  const k = useSequence(2, 450, 300);
  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,230px)_minmax(0,1fr)] sm:gap-6">
      <ul aria-label="The catalogue, A to Z" className="overflow-hidden rounded-[12px] border border-(--sky-card-line) max-sm:hidden">
        {CATALOGUE_ROWS.map((a, i) => {
          const on = a.id === COSIFT.id && k >= 1;
          return (
            <li
              key={a.id}
              data-on={on}
              style={{ animationDelay: `${i * 40}ms` }}
              className="flex items-center gap-2.5 border-b border-(--sky-card-line) px-3 py-2 transition-colors duration-300 last:border-b-0 data-[on=true]:bg-(--sky-tint) motion-safe:animate-[row-in_400ms_var(--ease-out)_both]"
            >
              <img src={a.icon} alt="" width={24} height={24} className="size-6 shrink-0 rounded-[23%] shadow-tile" />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[13px] leading-[18px] ${on ? "font-medium text-fg" : "text-soft"}`}>{a.name}</span>
                <span className="block truncate font-mono text-[11px] leading-4 text-mute">{a.id}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div
        data-on={k >= 2}
        className="rounded-[12px] border border-(--sky-card-line) p-4 transition-[opacity,translate] duration-500 ease-(--ease-out) data-[on=false]:translate-y-1.5 data-[on=false]:opacity-0 sm:p-5"
      >
        <div className="flex items-center gap-4">
          <img src={COSIFT_APP.icon} alt="" width={56} height={56} className="size-14 shrink-0 rounded-[23%] shadow-tile" />
          <div className="min-w-0">
            <p className="text-[19px] leading-6 font-medium tracking-[-0.02em] text-fg">{COSIFT_APP.name}</p>
            <p className="mt-0.5 text-[13px] text-mute">{COSIFT_APP.publisher}</p>
          </div>
        </div>
        <p className="mt-3.5 text-[14px] leading-[1.5] text-soft">{COSIFT_APP.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-y-3 border-y border-(--sky-card-line) py-3 sm:grid-cols-4">
          {(
            [
              ["Version", COSIFT.version],
              ["Size", COSIFT.size],
              ["Methods", String(COSIFT.methods.length)],
              ["Runs on", <PlatformMarks key="p" mac={COSIFT_APP.mac} linux={COSIFT_APP.linux} />],
            ] as [string, ReactNode][]
          ).map(([k2, v]) => (
            <div key={k2} className="min-w-0">
              <dt className="text-[12px] leading-4 text-mute">{k2}</dt>
              <dd className="mt-1 flex h-5 items-center text-[14px] font-medium text-fg tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <ul aria-label="Methods" className="mt-3.5 flex flex-wrap gap-1.5">
          {COSIFT.methods.map((m) => (
            <li key={m} className="rounded-[6px] bg-fg/[0.05] px-1.5 py-[3px] font-mono text-[11.5px] leading-4 text-soft">
              cosift.{m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Step 2's nodes: the bundle, the three integrity layers outside in, then the app running under the daemon. */
const INSTALL_NODES: { name: string; fact: string; glyph?: keyof typeof Glyph }[] = [
  { name: "Bundle", fact: "io.pilot.cosift", glyph: "box" },
  { name: "Catalogue", fact: "Ed25519 signature", glyph: "seal" },
  { name: "Tarball", fact: "SHA-256 pinned by the catalogue", glyph: "hash" },
  { name: "Binary", fact: "SHA-256 pinned in the manifest", glyph: "hash" },
  { name: "Running", fact: "Spawned by the daemon" },
];

/** Step 2: the bundle passes each integrity layer in turn, and the daemon starts it. */
function InstallPanel() {
  const k = useSequence(INSTALL_NODES.length - 1, 650, 350);
  const last = INSTALL_NODES.length - 1;
  return (
    <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-5 sm:gap-2 sm:py-6">
      {/* The path: down the left on phones, across the middle of the tiles from sm up. Fills as the bundle moves on. */}
      <span aria-hidden className="absolute top-6 bottom-6 left-6 w-px bg-(--sky-card-line) sm:top-[48px] sm:right-[10%] sm:bottom-auto sm:left-[10%] sm:h-px sm:w-auto">
        <span
          className="block size-full origin-top bg-(--sky-fill) transition-transform duration-500 ease-(--ease-out) sm:origin-left max-sm:[transform:scaleY(var(--f))] sm:[transform:scaleX(var(--f))]"
          style={{ "--f": k / last } as CSSProperties}
        />
      </span>
      {INSTALL_NODES.map((n, i) => {
        const passed = i <= k;
        const G = n.glyph ? Glyph[n.glyph] : null;
        return (
          <li key={n.name} className="relative flex items-center gap-4 sm:flex-col sm:gap-0 sm:text-center">
            <span
              data-on={passed}
              className={`${TILE} relative size-12 transition-[background-color,color,box-shadow] duration-300 ${
                G ? "text-mute data-[on=true]:bg-(--sky-fill) data-[on=true]:text-white" : ""
              }`}
            >
              {G && <G className="size-[22px]" />}
              {i === last && (
                <img
                  src={COSIFT_APP.icon}
                  alt=""
                  width={48}
                  height={48}
                  className={`size-12 rounded-[12px] transition-[opacity,filter] duration-300 ${passed ? "" : "opacity-40 grayscale"}`}
                />
              )}
              {G && i > 0 && passed && (
                <span className="absolute -right-1 -bottom-1 grid size-[18px] place-items-center rounded-full bg-card text-(--sky-fill) shadow-tile">
                  <CheckIcon className="size-[11px]" />
                </span>
              )}
              {i === last && passed && (
                <span aria-hidden className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-[#22c55e]" />
              )}
            </span>
            <span className="min-w-0 sm:mt-3.5 sm:px-1">
              <span className={`block text-[14px] leading-5 font-medium transition-colors duration-300 ${passed ? "text-fg" : "text-mute"}`}>{n.name}</span>
              <span className={`mt-0.5 block text-[12.5px] leading-[17px] text-mute ${i === 0 ? "font-mono text-[11.5px]" : ""}`}>{n.fact}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Half a tile: the wires run from tile edge to tile edge. */
const HALF = 24;

/** The width of an element, kept current as it resizes (0 until it's measured). */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/**
 * Step 3: on your machine, the call goes from your agent through the daemon to the app and back, as the shared beam
 * along each wire: out over pilotctl and local IPC, back the same way, then the reply is in. It waits off screen; with
 * reduced motion there's no beam and the reply simply shows.
 */
function CallPanel() {
  // 0: agent to daemon · 1: daemon to app · 2: app to daemon · 3: daemon to agent · 4: the reply is in.
  const [k, setK] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [row, w] = useWidth<HTMLDivElement>();
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const at = reduced ? 4 : k;

  // Once the reply has been up a while, ask again, while the panel is on screen.
  useEffect(() => {
    if (reduced || k !== 4 || !inView) return;
    const id = window.setTimeout(() => {
      setCycle((c) => c + 1);
      setK(0);
    }, 2400);
    return () => window.clearTimeout(id);
  }, [k, inView, reduced]);

  // The two wires in the row's own pixels, at the tiles' centre line.
  const c = [w / 6, w / 2, (5 * w) / 6];
  const wires = [0, 1].map((i) => `M ${c[i] + HALF} ${HALF} H ${c[i + 1] - HALF}`);
  const tail = Math.max(16, Math.min(72, (w / 3 - 2 * HALF) * 0.6));
  // Each wire plays when its leg starts: out, then back (reversed). Between its legs its run stays put.
  const runA = w ? cycle * 2 + (k >= 3 ? 1 : 0) : null;
  const runB = w && k >= 1 ? cycle * 2 + (k >= 2 ? 1 : 0) : null;

  const nodes = [
    { name: "Your agent", tile: <BrandMark brand="claude" className="size-6" /> },
    { name: "Daemon", tile: <PilotMarkP className="h-[19px] w-auto text-(--sky-fill)" /> },
    { name: COSIFT_APP.name, tile: <img src={COSIFT_APP.icon} alt="" width={48} height={48} className="size-12 rounded-[12px]" /> },
  ];
  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="rounded-[12px] bg-fg/[0.03] px-4 pt-3 pb-5 sm:px-6">
        <p className="text-[12.5px] text-mute">Your machine</p>
        <div ref={row} className="relative mt-4 grid grid-cols-3">
          {w > 0 && (
            <svg aria-hidden className="absolute top-0 left-0 overflow-visible" width={w} height={HALF * 2}>
              {wires.map((d) => (
                <path key={d} d={d} className="stroke-fg/15" strokeWidth={1} fill="none" />
              ))}
              <Beam
                d={wires[0]}
                run={runA}
                reverse={k >= 3}
                duration={900}
                tail={tail}
                width={2}
                onArrive={() => setK((v) => (v === 0 ? 1 : v === 3 ? 4 : v))}
              />
              <Beam
                d={wires[1]}
                run={runB}
                reverse={k >= 2}
                duration={900}
                tail={tail}
                width={2}
                onArrive={() => setK((v) => (v === 1 ? 2 : v === 2 ? 3 : v))}
              />
            </svg>
          )}
          {/* The wires' names: pilotctl from the agent to the daemon, local IPC on to the app. */}
          {(["pilotctl", "local IPC"] as const).map((label, i) => (
            <span
              key={label}
              aria-hidden
              className="absolute top-[2px] -translate-x-1/2 font-mono text-[11px] whitespace-nowrap text-mute max-sm:hidden"
              style={{ left: `${33.33 * (i + 1)}%` }}
            >
              {label}
            </span>
          ))}
          {nodes.map((n) => (
            <div key={n.name} className="relative flex flex-col items-center">
              <span className={`${TILE} size-12 overflow-hidden`}>{n.tile}</span>
              <span className="mt-2 text-[13px] leading-5 font-medium text-fg">{n.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-[12px] border border-(--sky-card-line) p-4">
          <p className="text-[12.5px] text-mute">JSON in</p>
          <pre className="mt-2.5 font-mono text-[12.5px] leading-[22px] text-fg">
            {"{\n  "}
            <span className="text-(--sky-accent)">&quot;q&quot;</span>: &quot;raft consensus&quot;,{"\n  "}
            <span className="text-(--sky-accent)">&quot;k&quot;</span>: &quot;5&quot;{"\n}"}
          </pre>
        </div>
        <div className="rounded-[12px] border border-(--sky-card-line) p-4">
          <p className="flex items-baseline justify-between gap-3 text-[12.5px] text-mute">
            <span>JSON out, on stdout</span>
            <span>5 ranked URLs</span>
          </p>
          <ol aria-label="Five ranked results, each a URL and an excerpt" className="mt-2.5 flex flex-col gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <li
                key={i}
                data-on={at >= 4}
                style={{ transitionDelay: at >= 4 ? `${i * 70}ms` : "0ms" }}
                className="grid grid-cols-[14px_minmax(0,1fr)] items-center gap-2 transition-opacity duration-300 ease-(--ease-out) data-[on=false]:opacity-25"
              >
                <span className="font-mono text-[11px] leading-4 text-mute tabular-nums">{i + 1}</span>
                <span aria-hidden className="flex items-center gap-1.5">
                  <span className="h-[7px] rounded-full bg-(--sky-fill)/45" style={{ width: `${30 + ((i * 17) % 22)}%` }} />
                  <span className="h-[7px] flex-1 rounded-full bg-fg/[0.08]" />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

const PANELS = [DiscoverPanel, InstallPanel, CallPanel];

/**
 * Sky: discover, install, call as the kit's stepper (Figma 180:5935): the three heads are tabs, and under them one
 * window shows the step as it happens, with its commands to copy. It plays through on its own while it's on screen,
 * and stops on the step you pick.
 */
function SkyLoop() {
  const [on, setOn] = useState(0);
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-20% 0px" });
  const reduced = usePrefersReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!inView || held || reduced) return;
    const id = window.setTimeout(() => setOn((v) => (v + 1) % LOOP.length), DWELL[on]);
    return () => window.clearTimeout(id);
  }, [inView, held, reduced, on]);

  const pick = (i: number) => {
    setHeld(true);
    setOn(i);
  };
  function onKey(e: KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const n = LOOP.length;
    const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (on + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    pick(next);
    tabs.current[next]?.focus();
  }

  const Panel = PANELS[on];
  return (
    <div ref={ref} className="mt-12 sm:mt-14">
      <div role="tablist" aria-label="Discover, install, call" onKeyDown={onKey} className="mx-auto grid max-w-[880px] grid-cols-3">
        {LOOP.map((s, i) => (
          <button
            key={s.n}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`as-loop-tab-${i}`}
            aria-selected={on === i}
            aria-controls="as-loop-panel"
            tabIndex={on === i ? 0 : -1}
            onClick={() => pick(i)}
            className="pressable rounded-[12px] py-1 outline-none focus-visible:ring-2 focus-visible:ring-(--sky-accent)"
          >
            <StepHead n={i + 1} title={s.title} on={on === i} last={i === LOOP.length - 1} />
          </button>
        ))}
      </div>

      <div id="as-loop-panel" role="tabpanel" aria-labelledby={`as-loop-tab-${on}`} className="mx-auto mt-6 max-w-[880px]">
        <p key={`body-${on}`} className="mx-auto max-w-[560px] text-center text-[15px] leading-[1.55] text-pretty text-mute motion-safe:animate-[row-in_400ms_var(--ease-out)_both]">
          {SKY_BODY[on]}
        </p>
        <div className={`mt-6 overflow-hidden ${FOCAL}`}>
          {/* The step's commands, to copy, on white chips above its picture. */}
          <div className="flex flex-col gap-2 border-b border-(--sky-card-line) bg-fg/[0.02] p-3 sm:flex-row sm:p-4 [--color-bg-deep:var(--color-card)] [&>*]:min-w-0 [&>*]:flex-1">
            {LOOP[on].cmds.map((c) => (
              <Command key={c} value={c} prefix="$ " label="Copy command" />
            ))}
          </div>
          <div key={`panel-${on}`} className="p-4 sm:p-7">
            <Panel />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sky: what `cosift.help` tells an agent, drawn as what it's for: each method against the time it takes, so the
 * cheapest call that fits is plain to see.
 */
function HelpReply() {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });
  const reduced = usePrefersReducedMotion();
  const grown = inView || reduced;
  const rest = COSIFT.methods.filter((m) => !COSIFT_HELP.some((h) => h.method === `cosift.${m}`));
  return (
    <figure ref={ref} className={`w-full max-w-[520px] min-w-0 overflow-hidden ${FOCAL}`}>
      <div className="border-b border-(--sky-card-line) bg-fg/[0.02] p-3 [--color-bg-deep:var(--color-card)]">
        <Command value="pilotctl appstore call io.pilot.cosift cosift.help '{}'" prefix="$ " label="Copy command" />
      </div>
      <div className="px-4 pt-4 pb-5 sm:px-6 sm:pt-5">
        {/* The latency classes as three columns of one time axis. */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-4">
          <p className="self-end text-[12.5px] text-mute">Method</p>
          <div className="grid grid-cols-3">
            {LATENCY.map((l) => (
              <p key={l.name} className="border-l border-dashed border-fg/15 pl-2">
                <span className="block text-[13px] leading-5 font-medium text-fg">{l.name}</span>
                <span className="block text-[11.5px] leading-4 text-mute">{l.range}</span>
              </p>
            ))}
          </div>
        </div>
        <ul className="mt-3 flex flex-col">
          {COSIFT_HELP.map((h, i) => (
            <li key={h.method} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-x-4 border-t border-(--sky-card-line) py-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[12.5px] leading-5 text-fg">{h.method}</p>
                <p className="font-mono text-[11.5px] leading-4 text-mute">{h.params.join(", ")}</p>
              </div>
              <div className="relative grid h-7 grid-cols-3 items-center" aria-label={`${LATENCY[h.latency].name}, ${LATENCY[h.latency].range}`} role="img">
                {[0, 1, 2].map((c) => (
                  <span key={c} aria-hidden className="h-full border-l border-dashed border-fg/15" />
                ))}
                <span
                  aria-hidden
                  className="absolute inset-y-[7px] left-0 origin-left rounded-full bg-(--sky-fill) transition-transform duration-700 ease-(--ease-out)"
                  style={{ width: `${((h.latency + 1) / 3) * 100}%`, transform: `scaleX(${grown ? 1 : 0})`, transitionDelay: `${150 + i * 120}ms` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-(--sky-card-line) pt-3.5">
          <span className="mr-1 text-[12.5px] text-mute">{rest.length} more</span>
          {rest.map((m) => (
            <span key={m} className="rounded-[6px] bg-fg/[0.05] px-1.5 py-[3px] font-mono text-[11.5px] leading-4 text-soft">
              {m}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

/** Sky: the help convention and the pricing beside what the help call returns, as a split section. */
function SkyHelp() {
  return (
    <SkySplit
      labelledBy="help-title"
      className="mt-20 sm:mt-28"
      text={
        <Reveal className="flex flex-col">
          <h3 id="help-title" className={SKY_H2}>
            Every app <span className="block text-mute">explains itself.</span>
          </h3>
          <p className="mt-5 max-w-[500px] text-[16px] leading-[1.55] text-mute sm:text-[17px]">
            By convention each app has a <code className="font-mono text-[14.5px] text-soft">&lt;app&gt;.help</code> method: one
            local call, no backend round-trip, that returns every method with its parameters and a latency class, so an agent
            picks the cheapest call that fits before spending a slow one.
          </p>
          <div className="mt-10 border-t border-(--sky-card-line) pt-8">
            <h4 className="text-[20px] leading-tight font-medium tracking-[-0.025em] text-fg">Mostly free.</h4>
            <p className="mt-3 max-w-[500px] text-[15.5px] leading-[1.55] text-mute">
              Most apps run locally and cost nothing. A few call a paid partner API through Pilot&apos;s broker and draw on a
              USD 5 budget per user, per app. Only successful paid calls count, reads are free, and{" "}
              <code className="font-mono text-[14px] text-soft">&lt;app&gt;.balance</code> shows what&apos;s left. Each
              app&apos;s page lists its prices.
            </p>
          </div>
        </Reveal>
      }
      visual={
        <Reveal delay={100} className="flex w-full justify-center">
          <HelpReply />
        </Reveal>
      }
    />
  );
}

/**
 * Sky: the whole "how it works" section. The loop on a hatch panel with the heading inside it, then the help
 * convention and pricing beside the help call's reply, as a split.
 */
export function SkyHowItWorks({ heading }: { heading: ReactNode }) {
  return (
    <>
      <div className="wrap">
        <HatchPanel className="px-5 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-[72px]">
          {heading}
          <SkyLoop />
        </HatchPanel>
      </div>
      <SkyHelp />
    </>
  );
}

export function HowItWorks() {
  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <Reveal as="ol" className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge lg:grid-cols-3">
        {LOOP.map((s) => (
          <li key={s.n} className="flex min-w-0 flex-col bg-bg p-6 sm:p-7">
            <p className="flex items-center gap-3">
              <span className="grid size-[22px] place-items-center bg-lime font-mono text-[11px] font-medium text-ink">{s.n}</span>
              <span className="text-[18px] font-medium tracking-[-0.02em] text-fg">{s.title}</span>
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {s.cmds.map((c) => (
                <Command key={c} value={c} prefix="$ " label="Copy command" />
              ))}
            </div>
            <p className="mt-5 text-[14.5px] leading-[1.55] text-mute">{s.body}</p>
          </li>
        ))}
      </Reveal>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal className="flex flex-col gap-10">
          <div>
            <h3 className="text-[22px] leading-tight font-medium tracking-[-0.025em] text-fg">Every app explains itself.</h3>
            <p className="mt-3 text-[15.5px] leading-[1.55] text-mute">
              By convention each app has a <code className="font-mono text-[14px] text-soft">&lt;app&gt;.help</code> method: one
              local call, no backend round-trip, that returns every method with its parameters and a latency class, so an agent
              picks the cheapest call that fits before spending a slow one.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[11.5px]">
              {["fast", "med", "slow"].map((l, i) => (
                <span key={l} className="flex items-center gap-2 rounded-md border border-edge-2 px-2 py-1 text-soft">
                  <span aria-hidden className="flex gap-[2px]">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className={`h-2 w-[3px] ${k <= i ? "bg-lime" : "bg-fg/15"}`} />
                    ))}
                  </span>
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[22px] leading-tight font-medium tracking-[-0.025em] text-fg">Mostly free.</h3>
            <p className="mt-3 text-[15.5px] leading-[1.55] text-mute">
              Most apps run locally and cost nothing. A few call a paid partner API through Pilot&apos;s broker and draw on a
              USD 5 budget per user, per app. Only successful paid calls count, reads are free, and{" "}
              <code className="font-mono text-[14px] text-soft">&lt;app&gt;.balance</code> shows what&apos;s left. Each
              app&apos;s page lists its prices.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Rings />
        </Reveal>
      </div>
    </div>
  );
}
