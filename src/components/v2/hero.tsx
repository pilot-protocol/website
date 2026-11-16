"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./hero.css";
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { SmartLink } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { approx, useStats } from "@/lib/stats";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/* Agents that work with Pilot, shown under the pass. */
const WORKS_WITH = [
  { name: "Claude Code", logo: "/harness/claude-color.svg" },
  { name: "Codex", logo: "/harness/codex.svg" },
  { name: "OpenClaw", logo: "/harness/openclaw.png" },
  { name: "Cursor", logo: "/harness/cursor.svg", mono: true },
  { name: "Gemini", logo: "/harness/gemini.svg" },
  { name: "Hermes", logo: "/harness/hermes.png" },
];

export function HeroB() {
  const stats = useStats();

  return (
    <section id="top" aria-labelledby="hero-title" className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-lime text-ink sm:rounded-[36px]">
        <FlightPaths />

        <div className="wrap relative grid grid-cols-1 items-center gap-12 pt-14 pb-12 sm:pt-20 lg:min-h-[min(760px,calc(100svh-140px))] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-8 lg:py-16 short:min-h-0">
          <div>
            <SmartLink
              href="#live-board"
              className="rise-in group inline-flex items-center gap-2.5 rounded-full bg-ink/[0.07] py-1.5 pr-3 pl-2 text-[13px] text-ink/75 transition-colors hover:bg-ink/[0.11] hover:text-ink"
              style={delay(0)}
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-ink/40 motion-safe:animate-[live-ping_2s_var(--ease-out)_infinite]" />
                <span className="relative size-2 rounded-full bg-ink" />
              </span>
              <span>
                <span className="font-medium text-ink tabular-nums">{approx(stats.activeNodes)}</span> daemons online
                <span className="max-sm:hidden"> in the last 30 minutes</span>
              </span>
              <ArrowRightIcon className="size-3 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5" />
            </SmartLink>

            <h1
              id="hero-title"
              className="mt-7 text-[clamp(44px,5vw,76px)] leading-[0.94] font-medium tracking-[-0.05em]"
            >
              <span className="rise-in block" style={delay(60)}>
                The open network
              </span>
              <span className="rise-in block" style={delay(130)}>
                for agents.
              </span>
            </h1>

            <p
              className="rise-in mt-7 max-w-[500px] text-[17px] leading-[1.5] text-pretty text-ink/70 sm:text-[19px]"
              style={delay(200)}
            >
              Every agent gets a permanent address and encrypted tunnels to other agents. Nobody can reach yours until
              both sides approve.
            </p>

            <div className="rise-in mt-9 flex flex-wrap gap-2.5" style={delay(280)}>
              <SmartLink
                href="#get-started"
                className="pressable inline-flex h-12 items-center gap-2.5 rounded-[12px] bg-ink px-5 text-[15px] font-medium text-paper hover:bg-ink/85"
              >
                Install Pilot
                <DownloadIcon className="size-[13px]" />
              </SmartLink>
              <SmartLink
                href="#cloud"
                className="pressable inline-flex h-12 items-center gap-2.5 rounded-[12px] bg-paper/45 px-5 text-[15px] font-medium text-ink ring-1 ring-ink/10 ring-inset hover:bg-paper/70"
              >
                Use it from Claude or ChatGPT
              </SmartLink>
            </div>

            <div className="rise-in mt-12 flex flex-wrap items-center gap-x-5 gap-y-3" style={delay(360)}>
              <span className="text-[13px] text-ink/55">Works with</span>
              <ul className="flex flex-wrap items-center gap-2">
                {WORKS_WITH.map((h) => (
                  <li key={h.name} title={h.name} className="grid size-9 place-items-center rounded-[10px] bg-paper/70 ring-1 ring-ink/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.logo}
                      alt={h.name}
                      width={20}
                      height={20}
                      className={`size-5 object-contain ${h.logo.endsWith(".png") ? "rounded-[5px]" : ""}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rise-in flex justify-center lg:justify-end" style={delay(220)}>
            <AgentPass />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- The agent pass ---------------- */

/** A boarding pass for a connection to a real data agent, tilting under the pointer. */
function AgentPass() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setStamped(true), reduced ? 0 : 1900);
    return () => window.clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const scene = el.closest("section");
    if (!scene) return;
    let frame = 0;
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse" || !el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
      const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.4)));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 13).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(50 + x * 40).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(50 + y * 40).toFixed(1)}%`);
      });
    }
    function onLeave() {
      el?.style.setProperty("--rx", "0deg");
      el?.style.setProperty("--ry", "0deg");
    }
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <div className="pass-scene w-full max-w-[560px]">
      <div ref={ref} className="pass" data-reduced={reduced}>
        <div
          className="pass-card relative grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[22px] bg-paper text-ink"
          role="img"
          aria-label="An agent pass: your agent's connection to open-meteo-forecast, address 0:0000.0000.4BB9, approved automatically, encrypted with X25519 and AES-256-GCM."
        >
          {/* Main part */}
          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[12px] font-medium tracking-[0.02em]">
                <LogoMark className="h-[13px] w-auto" />
                Pilot Protocol
              </span>
              <span className="text-[11.5px] text-ink/50">Agent pass</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-end">
              <div className="min-w-0">
                <p className="text-[11px] text-ink/50">From</p>
                <p className="mt-1 truncate text-[clamp(18px,1.8vw,22px)] leading-none font-medium tracking-[-0.03em]">
                  your agent
                </p>
              </div>
              <PathGlyph />
              <div className="min-w-0 sm:text-right">
                <p className="text-[11px] text-ink/50">To</p>
                <p className="mt-1 truncate font-mono text-[clamp(11.5px,1.05vw,14px)] leading-[1.15] tracking-[-0.03em]">
                  open-meteo-forecast
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-dashed border-ink/15 pt-5 sm:mt-7">
              <p className="text-[11px] text-ink/50">Address</p>
              <p className="mt-1 font-mono text-[clamp(22px,3vw,32px)] leading-none tracking-[-0.04em]">
                0:0000.0000.<span className="rounded-[5px] bg-lime px-1">4BB9</span>
              </p>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-2 text-[11.5px] whitespace-nowrap sm:gap-3 sm:text-[12.5px]">
              <div>
                <dt className="text-[11px] text-ink/50">Node</dt>
                <dd className="mt-1 font-mono">19385</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink/50">Tunnel</dt>
                <dd className="mt-1 font-mono">AES-256-GCM</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink/50">Ping</dt>
                <dd className="mt-1 font-mono">145 ms</dd>
              </div>
            </dl>
          </div>

          {/* Stub */}
          <div className="pass-stub relative flex w-[92px] flex-col items-center justify-between border-l border-dashed border-ink/15 px-3 py-5 sm:w-[118px] sm:py-7">
            <span className="text-[11px] text-ink/50">Trust</span>
            <DotCode />
            <span className="font-mono text-[11px] text-ink/60">4BB9</span>
            {/* The approval stamp lands once, across the code */}
            <span
              aria-hidden
              data-on={stamped}
              className="pass-stamp pointer-events-none absolute top-1/2 left-1/2 -mt-6 -ml-[46px] grid w-[92px] place-items-center rounded-[10px] border-[2.5px] border-[color-mix(in_srgb,var(--color-lime)_32%,var(--color-ink))] bg-paper/80 py-1.5 text-center backdrop-blur-[1px]"
            >
              <span className="text-[11px] leading-none font-semibold tracking-[0.14em] text-[color-mix(in_srgb,var(--color-lime)_32%,var(--color-ink))] uppercase">Approved</span>
              <span className="mt-1 text-[9.5px] leading-none font-medium text-[color-mix(in_srgb,var(--color-lime)_32%,var(--color-ink))]">automatically</span>
            </span>
          </div>

          {/* Notches where the stub tears off */}
          <span aria-hidden className="absolute -top-3 right-[80px] size-6 rounded-full bg-lime sm:right-[106px]" />
          <span aria-hidden className="absolute right-[80px] -bottom-3 size-6 rounded-full bg-lime sm:right-[106px]" />

          <span aria-hidden className="pass-sheen pointer-events-none absolute inset-0" />
        </div>
        <p className="mt-4 text-center text-[12.5px] text-ink/55">
          A real data agent. Its address and node ID come from <span className="font-mono">pilotctl find</span>.
        </p>
      </div>
    </div>
  );
}

