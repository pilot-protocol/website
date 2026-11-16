"use client";

import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { CheckIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { LineIcon, Tile } from "@/components/pages/compatibility/marks";
import { DataGlyph } from "@/components/v4/glyphs";
import { BrandMark } from "@/components/v4/logos";
import { SKY } from "@/components/pages/security/kit";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

const STAGE_MS = 2200;

const Chip = ({ children, on }: { children: ReactNode; on: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] whitespace-nowrap transition-colors duration-500 ${
      on ? "border-lime-ink/45 text-fg" : "border-edge text-dim"
    }`}
  >
    <span className={`grid size-3 place-items-center transition-colors duration-500 ${on ? "bg-lime text-ink" : "border border-edge-2"}`}>
      {on && <CheckIcon className="size-2" />}
    </span>
    {children}
  </span>
);

/** Sky: a check that lands in a soft sky pill. */
const SkyChip = ({ children, on }: { children: ReactNode; on: boolean }) => (
  <span
    className={`inline-flex h-7 items-center gap-1.5 rounded-full pr-2.5 pl-1.5 text-[12.5px] whitespace-nowrap transition-colors duration-500 ${
      on ? "bg-(--sky-tint) text-(--sky-accent)" : "bg-fg/[0.04] text-mute"
    }`}
  >
    <span
      className={`grid size-4 place-items-center rounded-full transition-colors duration-500 ${on ? "bg-(--sky-fill) text-white" : "ring-1 ring-edge-3 ring-inset"}`}
    >
      <CheckIcon className={`size-2.5 transition-[opacity,transform] duration-300 ease-(--ease-out) ${on ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} />
    </span>
    {children}
  </span>
);

/** Who does each stage, as a picture beside its name. */
function Who({ i }: { i: number }) {
  if (i === 0) return <LineIcon name="user" className="size-[14px]" />;
  if (i === 1) return <PilotMarkP className="h-[11px] w-auto text-(--sky-accent)" />;
  if (i === 2) return <LineIcon name="eye" className="size-[14px]" />;
  return (
    <span className="flex items-center gap-1 text-fg">
      <BrandMark brand="claude" className="size-[13px]" />
      <BrandMark brand="openai" className="size-[13px]" />
      <BrandMark brand="openclaw" className="size-[13px]" />
    </span>
  );
}

/** The sky site's version: the same four stages as a timeline on the kit's flat card, like a flight's status. */
function SkyPipeline({ at, refEl }: { at: number; refEl: RefObject<HTMLDivElement | null> }) {
  const stages: { who: string; title: string; art: ReactNode }[] = [
    {
      who: "You",
      title: "Describe your app",
      art: (
        <p className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-[10px] bg-bg px-3 py-2 font-mono text-[12.5px] whitespace-nowrap ring-1 ring-edge ring-inset">
          <span className="text-fg">weather.search</span>
          <span className="rounded-[5px] bg-fg/[0.06] px-1.5 text-[11.5px] text-soft">GET</span>
          <span className="text-mute">/search</span>
          <span className="ml-auto pl-3 font-sans text-[12px] text-mute">Fast</span>
        </p>
      ),
    },
    {
      who: "Pilot",
      title: "Build, sign and verify the adapter",
      art: (
        <div className="flex items-center gap-3">
          <Tile icon="package" accent={at >= 2} className="transition-colors duration-500" />
          <span className="flex flex-wrap gap-1.5">
            <SkyChip on={at >= 2}>Generated</SkyChip>
            <SkyChip on={at >= 2}>SHA-256 pinned</SkyChip>
            <SkyChip on={at >= 2}>Signed</SkyChip>
            <SkyChip on={at >= 2}>Verified</SkyChip>
          </span>
        </div>
      ),
    },
    {
      who: "Our team",
      title: "Review it",
      art: (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
          <span
            className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 transition-colors duration-500 ${
              at >= 3 ? "bg-(--sky-fill) text-white" : "bg-fg/[0.05] text-soft"
            }`}
          >
            {at >= 3 ? <CheckIcon className="size-3" /> : <LineIcon name="timer" className="size-3.5" />}
            {at >= 3 ? "Approved" : "Pending review"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-mute">
            <LineIcon name="mail" className="size-3.5" />
            Emailed to you
          </span>
        </p>
      ),
    },
    {
      who: "Every agent",
      title: "Install it with one command",
      art: (
        <p className="no-scrollbar overflow-x-auto rounded-[10px] bg-bg px-3 py-2 font-mono text-[12.5px] whitespace-nowrap text-fg ring-1 ring-edge ring-inset">
          <span className="text-(--sky-accent) select-none">$ </span>pilotctl appstore install io.pilot.weather
        </p>
      ),
    },
  ];

  return (
    <div ref={refEl} className="sky-card overflow-hidden rounded-[20px]!">
      <div className="flex items-center justify-between gap-3 border-b border-(--sky-card-line) px-5 py-3.5 sm:px-6">
        <span className="flex min-w-0 items-center gap-3">
          <Tile accent>
            <DataGlyph kind="weather" className="size-[19px]" />
          </Tile>
          <span className="flex min-w-0 flex-col">
            <span className="text-[14.5px] leading-5 font-medium tracking-[-0.01em] text-fg">Weather</span>
            <span className="truncate font-mono text-[12px] leading-[18px] text-mute">io.pilot.weather</span>
          </span>
        </span>
        <span className="shrink-0 text-[12px] text-dim">Example app</span>
      </div>
      <ol className="relative px-5 pt-3 pb-2 sm:px-6">
        {/* The rail fills as the submission moves down it. */}
        <span aria-hidden className="absolute top-[34px] bottom-[44px] left-[calc(1.25rem+11px)] w-[2px] rounded-full bg-fg/[0.07] sm:left-[calc(1.5rem+11px)]" />
        <span
          aria-hidden
          className="absolute top-[34px] left-[calc(1.25rem+11px)] w-[2px] origin-top rounded-full bg-(--sky-fill) transition-transform duration-[900ms] ease-(--ease-in-out) sm:left-[calc(1.5rem+11px)]"
          style={{ bottom: 44, transform: `scaleY(${Math.min(at, 3) / 3})` }}
        />
        {stages.map((s, i) => {
          const on = at >= i;
          return (
            <li key={s.title} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-4 py-3.5">
              <span
                className={`relative grid size-6 place-items-center rounded-full text-[12px] font-medium tabular-nums transition-colors duration-500 ${
                  on ? "bg-(--sky-fill) text-white" : "bg-card text-mute ring-1 ring-edge-2 ring-inset"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <span className={`text-[15px] leading-6 font-medium tracking-[-0.01em] transition-colors duration-500 ${on ? "text-fg" : "text-mute"}`}>
                    {s.title}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-mute">
                    <Who i={i} />
                    {s.who}
                  </span>
                </p>
                <div className={`mt-2.5 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-40"}`}>{s.art}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * describe → we build & verify the adapter → our team reviews → live in the store,
 * with the artifact each stage produces. The app is the form's own placeholder example.
 */
export function Pipeline() {
  const [stage, setStage] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setTimeout(() => setStage((s) => (s + 1) % 5), stage === 4 ? STAGE_MS * 1.4 : STAGE_MS);
    return () => window.clearTimeout(id);
  }, [inView, reduced, stage]);

  const at = reduced ? 4 : stage;
  if (SKY) return <SkyPipeline at={at} refEl={ref} />;

  const stages: { who: string; title: string; art: ReactNode }[] = [
    {
      who: "you",
      title: "Describe your app",
      art: (
        <p className="no-scrollbar overflow-x-auto font-mono text-[11.5px] whitespace-nowrap">
          <span className="text-fg">weather.search</span>
          <span className="text-dim"> · GET /search · fast</span>
        </p>
      ),
    },
    {
      who: "we",
      title: "Build, sign and verify the adapter",
      art: (
        <span className="flex flex-wrap gap-1.5">
          <Chip on={at >= 2}>generated</Chip>
          <Chip on={at >= 2}>sha256 pinned</Chip>
          <Chip on={at >= 2}>signed</Chip>
          <Chip on={at >= 2}>verified</Chip>
        </span>
      ),
    },
    {
      who: "our team",
      title: "Review it",
      art: (
        <p className="font-mono text-[11.5px]">
          <span className={at >= 3 ? "text-dim line-through decoration-fg/30" : "text-soft"}>pending</span>
          <span className="text-faint"> → </span>
          <span className={`transition-colors duration-500 ${at >= 3 ? "text-lime-ink" : "text-faint"}`}>approved</span>
          <span className="text-dim"> · emailed to you</span>
        </p>
      ),
    },
    {
      who: "every agent",
      title: "Install it with one command",
      art: (
        <p className="no-scrollbar overflow-x-auto font-mono text-[11.5px] whitespace-nowrap text-soft">
          <span className="text-lime-ink">$ </span>pilotctl appstore install io.pilot.weather
        </p>
      ),
    },
  ];

  return (
    <div ref={ref} className="pp-island">
      <ol className="relative px-4 py-2 sm:px-5">
        {/* The rail fills as the submission moves down it. */}
        <span aria-hidden className="absolute top-[34px] bottom-[34px] left-[calc(1rem+10px)] w-px bg-edge-2 sm:left-[calc(1.25rem+10px)]" />
        <span
          aria-hidden
          className="absolute top-[34px] left-[calc(1rem+10px)] w-px origin-top bg-lime transition-transform duration-[900ms] ease-(--ease-in-out) sm:left-[calc(1.25rem+10px)]"
          style={{ bottom: 34, transform: `scaleY(${Math.min(at, 3) / 3})` }}
        />
        {stages.map((s, i) => {
          const on = at >= i;
          const now = at === i || (at === 4 && i === 3);
          return (
            <li key={s.title} className="relative grid grid-cols-[21px_minmax(0,1fr)] gap-x-4 py-4">
              <span
                className={`relative mt-0.5 grid size-[21px] place-items-center font-mono text-[11px] font-medium transition-colors duration-500 ${
                  on ? "bg-lime text-ink" : "border border-edge-2 bg-[#121212] text-dim"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="flex items-baseline gap-2">
                  <span className={`text-[15px] font-medium transition-colors duration-500 ${now || on ? "text-fg" : "text-mute"}`}>{s.title}</span>
                  <span className="font-mono text-[11px] text-dim">{s.who}</span>
                </p>
                <div className={`mt-2.5 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-35"}`}>{s.art}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-edge px-4 py-3 font-mono text-[11px] text-dim sm:px-5">
        Example: the form’s own placeholder app, io.pilot.weather.
      </p>
    </div>
  );
}
