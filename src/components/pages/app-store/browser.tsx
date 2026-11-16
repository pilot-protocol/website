"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { SKY } from "@/components/pages/security/kit";
import { APPS, type App } from "@/lib/apps";
import { CATEGORIES, FRESH, byId, categoriesOf, type Facts } from "./data";
import { Featured } from "./featured";
import { PlatformMarks } from "./parts";

/* eslint-disable @next/next/no-img-element */

type Shelf = { id: string; name: string; apps: string[] };

const ALL = [...APPS].sort((a, b) => a.name.localeCompare(b.name));

const SHELVES: Shelf[] = [
  { id: "all", name: "All apps", apps: ALL.map((a) => a.id) },
  { id: "fresh", name: "New & updated", apps: FRESH },
  ...CATEGORIES,
];

function platforms(a: App) {
  return [a.mac && "macOS", a.linux && "Linux"].filter(Boolean).join(" · ");
}

/** A shelf button: its name, how many apps, and the first few of their icons fanned out. */
function ShelfButton({ shelf, on, onPick }: { shelf: Shelf; on: boolean; onPick: () => void }) {
  const icons = shelf.apps.slice(0, 5).map(byId);
  if (SKY) {
    // A flat bordered card on the paper (the kit's card); the chosen shelf gets a sky border and a sky count.
    return (
      <button
        type="button"
        onClick={onPick}
        aria-pressed={on}
        data-on={on}
        className="group pressable relative flex w-[188px] shrink-0 flex-col justify-between gap-5 rounded-[12px] border border-(--sky-card-line) bg-card p-3.5 text-left transition-[border-color,box-shadow,transform] duration-300 hover:border-fg/20 data-[on=true]:border-(--sky-fill) data-[on=true]:shadow-[0_0_0_0.5px_var(--sky-fill)] sm:w-auto"
      >
        <span className="flex" aria-hidden>
          {icons.map((a, i) => (
            <img
              key={a.id}
              src={a.icon}
              alt=""
              width={26}
              height={26}
              loading="lazy"
              style={{ zIndex: 10 - i, "--n": i } as CSSProperties}
              className={`relative size-[26px] rounded-[23%] ring-2 ring-card transition-transform duration-300 ease-(--ease-out) ${
                i > 0 ? "-ml-2 group-hover:translate-x-[calc(var(--n)*3px)]" : ""
              }`}
            />
          ))}
        </span>
        <span className="flex items-baseline justify-between gap-3">
          <span className={`text-[14px] leading-tight transition-colors duration-300 ${on ? "font-medium text-fg" : "text-soft"}`}>{shelf.name}</span>
          <span className={`text-[12.5px] tabular-nums transition-colors duration-300 ${on ? "text-(--sky-accent)" : "text-dim"}`}>{shelf.apps.length}</span>
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      className={`group relative flex w-[188px] shrink-0 flex-col justify-between gap-5 rounded-[16px] border p-3.5 text-left transition-[border-color,background-color] duration-300 sm:w-auto ${
        on ? "border-fg/55 bg-fg/[0.045]" : "border-edge hover:border-edge-3 hover:bg-fg/[0.02]"
      }`}
    >
      {on && <span aria-hidden className="absolute -top-px -right-px size-2 bg-lime" />}
      <span className="flex" aria-hidden>
        {icons.map((a, i) => (
          <img
            key={a.id}
            src={a.icon}
            alt=""
            width={26}
            height={26}
            loading="lazy"
            style={{ zIndex: 10 - i, "--n": i } as CSSProperties}
            className={`relative size-[26px] rounded-[24%] ring-2 ring-bg transition-transform duration-300 ease-(--ease-out) ${
              i > 0 ? "-ml-2 group-hover:translate-x-[calc(var(--n)*3px)]" : ""
            }`}
          />
        ))}
      </span>
      <span className="flex items-baseline justify-between gap-3">
        <span className={`text-[14px] leading-tight transition-colors duration-300 ${on ? "text-fg" : "text-soft"}`}>{shelf.name}</span>
        <span className="font-mono text-[11.5px] text-dim tabular-nums">{shelf.apps.length}</span>
      </span>
    </button>
  );
}

function AppCard({ app, facts }: { app: App; facts: Facts }) {
  const f = facts[app.id];
  const cats = categoriesOf(app.id);
  if (SKY) {
    return (
      <a
        href={`/apps/${app.id}`}
        className="group flex h-full flex-col rounded-[12px] border border-(--sky-card-line) bg-card p-5 transition-[border-color] duration-300 hover:border-fg/20 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <img src={app.icon} alt="" width={52} height={52} loading="lazy" className="size-[52px] shrink-0 rounded-[23%] shadow-tile" />
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-[17px] leading-tight font-medium tracking-[-0.015em] text-fg">{app.name}</h3>
            <p className="mt-1 truncate text-[13px] text-mute">{app.publisher}</p>
          </div>
          <ArrowUpRightIcon className="mt-1 size-3 shrink-0 text-dim opacity-0 transition-[opacity,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </div>
        <p className="mt-4 text-[14.5px] leading-[1.5] text-mute">{app.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-5 text-[12.5px] text-mute tabular-nums">
          <span>
            {f?.version}
            {f?.methods && ` · ${f.methods} methods`}
          </span>
          <PlatformMarks mac={app.mac} linux={app.linux} className="size-[14px]" />
        </div>
        {cats.length > 0 && <p className="mt-1 truncate text-[12.5px] text-dim">{cats.map((c) => c.name).join(" · ")}</p>}
      </a>
    );
  }
  return (
    <a
      href={`/apps/${app.id}`}
      className="group flex h-full flex-col rounded-[16px] border border-edge p-5 transition-[border-color,background-color] duration-300 hover:border-edge-3 hover:bg-fg/[0.03] sm:p-6"
    >
      <div className="flex items-start gap-4">
        <img
          src={app.icon}
          alt=""
          width={52}
          height={52}
          loading="lazy"
          className="size-[52px] shrink-0 rounded-[22%] shadow-tile"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-[17px] leading-tight font-medium tracking-[-0.015em] text-fg">{app.name}</h3>
          <p className="mt-1 truncate font-mono text-[11.5px] text-dim">{app.publisher}</p>
        </div>
        <ArrowUpRightIcon className="mt-1 size-3 shrink-0 text-dim opacity-0 transition-[opacity,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-[14.5px] leading-[1.5] text-mute">{app.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-5 font-mono text-[11px] text-dim">
        <span>
          {f?.version}
          {f?.methods && <span className="text-faint"> · </span>}
          {f?.methods && `${f.methods} methods`}
        </span>
        <span>{platforms(app)}</span>
      </div>
      {cats.length > 0 && (
        <p className="mt-2 truncate font-mono text-[11px] text-faint">{cats.map((c) => c.name).join(" · ")}</p>
      )}
    </a>
  );
}

function isTyping(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

/** The catalogue: shelves to filter by, a search box (⌘K), the featured app, and every app. */
export function Browser({ facts }: { facts: Facts }) {
  const [shelf, setShelf] = useState("all");
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((k === "k" && (e.metaKey || e.ctrlKey)) || (k === "/" && !isTyping(e.target))) {
        e.preventDefault();
        input.current?.focus({ preventScroll: true });
        input.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = SHELVES.find((s) => s.id === shelf)!;
  const query = q.trim().toLowerCase();

  const list = useMemo(() => {
    const ids = shelf === "fresh" ? current.apps : ALL.filter((a) => current.apps.includes(a.id)).map((a) => a.id);
    return ids
      .map(byId)
      .filter(
        (a) =>
          !query ||
          `${a.name} ${a.publisher} ${a.description} ${a.id} ${categoriesOf(a.id)
            .map((c) => c.name)
            .join(" ")}`
            .toLowerCase()
            .includes(query),
      );
  }, [shelf, current, query]);

  const browsing = shelf === "all" && !query;
  const blurb = CATEGORIES.find((c) => c.id === shelf)?.blurb ?? (shelf === "fresh" ? "Just shipped or recently bumped on the catalogue." : null);

  return (
    <div>
      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label
          className={
            SKY
              ? "flex h-12 w-full items-center gap-3 rounded-full border border-(--sky-card-line) bg-card pr-2.5 pl-4 transition-[border-color,box-shadow] duration-200 focus-within:border-(--sky-fill) focus-within:shadow-[0_0_0_0.5px_var(--sky-fill)] sm:max-w-[440px]"
              : "flex h-11 w-full items-center gap-2.5 rounded-[10px] border border-edge-2 bg-card px-3.5 transition-colors focus-within:border-fg/45 sm:max-w-[420px]"
          }
        >
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-dim" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="sr-only">Search apps</span>
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQ("");
            }}
            placeholder={`Search ${APPS.length} apps`}
            className="w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-dim [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd
            className={
              SKY
                ? "hidden shrink-0 rounded-full bg-fg/[0.05] px-2.5 py-1 text-[12px] leading-none text-mute sm:block"
                : "hidden shrink-0 rounded-md border border-edge-2 px-1.5 py-0.5 font-mono text-[11px] text-dim sm:block"
            }
          >
            ⌘K
          </kbd>
        </label>
        <p className={SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"} aria-live="polite">
          {query || shelf !== "all" ? (
            <>
              <span className="text-fg">{list.length}</span> of {APPS.length} apps
            </>
          ) : (
            <>
              {APPS.length} apps · {CATEGORIES.length} categories · all live
            </>
          )}
        </p>
      </div>

      {/* Shelves */}
      <div
        role="group"
        aria-label="Categories"
        className={`no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-5 ${SKY ? "-my-2 py-2 sm:gap-2.5" : ""}`}
      >
        {SHELVES.map((s) => (
          <ShelfButton key={s.id} shelf={s} on={s.id === shelf} onPick={() => setShelf(s.id)} />
        ))}
      </div>

      {browsing && (
        <div className={SKY ? "mt-14 sm:mt-20" : "mt-12 sm:mt-16"}>
          <Featured facts={facts} />
        </div>
      )}

      <div className={SKY && browsing ? "mt-14 sm:mt-20" : "mt-12 sm:mt-16"}>
        <div className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 ${SKY ? "" : "border-b border-edge pb-4"}`}>
          <h2 className="text-[22px] font-medium tracking-[-0.025em] text-fg">
            {query ? `Results for “${q.trim()}”` : current.name}
          </h2>
          {blurb && !query && <p className="text-[14.5px] text-mute">{blurb}</p>}
        </div>
        {list.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[16px] text-mute">No apps match. Try another word or category.</p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setShelf("all");
              }}
              className={`pressable mt-4 text-soft underline decoration-fg/30 underline-offset-[3px] hover:text-fg ${SKY ? "text-[14px]" : "font-mono text-[12px]"}`}
            >
              Show all {APPS.length} apps
            </button>
          </div>
        ) : (
          <ul className={`mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${SKY ? "gap-3 sm:gap-4" : "gap-3"}`}>
            {list.map((a, i) => (
              <li key={a.id} style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }} className="motion-safe:animate-[row-in_450ms_var(--ease-out)_both]">
                <AppCard app={a} facts={facts} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
