"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Becomes true the first time the element scrolls into view (or every time, with `once: false`). */
export function useInView<T extends Element>(
  options: { once?: boolean; margin?: string; threshold?: number } = {},
): [RefObject<T | null>, boolean] {
  const { once = true, margin = "0px 0px -12% 0px", threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: margin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, margin, threshold]);

  return [ref, inView];
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Scale factor that fits a fixed-width composition into its container. */
export function useFitScale<T extends HTMLElement>(baseWidth: number, max = 1): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(max);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(max, entry.contentRect.width / baseWidth));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [baseWidth, max]);
  return [ref, scale];
}

/**
 * Scale factor (≤ 1) that keeps a pinned scene inside the viewport height.
 * Measures the element's untransformed layout height, so it's safe to apply
 * the result as a transform on that same element.
 */
export function useFitHeight<T extends HTMLElement>(margin = 24): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      const available = window.innerHeight - margin * 2;
      setScale(Math.min(1, available / node.offsetHeight));
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [margin]);
  return [ref, scale];
}
