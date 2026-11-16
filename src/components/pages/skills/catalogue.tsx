"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRightIcon, XIcon } from "@/components/icons";
import { FLAT_CARD, SKY } from "@/components/pages/security/kit";
import { Command, Reveal } from "@/components/ui";
import { SKILL_GROUPS, SKILL_TOTAL, clawhubUrl, shortName, sourceUrl, type Skill, type SkillGroup } from "./data";
import { SkillMark, SkillTile, GroupTile } from "./marks";

/*
 * The 82 skills as a map: one row of tiles per category, so the shape of the
 * catalogue is visible before you read a word. Hover (or tap) a tile to read
 * the skill and copy its install command; search dims what doesn't match.
 */

const ALL = SKILL_GROUPS.flatMap((g) => g.skills.map((s) => ({ ...s, group: g })));
const FIRST = ALL.find((s) => s.id === "pilot-chat") ?? ALL[0];

function matches(skill: Skill, q: string) {
  if (!q) return true;
  const hay = `${skill.id} ${skill.desc} ${skill.tags.join(" ")}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

function Detail({ skill, group, onClose }: { skill: Skill; group: SkillGroup; onClose?: () => void }) {
  return (
    <div key={skill.id} className="animate-[row-in_360ms_var(--ease-out)_both]">
      <div className="flex items-start justify-between gap-4">
        {SKY ? (
          <div className="flex items-center gap-3">
            <SkillTile id={skill.id} group={group.id} />
            <p className="text-[13px] text-mute">{group.name}</p>
          </div>
        ) : (
          <p className="font-mono text-[12px] text-dim">{group.name}</p>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pressable -mt-2 -mr-2 grid size-9 place-items-center rounded-[10px] text-dim hover:text-fg lg:hidden"
          >
            <XIcon className="size-[14px]" />
          </button>
        )}
      </div>
      <h3 className={`${SKY ? "mt-4" : "mt-2"} font-mono text-[clamp(20px,2vw,24px)] leading-[1.2] font-medium tracking-[-0.02em] break-words text-fg`}>
        {skill.id}
      </h3>
      <p className="mt-3 text-[15.5px] leading-[1.55] text-soft">{skill.desc}</p>
      {skill.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {skill.tags.map((t) => (
            <li
              key={t}
              className={SKY ? "rounded-full bg-fg/[0.05] px-2.5 py-1 text-[12px] leading-none text-mute" : "rounded-md border border-edge-2 px-1.5 py-0.5 font-mono text-[11px] text-dim"}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
      <Command value={`clawhub install ${skill.id}`} prefix="clawhub " className="mt-6 w-full" label={`Copy install command for ${skill.id}`}>
        install {skill.id}
      </Command>
      <div className="mt-4 flex gap-5 text-[13px]">
        <a href={clawhubUrl(skill.id)} className="group inline-flex items-center gap-1.5 text-soft hover:text-fg">
          ClawHub
          <ArrowUpRightIcon className="size-[10px] transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <a href={sourceUrl(skill.id)} className="group inline-flex items-center gap-1.5 text-soft hover:text-fg">
          Source
          <ArrowUpRightIcon className="size-[10px] transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}

export function Catalogue() {
  const [pinned, setPinned] = useState(FIRST.id);
  const [hovered, setHovered] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim());
  const sheetRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => new Set(ALL.filter((s) => matches(s, q)).map((s) => s.id)), [q]);
  const shown = ALL.find((s) => s.id === (hovered ?? pinned)) ?? FIRST;

  // Escape closes the phone sheet.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  return (
    <div
      className={
        SKY
          ? "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]"
          : "grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_380px]"
      }
    >
      {/* Sky site: the search and the map in one flat bordered card, as the service page's directory. */}
      <div className={SKY ? `min-w-0 overflow-hidden ${FLAT_CARD}` : "min-w-0"}>
        <div
          className={
            SKY
              ? "flex flex-col gap-3 border-b border-(--sky-card-line) p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:pr-5"
              : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          }
        >
          <label className="relative block w-full sm:max-w-[360px]">
            <span className="sr-only">Search skills</span>
            <svg aria-hidden viewBox="0 0 24 24" className="absolute top-1/2 left-3 size-[14px] -translate-y-1/2 text-dim">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: weather, trust, slack, files…"
              className={
                SKY
                  ? "h-10 w-full rounded-full border border-(--sky-card-line) bg-bg pr-4 pl-9 text-[14px] text-fg outline-none placeholder:text-dim focus:border-(--sky-fill)/50 focus:shadow-[0_0_0_3px_var(--sky-tint)]"
                  : "h-10 w-full rounded-[10px] border border-edge-2 bg-transparent pr-3 pl-9 text-[14px] text-fg outline-none placeholder:text-faint focus:border-fg/40"
              }
            />
          </label>
          <p className={SKY ? "px-1 text-[13px] text-mute sm:px-0" : "font-mono text-[12px] text-dim"} aria-live="polite">
            {q ? (
              <>
                <span className="text-fg">{hits.size}</span> of {SKILL_TOTAL} match
              </>
            ) : (
              <>
                {SKILL_TOTAL} skills in {SKILL_GROUPS.length} groups
              </>
            )}
          </p>
        </div>

        {SKY ? (
          <SkyGroups
            hits={hits}
            q={q}
            shownId={shown.id}
            pinned={pinned}
            onHover={setHovered}
            onPick={(id) => {
              setPinned(id);
              setSheetOpen(true);
            }}
          />
        ) : (
        <div className="mt-6 flex flex-col border border-edge" onPointerLeave={() => setHovered(null)}>
          {SKILL_GROUPS.map((g, gi) => {
            const groupHits = g.skills.filter((s) => hits.has(s.id)).length;
            return (
              <Reveal
                key={g.id}
                id={`group-${g.id}`}
                delay={gi * 40}
                className="grid scroll-mt-28 grid-cols-1 border-t border-edge first:border-t-0 md:grid-cols-[176px_minmax(0,1fr)]"
              >
                <div
                  className={`flex items-baseline justify-between gap-3 border-b border-edge px-4 py-3 transition-opacity duration-300 md:flex-col md:justify-start md:gap-1 md:border-r md:border-b-0 md:py-4 ${
                    q && groupHits === 0 ? "opacity-35" : ""
                  }`}
                >
                  <h3 className="text-[14px] leading-[1.3] font-medium text-fg">{g.name}</h3>
                  <p className="font-mono text-[11.5px] text-dim tabular-nums">
                    {q ? `${groupHits}/${g.skills.length}` : g.skills.length}
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-px bg-edge min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                  {g.skills.map((s) => {
                    const hit = hits.has(s.id);
                    const active = shown.id === s.id;
                    return (
                      <li key={s.id} className="bg-bg">
                        <button
                          type="button"
                          aria-pressed={pinned === s.id}
                          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(s.id)}
                          onFocus={() => setHovered(s.id)}
                          onBlur={() => setHovered(null)}
                          onClick={() => {
                            setPinned(s.id);
                            setSheetOpen(true);
                          }}
                          className={`group relative flex h-12 w-full items-center px-3 text-left font-mono text-[12.5px] transition-[background-color,color,opacity] duration-200 ${
                            active ? "bg-lime/[0.07] text-fg" : "text-mute hover:bg-raised hover:text-fg"
                          } ${hit ? "" : "opacity-25"}`}
                        >
                          <span className="truncate">{shortName(s.id)}</span>
                          <span className="sr-only">: {s.desc}</span>
                          {active && <span aria-hidden className="absolute inset-0 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-lime)_70%,transparent)]" />}
                          {pinned === s.id && <span aria-hidden className="absolute top-0 right-0 size-1.5 bg-lime" />}
                        </button>
                      </li>
                    );
                  })}
                  {/* Fill the last row so the hairline grid stays a clean rectangle. */}
                  {Array.from({ length: 3 }, (_, i) => (
                    <li key={`pad-${i}`} aria-hidden className={`bg-bg ${padClass(g.skills.length, i)}`} />
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
        )}
        {!SKY && (
          <p className="mt-4 font-mono text-[11.5px] leading-[1.5] text-dim">
            Skills that describe features Pilot doesn&apos;t have are left out of this list.
          </p>
        )}
      </div>

      {/* Wide screens: a reading panel that follows you down the map. */}
      <aside aria-label="Selected skill" className="hidden lg:block">
        <div className={SKY ? `sticky top-[96px] p-6 ${FLAT_CARD}` : "sticky top-[96px] rounded-[16px] border border-edge-2 bg-raised/40 p-6"}>
          <Detail skill={shown} group={shown.group} />
        </div>
      </aside>

      {/* Phones and tablets: the same panel as a sheet, once you tap a skill. */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-label="Selected skill"
        aria-hidden={!sheetOpen}
        data-open={sheetOpen}
        className={`fixed inset-x-3 bottom-3 z-40 bg-card p-5 shadow-float transition-[transform,opacity] duration-400 ease-(--ease-drawer) data-[open=false]:pointer-events-none data-[open=false]:translate-y-[calc(100%+24px)] data-[open=false]:opacity-0 sm:inset-x-6 lg:hidden ${
          SKY ? "rounded-[16px] border border-(--sky-card-line)" : "rounded-[16px] border border-edge-3"
        }`}
      >
        <Detail skill={shown} group={shown.group} onClose={() => setSheetOpen(false)} />
      </div>
    </div>
  );
}

/** Sky site: the map inside the catalogue card, a row per group, each skill a rounded tile (blue tint when in view). */
function SkyGroups({
  hits,
  q,
  shownId,
  pinned,
  onHover,
  onPick,
}: {
  hits: Set<string>;
  q: string;
  shownId: string;
  pinned: string;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
}) {
  return (
    <div onPointerLeave={() => onHover(null)}>
      {SKILL_GROUPS.map((g, gi) => {
        const groupHits = g.skills.filter((s) => hits.has(s.id)).length;
        return (
          <Reveal
            key={g.id}
            id={`group-${g.id}`}
            delay={gi * 40}
            className="grid scroll-mt-28 grid-cols-1 gap-x-4 gap-y-3 border-t border-(--sky-card-line) px-4 py-4 first:border-t-0 sm:px-5 md:grid-cols-[152px_minmax(0,1fr)] md:py-5"
          >
            <div
              className={`flex items-center justify-between gap-3 transition-opacity duration-300 md:flex-col md:items-start md:justify-start md:gap-0.5 md:pt-0.5 ${
                q && groupHits === 0 ? "opacity-35" : ""
              }`}
            >
              <span className="flex items-center gap-3 md:flex-col md:items-start md:gap-2.5">
                <GroupTile group={g.id} />
                <span className="flex flex-col gap-0.5">
                  <h3 className="text-[14px] leading-[1.3] font-medium text-fg">{g.name}</h3>
                  <p className="text-[12.5px] text-dim tabular-nums">
                    {q ? `${groupHits} of ${g.skills.length}` : `${g.skills.length} ${g.skills.length === 1 ? "skill" : "skills"}`}
                  </p>
                </span>
              </span>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {g.skills.map((s) => {
                const hit = hits.has(s.id);
                const active = shownId === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-pressed={pinned === s.id}
                      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(s.id)}
                      onFocus={() => onHover(s.id)}
                      onBlur={() => onHover(null)}
                      onClick={() => onPick(s.id)}
                      className={`pressable flex h-9 items-center gap-2 rounded-[10px] px-3 font-mono text-[12.5px] transition-[background-color,color,opacity,box-shadow] duration-200 ${
                        active
                          ? "bg-(--sky-tint) text-(--sky-accent) shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sky-fill)_32%,transparent)]"
                          : "bg-fg/[0.04] text-soft hover:bg-fg/[0.08] hover:text-fg"
                      } ${hit ? "" : "opacity-25"}`}
                    >
                      {pinned === s.id && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--sky-fill)" />}
                      <SkillMark id={s.id} />
                      <span className="truncate">{shortName(s.id)}</span>
                      <span className="sr-only">: {s.desc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        );
      })}
    </div>
  );
}

/* Column counts per breakpoint, matching the tile grid above, with literal class names for Tailwind. */
const STEPS: [number, string, string][] = [
  [2, "block", "hidden"],
  [3, "min-[480px]:block", "min-[480px]:hidden"],
  [4, "sm:block", "sm:hidden"],
  [3, "lg:block", "lg:hidden"],
  [4, "xl:block", "xl:hidden"],
];

/** Empty cells that square off a group's last row: filler i shows wherever at least i + 1 are needed. */
function padClass(n: number, i: number) {
  return STEPS.map(([cols, on, off]) => (i < (cols - (n % cols)) % cols ? on : off)).join(" ");
}
