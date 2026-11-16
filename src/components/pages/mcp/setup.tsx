"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FLAT_CARD, NumberedList, SKY, SkySplit } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Command, Reveal } from "@/components/ui";
import { BRAND_OF, BrandMark } from "@/components/v4/logos";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/* The clients `pilotprotocol-mcp setup` looks for (docs/pilot-mcp). */
const CLIENTS = [
  "Claude Code",
  "Cursor",
  "Cline",
  "Continue",
  "Codex CLI",
  "Gemini CLI",
  "GitHub Copilot CLI",
  "Junie",
  "Hermes",
  "OpenHands",
  "OpenClaw",
  "PicoClaw",
];

const ROW = 40;
const FAN_W = 150;
const STEP_MS = 420;

/** How many clients setup has written so far in this pass: runs 0 → 12 while on screen, holds, then starts again. */
function useFan() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(CLIENTS.length);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(
      () => setDone((d) => (d >= CLIENTS.length ? 0 : d + 1)),
      done >= CLIENTS.length ? 2600 : done === 0 ? 500 : STEP_MS,
    );
    return () => window.clearTimeout(t);
  }, [inView, reduced, done]);

  return { ref, shown: reduced ? CLIENTS.length : done };
}

/** What `setup` does, in order (docs/pilot-mcp). */
const STEPS = [
  { title: "Installs the Pilot runtime", body: "If it’s missing, checked against its SHA-256." },
  { title: "Starts the daemon", body: "In compat mode through the proxy if you’re behind an HTTPS proxy." },
  { title: "Adds a “pilot” MCP server", body: "To each client it finds, pinned to the current release." },
];

/** The wires from the command out to each client, lit as setup reaches it. */
function Fan({ shown, className = "" }: { shown: number; className?: string }) {
  const h = CLIENTS.length * ROW;
  const mid = h / 2;
  return (
    <svg aria-hidden viewBox={`0 0 ${FAN_W} ${h}`} className={`h-[480px] w-[150px] ${className}`} preserveAspectRatio="none">
      {CLIENTS.map((c, i) => {
        const y = i * ROW + ROW / 2;
        const d = `M0 ${mid} C${FAN_W * 0.55} ${mid} ${FAN_W * 0.45} ${y} ${FAN_W} ${y}`;
        const lit = i < shown;
        return (
          <g key={c}>
            <path d={d} fill="none" className="stroke-fg" strokeOpacity={0.16} strokeWidth={1} />
            <path
              d={d}
              fill="none"
              className="stroke-(--sky-fill)"
              strokeWidth={1.4}
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={lit ? 0 : 100}
              style={{ transition: lit ? "stroke-dashoffset 380ms var(--ease-out)" : "none" }}
            />
            {/* The write landing in this client: a beam out along its wire as it lights. */}
            <Beam d={d} run={i === shown - 1 ? shown : null} duration={420} tail={40} width={1.4} />
          </g>
        );
      })}
      <circle cx="4" cy={mid} r="4" className="fill-(--sky-fill)" />
    </svg>
  );
}

/**
 * Sky site: a split section (Figma 218:22895). The heading, the command and what it does on the paper half; on the
 * hatched half the command fans out from the divider to every client it finds.
 */
function SkySetup({ head }: { head?: ReactNode }) {
  const { ref, shown } = useFan();
  return (
    <SkySplit
      labelledBy="setup-title"
      text={
        <>
          {head}
          <Reveal delay={60} className="mt-10">
            <p className="text-[13px] leading-5 text-mute">Needs Node 18 or later</p>
            <Command value="npx -y pilotprotocol-mcp setup" prefix="npx " className="mt-3 w-full bg-card!" label="Copy setup command">
              -y pilotprotocol-mcp setup
            </Command>
            <NumberedList items={STEPS} className="mt-8" />
          </Reveal>
        </>
      }
      visual={
        <div ref={ref} className="flex w-full items-center">
          <Fan shown={shown} className="-ml-12 hidden shrink-0 lg:block" />
          <SkyClients shown={shown} />
        </div>
      }
    />
  );
}

/** One command fans out to every client it finds and writes a "pilot" server into each. `head` (sky only) is the heading. */
export function Setup({ head }: { head?: ReactNode }) {
  if (SKY) return <SkySetup head={head} />;
  return <GreenSetup />;
}

