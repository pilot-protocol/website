"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FingerprintIcon, KeyIcon, LockIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { Beam } from "@/components/sky/beam";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { AppMark, BoxGlyph, TrashGlyph } from "./marks";
import "./cloud.css";

/*
 * Sky: "Your agent is yours alone", drawn as the things involved. Your AI apps on one side, your friends' agents
 * on the other, your agent in the middle inside its own sandbox; locked tunnels between them with messages running
 * through as the site's beam; and the key you make next to the only thing Pilot Cloud keeps of it, its fingerprint.
 */

const TILE = "relative grid size-12 shrink-0 place-items-center rounded-[13px] border border-(--sky-card-line) bg-card";

/** From md up, three short wires gather the stack's tiles into its tunnel. */
function Fan({ side }: { side: "left" | "right" }) {
  // Tiles are 48px tall with 10px between them: centres at 24, 82 and 140.
  const ys = [24, 82, 140];
  const x0 = side === "right" ? 0 : 28;
  const x1 = side === "right" ? 28 : 0;
  return (
    <svg
      aria-hidden
      width={28}
      height={164}
      className={`absolute top-0 hidden overflow-visible md:block ${side === "right" ? "left-full" : "right-full"}`}
    >
      {ys.map((y) => (
        <path key={y} d={`M${x0} ${y} C${(x0 + x1) / 2} ${y} ${(x0 + x1) / 2} 82 ${x1} 82`} fill="none" strokeWidth={1.25} className="stroke-fg/15" />
      ))}
    </svg>
  );
}

function Stack({ apps, people, label, fan }: { apps: string[]; people?: string[]; label: string; fan: "left" | "right" }) {
  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative flex gap-2.5 md:flex-col">
        <Fan side={fan} />
        {apps.map((a, i) => (
          <span key={a} className={TILE}>
            <AppMark app={a} className="size-6" />
            {people && (
              <span className="absolute -right-1.5 -bottom-1.5 grid size-[18px] place-items-center rounded-full bg-fg text-[10px] font-medium text-bg ring-2 ring-card">
                {people[i]}
              </span>
            )}
          </span>
        ))}
      </div>
      <p className="text-[14px] leading-5 font-medium tracking-[-0.01em] whitespace-nowrap text-fg md:absolute md:top-full md:mt-3">{label}</p>
    </div>
  );
}

/** The tunnel's box in px, and whether it runs across (md up) or down (phones). */
function useTube() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, across: true });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setBox({ w: node.clientWidth, h: node.clientHeight, across: mq.matches });
    const ro = new ResizeObserver(update);
    ro.observe(node);
    mq.addEventListener("change", update);
    update();
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);
  return [ref, box] as const;
}

/**
 * An encrypted tunnel: a tube with a lock on it, drawn in SVG so a message can run through it as the site's beam,
 * one way and then the other.
 */
function Tunnel({ gap, run, reverse, delay = 0 }: { gap: "left" | "right"; run: number | null; reverse: boolean; delay?: number }) {
  const [ref, { w, h, across }] = useTube();
  const d = !w || !h ? "" : across ? `M6 ${h / 2} H${w - 6}` : `M${w / 2} 6 V${h - 6}`;
  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative flex min-h-16 min-w-16 flex-1 items-center justify-center self-stretch md:min-h-10 md:self-auto ${gap === "left" ? "md:ml-7" : "md:mr-7"}`}
    >
      {d && (
        <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
          <path d={d} fill="none" strokeLinecap="round" strokeWidth={11} stroke="var(--sky-card-line)" />
          <path d={d} fill="none" strokeLinecap="round" strokeWidth={9} stroke="color-mix(in srgb, var(--sky-fill) 7%, var(--color-card))" />
          <Beam d={d} run={run} reverse={reverse} delay={delay} duration={1500} width={2} tail={70} />
        </svg>
      )}
      <span className="relative grid size-8 place-items-center rounded-full border border-(--sky-card-line) bg-card text-(--sky-accent)">
        <LockIcon className="size-3.5" />
      </span>
    </div>
  );
}

const TUNNEL_MS = 1900;

export function PrivacyPicture() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  // One message at a time through each tunnel, alternating direction; the clock only runs on screen.
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setN((v) => v + 1), TUNNEL_MS);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  const run = inView ? n : null;
  return (
    <div
      ref={ref}
      className="mx-auto flex max-w-[980px] flex-col items-center md:flex-row md:items-center"
      role="img"
      aria-label="Your AI apps (Claude, ChatGPT, Muse) connect to your agent through an encrypted tunnel. Your agent runs in its own sandbox, one per account, and Pilot Cloud keeps only a fingerprint of each key you make. Your agent talks to your friends' agents through encrypted tunnels too."
    >
      <Stack apps={["Claude", "ChatGPT", "Muse"]} label="Your AI apps" fan="right" />
      <Tunnel gap="left" run={run} reverse={n % 2 === 1} />

      {/* Your agent, in its sandbox. */}
      <div className="relative w-full max-w-[320px] shrink-0 rounded-[22px] border-[1.5px] border-dashed border-(--sky-fill)/45 bg-[color-mix(in_srgb,var(--sky-fill)_4%,var(--color-bg))] p-2.5 pt-8">
        <span className="absolute top-2.5 left-3.5 flex items-center gap-1.5 text-[12.5px] leading-4 text-(--sky-accent)">
          <BoxGlyph className="size-3.5" />
          Your sandbox
        </span>
        <span className="absolute top-2.5 right-3.5 text-[12.5px] leading-4 text-mute">1 per account</span>
        <div className="sky-card flex flex-col items-center px-4 pt-5 pb-4 text-center">
          <span className="grid size-14 place-items-center rounded-[16px] bg-(--sky-fill) text-white">
            <PilotMarkP className="h-6 w-auto" />
          </span>
          <p className="mt-3 text-[15px] leading-5 font-medium tracking-[-0.01em] text-fg">Your agent</p>
          {/* The key you make, and what's kept of it. */}
          <div className="mt-4 flex w-full items-center gap-1.5 rounded-[10px] bg-fg/[0.04] p-1.5 text-[12px] leading-4">
            <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[7px] bg-card px-2 py-1.5 text-mute">
              <KeyIcon className="size-3 shrink-0 text-fg" />
              <span className="truncate font-mono">pk_demo_no…</span>
            </span>
            <span className="text-mute">→</span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[7px] bg-card px-2 py-1.5 text-fg">
              <FingerprintIcon className="size-3 shrink-0 text-(--sky-accent)" />
              <span className="truncate font-mono">9f3c…e1a4</span>
            </span>
          </div>
        </div>
      </div>

      <Tunnel gap="right" run={run} reverse={n % 2 === 0} delay={650} />
      <Stack apps={["Gemini", "Le Chat", "Grok"]} people={["L", "J", "T"]} label="Friends’ agents" fan="left" />
    </div>
  );
}

/** The four promises under the picture, each with the object that stands for it. */
export function PrivacyFacts({ items }: { items: [string, string][] }) {
  const icons: ReactNode[] = [
    <BoxGlyph key="box" className="size-[18px]" />,
    <LockIcon key="lock" className="size-4" />,
    <FingerprintIcon key="fp" className="size-4" />,
    <TrashGlyph key="trash" className="size-[18px]" />,
  ];
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([t, b], i) => (
        <li key={t} className="flex gap-3.5">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--color-fg)_6%,var(--color-bg))] text-fg"
          >
            {icons[i]}
          </span>
          <p className="text-[15px] leading-[1.55] text-mute">
            <span className="text-fg">{t}</span> {b}
          </p>
        </li>
      ))}
    </ul>
  );
}
