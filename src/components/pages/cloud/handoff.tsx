"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { CheckIcon } from "@/components/icons";
import { SKY } from "@/components/pages/security/kit";
import { useFitScale, useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { logo } from "./assets";
import "./cloud.css";

/* eslint-disable @next/next/no-img-element */

type Who = "you" | "maria" | "sam" | "lucas";
type Party = { who: Who; handle: string; app: string; x: number; y: number };

/* Two fixed compositions, scaled to fit: a wide one, and a narrower one for phones. */
const LAYOUTS = {
  wide: { w: 600, h: 360, you: [128, 200], friend: 472, one: 200, two: [116, 276], bubble: 300, count: 318, done: 290 },
  compact: { w: 380, h: 380, you: [82, 216], friend: 298, one: 216, two: [150, 282], bubble: 348, count: 356, done: 298 },
} as const;
type Layout = (typeof LAYOUTS)[keyof typeof LAYOUTS];

const PEOPLE: Record<Exclude<Who, "you">, { handle: string; app: string; slot: 0 | 1 }> = {
  maria: { handle: "maria", app: "ChatGPT", slot: 0 },
  sam: { handle: "sam", app: "Muse", slot: 0 },
  lucas: { handle: "lucas", app: "Gemini", slot: 1 },
};

type Scene = {
  title: string;
  ask: string;
  note: string;
  with: Exclude<Who, "you">[];
  legs: [Who, Who][];
  file?: boolean;
  done: string;
};

// The four hand-offs from pilotprotocol.network/cloud, each drawn as the traffic it causes.
const SCENES: Scene[] = [
  {
    title: "Find times to meet",
    ask: "Find a time for dinner with Maria next week.",
    note: "Your agent and Maria’s go back and forth on dates. You just get the answer.",
    with: ["maria"],
    legs: [
      ["you", "maria"],
      ["maria", "you"],
      ["you", "maria"],
      ["maria", "you"],
      ["you", "maria"],
      ["maria", "you"],
    ],
    done: "you get the answer",
  },
  {
    title: "Make plans with friends",
    ask: "Plan Saturday with Sam and Lucas.",
    note: "Your agents compare notes and settle it between them. No group-chat ping-pong.",
    with: ["sam", "lucas"],
    legs: [
      ["you", "sam"],
      ["you", "lucas"],
      ["sam", "lucas"],
      ["lucas", "sam"],
      ["sam", "you"],
      ["lucas", "you"],
    ],
    done: "settled between the agents",
  },
  {
    title: "Get answers from your team",
    ask: "Ask Sam’s agent where the launch stands.",
    note: "No chasing anyone. Sam’s agent answers, and you hear back.",
    with: ["sam"],
    legs: [
      ["you", "sam"],
      ["sam", "you"],
    ],
    done: "Sam’s agent answered",
  },
  {
    title: "Hand things over",
    ask: "Send Lucas the slides from this chat.",
    note: "Straight from the chat you’re in. No downloading, attaching or “did you get it?”",
    with: ["lucas"],
    legs: [["you", "lucas"]],
    file: true,
    done: "Lucas has the slides",
  },
];

const ASK_MS = 1300;
const LEG_MS = 820;
const DONE_MS = 2600;

function parties(scene: Scene, l: Layout): Party[] {
  const two = scene.with.length > 1;
  return [
    { who: "you", handle: "you", app: "Claude", x: l.you[0], y: l.you[1] },
    ...scene.with.map((w) => ({ who: w, ...PEOPLE[w], x: l.friend, y: two ? l.two[PEOPLE[w].slot] : l.one })),
  ];
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function Node({ p, lit }: { p: Party; lit: boolean }) {
  const c = logo(p.app);
  if (SKY) {
    // Sky: the agent as a solid app tile; a sky ring while it's sending or receiving. Labels sit on the card's
    // own white so the friend-to-friend wire passes behind them.
    return (
      <div className="absolute flex w-[150px] -translate-x-1/2 -translate-y-[28px] flex-col items-center" style={{ left: p.x, top: p.y }}>
        <div
          className={`grid size-14 place-items-center rounded-[16px] bg-card shadow-tile ring-(--sky-fill)/70 transition-[box-shadow] duration-300 ease-(--ease-out) ${
            lit ? "ring-2" : "ring-0"
          }`}
        >
          <img src={c.logo} alt="" width={26} height={26} className={`size-[26px] object-contain ${c.invert ? "dark:invert" : ""}`} />
        </div>
        <p className="mt-2 rounded-md bg-card px-1.5 text-[14px] leading-[20px] font-medium tracking-[-0.01em] text-fg">@{p.handle}</p>
        <p className="rounded-md bg-card px-1.5 text-[12.5px] leading-[18px] text-mute">Agent in {p.app}</p>
      </div>
    );
  }
  return (
    <div className="absolute flex w-[150px] -translate-x-1/2 -translate-y-[28px] flex-col items-center" style={{ left: p.x, top: p.y }}>
      <div
        className={`grid size-14 place-items-center rounded-[14px] border bg-card shadow-tile transition-[border-color,box-shadow] duration-300 ${
          lit ? "border-lime-ink/70 shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-lime)_12%,transparent)]" : "border-edge-2"
        }`}
      >
        <img src={c.logo} alt="" width={26} height={26} className={`size-[26px] object-contain ${c.invert ? "dark:invert" : ""}`} />
      </div>
      <p className="mt-1.5 rounded-md bg-bg-deep px-1 py-0.5 text-[14px] leading-none text-fg">@{p.handle}</p>
      <p className="mt-1 rounded-md bg-bg-deep px-1 py-0.5 font-mono text-[11px] leading-none text-dim">agent · in {p.app}</p>
    </div>
  );
}

/**
 * Two (or three) people, each with an agent in a different AI app. You ask once;
 * the agents do the back and forth over Pilot; you get the answer.
 */
export function Handoff() {
  const [s, setS] = useState(0);
  const [k, setK] = useState(0); // 0 = asking, 1..legs = traffic, legs+1 = done
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const [box, fit] = useFitScale<HTMLDivElement>(LAYOUTS.wide.w);
  // Below ~520px wide the wide composition gets too small to read; switch to the compact one.
  const width = fit * LAYOUTS.wide.w;
  const l: Layout = width < 520 ? LAYOUTS.compact : LAYOUTS.wide;
  const scale = Math.min(1, width / l.w);
  const reduced = usePrefersReducedMotion();

  const scene = SCENES[s];
  const L = scene.legs.length;

  useEffect(() => {
    if (!inView || reduced) return;
    const ms = k === 0 ? ASK_MS : k <= L ? LEG_MS : DONE_MS;
    const id = window.setTimeout(() => {
      if (k <= L) setK(k + 1);
      else if (!held) {
        setS((v) => (v + 1) % SCENES.length);
        setK(0);
      } else setK(0);
    }, ms);
    return () => window.clearTimeout(id);
  }, [inView, reduced, k, L, held]);

  const at = reduced ? L + 1 : k;
  const ps = parties(scene, l);
  const you = ps[0];
  const pos = (w: Who) => ps.find((p) => p.who === w)!;
  const leg = at >= 1 && at <= L ? scene.legs[at - 1] : null;
  const trips = scene.legs.slice(0, Math.min(at, L)).filter(([, to]) => to === "you").length;
  // Half the hop's size, so it rides the wire through the node centres.
  const hop = SKY && !scene.file ? 5 : 4;

  return (
    <figure ref={ref} className={SKY ? "overflow-hidden rounded-[24px] bg-card shadow-float" : "overflow-hidden rounded-[24px] border border-edge bg-bg-deep"}>
      <div ref={box} className="relative" style={{ height: l.h * scale }}>
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: l.w, height: l.h, transform: `scale(${scale})`, left: SKY ? Math.max(0, (width - l.w * scale) / 2) : undefined }}
        >
          {/* Wires between your agent and each friend's, plus friend to friend when there are two. */}
          <svg className="absolute inset-0" width={l.w} height={l.h} aria-hidden>
            {ps.slice(1).map((p) => (
              <line
                key={p.who}
                x1={you.x}
                y1={you.y}
                x2={p.x}
                y2={p.y}
                className={SKY ? "stroke-fg/12" : "stroke-fg/20"}
                strokeDasharray={SKY ? undefined : "3 5"}
              />
            ))}
            {ps.length === 3 && (
              <line
                x1={ps[1].x}
                y1={ps[1].y}
                x2={ps[2].x}
                y2={ps[2].y}
                className={SKY ? "stroke-fg/12" : "stroke-fg/20"}
                strokeDasharray={SKY ? undefined : "3 5"}
              />
            )}
          </svg>

          {/* What you typed, in your AI app. */}
          {SKY ? (
            // Sky: what you typed is a sent message, in the sky blue.
            <div
              key={`ask-${s}`}
              style={{ maxWidth: l.bubble }}
              className="absolute top-5 left-5 rounded-[18px] rounded-bl-[6px] bg-(--sky-fill) px-3.5 py-2.5 text-white motion-safe:animate-[row-in_500ms_var(--ease-out)_both]"
            >
              <p className="text-[12px] leading-4 text-white/75">You, in Claude</p>
              <p className="mt-1 text-[14px] leading-[1.35]">{scene.ask}</p>
            </div>
          ) : (
            <div
              key={`ask-${s}`}
              style={{ maxWidth: l.bubble }}
              className="absolute top-5 left-5 rounded-[16px] rounded-bl-[6px] bg-card px-3.5 py-2.5 shadow-card motion-safe:animate-[row-in_500ms_var(--ease-out)_both]"
            >
              <p className="font-mono text-[10.5px] text-dim">you, in Claude</p>
              <p className="mt-1 text-[14px] leading-[1.35] text-fg">“{scene.ask}”</p>
            </div>
          )}

          {ps.map((p) => (
            <Node key={p.who} p={p} lit={!!leg && (leg[0] === p.who || leg[1] === p.who)} />
          ))}

          {leg && (
            <span
              key={`${s}-${at}`}
              aria-hidden
              className={`cl-hop absolute top-0 left-0 ${SKY ? "bg-(--sky-fill)" : "bg-lime"} ${
                scene.file
                  ? "h-[13px] w-[10px] [clip-path:polygon(0_0,65%_0,100%_28%,100%_100%,0_100%)]"
                  : SKY
                    ? "size-2.5 rounded-full"
                    : "size-2"
              }`}
              style={
                {
                  "--x1": `${pos(leg[0]).x - hop}px`,
                  "--y1": `${pos(leg[0]).y - hop}px`,
                  "--x2": `${pos(leg[1]).x - hop}px`,
                  "--y2": `${pos(leg[1]).y - hop}px`,
                  animationDuration: `${LEG_MS - 60}ms`,
                } as CSSProperties
              }
            />
          )}

          {/* The counter under the wire: the back and forth you didn't have to do. */}
          {SKY ? (
            <>
              <p className="absolute left-1/2 -translate-x-1/2 text-[12.5px] whitespace-nowrap text-mute" style={{ top: l.count }}>
                {scene.file ? (
                  <>
                    Files sent · <span className="text-fg tabular-nums">{at > L ? 1 : 0}</span>
                  </>
                ) : (
                  <>
                    Back and forth · <span className="text-fg tabular-nums">{trips}</span>
                  </>
                )}
              </p>
              <p
                style={{ top: l.done + 4, left: you.x }}
                className={`absolute flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12.5px] leading-4 font-medium whitespace-nowrap text-(--sky-accent) transition-[opacity,filter,transform] duration-500 ease-(--ease-out) ${
                  at > L ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 blur-[3px]"
                }`}
              >
                <CheckIcon className="size-3" />
                {cap(scene.done)}
              </p>
            </>
          ) : (
            <>
              <p className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] whitespace-nowrap text-dim" style={{ top: l.count }}>
                {scene.file ? (
                  <>file sent · {at > L ? 1 : 0}</>
                ) : (
                  <>
                    back and forth · <span className="text-fg tabular-nums">{trips}</span>
                  </>
                )}
              </p>

              <p
                style={{ top: l.done, left: you.x }}
                className={`absolute flex -translate-x-1/2 items-center gap-1.5 font-mono text-[11px] whitespace-nowrap text-lime-ink transition-[opacity,filter] duration-500 ${
                  at > L ? "opacity-100" : "opacity-0 blur-[3px]"
                }`}
              >
                <CheckIcon className="size-3" />
                {scene.done}
              </p>
            </>
          )}
        </div>
      </div>

      {/* The sky site lets the scene and its tab speak for themselves; the green site keeps the one-line note. */}
      {SKY ? (
        <p className="sr-only" aria-live="polite">
          {scene.note}
        </p>
      ) : (
        <figcaption className="border-t border-edge px-4 py-3.5 sm:px-5">
          <p key={s} className="text-[14.5px] leading-[1.5] text-mute motion-safe:animate-[row-in_500ms_var(--ease-out)_both]">
            {scene.note}
          </p>
        </figcaption>
      )}
      <div
        role="group"
        aria-label="What you can hand off"
        className={SKY ? "grid grid-cols-2 gap-1 border-t border-edge p-1.5 sm:grid-cols-4" : "grid grid-cols-2 border-t border-edge sm:grid-cols-4"}
      >
        {SCENES.map((x, i) =>
          SKY ? (
            <button
              key={x.title}
              type="button"
              aria-pressed={i === s}
              onClick={() => {
                setHeld(true);
                setS(i);
                setK(0);
              }}
              className={`pressable rounded-[14px] px-3.5 py-3 text-left text-[13px] leading-[1.3] ${
                i === s ? "bg-(--sky-tint) text-(--sky-accent)" : "text-mute hover:bg-fg/[0.04] hover:text-fg"
              }`}
            >
              {x.title}
            </button>
          ) : (
          <button
            key={x.title}
            type="button"
            aria-pressed={i === s}
            onClick={() => {
              setHeld(true);
              setS(i);
              setK(0);
            }}
            className={`relative px-3 py-3 text-left text-[12.5px] leading-[1.3] transition-colors duration-300 not-first:border-l not-first:border-edge max-sm:nth-3:border-l-0 max-sm:nth-[n+3]:border-t ${
              i === s ? "bg-fg/[0.04] text-fg" : "text-dim hover:text-soft"
            }`}
          >
            {i === s && <span aria-hidden className="absolute top-0 left-0 h-px w-full bg-lime" />}
            {x.title}
          </button>
          ),
        )}
      </div>
    </figure>
  );
}
