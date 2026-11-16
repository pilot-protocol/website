"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SKY } from "@/components/pages/security/kit";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { DIRECTORY_TOTAL, EXAMPLES, MOBILE_ROWS, ROWS, TRY, matchCount, search, type Match } from "./data";
import { SkyDirectory } from "./sky-directory";
import "./service-agents.css";

// What the directory types to itself until someone takes over.
const TOUR = ["weather", "recall", "aviation", "crypto", "earthquake", "transit"];

function useTour(active: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    let word = 0;
    let chars = 0;
    let deleting = false;
    let t: number;
    const tick = () => {
      const target = TOUR[word];
      if (!deleting) {
        chars++;
        setText(target.slice(0, chars));
        if (chars === target.length) {
          deleting = true;
          t = window.setTimeout(tick, 2600);
          return;
        }
        t = window.setTimeout(tick, 75 + Math.random() * 40);
        return;
      }
      // Clear in one go, like select-all and delete, so half-words never light anything up.
      chars = 0;
      setText("");
      deleting = false;
      word = (word + 1) % TOUR.length;
      t = window.setTimeout(tick, 650);
    };
    t = window.setTimeout(tick, 700);
    return () => window.clearTimeout(t);
  }, [active]);
  return text;
}

/**
 * The whole list-agents directory, one square per agent, a row per category.
 * Searching lights up what list-agents would match: a whole category, or the
 * single agents whose hostnames fit.
 */
/** The directory's state: the tour that types itself, a visitor's own query, or a pinned category. */
function useDirectory() {
  const [ref, seen] = useInView<HTMLDivElement>({ margin: "0px 0px -10% 0px" });
  const [listRef, inView] = useInView<HTMLUListElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [touched, setTouched] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Arriving from a category link elsewhere (the home page's tower): open the directory filtered to it.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("category");
    if (!want || !ROWS.some((r) => r.id === want)) return;
    queueMicrotask(() => {
      setTouched(true);
      setCategory(want);
    });
  }, []);

  const tour = useTour(inView && !touched && !reduced);
  const text = touched ? query : reduced ? "recall" : tour;

  const match: Match | null = useMemo(() => {
    if (category) return { rows: new Set([category]), agents: new Set() };
    return search(text);
  }, [category, text]);

  const found = match ? matchCount(match) : DIRECTORY_TOTAL;

  function take(next: string) {
    setTouched(true);
    setCategory(null);
    setQuery(next);
  }

  return { ref, seen, listRef, reduced, touched, setTouched, setQuery, category, setCategory, expanded, setExpanded, input, text, match, found, take };
}

