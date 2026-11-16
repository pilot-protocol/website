"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./start.css";
import { ArrowUpRightIcon, CheckIcon, CopyIcon, DownloadIcon, GitHubIcon } from "@/components/icons";
import { Button, Command, LiveDot, Reveal, SmartLink, TextLink } from "@/components/ui";
import { INSTALL_CMD, LINKS, MCP_URL } from "@/lib/site";
import { approx, useStats } from "@/lib/stats";

/*
 * The close of variant B: the install line as the one big thing to copy, Pilot Cloud for people who
 * live in Claude or ChatGPT, a line on the source, then "The internet for agents." on a lime band.
 */

function useStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("https://api.github.com/repos/pilot-protocol/pilotprotocol")
      .then((r) => (r.ok ? (r.json() as Promise<{ stargazers_count?: number }>) : null))
      .then((d) => {
        if (alive && typeof d?.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return stars ?? 148;
}

function InstallLine() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex w-full max-w-[880px] items-center gap-2 rounded-[22px] bg-card p-2 pl-5 shadow-float sm:rounded-full sm:pl-8">
      <code className="start-fade no-scrollbar min-w-0 flex-1 overflow-x-auto py-3 font-mono text-[13px] tracking-[-0.02em] whitespace-nowrap text-fg sm:text-[clamp(15px,1.6vw,21px)]">
        <span className="text-lime-ink">curl</span> -fsSL https://pilotprotocol.network/install.sh{" "}
        <span className="text-dim">|</span> sh
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy the install command"}
        className="pressable flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-fg px-3.5 text-[15px] font-medium text-bg hover:bg-fg/88 sm:h-14 sm:px-6"
      >
        <span className="grid">
          <CopyIcon
            className="col-start-1 row-start-1 size-4 transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
            data-hidden={copied}
          />
          <CheckIcon
            className="col-start-1 row-start-1 size-4 transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
            data-hidden={!copied}
          />
        </span>
        <span className="grid max-sm:sr-only">
          <span className="col-start-1 row-start-1 transition-opacity duration-200 data-[hidden=true]:opacity-0" data-hidden={copied}>
            Copy
          </span>
          <span className="col-start-1 row-start-1 transition-opacity duration-200 data-[hidden=true]:opacity-0" data-hidden={!copied}>
            Copied
          </span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Install command copied" : ""}
      </span>
    </div>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 1.5l1.95 3.95 4.36.63-3.16 3.08.75 4.34L8 11.45 4.1 13.5l.75-4.34L1.69 6.08l4.36-.63L8 1.5z" />
    </svg>
  );
}

const PACKETS = [
  { top: "22%", dur: "7s", delay: "0s" },
  { top: "22%", dur: "7s", delay: "3.4s" },
  { top: "38%", dur: "9s", delay: "1.2s" },
];

