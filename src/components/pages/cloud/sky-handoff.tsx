"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { CheckIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { Beam } from "@/components/sky/beam";
import { useFitScale, useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { AppMark, ArrowUpGlyph, FileGlyph } from "./marks";
import "./cloud.css";

/*
 * Sky: the hand-off as it happens. Your Claude chat on the left, where you ask once and get the answer; your
 * friends' agents on the right, each in the AI app its owner uses. While Pilot works, every message the agents
 * trade travels its wire as the site's beam, with what it says on a chip beside the wire.
 */

type Who = "you" | "maria" | "sam" | "lucas";
type Friend = Exclude<Who, "you">;
type Pt = [number, number];
type Leg = { from: Who; to: Who; say: string; file?: boolean };
type Scene = { title: string; ask: string; note: string; with: Friend[]; legs: Leg[]; answer: string; done: string };

const PEOPLE: Record<Friend, { app: string }> = {
  maria: { app: "ChatGPT" },
  sam: { app: "Muse" },
  lucas: { app: "Gemini" },
};

// The four hand-offs from pilotprotocol.network/cloud.
const SCENES: Scene[] = [
  {
    title: "Find times to meet",
    ask: "Find a time for dinner with Maria next week.",
    note: "Your agent and Maria’s go back and forth on dates. You just get the answer.",
    with: ["maria"],
    legs: [
      { from: "you", to: "maria", say: "Dinner next week?" },
      { from: "maria", to: "you", say: "Tue or Thu evening" },
      { from: "you", to: "maria", say: "Thursday at 7:30?" },
      { from: "maria", to: "you", say: "Thursday works" },
    ],
    answer: "Dinner with Maria is on Thursday at 7:30.",
    done: "Maria’s agent agreed",
  },
  {
    title: "Make plans with friends",
    ask: "Plan Saturday with Sam and Lucas.",
    note: "Your agents compare notes and settle it between them. No group-chat ping-pong.",
    with: ["sam", "lucas"],
    legs: [
      { from: "you", to: "sam", say: "Free on Saturday?" },
      { from: "you", to: "lucas", say: "Free on Saturday?" },
      { from: "sam", to: "lucas", say: "Hike in the morning?" },
      { from: "lucas", to: "sam", say: "Then lunch" },
      { from: "sam", to: "you", say: "Hike at 9, lunch after" },
      { from: "lucas", to: "you", say: "Count me in" },
    ],
    answer: "Saturday: a hike at 9 with Sam and Lucas, then lunch.",
    done: "Settled between agents",
  },
  {
    title: "Get answers from your team",
    ask: "Ask Sam’s agent where the launch stands.",
    note: "No chasing anyone. Sam’s agent answers, and you hear back.",
    with: ["sam"],
    legs: [
      { from: "you", to: "sam", say: "Where’s the launch?" },
      { from: "sam", to: "you", say: "On track for Friday" },
    ],
    answer: "Sam’s agent says the launch is on track for Friday.",
    done: "Sam’s agent answered",
  },
  {
    title: "Hand things over",
    ask: "Send Lucas the slides from this chat.",
    note: "Straight from the chat you’re in. No downloading, attaching or “did you get it?”",
    with: ["lucas"],
    legs: [
      { from: "you", to: "lucas", say: "slides.pdf", file: true },
      { from: "lucas", to: "you", say: "Got the slides" },
    ],
    answer: "Sent. Lucas has the slides.",
    done: "Lucas has the slides",
  },
];

/*
 * Two fixed compositions, scaled to fit. `win` is the chat window, `a` the point where your agent leaves it, and
 * `one` / `two` the centres of the friends' cards. Wide: the chat on the left, the friends as contact cards on the
 * right. Compact (phones): the chat on top, the friends under it.
 */
const LAYOUTS = {
  wide: {
    w: 600,
    h: 330,
    win: { x: 16, y: 16, w: 256, h: 298 },
    tool: 126,
    answer: 184,
    composer: true,
    a: [272, 165] as Pt,
    one: [[514, 165]] as Pt[],
    two: [
      [514, 76],
      [514, 254],
    ] as Pt[],
    card: { w: 144, h: 120 },
    wide: true,
  },
  compact: {
    w: 360,
    h: 482,
    win: { x: 12, y: 12, w: 336, h: 236 },
    tool: 116,
    answer: 172,
    composer: false,
    a: [180, 248] as Pt,
    one: [[180, 384]] as Pt[],
    two: [
      [96, 384],
      [264, 384],
    ] as Pt[],
    card: { w: 156, h: 56 },
    wide: false,
  },
};
type Layout = (typeof LAYOUTS)["wide"] | (typeof LAYOUTS)["compact"];

const ASK_MS = 1200;
const LEG_MS = 1350;
const DONE_MS = 3400;

/** Where each friend's card sits in this scene. */
function spots(scene: Scene, l: Layout): Record<Friend, Pt> {
  const at = scene.with.length > 1 ? l.two : l.one;
  const out = {} as Record<Friend, Pt>;
  scene.with.forEach((f, i) => (out[f] = at[i]));
  return out;
}

const between = (from: Who, to: Who) => from !== "you" && to !== "you";

/** The wire between two parties, as a cubic (four points), from `from` to `to`. */
function wire(from: Who, to: Who, s: Record<Friend, Pt>, l: Layout): Pt[] {
  const { w: cw, h: ch } = l.card;
  if (between(from, to)) {
    const [p, q] = [s[from as Friend], s[to as Friend]];
    if (l.wide) {
      // The two cards stack; a straight wire from one to the other.
      const dir = q[1] > p[1] ? 1 : -1;
      const p0: Pt = [p[0], p[1] + (dir * ch) / 2];
      const p3: Pt = [q[0], q[1] - (dir * ch) / 2];
      return [p0, p0, p3, p3];
    }
    // Side by side; the wire loops under them.
    const p0: Pt = [p[0], p[1] + ch / 2];
    const p3: Pt = [q[0], q[1] + ch / 2];
    return [p0, [p0[0], p0[1] + 40], [p3[0], p3[1] + 40], p3];
  }
  const f = s[(from === "you" ? to : from) as Friend];
  const a = l.a;
  const end: Pt = l.wide ? [f[0] - cw / 2, f[1]] : [f[0], f[1] - ch / 2];
  const c1: Pt = l.wide ? [a[0] + 80, a[1]] : [a[0], a[1] + 56];
  const c2: Pt = l.wide ? [end[0] - 80, end[1]] : [end[0], end[1] - 56];
  const fwd = [a, c1, c2, end];
  return from === "you" ? fwd : [...fwd].reverse();
}

const d = (c: Pt[]) => `M${c[0][0]} ${c[0][1]} C${c[1][0]} ${c[1][1]} ${c[2][0]} ${c[2][1]} ${c[3][0]} ${c[3][1]}`;
const mid = (c: Pt[]): Pt => [(c[0][0] + 3 * c[1][0] + 3 * c[2][0] + c[3][0]) / 8, (c[0][1] + 3 * c[1][1] + 3 * c[2][1] + c[3][1]) / 8];
const key = (a: Who, b: Who) => [a, b].sort().join("-");

/** The message's chip sits beside the middle of its wire, clear of the dot riding it. */
function chipAt(leg: Leg, path: Pt[], l: Layout): CSSProperties {
  const [x, y] = mid(path);
  if (between(leg.from, leg.to)) {
    return l.wide ? { left: x - 12, top: y, translate: "-100% -50%" } : { left: x, top: y + 8, translate: "-50% 0" };
  }
  return l.wide ? { left: x, top: y - 12, translate: "-50% -100%" } : { left: x + 12, top: y, translate: "0 -50%" };
}

function FriendCard({ who, at, l, lit }: { who: Friend; at: Pt; l: Layout; lit: boolean }) {
  const app = PEOPLE[who].app;
  const tile = "grid shrink-0 place-items-center bg-[color-mix(in_srgb,var(--color-fg)_5%,var(--color-card))]";
  return (
    <div
      className={`absolute flex rounded-[16px] border bg-card transition-[border-color,box-shadow] duration-300 ease-(--ease-out) ${
        l.wide ? "flex-col items-center justify-center text-center" : "items-center gap-2.5 px-2.5"
      } ${lit ? "border-(--sky-fill)/60 shadow-[0_0_0_3px_var(--sky-tint)]" : "border-(--sky-card-line)"}`}
      style={{ left: at[0] - l.card.w / 2, top: at[1] - l.card.h / 2, width: l.card.w, height: l.card.h }}
    >
      <span className={l.wide ? `${tile} relative mb-2.5 size-12 rounded-[13px]` : `${tile} relative size-9 rounded-[10px]`}>
        <AppMark app={app} className={l.wide ? "size-[26px]" : "size-5"} />
        {/* The person the agent works for. */}
        <span
          className={`absolute grid place-items-center rounded-full bg-fg font-medium text-bg ring-2 ring-card ${
            l.wide ? "-right-1.5 -bottom-1.5 size-[18px] text-[10px]" : "-right-1 -bottom-1 size-4 text-[9px]"
          }`}
        >
          {who[0].toUpperCase()}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] leading-[18px] font-medium tracking-[-0.01em] text-fg">@{who}</span>
        <span className="block text-[12px] leading-4 whitespace-nowrap text-mute">Agent in {app}</span>
      </span>
    </div>
  );
}