function GreenSetup() {
  const { ref, shown } = useFan();
  const h = CLIENTS.length * ROW;
  const mid = h / 2;

  return (
    <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_150px_minmax(0,360px)] lg:items-center lg:gap-0">
      <div className="lg:pr-10">
        <p className="font-mono text-[12px] text-dim">Needs Node 18 or later</p>
        <Command value="npx -y pilotprotocol-mcp setup" prefix="npx " className="mt-3 w-full max-w-[460px]" label="Copy setup command">
          -y pilotprotocol-mcp setup
        </Command>
        <ol className="mt-6 flex max-w-[460px] flex-col gap-2.5 text-[14.5px] leading-[1.5] text-mute">
          {[
            "Installs the Pilot runtime if it’s missing, checked against its SHA-256.",
            "Starts the daemon, in compat mode through the proxy if you’re behind an HTTPS proxy.",
            "Adds a “pilot” MCP server to each client it finds, pinned to the current release.",
          ].map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="w-5 shrink-0 font-mono text-[12px] leading-[1.9] text-dim">0{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* The fan, wide screens only: one wire per client, lit as setup reaches it. */}
      <svg aria-hidden viewBox={`0 0 ${FAN_W} ${h}`} className="hidden h-[480px] w-[150px] lg:block" preserveAspectRatio="none">
        {CLIENTS.map((c, i) => {
          const y = i * ROW + ROW / 2;
          const d = `M0 ${mid} C${FAN_W * 0.55} ${mid} ${FAN_W * 0.45} ${y} ${FAN_W} ${y}`;
          const lit = i < shown;
          return (
            <g key={c}>
              <path d={d} fill="none" className="stroke-fg" strokeOpacity={0.16} strokeWidth={1} />
              <path
                d={d}
                fill="none"
                className="stroke-lime-ink"
                strokeWidth={1.4}
                pathLength={100}
                strokeDasharray="100 100"
                strokeDashoffset={lit ? 0 : 100}
                style={{ transition: lit ? "stroke-dashoffset 380ms var(--ease-out)" : "none" }}
              />
            </g>
          );
        })}
        <rect x="0" y={mid - 4} width="8" height="8" className="fill-lime" />
      </svg>

      <div>
        <p className="mb-3 font-mono text-[12px] text-dim lg:hidden">Clients it looks for</p>
        <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-1">
          {CLIENTS.map((c, i) => {
            const lit = i < shown;
            return (
              <li key={c} className="flex h-10 items-center justify-between gap-3 border-b border-edge lg:border-b-0 lg:pl-4">
                <span className={`truncate text-[14.5px] transition-colors duration-300 ${lit ? "text-fg" : "text-dim"}`}>{c}</span>
                <span
                  className={`shrink-0 font-mono text-[11.5px] transition-[opacity,transform] duration-300 ease-(--ease-out) ${
                    lit ? "translate-x-0 text-lime-ink opacity-100" : "-translate-x-1 opacity-0"
                  }`}
                >
                  <span className="max-sm:hidden">+ pilot</span>
                  <span aria-hidden className="block size-1.5 bg-lime sm:hidden" />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Sky site: the clients as one flat card, each with its mark; each gains a "pilot" server as setup reaches it. */
function SkyClients({ shown }: { shown: number }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-3 text-[13px] text-mute lg:hidden">Clients it looks for</p>
      <ul className={`${FLAT_CARD} grid grid-cols-1 p-2 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 lg:px-2 lg:py-0`}>
        {CLIENTS.map((c, i) => {
          const lit = i < shown;
          return (
            <li key={c} className="flex h-10 items-center justify-between gap-3 px-3">
              <span className="flex min-w-0 items-center gap-2.5">
                {/* Greyed until setup reaches the client, like its name. */}
                <span className={`flex text-fg transition-[opacity,filter] duration-300 ${lit ? "" : "opacity-45 grayscale"}`}>
                  <BrandMark brand={BRAND_OF[c]} className="size-[18px]" />
                </span>
                <span className={`truncate text-[14.5px] transition-colors duration-300 ${lit ? "text-fg" : "text-dim"}`}>{c}</span>
              </span>
              <span
                className={`shrink-0 rounded-full bg-(--sky-tint) px-2 py-0.5 font-mono text-[11.5px] text-(--sky-accent) transition-[opacity,transform] duration-300 ease-(--ease-out) ${
                  lit ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                }`}
              >
                + pilot
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