export function Directory() {
  const d = useDirectory();
  if (SKY) return <SkyDirectory d={d} />;
  const { ref, seen, listRef, reduced, touched, setTouched, setQuery, category, setCategory, expanded, setExpanded, input, text, match, found, take } = d;

  return (
    <div
      ref={ref}
      data-in={seen}
      className="sa-dir pp-island"
    >
      {/* The query, as you'd send it. Click into the quotes to type your own. */}
      <div className="flex flex-col gap-3 border-b border-edge px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div
          onClick={() => input.current?.focus()}
          className="flex min-w-0 cursor-text items-center gap-3 font-mono text-[12.5px] whitespace-nowrap sm:text-[13px]"
        >
          <span aria-hidden className="text-lime-ink">
            ❯
          </span>
          <span className="no-scrollbar min-w-0 overflow-x-auto text-dim">
            <span className="max-md:hidden">pilotctl send-message </span>
            <span className="text-soft">list-agents</span>
            <span className="max-md:hidden"> --data</span> &apos;/data {"{"}&quot;{category ? "category" : "search"}&quot;:&quot;
            {category ? (
              <button type="button" onClick={() => take("")} className="text-lime-ink underline decoration-lime-ink/40 underline-offset-2">
                {category}
              </button>
            ) : (
              <span className="relative inline-block">
                <input
                  ref={input}
                  value={text}
                  onFocus={() => {
                    if (!touched) take(text);
                  }}
                  onChange={(e) => take(e.target.value.toLowerCase())}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Search the directory"
                  className="min-w-[1ch] bg-transparent text-lime-ink caret-lime outline-none"
                  style={{ width: `${Math.max(text.length, touched ? 1 : 0)}ch` }}
                />
                {!touched && !reduced && (
                  <span
                    aria-hidden
                    className="caret-blink absolute top-1/2 h-[1.15em] w-[1.5px] -translate-y-1/2 bg-lime"
                    style={{ left: `${text.length}ch` }}
                  />
                )}
              </span>
            )}
            &quot;{"}"}&apos;<span className="max-md:hidden"> --wait</span>
          </span>
        </div>
        <p className="shrink-0 font-mono text-[12px] text-dim tabular-nums" aria-live="polite">
          {match ? (
            <>
              <span className="text-fg">{found}</span> of {DIRECTORY_TOTAL}
            </>
          ) : (
            <>
              {DIRECTORY_TOTAL} agents · {ROWS.length} categories
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 border-b border-edge px-4 py-2.5 sm:px-5">
        <span className="mr-1 font-mono text-[11.5px] text-faint">Try</span>
        {TRY.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => take(w)}
            className="pressable rounded-[10px] border border-edge px-2 py-[3px] font-mono text-[11.5px] text-mute hover:border-edge-3 hover:text-fg"
          >
            {w}
          </button>
        ))}
        {(touched || category) && (
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setQuery("");
              input.current?.focus();
            }}
            className="pressable ml-auto font-mono text-[11.5px] text-dim hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>

      <ul ref={listRef} className="px-2 py-3 sm:px-3 sm:py-4" aria-label="Agents by category">
        {ROWS.map((r, row) => {
          const rowHit = match?.rows.has(r.id) ?? false;
          const hits = r.known.filter((a) => match?.agents.has(a));
          const lit = rowHit || hits.length > 0;
          const dim = match !== null && !lit;
          const pinned = category === r.id;
          // On phones the list starts at the ten largest categories, plus anything the query lights up.
          const folded = !expanded && row >= MOBILE_ROWS && !lit;
          return (
            <li key={r.id} className={folded ? "max-md:hidden" : ""}>
              <button
                type="button"
                aria-pressed={pinned}
                aria-label={`${r.name}: ${r.count} agents, including ${r.known.join(", ")}`}
                onClick={() => {
                  setTouched(true);
                  setCategory(pinned ? null : r.id);
                }}
                style={{ "--row": row } as CSSProperties}
                className={`group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 rounded-md px-2 py-[7px] text-left transition-[opacity,background-color] duration-300 hover:bg-fg/[0.035] sm:py-[5px] md:grid-cols-[112px_349px_30px_minmax(0,1fr)] ${
                  dim ? "opacity-45" : ""
                } ${pinned ? "bg-fg/[0.05]" : ""}`}
              >
                <span className={`font-mono text-[12px] transition-colors duration-300 ${lit ? "text-fg" : "text-dim group-hover:text-soft"}`}>
                  {r.id}
                </span>
                <span className="font-mono text-[11.5px] text-dim tabular-nums md:order-3 md:text-right">{r.count}</span>
                <span aria-hidden className="col-span-2 flex gap-[2px] md:order-2 md:col-span-1 md:gap-[3px]">
                  {Array.from({ length: r.count }, (_, i) => {
                    const on = rowHit || (i < r.known.length && match?.agents.has(r.known[i]));
                    return (
                      <span
                        key={i}
                        style={{ "--i": i } as CSSProperties}
                        className={`sa-sq size-[6px] shrink-0 md:size-[8px] ${on ? "bg-lime" : "bg-fg/16 group-hover:bg-fg/28"}`}
                      />
                    );
                  })}
                </span>
                <span
                  className={`col-span-2 min-w-0 truncate font-mono text-[11.5px] md:order-4 md:col-span-1 md:block ${
                    hits.length ? "block" : "hidden"
                  }`}
                >
                  {r.known.map((a, i) => {
                    const hit = match?.agents.has(a);
                    return (
                      <span key={a} className={hit ? "text-lime-ink" : `transition-colors duration-300 ${match ? "text-faint" : "text-dim group-hover:text-soft"}`}>
                        {i > 0 && <span className="text-faint/50"> · </span>}
                        {a}
                      </span>
                    );
                  })}
                  {r.count > r.known.length && <span className="text-faint/70"> +{r.count - r.known.length}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!expanded && (
        <div className="border-t border-edge px-4 py-3 md:hidden">
          <button type="button" onClick={() => setExpanded(true)} className="pressable font-mono text-[12px] text-soft hover:text-fg">
            Show all {ROWS.length} categories
          </button>
        </div>
      )}

      <Reply match={match} category={category} />
    </div>
  );
}

/** The bottom line: what list-agents would hand back for the current filter. */
function Reply({ match, category }: { match: Match | null; category: string | null }) {
  const agents = match ? ROWS.flatMap((r) => r.known.filter((a) => match.agents.has(a)).map((a) => ({ a, cat: r.id }))) : [];
  const rows = match ? ROWS.filter((r) => match.rows.has(r.id)) : [];

  return (
    <div className="border-t border-edge px-4 py-3.5 font-mono text-[11.5px] leading-[1.6] sm:px-5" aria-live="polite">
      {!match && (
        <p className="text-dim">
          One square per agent. The named ones are from this page; list-agents itself returns all {DIRECTORY_TOTAL}, counting
          its own entry and <span className="text-soft">feedback</span>.
        </p>
      )}
      {match && rows.length + agents.length === 0 && <p className="text-dim">No category or named agent matches. list-agents also searches descriptions, so try it there.</p>}
      {match && rows.length + agents.length > 0 && (
        <ul className="flex flex-col gap-1">
          {rows.map((r) => (
            <li key={r.id} className="truncate text-dim">
              <span className="text-lime-ink">{category ? "category" : "match"}</span> {r.name.toLowerCase()}{" "}
              <span className="text-faint">·</span> {r.count} agents <span className="text-faint">·</span>{" "}
              <span className="text-soft">/data {`{"category":"${r.id}"}`}</span>
            </li>
          ))}
          {agents.map(({ a, cat }) => (
            <li key={a} className="truncate text-dim">
              <span className="text-lime-ink">hostname</span> <span className="text-fg">{a}</span>{" "}
              <span className="text-faint">·</span> {cat}
              {EXAMPLES[a] && (
                <>
                  {" "}
                  <span className="text-faint">·</span> <span className="text-soft">{EXAMPLES[a]}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type DirectoryState = ReturnType<typeof useDirectory>;
