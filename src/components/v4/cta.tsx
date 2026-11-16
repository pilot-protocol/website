"use client";

import {
  animate,
  motion,
  motionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUpRightIcon, CheckIcon, CopyIcon } from "@/components/icons";
import { SmartLink } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { INSTALL_CMD, LINKS, MCP_URL } from "@/lib/site";
import { BrandMark, type Brand } from "./logos";
import "./cta.css";

/*
 * CTA (Figma 160:819, keyframes 166:4104 → 166:2943).
 *
 * When the section comes into view an airliner flies across on its own. The blue shape (the contrail)
 * is tied to the plane and trails it until the whole section is sky; the white type is revealed by the
 * same edge. At the end keyframe the trail stops and the plane carries on, out to the right.
 *
 * The stage pins to the top of the window for a stretch of scroll (the runway, cta.css), so the reader sees
 * the flight through rather than scrolling past it half way.
 *
 * It flies every time the reader arrives from above, and otherwise stays blue: scrolling on into the
 * footer keeps the sky (the footer continues it), and coming back up from the footer shows the end
 * state. Only leaving through the bottom of the viewport (scrolling back up past it) re-arms it.
 *
 * Everything is measured in the design's 1680 × 900 frame and scaled by `s` (from the section size),
 * and every moving part is a translateX.
 */

const D = {
  // The airliner, trimmed and rotated nose-right (public/v4/cta-plane.webp): 1374 × 1518.8 in the frame.
  planeW: 1374,
  planeH: 1518.8,
  // End keyframe: the plane's left edge sits 183.7 from the right edge (tail still in view).
  endInset: 183.69,
  // The shape (public/v4/cta-shape.svg) and where it hangs off the plane: its left edge is 1546.31
  // behind the plane's, its point 149.25 deep, and it sits 11.35 below the plane's centre line.
  shapeW: 2231.75,
  shapeH: 1114,
  shapeBehind: 1546.31,
  shapeTip: 149.25,
  shapeDy: 11.35,
};

// The flight: a short climb to speed, a steady cruise, and a slow finish that happens off-screen.
// On screen: nose in at ~0.2s, type fully revealed by ~1.9s, plane gone by ~2.4s.
const FLIGHT = { duration: 3.2, ease: [0.32, 0.06, 0.38, 1] as const };
// How much of the section must be showing before the plane takes off (its top at ~70% of the viewport).
const TAKEOFF = 0.3;

export type Box = { w: number; h: number };

/*
 * Shared with the footer, which sits directly below and carries the trail (and the plane's wings) on
 * across the seam, so the two sections line up at every moment of the flight. `box` is null whenever
 * no CTA is on the page (inner pages), and the footer then shows its plain end-state sky.
 */
export const ctaShared = {
  box: motionValue<Box | null>(null),
  trailX: motionValue(0),
  planeX: motionValue(0),
};

export function geometry({ w, h }: Box) {
  const s = Math.min(h / 900, w / 1200);
  // The trail must reach both edges at the end keyframe, so it may be wider (and taller) than `s` alone.
  const sx = Math.max(s, w / 1680);
  const shapeW = D.shapeW * sx;
  const shapeH = D.shapeH * sx;
  const shapeTop = h / 2 + D.shapeDy * s - shapeH / 2;
  // On screens taller than the shape (phones, tablets upright) its body carries on straight up and down.
  const over = Math.max(0, shapeTop + h * 0.1, h * 1.1 - shapeTop - shapeH);
  const tip = (D.shapeW - D.shapeBehind) * s; // the trail's point, from the plane's left edge
  const planeW = D.planeW * s;
  const planeH = D.planeH * s;
  return {
    s,
    planeW,
    planeH,
    planeTop: (h - planeH) / 2,
    shapeW,
    shapeH,
    shapeLeft: tip - shapeW,
    shapeTop,
    // The extensions: the shape's body without its point, overlapping the SVG by 2px to hide the seam.
    bodyW: (D.shapeW - D.shapeTip) * sx,
    over: over > 0 ? over + 2 : 0,
    unit: sx,
    // The trail's straight edge, where the point begins; the type is revealed along it.
    edge: tip - D.shapeTip * sx,
    // The plane starts and finishes well off-screen (where the ease is slow), and the trail stops at
    // the design's end keyframe.
    from: -planeW * 1.06,
    to: w - D.endInset * s,
    out: w + planeW * 0.15,
  };
}