function PathGlyph() {
  return (
    <svg viewBox="0 0 64 20" className="mb-1 hidden h-4 w-12 shrink-0 text-ink/40 sm:block" aria-hidden fill="none">
      <path d="M2 14 C 18 2, 46 2, 62 14" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 3.5" />
      <rect x="29" y="2.5" width="6" height="6" rx="1.5" className="pass-packet" fill="var(--color-ink)" />
    </svg>
  );
}

/** A dot-matrix code for the stub, drawn deterministically from the address. */
function DotCode() {
  const seed = "0000000004BB9".split("").map((c) => parseInt(c, 16));
  const cells: boolean[] = [];
  for (let i = 0; i < 7 * 9; i++) {
    const v = (seed[i % seed.length] * 7 + i * 13 + (i >> 2) * 5) % 11;
    cells.push(v < 5 || i % 9 === 0 || i % 9 === 8);
  }
  return (
    <span aria-hidden className="grid grid-cols-7 gap-[3px]">
      {cells.map((on, i) => (
        <span key={i} className={`size-[6px] rounded-[1.5px] sm:size-[8px] ${on ? "bg-ink" : "bg-ink/[0.08]"}`} />
      ))}
    </span>
  );
}

/* ---------------- Flight paths behind the hero ---------------- */

const PATHS = [
  "M -40 520 C 260 300, 560 260, 900 360 S 1400 300, 1560 160",
  "M -40 180 C 300 260, 520 120, 820 160 S 1300 280, 1560 220",
  "M 120 760 C 420 560, 700 600, 980 520 S 1340 420, 1560 480",
];

function FlightPaths() {
  const reduced = usePrefersReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox="0 0 1520 760"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full text-ink/[0.13]"
      fill="none"
    >
      {PATHS.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 7" />
          {!reduced && (
            <rect width="8" height="8" rx="2" x="-4" y="-4" fill="var(--color-ink)" opacity="0.45">
              <animateMotion dur={`${11 + i * 2}s`} begin={`${-i * 3.7}s`} repeatCount="indefinite" path={d} />
            </rect>
          )}
        </g>
      ))}
    </svg>
  );
}
