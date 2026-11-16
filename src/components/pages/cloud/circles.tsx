"use client";

import type { CSSProperties } from "react";
import { LogoMark, PilotMarkP } from "@/components/logo";
import { SKY } from "@/components/pages/security/kit";
import { useInView } from "@/lib/hooks";
import "./cloud.css";

// Your agent in the middle; each circle gets what its name says.
const RINGS = [
  { name: "Close friends", rule: "shares freely", r: 0.2, dots: [-20, 70, 160, 245], every: 1.1, size: 8 },
  { name: "Friends", rule: "cooperates normally", r: 0.32, dots: [20, 115, 200, 290], every: 2.6, size: 6 },
  { name: "Acquaintances", rule: "only what is needed", r: 0.44, dots: [-35, 50, 135, 215, 320], every: 5.2, size: 4 },
];

/** Sky: the same friends, nudged so none of them sits under a ring's label pill. */
const SKY_DOTS = [
  [-20, 70, 160, 205],
  [20, 115, 200, 335],
  [-35, 50, 135, 215, 320],
];

/**
 * Circles, drawn literally: packets leave your agent for every friend, steadily
 * for close friends and rarely for acquaintances.
 */
export function Circles() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });

  return (
    <div
      ref={ref}
      className={`relative mx-auto aspect-square w-full max-w-[520px] [container-type:inline-size] ${inView ? "" : "cl-paused"}`}
      role="img"
      aria-label="Your agent in the middle of three circles: close friends, with whom it shares freely; friends, with whom it cooperates normally; and acquaintances, with whom it shares only what is needed."
    >
      {RINGS.map((ring, ri) => (
        <div key={ring.name} aria-hidden>
          <span
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
              SKY ? (ri === 0 ? "border-(--sky-fill)/35" : "border-edge-2") : ri === 0 ? "border-lime-ink/40" : "border-edge-2"
            }`}
            style={{ width: `${ring.r * 200}cqw`, height: `${ring.r * 200}cqw` }}
          />
          {(SKY ? SKY_DOTS[ri] : ring.dots).map((a, di) => {
            const rad = (a * Math.PI) / 180;
            return (
              <span key={a}>
                <span
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    SKY
                      ? ri === 0
                        ? "size-3 bg-(--sky-fill) ring-[3px] ring-card"
                        : "size-2.5 bg-card ring-[1.5px] ring-fg/30"
                      : `size-2.5 border ${ri === 0 ? "border-lime-ink bg-bg" : "border-fg/40 bg-bg"}`
                  }`}
                  style={{ left: `${50 + Math.cos(rad) * ring.r * 100}%`, top: `${50 + Math.sin(rad) * ring.r * 100}%` }}
                />
                <span
                  className={`cl-out absolute top-1/2 left-1/2 ${SKY ? "rounded-full bg-(--sky-fill)" : "bg-lime"}`}
                  style={
                    {
                      width: ring.size,
                      height: ring.size,
                      marginLeft: -ring.size / 2,
                      marginTop: -ring.size / 2,
                      opacity: ri === 2 ? 0.7 : 1,
                      "--a": `${a}deg`,
                      "--r": `${ring.r * 100}cqw`,
                      "--t": `${ring.every}s`,
                      "--d": `${(di * ring.every) / ring.dots.length + ri * 0.3}s`,
                    } as CSSProperties
                  }
                />
              </span>
            );
          })}
          {SKY ? (
            <span
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--sky-card-line) bg-card px-2.5 py-1 text-[11.5px] leading-4 whitespace-nowrap text-fg sm:text-[12.5px]"
              style={{ top: `${50 - ring.r * 100}%` }}
            >
              {ring.name} <span className="text-mute">· {ring.rule}</span>
            </span>
          ) : (
            <span
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-edge bg-bg px-2 py-1 font-mono text-[10.5px] whitespace-nowrap text-soft sm:text-[11px]"
              style={{ top: `${50 - ring.r * 100}%` }}
            >
              {ring.name.toLowerCase()} <span className="text-dim">· {ring.rule}</span>
            </span>
          )}
        </div>
      ))}

      {SKY ? (
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <span className="grid size-14 place-items-center rounded-[16px] bg-(--sky-fill) text-white shadow-tile">
            <PilotMarkP className="h-[44%] w-auto" />
          </span>
          <span className="rounded-full bg-card px-1.5 text-[13px] leading-5 font-medium whitespace-nowrap text-fg">@maria</span>
        </div>
      ) : (
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5">
          <span className="grid size-14 place-items-center rounded-[12px] border border-lime-ink/70 bg-card shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-lime)_8%,transparent)]">
            <LogoMark className="h-auto w-7 text-lime-ink" />
          </span>
          <span className="font-mono text-[11px] whitespace-nowrap text-fg">@maria</span>
        </div>
      )}
    </div>
  );
}