function useBox() {
  const ref = useRef<HTMLElement>(null);
  const [box, setBox] = useState<Box>({ w: 1440, h: 900 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setBox({ w: node.clientWidth, h: node.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, box };
}

/** Resolves once the plane image can be drawn, or after a short wait so the flight never stalls. */
function planeReady(img: HTMLImageElement | null) {
  if (!img || (img.complete && img.naturalWidth > 0)) return Promise.resolve();
  return Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 900))]);
}

/* The trail's silhouette as mask layers: its body above the shape, the shape itself, its body below. */
const SKY_MASK = "linear-gradient(#000, #000), url(/v4/cta-shape.svg), linear-gradient(#000, #000)";

function TerminalGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.75" y="2.75" width="14.5" height="12.5" rx="2" />
      <path d="M5 7l2.25 2L5 11M9.5 11.25H13" />
    </svg>
  );
}

/**
 * One way in, as a white card on the sky (fixed colours: the sky is the same in both themes): what it is, the one
 * thing to copy, and where to go next.
 */
function Way({
  icon,
  title,
  marks,
  value,
  display,
  copyLabel,
  link,
}: {
  icon: ReactNode;
  title: string;
  marks?: Brand[];
  value: string;
  display: ReactNode;
  copyLabel: string;
  link: { label: string; href: string };
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the text is selectable in the field.
    }
  };
  return (
    <div className="cta-way flex min-w-0 flex-col rounded-[14px] bg-white p-4 text-[#141413] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 text-[15px] leading-5 font-medium tracking-[-0.02em]">
          <span className="grid h-8 min-w-8 place-items-center rounded-[9px] bg-[#f1f3f8] px-1.5 text-[#141413]">{icon}</span>
          {title}
        </p>
        {marks && (
          <span className="flex items-center gap-1.5 text-[#141413]/70">
            {marks.map((m) => (
              <BrandMark key={m} brand={m} className="size-[14px]" />
            ))}
          </span>
        )}
      </div>
      <div className="mt-3.5 flex items-center gap-2 rounded-[10px] bg-[#f4f5f8] py-1.5 pr-1.5 pl-3">
        <code className="min-w-0 flex-1 py-0.5 font-mono text-[11.5px] leading-[18px] tracking-[-0.02em] select-all sm:text-[12px] xl:text-[12.5px]">
          {display}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={copyLabel}
          className="pressable grid size-8 shrink-0 place-items-center rounded-[8px] text-[#141413]/70 transition-colors hover:bg-[#141413]/[0.06] hover:text-[#141413]"
        >
          {copied ? <CheckIcon className="size-3.5 text-[#1f5bff]" /> : <CopyIcon className="size-3.5" />}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
      </div>
      <SmartLink
        href={link.href}
        className="mt-3.5 inline-flex w-fit items-center gap-1.5 text-[13.5px] leading-5 font-medium text-[#141413] underline decoration-[#141413]/25 underline-offset-[3px] hover:decoration-[#141413]"
      >
        {link.label}
        <ArrowUpRightIcon className="size-[11px]" />
      </SmartLink>
    </div>
  );
}

