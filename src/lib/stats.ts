"use client";

import { useSyncExternalStore } from "react";
import { STATS_ENDPOINT, STATS_FALLBACK } from "@/lib/site";

export type Stats = typeof STATS_FALLBACK & { live: boolean };

const REFRESH_MS = 60_000;

let snapshot: Stats = { ...STATS_FALLBACK, live: false };
const listeners = new Set<() => void>();
let timer: number | undefined;

async function refresh() {
  try {
    const res = await fetch(STATS_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { active_nodes?: number; total_nodes?: number; requests_per_sec?: number };
    if (typeof data.active_nodes !== "number") return;
    snapshot = {
      ...snapshot,
      totalNodes: data.total_nodes ?? snapshot.totalNodes,
      activeNodes: data.active_nodes,
      requestsPerSec: Math.round(data.requests_per_sec ?? snapshot.requestsPerSec),
      live: true,
    };
    listeners.forEach((l) => l());
  } catch {
    // Offline or blocked: keep showing the build-time figures.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    refresh();
    timer = window.setInterval(refresh, REFRESH_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.clearInterval(timer);
  };
}

const server = { ...STATS_FALLBACK, live: false };

/** Public registry figures, refreshed every minute while anything on the page is showing them. */
export function useStats(): Stats {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => server,
  );
}

/** "~219,000" style rounding the registry figures are quoted in. */
export function approx(n: number, step = 1000) {
  return `~${(Math.round(n / step) * step).toLocaleString("en-US")}`;
}