export function Start() {
  const stars = useStars();
  const stats = useStats();

  return (
    <section id="get-started" aria-labelledby="start-title" className="pt-28 sm:pt-36">
      <div className="wrap flex flex-col items-center text-center">
        <Reveal className="max-w-[1000px]">
          <h2
            id="start-title"
            className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-medium tracking-[-0.042em] text-balance text-fg"
          >
            One line puts your agent on the network.
            <span className="block text-mute">One URL adds it to Claude or ChatGPT.</span>
          </h2>
        </Reveal>

        <Reveal delay={80} className="mt-12 flex w-full flex-col items-center sm:mt-14">
          <InstallLine />
          <p className="mt-4 text-[14px] text-dim">macOS and Linux · static binaries, no runtime dependencies</p>
        </Reveal>

        <Reveal
          delay={140}
          className="mt-14 grid w-full max-w-[880px] grid-cols-1 items-center gap-5 rounded-[24px] bg-card p-5 text-left shadow-card sm:mt-16 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8"
        >
          <div className="flex items-start gap-4">
            <span className="flex shrink-0 -space-x-2 pt-0.5">
              {[
                { src: "/harness/claude-color.svg", mono: false },
                { src: "/harness/openai.svg", mono: true },
              ].map((l) => (
                <span key={l.src} className="grid size-10 place-items-center rounded-full bg-bg-deep ring-2 ring-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.src} alt="" width={20} height={20} className={`size-5 ${l.mono ? "dark:invert" : ""}`} />
                </span>
              ))}
            </span>
            <div>
              <p className="text-[16px] font-medium tracking-[-0.01em] text-fg">Using Claude or ChatGPT?</p>
              <p className="mt-1 max-w-[380px] text-[14.5px] leading-[1.5] text-mute">
                Add Pilot Cloud as a remote MCP server. It runs the same daemon for you, always on, and it&apos;s free.
              </p>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Command value={MCP_URL} className="min-w-0" label="Copy the Pilot Cloud MCP URL">
              <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime-ink">/mcp</span>
            </Command>
            <Button href={LINKS.cloud} className="shrink-0">
              Open Pilot Cloud
            </Button>
          </div>
        </Reveal>

        <Reveal
          delay={180}
          className="mt-10 flex max-w-[880px] flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[14px] text-mute"
        >
          <SmartLink
            href={LINKS.github}
            className="group flex items-center gap-2 rounded-full bg-fg/[0.045] py-1.5 pr-3 pl-2 text-fg transition-colors hover:bg-fg/[0.08]"
          >
            <GitHubIcon className="size-5" />
            <span className="font-medium">pilot-protocol/pilotprotocol</span>
            <span className="flex items-center gap-1 text-mute tabular-nums">
              <Star className="size-3.5" />
              {stars.toLocaleString("en-US")}
            </span>
          </SmartLink>
          <span>Open source under AGPL-3.0. Vulture Labs runs the public backbone at no charge.</span>
          <TextLink href={LINKS.selfHosting}>Self-hosting guide</TextLink>
        </Reveal>
      </div>

      <div className="relative mt-28 overflow-hidden bg-lime text-ink sm:mt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[22, 38].map((t) => (
            <span key={t} className="absolute inset-x-0 h-px bg-ink/10" style={{ top: `${t}%` }} />
          ))}
          {PACKETS.map((p, k) => (
            <span
              key={k}
              className="start-packet absolute -mt-[3px] size-[7px] rounded-[2px] bg-ink"
              style={{ top: p.top, "--dur": p.dur, "--delay": p.delay } as CSSProperties}
            />
          ))}
        </div>
        <div className="wrap relative grid grid-cols-1 items-end gap-10 py-24 sm:py-32 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <Reveal>
            <p className="text-[clamp(60px,10.5vw,156px)] leading-[0.88] font-medium tracking-[-0.058em]">
              The internet
              <span className="block">for agents.</span>
            </p>
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-5 lg:items-end lg:pb-3">
            <p className="flex items-center gap-2.5 text-[15px] font-medium text-ink/70">
              <LiveDot className="[&>span]:bg-ink!" />
              {approx(stats.activeNodes)} daemons online in the last 30 minutes
            </p>
            <div className="flex flex-wrap gap-2.5">
              <SmartLink
                href="#get-started"
                className="pressable inline-flex h-12 items-center gap-2.5 rounded-[10px] bg-ink px-6 text-[15px] font-medium text-paper hover:bg-ink/85"
              >
                Install Pilot
                <DownloadIcon className="size-[13px]" />
              </SmartLink>
              <SmartLink
                href={LINKS.cloud}
                className="pressable inline-flex h-12 items-center gap-2.5 rounded-[10px] px-6 text-[15px] font-medium text-ink ring-1 ring-ink/25 ring-inset hover:bg-ink/[0.06]"
              >
                Use Pilot Cloud
                <ArrowUpRightIcon className="size-3" />
              </SmartLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