export function CtaD() {
  const reduced = usePrefersReducedMotion();
  const { ref: section, box } = useBox();
  const plane = useRef<HTMLImageElement>(null);
  const g = geometry(box);

  // Flight progress: 0 = waiting off the left edge, 1 = done (the end state). The server renders the
  // end state, so the section reads correctly before any script runs.
  const flight = useMotionValue(1);
  const planeX = useTransform(flight, (p) => g.from + (g.out - g.from) * p);
  const trailX = useTransform(planeX, (x) => Math.min(x, g.to));
  const typeX = useTransform(trailX, (x) => -x);

  // Publish the flight for the footer: positions every frame, the box whenever it changes.
  useMotionValueEvent(trailX, "change", (x) => ctaShared.trailX.set(x));
  useMotionValueEvent(planeX, "change", (x) => ctaShared.planeX.set(x));
  useEffect(() => {
    ctaShared.trailX.set(trailX.get());
    ctaShared.planeX.set(planeX.get());
    ctaShared.box.set(box);
  }, [box, trailX, planeX]);
  useEffect(() => () => ctaShared.box.set(null), []);

  // Only fetch the airliner once the section is getting close.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "150% 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, [section]);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    if (reduced) {
      flight.set(1);
      return;
    }

    // Where the section is: below the viewport (not reached yet), showing, or above it (passed).
    const below = (r: DOMRectReadOnly) => r.top >= window.innerHeight;

    // Landing directly (reload, anchor) or from below: the end state. Still to come: wait off-screen.
    let armed = below(node.getBoundingClientRect());
    let flying = false;
    let controls: AnimationPlaybackControls | undefined;
    let alive = true;
    flight.set(armed ? 0 : 1);

    const takeOff = async () => {
      armed = false;
      flying = true;
      flight.set(0);
      await planeReady(plane.current);
      if (!alive) return;
      controls = animate(flight, 1, {
        ...FLIGHT,
        onComplete: () => {
          flying = false;
          // Scrolled back up past it mid-flight: get ready for the next arrival.
          if (below(node.getBoundingClientRect())) {
            armed = true;
            flight.set(0);
          }
        },
      });
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) {
          // Left through the bottom (the reader went back up): re-arm, out of sight. Left through the
          // top (on into the footer): stay blue so the footer's sky carries straight on.
          if (below(e.boundingClientRect)) {
            armed = true;
            if (!flying) flight.set(0);
          }
          return;
        }
        if (!armed || flying) return;
        // Arrived with its top already above the viewport (a jump to just past it): blue, as if it had flown.
        if (e.boundingClientRect.top < 0) {
          armed = false;
          flight.set(1);
        } else if (e.intersectionRatio >= TAKEOFF) takeOff();
      },
      { threshold: [0, TAKEOFF] },
    );
    // Jumped straight past it (End key, an anchor further down) without it ever showing: blue, as if it
    // had flown. The root reaches far above the viewport, so passing it counts as "intersecting".
    const past = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.boundingClientRect.bottom <= 0 && armed && !flying) {
          armed = false;
          flight.set(1);
        }
      },
      { rootMargin: "100000px 0px 0px 0px" },
    );
    io.observe(node);
    past.observe(node);
    return () => {
      alive = false;
      io.disconnect();
      past.disconnect();
      controls?.stop();
    };
  }, [reduced, flight, section]);

  // Keyboard users can reach the buttons before the trail does; show the type while focus is inside.
  const [focused, setFocused] = useState(false);
  const MASK = box.w + 2400;

  return (
    // The runway: the stage pins to the top for a stretch of scroll, so the flight plays out in full instead of
    // being scrolled past (scroll capture, as on PilotLink). With reduced motion there's no flight to wait for.
    <div className="cta-runway relative">
    <section ref={section} id="get-started" aria-label="Get started with Pilot" className="cta-stage sticky top-0 h-lvh overflow-hidden bg-bg">
      {/* The contrail. */}
      <motion.div aria-hidden className="cta-layer absolute top-0 left-0" style={{ x: trailX }}>
        {/*
          One sky for the whole stage, top to bottom (Figma 220:25121: the page at the top, the deep blue at the bottom),
          cut to the trail's silhouette: the shape, and on tall screens its body carrying on above and below it.
        */}
        <div
          className="cta-sky absolute top-0"
          style={
            {
              left: g.shapeLeft,
              width: g.shapeW,
              height: box.h,
              "--sky-y0": `${(-0.107 * box.h).toFixed(1)}px`,
              "--sky-y1": `${(0.922 * box.h).toFixed(1)}px`,
              maskImage: SKY_MASK,
              WebkitMaskImage: SKY_MASK,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: `0 0, 0 ${g.shapeTop}px, 0 ${g.shapeTop + g.shapeH - 2}px`,
              WebkitMaskPosition: `0 0, 0 ${g.shapeTop}px, 0 ${g.shapeTop + g.shapeH - 2}px`,
              maskSize: `${g.bodyW}px ${Math.max(0, g.shapeTop + 2)}px, ${g.shapeW}px ${g.shapeH}px, ${g.bodyW}px ${Math.max(0, box.h - g.shapeTop - g.shapeH + 2)}px`,
              WebkitMaskSize: `${g.bodyW}px ${Math.max(0, g.shapeTop + 2)}px, ${g.shapeW}px ${g.shapeH}px, ${g.bodyW}px ${Math.max(0, box.h - g.shapeTop - g.shapeH + 2)}px`,
            } as CSSProperties
          }
        />
      </motion.div>

      {/* The type, revealed along the trail's edge: the mask moves with the trail, its content holds still. */}
      <motion.div
        className={`cta-layer absolute inset-y-0 ${focused ? "overflow-visible" : "overflow-hidden"}`}
        style={{ left: g.edge - MASK, width: MASK, x: trailX }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <motion.div
          className="cta-layer absolute inset-y-0 flex items-center justify-center px-5"
          style={{ left: MASK - g.edge, width: box.w, x: typeX }}
        >
          {/* As in the design, a little above centre; on short screens, centred in the space under the header. */}
          <div className="flex w-full max-w-[1000px] flex-col items-center gap-7 text-center sm:gap-8" style={{ marginTop: box.h < 640 ? 40 : -24 * g.s }}>
            <h2
              id="cta-title"
              className="text-[clamp(44px,5.6vw,80px)] leading-[0.9] font-medium tracking-[-0.05em] text-white short:text-[44px]"
            >
              The internet
              <br />
              for agents.
            </h2>
            <p className="max-w-[440px] text-[16px] leading-[1.35] font-medium tracking-[-0.3125px] text-balance text-white">
              Get your agent on the network in under five minutes, on your own machine or in the AI app you already use.
            </p>
            {/* The two ways in, each one copy away (this is the home page's "get started"). */}
            <div className="grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <Way
                icon={<TerminalGlyph className="size-[17px]" />}
                title="On your machine"
                marks={["apple", "linux"]}
                value={INSTALL_CMD}
                display={
                  <>
                    <span className="text-[#0b2ca0]">curl</span> -fsSL <wbr />
                    <span className="whitespace-nowrap">https://pilotprotocol.network/</span>
                    <wbr />
                    <span className="whitespace-nowrap">install.sh | sh</span>
                  </>
                }
                copyLabel="Copy the install command"
                link={{ label: "Getting started guide", href: LINKS.gettingStarted }}
              />
              <Way
                icon={
                  <span className="flex items-center gap-1">
                    <BrandMark brand="claude" className="size-[15px]" />
                    <BrandMark brand="openai" className="size-[15px]" />
                  </span>
                }
                title="In Claude or ChatGPT"
                value={MCP_URL}
                display={
                  <>
                    <span className="whitespace-nowrap">https://cloud.pilotprotocol.network</span>
                    <wbr />
                    <span className="text-[#0b2ca0]">/mcp</span>
                  </>
                }
                copyLabel="Copy the MCP URL"
                link={{ label: "Open Pilot Cloud", href: LINKS.cloud }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* The airliner, on top of everything. */}
      {near && !reduced && (
        <motion.img
          ref={plane}
          src="/v4/cta-plane.webp"
          srcSet="/v4/cta-plane-1600.webp 1600w, /v4/cta-plane.webp 3160w"
          sizes={`${Math.round(g.planeW)}px`}
          alt=""
          aria-hidden
          width={3160}
          height={3493}
          decoding="async"
          draggable={false}
          className="cta-layer pointer-events-none absolute top-0 left-0 max-w-none select-none"
          style={{ x: planeX, top: g.planeTop, width: g.planeW, height: g.planeH }}
        />
      )}
    </section>
    </div>
  );
}
