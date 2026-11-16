"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** An element's box, in px, relative to the measuring root. */
export type Box = { x: number; y: number; w: number; h: number };

/**
 * Measures the elements marked `data-anchor="<name>"` inside the root, relative to it, so an SVG laid over the root
 * can draw wires between them in px (and the shared Beam can run along those wires). Uses offset geometry, so a
 * reveal transform mid-flight doesn't skew the result; re-measures when the root or any anchor resizes. The root
 * must be positioned (relative), so it's the anchors' offset parent.
 */
export function useAnchors<T extends HTMLElement>(): [RefObject<T | null>, { w: number; h: number; at: Record<string, Box> } | null] {
  const ref = useRef<T>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; at: Record<string, Box> } | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const measure = () => {
      const at: Record<string, Box> = {};
      root.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
        if (!el.offsetParent) return; // hidden at this width
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = el;
        while (n && n !== root) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        if (n !== root) return;
        at[el.dataset.anchor!] = { x, y, w: el.offsetWidth, h: el.offsetHeight };
      });
      setGeo({ w: root.offsetWidth, h: root.offsetHeight, at });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    root.querySelectorAll("[data-anchor]").forEach((el) => ro.observe(el));
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return [ref, geo];
}

/** A soft S-curve from one point to another, leaving and arriving horizontally. */
export function sCurve(x1: number, y1: number, x2: number, y2: number) {
  const dx = (x2 - x1) * 0.5;
  return `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
}
