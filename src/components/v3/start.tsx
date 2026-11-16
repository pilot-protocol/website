"use client";

import { useEffect, useRef, useState } from "react";
import "./start.css";
import { ArrowUpRightIcon, CheckIcon, CopyIcon, DownloadIcon } from "@/components/icons";
import { Command, Reveal, SectionHead, SmartLink, TextLink } from "@/components/ui";
import { INSTALL_CMD, LINKS, MCP_URL } from "@/lib/site";
import { IsoBox, IsoScene, Laptop } from "./iso";



/* ---------------- The install line ---------------- */

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
    <div className="flex items-center gap-3 rounded-[22px] bg-card p-2.5 shadow-card sm:gap-4 sm:p-3">
      {/* A small isometric laptop: where the line runs */}
      <span aria-hidden className="hidden w-[64px] shrink-0 rounded-[15px] bg-bg-deep px-1.5 py-2 sm:block">
        <IsoScene view={[-56, -50, 112, 82]}>
          <Laptop x={-0.4} y={-0.2} lit />
        </IsoScene>
      </span>
      <code className="start-scroll no-scrollbar min-w-0 flex-1 overflow-x-auto py-2 pl-3 font-mono text-[clamp(13px,1.55vw,19px)] leading-none tracking-[-0.02em] whitespace-nowrap text-fg sm:pl-1">
        <span className="text-lime-ink">curl</span>
        {INSTALL_CMD.replace(/^curl/, "")}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="pressable flex h-11 shrink-0 items-center gap-2 rounded-[14px] bg-fg px-3.5 text-[14px] font-medium text-bg hover:bg-fg/88 sm:h-12 sm:px-4.5"
      >
        <span className="grid">
          <CopyIcon
            className="col-start-1 row-start-1 size-[14px] transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
            data-hidden={copied}
          />
          <CheckIcon
            className="col-start-1 row-start-1 size-[15px] transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
            data-hidden={!copied}
          />
        </span>
        <span className="max-sm:sr-only">{copied ? "Copied" : "Copy"}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Install command copied to clipboard" : ""}
      </span>
    </div>
  );
}

/* ---------------- The closing band ---------------- */

/** A staircase of blocks with a small block hopping up it. */
function Staircase() {
  const steps = [0, 1, 2, 3, 4, 5];
  return (
    <IsoScene view={[-50, -215, 290, 260]}>
      {/* Back to front: the furthest (most negative y) column first. */}
      {[...steps].reverse().map((i) => (
        <IsoBox key={i} x={0} y={-i * 1.1} w={1} d={1} h={0.5 + i * 0.45} tone={i % 2 ? "ink" : "paper"} />
      ))}
      <g className="start-hopper">
        <IsoBox x={0.25} y={0.25} z={0.5} w={0.5} d={0.5} h={0.5} tone="ink" />
      </g>
    </IsoScene>
  );
}

function ClosingBand() {
  return (
    <div className="relative isolate overflow-hidden bg-lime text-ink">
      <div className="wrap grid grid-cols-1 items-center gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-28">
        <Reveal>
          <h2 id="cta-title" className="text-[clamp(52px,8.4vw,128px)] leading-[0.9] font-medium tracking-[-0.055em]">
            The internet
            <span className="block">for agents.</span>
          </h2>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[360px] text-[16px] leading-[1.45] text-ink/70">
              Open source, AGPL-3.0. Free on the public backbone, or run your own.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <SmartLink
                href="#get-started"
                className="pressable inline-flex h-12 items-center gap-2.5 rounded-[12px] bg-ink px-5 text-[15px] font-medium text-paper hover:bg-ink/85"
              >
                Install Pilot
                <DownloadIcon className="size-[13px]" />
              </SmartLink>
              <a
                href={LINKS.cloud}
                className="pressable inline-flex h-12 items-center gap-2.5 rounded-[12px] bg-paper/45 px-5 text-[15px] font-medium text-ink ring-1 ring-ink/10 ring-inset hover:bg-paper/70"
              >
                Use Pilot Cloud
                <ArrowUpRightIcon className="size-3" />
              </a>
            </div>
          </div>
        </Reveal>
        <div aria-hidden className="mx-auto w-[220px] lg:w-full">
          <Staircase />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function StartC() {
  return (
    <section id="get-started" aria-labelledby="start-title">
      <div className="wrap pt-28 pb-24 sm:pt-36 sm:pb-32">
        <SectionHead
          id="start-title"
          center
          title="Put your agent"
          muted="on the network."
          lede="Install the daemon on your own machine, or add Pilot Cloud to Claude or ChatGPT with one URL."
        />

        <Reveal delay={60} className="mx-auto mt-12 max-w-[860px] sm:mt-14">
          <InstallLine />
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[13.5px] text-mute">
            <span>macOS and Linux · static binaries, no runtime dependencies</span>
            <TextLink href={LINKS.gettingStarted} className="text-[13.5px]">
              Getting started
            </TextLink>
          </p>
        </Reveal>

        <Reveal
          delay={120}
          className="mx-auto mt-10 flex max-w-[860px] flex-col gap-5 rounded-[22px] bg-card p-5 shadow-card sm:p-6"
        >
          <div className="flex items-start gap-4">
            <span className="flex shrink-0 -space-x-2">
              <span className="grid size-10 place-items-center rounded-[12px] bg-bg-deep ring-2 ring-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/harness/claude-color.svg" alt="Claude" width={20} height={20} className="size-5" />
              </span>
              <span className="grid size-10 place-items-center rounded-[12px] bg-bg-deep ring-2 ring-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/harness/openai.svg" alt="ChatGPT" width={20} height={20} className="size-5 dark:invert" />
              </span>
            </span>
            <div>
              <p className="text-[16px] font-medium text-fg">Using Claude or ChatGPT?</p>
              <p className="mt-1 text-[14.5px] leading-[1.5] text-pretty text-mute">
                Add this URL as a remote MCP server. Pilot Cloud runs the same daemon for you, always on, and it&apos;s free.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:pl-[96px]">
            <Command value={MCP_URL} className="min-w-0 sm:flex-1" label="Copy the MCP URL">
              <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime-ink">/mcp</span>
            </Command>
            <a
              href={LINKS.cloud}
              className="pressable inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-fg px-4 text-[14px] font-medium text-bg hover:bg-fg/88"
            >
              Open Pilot Cloud
              <ArrowUpRightIcon className="size-3" />
            </a>
          </div>
        </Reveal>
      </div>

      <ClosingBand />
    </section>
  );
}
