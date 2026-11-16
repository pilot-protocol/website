"use client";

import { useEffect, useState } from "react";

/*
 * The pilotprotocol repository's stars and forks, for the header and the open-source card.
 *
 * GitHub's public API allows 60 unauthenticated requests an hour per network, so a visitor who browses a few pages
 * (or an office behind one IP) runs out and gets a 403. One request is shared by every component on the page, the
 * answer is kept in localStorage for six hours, and until it arrives (or if GitHub refuses) the last known figures
 * show instead of a bare label.
 */

export type Repo = { stars: number; forks: number };

const REPO = "pilot-protocol/pilotprotocol";
const KEY = "pp-gh-repo";
const MAX_AGE = 6 * 60 * 60 * 1000;
/** The figures when this was last checked (13 Nov 2026); shown until a fresh count arrives. */
export const REPO_FALLBACK: Repo = { stars: 148, forks: 20 };

let inflight: Promise<Repo | null> | null = null;

function cached(): { repo: Repo; at: number } | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { stars?: number; forks?: number; at?: number };
    if (typeof v.stars !== "number" || typeof v.at !== "number") return null;
    return { repo: { stars: v.stars, forks: v.forks ?? REPO_FALLBACK.forks }, at: v.at };
  } catch {
    return null;
  }
}

function load(): Promise<Repo | null> {
  inflight ??= fetch(`https://api.github.com/repos/${REPO}`)
    .then((r) => (r.ok ? (r.json() as Promise<{ stargazers_count?: number; forks_count?: number }>) : null))
    .then((d) => {
      if (typeof d?.stargazers_count !== "number") return null;
      const repo = { stars: d.stargazers_count, forks: d.forks_count ?? REPO_FALLBACK.forks };
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ ...repo, at: Date.now() }));
      } catch {
        // Private mode: it just isn't remembered.
      }
      return repo;
    })
    .catch(() => null);
  return inflight;
}

export function useRepo(): Repo {
  const [repo, setRepo] = useState<Repo>(REPO_FALLBACK);
  useEffect(() => {
    let alive = true;
    const c = cached();
    // Read on mount (not during render) so the server and first client render agree.
    queueMicrotask(() => alive && c && setRepo(c.repo));
    if (c && Date.now() - c.at < MAX_AGE) return;
    load().then((r) => alive && r && setRepo(r));
    return () => {
      alive = false;
    };
  }, []);
  return repo;
}
