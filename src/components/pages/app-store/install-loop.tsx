"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import { SKY } from "@/components/pages/security/kit";
import { APPS } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { BrandMark } from "@/components/v4/logos";

/* eslint-disable @next/next/no-img-element */

const PICK = APPS.findIndex((a) => a.id === "io.pilot.plainweb");

// What an install checks, in order (docs/app-store: "Signed catalogue", "Three integrity layers").
const CHECKS = ["catalogue signature", "tarball sha256", "manifest signature", "binary sha256"];

// Phase timeline: 0 idle · 1 picked · 2–5 checks · 6 spawned · 7 request · 8 reply.
const TIMES = [700, 900, 420, 420, 420, 420, 800, 900, 3400];
const LAST = TIMES.length - 1;

function Station({ n, on, title, cmd, children }: { n: number; on: boolean; title: string; cmd: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-3.5 px-4 py-4 sm:px-5">
      <span
        className={`grid size-[22px] place-items-center font-mono text-[11px] font-medium transition-colors duration-500 ${
          on ? "bg-lime text-ink" : "border border-edge-2 text-dim"
        }`}
      >
        {n}
      </span>
      <div className="min-w-0">
        <p className="flex min-w-0 items-baseline gap-2.5 font-mono text-[12px]">
          <span className={`transition-colors duration-500 ${on ? "text-fg" : "text-dim"}`}>{title}</span>
          <span className="no-scrollbar min-w-0 overflow-x-auto whitespace-nowrap text-faint">{cmd}</span>
        </p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

/**
 * One app, end to end: picked from the catalogue, verified four ways on install,
 * spawned by the daemon, then called. The call and its reply are real (Plainweb).
 */
function usePhase() {
  const [phase, setPhase] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setTimeout(() => setPhase((p) => (p === LAST ? 0 : p + 1)), TIMES[phase]);
    return () => window.clearTimeout(id);
  }, [inView, reduced, phase]);

  const at = reduced ? LAST : phase;
  return { ref, at, picked: at >= 1, checked: Math.max(0, Math.min(CHECKS.length, at - 1)), spawned: at >= 6 };
}

export function InstallLoop() {
  return SKY ? <SkyInstallLoop /> : <GreenInstallLoop />;
}

