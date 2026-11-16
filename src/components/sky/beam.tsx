"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/*
 * A message in flight, drawn as light travelling along the wire rather than a dot sliding over it: a rounded head with
 * a tail that fades out behind it and a faint glow, all following the path's own curve. The site's one
 * packet style; use it for every "something moves from here to there" (the home diagrams and the inner pages).
 *
 * Draw it inside the same <svg> as the wire it travels along, with the same `d`. Each `run` change plays it once
 * (from start to end, or end to start with `reverse`). With reduced motion it doesn't play; the diagram's states
 * carry the meaning.
 */
/*
 * The beam's layers, front-aligned: each is a dash of the path, all sharing one leading edge. Shorter layers stack on
 * longer ones, so the tail fades in steps towards a rounded, brighter head; a wide faint layer gives it a glow.
 * [length as a share of the tail, stroke width multiplier (+ added px), opacity]
 */
const LAYERS: [number, number, number][] = [
  [0.7, 3.5, 0.07], // glow
  [1, 1, 0.14],
  [0.72, 1, 0.2],
  [0.46, 1, 0.32],
  [0.24, 1.1, 0.55],
  [0.07, 1.9, 1], // head
];

export function Beam({
  d,
  run,
  reverse = false,
  duration = 1100,
  delay = 0,
  color = "var(--sky-fill)",
  width = 2,
  tail = 72,
  onArrive,
}: {
  d: string;
  /** Change it to play the beam again (a counter or a key). null/undefined: idle. */
  run: number | string | null | undefined;
  reverse?: boolean;
  /** ms for the head to cross the whole path. */
  duration?: number;
  delay?: number;
  color?: string;
  /** The wire's width; the beam is drawn a touch heavier. */
  width?: number;
  /** Tail length in px. */
  tail?: number;
  onArrive?: () => void;
}) {
  const ref = useRef<SVGGElement>(null);
  const reduced = usePrefersReducedMotion();
  const [len, setLen] = useState(0);
  const arrive = useRef(onArrive);
  useEffect(() => {
    arrive.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    const p = ref.current?.querySelector("path");
    if (p) setLen(p.getTotalLength());
  }, [d]);

  useEffect(() => {
    const g = ref.current;
    if (!g || reduced || run == null || !len) return;
    const paths = [...g.querySelectorAll<SVGPathElement>("path")];
    const segs = LAYERS.map(([share]) => Math.max(2, share * tail));
    const M = Math.max(...segs);
    const anims = paths.map((p, i) => {
      const seg = segs[i];
      p.style.strokeDasharray = `${seg} ${len + M + seg}`;
      // Every layer's leading edge travels at the same speed, so the layers stay locked together:
      // forward, the far end of each dash runs from 0 to len + M; in reverse, the near end runs from len to -M.
      const from = reverse ? -len : seg;
      const to = reverse ? M : seg - (len + M);
      return p.animate(
        [
          { strokeDashoffset: from, opacity: 0 },
          { opacity: 1, offset: 0.08 },
          { opacity: 1, offset: 0.88 },
          { strokeDashoffset: to, opacity: 0 },
        ],
        { duration, delay, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "both" },
      );
    });
    anims[anims.length - 1].onfinish = () => arrive.current?.();
    return () => anims.forEach((a) => a.cancel());
  }, [run, reverse, duration, delay, len, tail, reduced]);

  if (reduced) return null;
  return (
    <g ref={ref} aria-hidden fill="none" strokeLinecap="round" style={{ pointerEvents: "none" }}>
      {LAYERS.map(([, w, op], i) => (
        <path key={i} d={d} stroke={color} strokeWidth={width * w + (i === LAYERS.length - 1 ? 0.5 : 0)} opacity={0} style={{ strokeOpacity: op }} />
      ))}
    </g>
  );
}
