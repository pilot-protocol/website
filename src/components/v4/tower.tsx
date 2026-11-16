"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { TextLink } from "@/components/ui";
import { AGENT_CATEGORIES, type AgentCategory } from "@/lib/agents";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./tower.css";

/*
 * The directory (Figma 180:860): every category drifting past in three rows, fading out at both ends, with the
 * control tower rising out of the middle. The back row is set a size smaller, for depth. The beacon turns over the
 * rows, and each pill catches the light as the beam passes, the way list-agents answers for every agent out there.
 */

/* Every third category per row, so each row mixes big and small ones. */
const ROWS = [0, 1, 2].map((r) => AGENT_CATEGORIES.filter((_, i) => i % 3 === r));

/* Seconds per loop and where in the loop each row starts, so the rows never line up. The last row is the small one. */
const MOTION = [
  { dur: 78, delay: -12, reverse: false, small: false },
  { dur: 92, delay: -47, reverse: true, small: false },
  { dur: 84, delay: -30, reverse: false, small: true },
];

/* Where the lamp sits relative to the band (its centre, from the band's top edge), and how wide the lit wedge is. */
const LAMP_Y = -1;
const BEAM_HALF_ANGLE = 6.5;
const BEAM_REACH = 640;

/* The design's pill (48px) and the back row's, about four fifths of it. */
const PILL = {
  big: {
    list: "gap-3 pr-3",
    pill: "h-12 gap-3 pr-1.5 pl-5",
    name: "text-[15px] leading-[22.5px]",
    count: "h-9 min-w-9 px-2.5 text-[13px]",
  },
  small: {
    list: "gap-2.5 pr-2.5",
    pill: "h-[39px] gap-2.5 pr-[5px] pl-4",
    name: "text-[12.5px] leading-[18px]",
    count: "h-[29px] min-w-[29px] px-2 text-[11px]",
  },
};

function Pills({ items, hidden, small }: { items: AgentCategory[]; hidden?: boolean; small?: boolean }) {
  const s = PILL[small ? "small" : "big"];
  return (
    <ul aria-hidden={hidden || undefined} className={`flex shrink-0 ${s.list} ${hidden ? "motion-reduce:hidden" : ""}`}>
      {items.map((c) => (
        <li key={c.id} className="shrink-0">
          {/* Each category opens the directory filtered to it. The looped copies are for the eye only. */}
          <Link
            href={`/service-agents?category=${c.id}#categories`}
            tabIndex={hidden ? -1 : undefined}
            className={`tower-pill flex items-center rounded-full ${s.pill}`}
          >
            <span className={`tracking-[-0.016em] whitespace-nowrap text-fg ${s.name}`}>{c.name}</span>
            <span
              data-count={c.count}
              className={`tower-count grid place-items-center rounded-full tabular-nums ${s.count}`}
            >
              {c.count}
              <span className="sr-only"> agents</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Progress (0–1, direction applied) of the one CSS animation running on `el`. */
function progressOf(el: Element) {
  const timing = el.getAnimations()[0]?.effect?.getComputedTiming();
  return typeof timing?.progress === "number" ? timing.progress : 0;
}

/**
 * Lights each pill while the beam is on it. Positions come from layout measured once (and on resize) plus
 * the running animations' progress, so nothing is read from the layout per frame.
 */
function useBeacon(
  bandRef: RefObject<HTMLDivElement | null>,
  beamRef: RefObject<HTMLDivElement | null>,
  tracks: RefObject<(HTMLDivElement | null)[]>,
  running: boolean,
) {
  useEffect(() => {
    const band = bandRef.current;
    const beam = beamRef.current;
    if (!running || !band || !beam) return;

    type Pill = { el: HTMLElement; x: number; y: number; lit: boolean };
    let rows: { track: HTMLElement; half: number; pills: Pill[] }[] = [];
    const measure = () => {
      rows = tracks.current.flatMap((track) =>
        track
          ? [
              {
                track,
                half: track.offsetWidth / 2,
                pills: Array.from(track.querySelectorAll<HTMLElement>("li"), (el) => ({
                  el,
                  x: track.offsetLeft + el.offsetLeft + el.offsetWidth / 2,
                  y: track.offsetTop + el.offsetTop + el.offsetHeight / 2,
                  lit: false,
                })),
              },
            ]
          : [],
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(band);
    tracks.current.forEach((t) => t && observer.observe(t));

    let frame = 0;
    const tick = () => {
      const lampX = band.clientWidth / 2;
      const beamAngle = progressOf(beam) * 360;
      for (const row of rows) {
        const shift = -progressOf(row.track) * row.half;
        for (const p of row.pills) {
          const dx = p.x + shift - lampX;
          const dy = p.y - LAMP_Y;
          const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
          const off = Math.abs(((angle - beamAngle + 540) % 360) - 180);
          const lit = off < BEAM_HALF_ANGLE && Math.hypot(dx, dy) < BEAM_REACH;
          if (lit !== p.lit) {
            p.lit = lit;
            p.el.dataset.lit = String(lit);
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rows.forEach((row) => row.pills.forEach((p) => delete p.el.dataset.lit));
    };
  }, [bandRef, beamRef, tracks, running]);
}

export function Tower() {
  const [stageRef, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const bandRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  useBeacon(bandRef, beamRef, tracks, inView && !reduced);

  return (
    <section id="directory" aria-labelledby="directory-title" className="overflow-hidden pt-6 pb-20 sm:pt-10 sm:pb-24 lg:pt-14 lg:pb-[104px]">
      <div ref={stageRef} data-running={inView} className="tower-stage relative mx-auto h-[280px] max-w-[1000px]">
        <div ref={bandRef} className="tower-band absolute inset-x-0 top-[50px] flex flex-col gap-2">
          <div aria-hidden className="tower-sky">
            <div ref={beamRef} className="tower-beam" />
          </div>
          {ROWS.map((items, i) => {
            const m = MOTION[i];
            return (
              <div key={i} className="flex justify-center overflow-hidden">
                <div
                  ref={(el) => {
                    tracks.current[i] = el;
                  }}
                  className="tower-track relative flex w-max shrink-0 animate-[ticker_var(--dur)_linear_infinite] motion-reduce:animate-none"
                  style={
                    {
                      "--dur": `${m.dur}s`,
                      animationDelay: `${m.delay}s`,
                      animationDirection: m.reverse ? "reverse" : undefined,
                    } as CSSProperties
                  }
                >
                  <Pills items={items} small={m.small} />
                  <Pills items={items} small={m.small} hidden />
                </div>
              </div>
            );
          })}
        </div>

        <div aria-hidden className="absolute top-[43px] left-1/2 w-[186px] -translate-x-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v4/tower.webp"
            alt=""
            width={597}
            height={873}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="tower-img block h-auto w-full select-none"
          />
          <span className="tower-cab" />
          <span className="tower-lamp" />
        </div>
      </div>

      <div className="wrap relative flex flex-col items-center text-center">
        <h2
          id="directory-title"
          className="text-[clamp(34px,4.6vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
        >
          One agent per data source.
          <span className="block text-mute">{AGENT_CATEGORIES.length} categories.</span>
        </h2>
        <TextLink href={LINKS.serviceAgents} className="mt-4">
          Browse the agents
        </TextLink>
      </div>
    </section>
  );
}