function GreenInstallLoop() {
  const { ref, at, picked, checked, spawned } = usePhase();

  return (
    <div ref={ref} className="pp-island">
      <Station n={1} on={picked} title="discover" cmd="pilotctl appstore catalogue">
        <ul className="grid grid-cols-10 gap-1.5" aria-label="The catalogue">
          {APPS.map((a, i) => {
            const pick = i === PICK;
            return (
              <li key={a.id} className="relative">
                <img
                  src={a.icon}
                  alt={a.name}
                  width={32}
                  height={32}
                  loading="lazy"
                  className={`aspect-square w-full rounded-[22%] transition-[opacity,filter] duration-500 ${
                    picked && !pick ? "opacity-25 grayscale" : "opacity-100"
                  }`}
                />
                {pick && (
                  <span
                    aria-hidden
                    className={`absolute -inset-[3px] rounded-[26%] border-[1.5px] transition-colors duration-500 ${picked ? "border-lime-ink" : "border-transparent"}`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </Station>

      <div className="border-t border-edge">
        <Station
          n={2}
          on={checked > 0}
          title="install"
          cmd={
            <>
              pilotctl appstore install <span className={picked ? "text-soft" : ""}>io.pilot.plainweb</span>
            </>
          }
        >
          <ul className="grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2">
            {CHECKS.map((c, i) => {
              const ok = i < checked;
              return (
                <li
                  key={c}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 font-mono text-[11.5px] transition-colors duration-300 ${
                    ok ? "border-lime-ink/40 text-fg" : "border-edge text-dim"
                  }`}
                >
                  <span className={`grid size-3.5 shrink-0 place-items-center transition-colors duration-300 ${ok ? "bg-lime text-ink" : "border border-edge-2"}`}>
                    {ok && <CheckIcon className="size-2.5" />}
                  </span>
                  <span className="truncate">{c}</span>
                </li>
              );
            })}
          </ul>
          <p className={`mt-3 flex items-center gap-2 font-mono text-[11.5px] transition-colors duration-500 ${spawned ? "text-lime-ink" : "text-faint"}`}>
            <span aria-hidden className={`size-1.5 rounded-full transition-colors duration-500 ${spawned ? "bg-lime" : "bg-fg/20"}`} />
            {spawned ? "running · spawned by the daemon" : "waiting to spawn"}
          </p>
        </Station>
      </div>

      <div className="border-t border-edge">
        <Station n={3} on={at >= 7} title="call" cmd="pilotctl appstore call io.pilot.plainweb plainweb.fetch">
          <div className="font-mono text-[11.5px] leading-[1.7] sm:text-[12px]">
            <p className={`transition-[opacity,filter] duration-500 ${at >= 7 ? "opacity-100" : "opacity-20 blur-[2px]"}`}>
              <span className="text-dim">in </span>
              <span className="text-soft">{`{"url":"https://example.com"}`}</span>
            </p>
            <div className={`mt-1 transition-[opacity,filter] duration-500 ${at >= 8 ? "opacity-100" : "opacity-20 blur-[2px]"}`}>
              <p>
                <span className="text-dim">out </span>
                <span className="text-soft">&quot;content_type&quot;: </span>
                <span className="text-lime-ink/90">&quot;text/markdown; charset=utf-8&quot;</span>
              </p>
              <p className="truncate pl-[4ch] text-dim">&quot;content&quot;: &quot;This domain is for use in documentation examples…&quot;</p>
            </div>
          </div>
        </Station>
      </div>
      <p className="border-t border-edge px-4 py-3 font-mono text-[11px] text-dim sm:px-5">
        The call and reply are real, recorded in October 2026.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: your agent runs the loop                                  */
/* ------------------------------------------------------------------ */

/** The catalogue as the browser lists it, A to Z, so Plainweb sits mid-grid. */
const SKY_GRID = [...APPS].sort((a, b) => a.name.localeCompare(b.name));
const SKY_PICK = SKY_GRID.findIndex((a) => a.id === "io.pilot.plainweb");
const PLAINWEB = APPS[PICK];

// The same four checks as CHECKS, split into a name and what's checked, to sit under each node.
const SKY_CHECKS: [string, string][] = [
  ["Catalogue", "signature"],
  ["Tarball", "SHA-256"],
  ["Manifest", "signature"],
  ["Binary", "SHA-256"],
];

/** What the agent is doing, in the session's title bar. */
function status(at: number) {
  if (at <= 1) return "Browsing the catalogue";
  if (at <= 5) return "Verifying Plainweb";
  if (at === 6) return "Plainweb is running";
  if (at === 7) return "Calling plainweb.fetch";
  return "Reply in";
}

function Spinner() {
  return <span aria-hidden className="size-3 rounded-full border-[1.5px] border-current border-t-transparent motion-safe:animate-spin" />;
}

/** One step of the session: its number on a rail that fills as the loop moves on, its name and its command. */
function SkyStep({
  n,
  on,
  done,
  last = false,
  title,
  cmd,
  children,
}: {
  n: number;
  on: boolean;
  done: boolean;
  last?: boolean;
  title: string;
  cmd: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-3.5 py-4">
      {!last && (
        <span aria-hidden className="absolute top-[44px] -bottom-3 left-[11.5px] w-px overflow-hidden bg-(--sky-card-line)">
          <span
            data-on={done}
            className="block h-full origin-top scale-y-0 bg-(--sky-fill) transition-transform duration-700 ease-(--ease-out) data-[on=true]:scale-y-100"
          />
        </span>
      )}
      <span className="sky-step-dot tabular-nums" data-on={on}>
        {n}
      </span>
      <div className="min-w-0">
        <p className={`text-[15px] leading-6 font-medium tracking-[-0.01em] transition-colors duration-500 ${on ? "text-fg" : "text-mute"}`}>{title}</p>
        <code tabIndex={0} className="no-scrollbar block overflow-x-auto font-mono text-[12px] leading-5 whitespace-nowrap text-mute">
          <span className="text-(--sky-accent) select-none">$ </span>
          {cmd}
        </code>
        <div className="mt-3.5">{children}</div>
      </div>
    </li>
  );
}

/**
 * The sky site's header visual: your agent's session, step by step. Claude Code browses the real catalogue and
 * picks Plainweb, the install passes its four checks one by one and the daemon starts the app, then the recorded
 * call comes back as Markdown.
 */
function SkyInstallLoop() {
  const { ref, at, picked, checked, spawned } = usePhase();
  const working = at < LAST && at !== 6;
  // How far the line between the four check nodes has filled: from the first node to the last one passed.
  const fill = Math.max(0, checked - 1) / (SKY_CHECKS.length - 1);

  return (
    <div ref={ref} className="overflow-hidden rounded-[20px] bg-card text-left shadow-float">
      {/* The session's title bar: whose agent this is, and what it's doing now. */}
      <div className="flex items-center gap-3 border-b border-(--sky-card-line) px-4 py-3 sm:px-5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-card shadow-tile">
          <BrandMark brand="claude" className="size-[18px]" />
        </span>
        <p className="text-[14.5px] font-medium tracking-[-0.01em] text-fg">Claude Code</p>
        <p aria-hidden className="ml-auto flex min-w-0 items-center gap-2 text-[13px] text-mute">
          {working ? (
            <Spinner />
          ) : (
            <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-(--sky-fill) text-white">
              <CheckIcon className="size-2.5" />
            </span>
          )}
          <span key={status(at)} className="truncate motion-safe:animate-[row-in_400ms_var(--ease-out)_both]">
            {status(at)}
          </span>
        </p>
      </div>

      <ol className="px-4 py-1 sm:px-5">
        <SkyStep n={1} on done={picked} title="Discover" cmd="pilotctl appstore catalogue">
          <ul className="grid grid-cols-10 gap-1.5 sm:gap-2" aria-label={`The catalogue: ${APPS.length} apps`}>
            {SKY_GRID.map((a, i) => {
              const pick = i === SKY_PICK;
              return (
                <li key={a.id} className="relative">
                  <img
                    src={a.icon}
                    alt={a.name}
                    width={32}
                    height={32}
                    loading="lazy"
                    data-dim={picked && !pick}
                    data-pick={picked && pick}
                    className="relative aspect-square w-full rounded-[23%] shadow-tile transition-[opacity,scale] duration-500 ease-(--ease-out) data-[dim=true]:scale-[0.9] data-[dim=true]:opacity-30 data-[pick=true]:z-10 data-[pick=true]:scale-[1.14]"
                  />
                  {pick && (
                    <>
                      <span
                        aria-hidden
                        data-on={picked}
                        className="absolute -inset-[3px] z-10 scale-[1.14] rounded-[27%] shadow-[0_0_0_2px_var(--sky-fill)] opacity-0 transition-opacity duration-500 data-[on=true]:opacity-100"
                      />
                      <span
                        aria-hidden
                        data-on={picked}
                        className="pointer-events-none absolute bottom-[calc(100%+9px)] left-1/2 z-20 -translate-x-1/2 translate-y-1 rounded-[6px] bg-[#1a1a1a] px-2 py-1 text-[11.5px] leading-none font-medium whitespace-nowrap text-white opacity-0 transition-[opacity,translate] duration-300 ease-(--ease-out) data-[on=true]:translate-y-0 data-[on=true]:opacity-100 dark:bg-[#f2f2ec] dark:text-[#141413]"
                      >
                        Plainweb
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </SkyStep>

        <SkyStep
          n={2}
          on={checked > 0}
          done={spawned}
          title="Install"
          cmd={
            <>
              pilotctl appstore install <span className={`transition-colors duration-500 ${picked ? "text-fg" : ""}`}>io.pilot.plainweb</span>
            </>
          }
        >
          <div className="rounded-[12px] border border-(--sky-card-line) p-3">
            <div className="flex items-center gap-3">
              <img src={PLAINWEB.icon} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[23%] shadow-tile" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-5 font-medium text-fg">{PLAINWEB.name}</p>
                <p className="truncate text-[12.5px] leading-[18px] text-mute">{PLAINWEB.publisher}</p>
              </div>
              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] leading-4 transition-colors duration-500 ${
                  spawned ? "bg-(--sky-tint) font-medium text-(--sky-accent)" : "bg-fg/[0.05] text-mute"
                }`}
              >
                {spawned ? (
                  <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
                ) : checked > 0 ? (
                  <Spinner />
                ) : null}
                {spawned ? "Running" : checked > 0 ? "Verifying" : "Not installed"}
              </span>
            </div>
            {/* The four checks, outside in, as nodes on one line that lights up as each one passes. */}
            <ol className="relative mt-3.5 grid grid-cols-4 border-t border-(--sky-card-line) pt-3.5">
              <span aria-hidden className="absolute top-[23px] right-[12.5%] left-[12.5%] h-px bg-(--sky-card-line)">
                <span
                  className="block h-full origin-left bg-(--sky-fill) transition-transform duration-300 ease-(--ease-out)"
                  style={{ transform: `scaleX(${fill})` }}
                />
              </span>
              {SKY_CHECKS.map(([name, what], i) => {
                const ok = i < checked;
                return (
                  <li key={name} className="relative flex flex-col items-center text-center">
                    <span
                      data-ok={ok}
                      className="grid size-[18px] place-items-center rounded-full bg-card text-white shadow-[inset_0_0_0_1.5px_var(--color-edge-2)] transition-[background-color,box-shadow] duration-300 data-[ok=true]:bg-(--sky-fill) data-[ok=true]:shadow-none"
                    >
                      <CheckIcon className={`size-[10px] transition-opacity duration-300 ${ok ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    <span className={`mt-1.5 text-[12px] leading-4 transition-colors duration-300 ${ok ? "text-fg" : "text-mute"}`}>{name}</span>
                    <span className="text-[11.5px] leading-4 text-mute">{what}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </SkyStep>

        <SkyStep n={3} on={at >= 7} done={false} last title="Call" cmd="pilotctl appstore call io.pilot.plainweb plainweb.fetch">
          <p className={`font-mono text-[12px] leading-5 transition-[opacity,filter] duration-500 ${at >= 7 ? "opacity-100" : "opacity-30 blur-[2px]"}`}>
            <span className="text-mute">in&nbsp; </span>
            <span className="text-fg">{`{"url":"https://example.com"}`}</span>
          </p>
          {/* The reply is Markdown, so it's shown as the page it reads as. */}
          <div
            className={`mt-2.5 overflow-hidden rounded-[12px] border border-(--sky-card-line) transition-[opacity,filter,translate] duration-500 ease-(--ease-out) ${
              at >= 8 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-30 blur-[2px]"
            }`}
          >
            <p className="flex items-center justify-between gap-3 border-b border-(--sky-card-line) bg-fg/[0.025] px-3 py-1.5 text-[11.5px] leading-4 text-mute">
              <span className="font-mono">text/markdown</span>
              <span>Recorded Oct 2026</span>
            </p>
            <div className="px-3 py-2.5">
              <p className="text-[15px] leading-5 font-semibold tracking-[-0.015em] text-fg">
                <span className="mr-1.5 font-mono text-[13px] font-normal text-(--sky-accent)">#</span>Example Domain
              </p>
              <p className="mt-1 truncate text-[13px] leading-5 text-mute">This domain is for use in documentation examples…</p>
            </div>
          </div>
        </SkyStep>
      </ol>
    </div>
  );
}
