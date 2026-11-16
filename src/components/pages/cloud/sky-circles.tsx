"use client";

import { useEffect, useState } from "react";
import { PilotMarkP } from "@/components/logo";
import { Beam } from "@/components/sky/beam";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { CircleBadge } from "./marks";
import "./cloud.css";

/*
 * Sky: your agent in the middle and your friends around it, in the three circles Pilot Cloud sorts them into, with
 * the circles' own badges (heart, paw, bone). The people are the ones on the app's Friends screen; the two still
 * waiting to join are drawn dashed. Messages run out along the wires to everyone, most often to close friends.
 */

type Ring = "close" | "friends" | "acquaintances";
/** `every`: how many ticks of TICK_MS between messages to someone in this circle. */
const RINGS: { id: Ring; name: string; rule: string; r: number; every: number }[] = [
  { id: "close", name: "Close friends", rule: "shares freely", r: 0.205, every: 6 },
  { id: "friends", name: "Friends", rule: "cooperates normally", r: 0.33, every: 14 },
  { id: "acquaintances", name: "Acquaintances", rule: "only what is needed", r: 0.455, every: 27 },
];
const TICK_MS = 200;

/** The wire from your agent's tile out to a friend's avatar, in the picture's 100 × 100 box. */
function spokeOf(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  const at = (k: number) => `${(50 + Math.cos(rad) * k).toFixed(2)} ${(50 + Math.sin(rad) * k).toFixed(2)}`;
  return `M${at(9)} L${at(r * 100 - 4.4)}`;
}

/** Angles in degrees, clockwise from three o'clock; the top of each ring is kept clear for its label. */
const PEOPLE: { ring: Ring; initials: string; name: string; a: number; waiting?: boolean }[] = [
  { ring: "close", initials: "AC", name: "Alex", a: 200 },
  { ring: "close", initials: "SK", name: "sam-k", a: 335 },
  { ring: "close", initials: "D", name: "Dana", a: 125 },
  { ring: "close", initials: "O", name: "Omar", a: 55, waiting: true },
  { ring: "friends", initials: "JL", name: "Jordan", a: 160 },
  { ring: "friends", initials: "P", name: "Priya", a: 20, waiting: true },
  { ring: "acquaintances", initials: "TF", name: "Tom", a: 142 },
];

export function SkyCircles() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const ring = (id: Ring) => RINGS.find((r) => r.id === id)!;
  // The clock only runs on screen, so no message is sent while nobody can see it.
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setT((v) => v + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-[520px] [container-type:inline-size]"
      role="img"
      aria-label="Your agent in the middle of three circles of friends: close friends, with whom it shares freely; friends, with whom it cooperates normally; and acquaintances, with whom it shares only what is needed."
    >
      {/* The circles, outermost first so the inner ones sit on top; each a flat disc a shade deeper than the last. */}
      {[...RINGS].reverse().map((r, i) => (
        <span
          key={r.id}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--sky-card-line)"
          style={{
            width: `${r.r * 200}cqw`,
            height: `${r.r * 200}cqw`,
            background: `color-mix(in srgb, var(--color-fg) ${[2, 3.5, 0][i]}%, var(--color-card))`,
            ...(r.id === "close" ? { background: "color-mix(in srgb, var(--sky-fill) 7%, var(--color-card))", borderColor: "color-mix(in srgb, var(--sky-fill) 28%, transparent)" } : {}),
          }}
        />
      ))}

      {/* A wire from your agent to each friend (dashed while they haven't joined), and messages running out along it. */}
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
        {PEOPLE.map((p, i) => {
          const r = ring(p.ring);
          const spoke = spokeOf(p.a, r.r);
          return (
            <g key={`spoke-${p.name}`}>
              <path
                d={spoke}
                fill="none"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeDasharray={p.waiting ? "3 3" : undefined}
                className={p.waiting ? "stroke-fg/20" : "stroke-fg/12"}
              />
              {!p.waiting && (
                <Beam d={spoke} run={inView ? Math.floor((t + i * 3) / r.every) : null} duration={r.every > 10 ? 1300 : 950} width={0.32} tail={r.r > 0.3 ? 12 : 7} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Your friends. */}
      {PEOPLE.map((p) => {
        const r = ring(p.ring);
        const rad = (p.a * Math.PI) / 180;
        return (
          <span
            key={p.name}
            aria-hidden
            className="absolute flex -translate-x-1/2 -translate-y-[calc(50%-0.9cqw)] flex-col items-center"
            style={{ left: `${50 + Math.cos(rad) * r.r * 100}%`, top: `${50 + Math.sin(rad) * r.r * 100}%` }}
          >
            <span
              className={`relative grid size-[max(30px,7.6cqw)] place-items-center rounded-full text-[max(10px,2.5cqw)] font-medium tracking-[-0.02em] ${
                p.waiting
                  ? "border border-dashed border-fg/35 bg-card text-mute"
                  : "border border-(--sky-card-line) bg-[color-mix(in_srgb,var(--color-fg)_7%,var(--color-card))] text-fg"
              }`}
            >
              {p.initials}
              {!p.waiting && <CircleBadge circle={p.ring} className="absolute -right-[max(6px,0.8cqw)] -bottom-[max(3px,0.6cqw)] size-[max(12px,3.1cqw)] ring-2 ring-card" />}
            </span>
            <span className="mt-1 rounded-full bg-card/90 px-1 text-[max(10px,2.35cqw)] leading-[1.3] whitespace-nowrap text-mute">{p.name}</span>
          </span>
        );
      })}

      {/* Each circle's name and what your agent does for it, on the circle's top edge. */}
      {RINGS.map((r) => (
        <span
          key={`label-${r.id}`}
          aria-hidden
          className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-(--sky-card-line) bg-card py-1 pr-2.5 pl-1 text-[max(11px,2.6cqw)] leading-4 whitespace-nowrap text-fg"
          style={{ top: `${50 - r.r * 100}%` }}
        >
          <CircleBadge circle={r.id} className="size-[max(17px,4.2cqw)]" />
          {r.name} <span className="text-mute">· {r.rule}</span>
        </span>
      ))}

      {/* Your agent. */}
      <span aria-hidden className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-[calc(50%-1.6cqw)] flex-col items-center gap-1.5">
        <span className="grid size-[max(44px,12cqw)] place-items-center rounded-[28%] bg-(--sky-fill) text-white shadow-[0_0_0_5px_var(--color-card)]">
          <PilotMarkP className="h-[44%] w-auto" />
        </span>
        <span className="rounded-full bg-card px-1.5 text-[max(12px,2.8cqw)] leading-5 font-medium whitespace-nowrap text-fg">@maria</span>
      </span>
    </div>
  );
}
