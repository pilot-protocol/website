"use client";

import type { CSSProperties } from "react";
import { XIcon } from "@/components/icons";
import { DIRECTORY_TOTAL, EXAMPLES, MOBILE_ROWS, ROWS, TRY, type Match, type Row } from "./data";
import { Glyph } from "./glyphs";
import { SOURCE_OF, SourceChip } from "./marks";
import type { DirectoryState } from "./directory";

/*
 * The directory on the sky site: a real search box over the whole list-agents directory, one dot per agent and
 * a row per category. What you type is the `search` filter list-agents receives; the literal call and what it
 * would hand back sit at the foot of the card.
 */

function SearchGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <circle cx="7" cy="7" r="4.75" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

const nameOf = (id: string) => ROWS.find((r) => r.id === id)?.name ?? id;
/** The agents a row names: its first three, plus any others the search matched. */
const shown = (r: Row, hits: string[]) => [...r.known.slice(0, 3), ...hits.filter((a) => !r.known.slice(0, 3).includes(a))];
const MAX_COUNT = Math.max(...ROWS.map((r) => r.count));

export function SkyDirectory({ d }: { d: DirectoryState }) {
  const { ref, seen, listRef, reduced, touched, setTouched, setQuery, category, setCategory, expanded, setExpanded, input, text, match, found, take } = d;
  const touring = !touched && !reduced;

  return (
    <div ref={ref} data-in={seen} className="sa-dir sky-card overflow-hidden">
      {/* Search: the tour types into it until a visitor takes over. */}
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-5 sm:p-4">
        <div
          onClick={() => input.current?.focus()}
          className="flex h-12 min-w-0 flex-none cursor-text sm:flex-1 items-center gap-3 rounded-full bg-card-2 px-4 ring-1 ring-(--sky-card-line) transition-shadow duration-200 ring-inset focus-within:ring-edge-3 sm:px-5"
        >
          <SearchGlyph className="size-4 shrink-0 text-dim" />
          {category ? (
            <button
              type="button"
              onClick={() => take("")}
              aria-label={`Category ${nameOf(category)}. Clear`}
              className="pressable -ml-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-(--sky-tint) pr-2.5 pl-3 text-[14px] font-medium text-(--sky-accent)"
            >
              {nameOf(category)}
              <XIcon className="size-3" />
            </button>
          ) : (
            <span className="relative flex min-w-0 flex-1 items-center">
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
                placeholder={touched ? `Search ${DIRECTORY_TOTAL} agents` : undefined}
                className={`w-full min-w-0 bg-transparent text-[16px] leading-6 tracking-[-0.01em] caret-(--sky-fill) outline-none placeholder:text-dim ${
                  touring ? "text-transparent" : "text-fg"
                }`}
              />
              {/* While the tour types, the same text is drawn over the input with its own caret. */}
              {touring && (
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[16px] leading-6 tracking-[-0.01em] whitespace-pre text-fg">
                  {text}
                  <span className="caret-blink ml-px h-[1.15em] w-[1.5px] bg-(--sky-fill)" />
                </span>
              )}
            </span>
          )}
        </div>
        <p className="shrink-0 px-2 text-[13.5px] leading-5 text-mute tabular-nums sm:px-0" aria-live="polite">
          {match ? (
            <>
              <span className="font-medium text-fg">{found}</span> of {DIRECTORY_TOTAL} agents
            </>
          ) : (
            <>
              {DIRECTORY_TOTAL} agents in {ROWS.length} categories
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-4 sm:px-5">
        <span className="mr-1 text-[13px] text-dim">Try</span>
        {TRY.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => take(w)}
            data-on={touched && !category && text === w}
            className="pressable h-7 rounded-full px-3 text-[13px] text-soft ring-1 ring-edge hover:text-fg hover:ring-edge-3 data-[on=true]:bg-(--sky-tint) data-[on=true]:text-(--sky-accent) data-[on=true]:ring-transparent"
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
            className="pressable ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-(--sky-tint) pr-2.5 pl-3 text-[14px] text-(--sky-accent) transition-[filter] hover:brightness-95 dark:hover:brightness-110"
          >
            Clear all
            <XIcon className="size-3" />
          </button>
        )}
      </div>

      <ul ref={listRef} className="border-t border-(--sky-card-line) px-2 py-2.5 sm:px-3 sm:py-3" aria-label="Agents by category">
        {ROWS.map((r, row) => {
          const rowHit = match?.rows.has(r.id) ?? false;
          const hits = r.known.filter((a) => match?.agents.has(a));
          const lit = rowHit || hits.length > 0;
          const dim = match !== null && !lit;
          const pinned = category === r.id;
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
                className={`group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-[10px] px-2.5 py-2 text-left transition-[opacity,background-color] duration-300 hover:bg-fg/[0.03] md:grid-cols-[176px_minmax(0,280px)_28px_minmax(0,1fr)] md:py-[5px] ${
                  dim ? "opacity-40" : ""
                } ${pinned ? "bg-(--sky-tint) hover:bg-(--sky-tint)" : ""}`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className={`grid size-6 shrink-0 place-items-center rounded-[7px] transition-colors duration-300 ${
                      lit ? "bg-(--sky-tint) text-(--sky-accent)" : "bg-fg/[0.06] text-soft"
                    }`}
                  >
                    <Glyph name={r.id} className="size-3.5" />
                  </span>
                  <span className={`truncate text-[13.5px] leading-5 transition-colors duration-300 ${lit ? "font-medium text-fg" : "text-soft"}`}>
                    {r.name}
                  </span>
                </span>
                <span className="text-[12.5px] leading-5 text-dim tabular-nums md:order-3 md:text-right">{r.count}</span>
                <span aria-hidden className="col-span-2 flex items-center md:order-2 md:col-span-1">
                  {/* One bar per category, as long as its agent count; the part that matches fills in sky blue. */}
                  <span
                    className="sa-bar relative h-1.5 overflow-hidden rounded-full bg-fg/[0.08] transition-colors duration-300 group-hover:bg-fg/[0.13] md:h-2"
                    style={{ width: `${(r.count / MAX_COUNT) * 100}%` }}
                  >
                    <span
                      className="absolute inset-0 origin-left bg-(--sky-fill) transition-transform duration-500 ease-(--ease-out)"
                      style={{ transform: `scaleX(${rowHit ? 1 : hits.length / r.count})` }}
                    />
                  </span>
                </span>
                <span
                  className={`col-span-2 min-w-0 items-center gap-x-3 overflow-hidden font-mono text-[12px] leading-5 whitespace-nowrap md:order-4 md:col-span-1 md:flex ${
                    hits.length ? "flex" : "hidden"
                  }`}
                >
                  {/* The first three it names, plus any the search finds; each with its source's mark where it has one. */}
                  {shown(r, hits).map((a) => {
                    const hit = match?.agents.has(a);
                    const brand = SOURCE_OF[a];
                    return (
                      <span
                        key={a}
                        className={`inline-flex shrink-0 items-center gap-1.5 transition-[color,opacity] duration-300 ${
                          hit ? "text-(--sky-accent)" : match ? "text-faint" : "text-dim group-hover:text-mute"
                        }`}
                      >
                        {brand && <SourceChip brand={brand} className={match && !hit ? "opacity-50" : ""} />}
                        {a}
                      </span>
                    );
                  })}
                  {r.count > shown(r, hits).length && <span className="shrink-0 text-dim">+{r.count - shown(r, hits).length}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!expanded && (
        <div className="border-t border-(--sky-card-line) px-4 py-3 md:hidden">
          <button type="button" onClick={() => setExpanded(true)} className="pressable text-[13.5px] font-medium text-soft hover:text-fg">
            Show all {ROWS.length} categories
          </button>
        </div>
      )}

      <SkyReply match={match} category={category} text={text} />
    </div>
  );
}

/** The foot of the card: the call your agent would send, and what list-agents would hand back for it. */
function SkyReply({ match, category, text }: { match: Match | null; category: string | null; text: string }) {
  const agents = match ? ROWS.flatMap((r) => r.known.filter((a) => match.agents.has(a)).map((a) => ({ a, cat: r.name }))) : [];
  const rows = match ? ROWS.filter((r) => match.rows.has(r.id)) : [];
  const key = category ? "category" : "search";
  const value = category ?? text;
  const tag = "inline-flex h-[22px] shrink-0 items-center rounded-full bg-(--sky-tint) px-2 text-[12px] font-medium text-(--sky-accent)";

  return (
    <div className="border-t border-(--sky-card-line) bg-card-2 px-4 py-4 sm:px-5">
      <code tabIndex={0} className="no-scrollbar block overflow-x-auto font-mono text-[12px] leading-5 whitespace-nowrap text-mute">
        <span className="text-(--sky-accent) select-none">$ </span>
        pilotctl send-message <span className="text-fg">list-agents</span> --data &apos;/data {"{"}&quot;{key}&quot;:&quot;
        <span className="text-(--sky-accent)">{value}</span>&quot;{"}"}&apos; --wait
      </code>
      <div className="mt-3 text-[13px] leading-[1.55] text-mute" aria-live="polite">
        {!match && (
          <p className="text-pretty">
            The named agents are from this page; list-agents itself returns all {DIRECTORY_TOTAL}, counting its own entry and{" "}
            <code className="font-mono text-[12px] text-soft">feedback</code>.
          </p>
        )}
        {match && rows.length + agents.length === 0 && (
          <p>No category or named agent matches. list-agents also searches descriptions, so try it there.</p>
        )}
        {match && rows.length + agents.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {rows.map((r) => (
              <li key={r.id} className="flex min-w-0 items-center gap-2.5">
                <span className={tag}>{category ? "Category" : "Match"}</span>
                <span className="min-w-0 truncate">
                  <span className="text-fg">{r.name}</span> · {r.count} agents ·{" "}
                  <code className="font-mono text-[12px] text-soft">/data {`{"category":"${r.id}"}`}</code>
                </span>
              </li>
            ))}
            {agents.map(({ a, cat }) => (
              <li key={a} className="flex min-w-0 items-center gap-2.5">
                <span className={tag}>Hostname</span>
                <span className="min-w-0 truncate">
                  <code className="font-mono text-[12px] text-fg">{a}</code> · {cat}
                  {EXAMPLES[a] && (
                    <>
                      {" "}
                      · <code className="font-mono text-[12px] text-soft">{EXAMPLES[a]}</code>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