export function SkyHandoff() {
  const [s, setS] = useState(0);
  const [k, setK] = useState(0); // 0 = asking, 1..legs = the agents' messages, legs+1 = done
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  // Uncapped, so `width` is the box's real width and the composition can centre in it.
  const [box, fit] = useFitScale<HTMLDivElement>(LAYOUTS.wide.w, 4);
  const width = fit * LAYOUTS.wide.w;
  // Below ~520px the wide composition gets too small to read; switch to the stacked one.
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
  const leg = at >= 1 && at <= L ? scene.legs[at - 1] : null;
  const done = at > L;
  const sp = spots(scene, l);
  const trips = scene.legs.slice(0, Math.min(at, L)).filter((x) => x.to === "you").length;

  // Every wire in this scene, drawn once whichever way the messages go.
  const pairs: [Who, Who][] = scene.with.map((f) => ["you", f]);
  if (scene.with.length > 1) pairs.push([scene.with[0], scene.with[1]]);
  const path = leg ? wire(leg.from, leg.to, sp, l) : null;
  const chip = leg && path ? chipAt(leg, path, l) : null;
  const sender = leg ? (leg.from === "you" ? "Claude" : PEOPLE[leg.from].app) : "";
  const whom = scene.with.map((f) => `@${f}`).join(", ");
  const win = l.win;

  return (
    <figure ref={ref} className="w-full overflow-hidden rounded-[24px] bg-card shadow-float">
      <div ref={box} className="sky-hatch-bg relative border-b border-(--sky-card-line)" style={{ height: l.h * scale }}>
        <div
          className="absolute top-0 origin-top-left"
          style={{ width: l.w, height: l.h, transform: `scale(${scale})`, left: Math.max(0, (width - l.w * scale) / 2) }}
        >
          {/* The wires; the one carrying the current message lights up, and the message runs along it as a beam. */}
          <svg className="absolute inset-0 overflow-visible" width={l.w} height={l.h} aria-hidden>
            {pairs.map(([a, b]) => {
              const on = !!leg && key(leg.from, leg.to) === key(a, b);
              return (
                <path
                  key={key(a, b)}
                  d={d(wire(a, b, sp, l))}
                  fill="none"
                  strokeWidth={on ? 1.5 : 1.25}
                  className={`transition-[stroke] duration-300 ${on ? "stroke-(--sky-fill)/25" : "stroke-fg/15"}`}
                />
              );
            })}
            {/* `at` only moves while the figure is on screen, so the beam never plays off-screen. */}
            {path && <Beam d={d(path)} run={`${s}-${at}`} duration={LEG_MS - 150} width={1.5} tail={84} />}
          </svg>

          {/* Your chat, in Claude. */}
          <div
            className="absolute flex flex-col overflow-hidden rounded-[16px] border border-(--sky-card-line) bg-card"
            style={{ left: win.x, top: win.y, width: win.w, height: win.h }}
          >
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-(--sky-card-line) px-3.5">
              <AppMark app="Claude" className="size-4" />
              <span className="text-[13px] font-medium tracking-[-0.01em] text-fg">Claude</span>
              <span
                className={`ml-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] leading-4 transition-colors duration-300 ${
                  leg ? "bg-(--sky-tint) text-(--sky-accent)" : "bg-fg/[0.05] text-mute"
                }`}
              >
                <PilotMarkP className="h-2.5 w-auto" />
                Pilot
              </span>
            </div>

            {/* What you typed. */}
            <p
              key={`ask-${s}`}
              className="absolute right-3 max-w-[78%] rounded-[14px] bg-fg/[0.06] px-3 py-2 text-[13px] leading-[1.4] text-fg motion-safe:animate-[cl-rise_420ms_var(--ease-out)_both]"
              style={{ top: 52 }}
            >
              {scene.ask}
            </p>

            {/* Claude using Pilot: who it's talking to, then done. */}
            <div
              className={`absolute right-5 left-3 flex h-[42px] items-center gap-2.5 rounded-[12px] border border-(--sky-card-line) px-2.5 transition-[opacity,translate] duration-300 ease-(--ease-out) ${
                at >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
              style={{ top: l.tool }}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-(--sky-fill) text-white">
                <PilotMarkP className="h-3 w-auto" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] leading-4 font-medium text-fg">
                  {done ? scene.done : scene.with.length > 1 ? `Asking ${whom}` : `Asking ${whom}’s agent`}
                </span>
                <span className="block text-[11.5px] leading-4 text-mute tabular-nums">
                  {scene.legs.some((x) => x.file) ? `Files sent · ${done || at > 1 ? 1 : 0}` : `Back and forth · ${trips}`}
                </span>
              </span>
              {done ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-(--sky-fill) text-white">
                  <CheckIcon className="size-3" />
                </span>
              ) : (
                <span aria-hidden className="cl-spin size-4 shrink-0 rounded-full border-[1.5px] border-(--sky-fill)/25 border-t-(--sky-fill)" />
              )}
            </div>

            {/* The answer, once the agents are done. */}
            <div
              className={`absolute inset-x-3.5 flex gap-2 transition-[opacity,translate,filter] duration-500 ease-(--ease-out) ${
                done ? "translate-y-0 opacity-100 blur-0" : "translate-y-1 opacity-0 blur-[2px]"
              }`}
              style={{ top: l.answer }}
            >
              <AppMark app="Claude" className="mt-0.5 size-3.5" />
              <p className="text-[13px] leading-[1.4] text-fg">{scene.answer}</p>
            </div>

            {l.composer && (
              <div className="absolute inset-x-3 bottom-3 flex h-9 items-center rounded-[11px] border border-(--sky-card-line) pr-1.5 pl-3 text-[12.5px] text-mute">
                Reply to Claude…
                <span className="ml-auto grid size-6 place-items-center rounded-[7px] bg-fg/[0.08] text-mute">
                  <ArrowUpGlyph className="size-3" />
                </span>
              </div>
            )}
          </div>

          {/* Your agent, where the wire leaves the chat. */}
          <span
            aria-hidden
            className={`absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[7px] bg-(--sky-fill) text-white ring-[3px] transition-shadow duration-300 ${
              leg && (leg.from === "you" || leg.to === "you") ? "ring-(--sky-fill)/25" : "ring-card"
            }`}
            style={{ left: l.a[0], top: l.a[1] }}
          >
            <PilotMarkP className="h-3 w-auto" />
          </span>

          {scene.with.map((f) => (
            <FriendCard key={f} who={f} at={sp[f]} l={l} lit={!!leg && (leg.from === f || leg.to === f)} />
          ))}

          {/* What the message on its way says, on a chip beside its wire. */}
          {leg && chip && (
            <>
              <span
                key={`chip-${s}-${at}`}
                aria-hidden
                className="cl-chip absolute flex items-center gap-1.5 rounded-full border border-(--sky-card-line) bg-card py-1 pr-2.5 pl-1.5 text-[12px] leading-4 whitespace-nowrap text-fg shadow-[0_1px_2px_rgb(20_20_18/0.06)]"
                style={chip}
              >
                <span className="grid size-4 place-items-center">
                  {leg.file ? <FileGlyph className="size-3.5 text-(--sky-accent)" /> : <AppMark app={sender} className="size-3.5" />}
                </span>
                {leg.say}
              </span>
            </>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {scene.note}
      </p>
      <div role="group" aria-label="What you can hand off" className="grid grid-cols-2 gap-1 p-1.5 sm:grid-cols-4">
        {SCENES.map((x, i) => (
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
        ))}
      </div>
    </figure>
  );
}
