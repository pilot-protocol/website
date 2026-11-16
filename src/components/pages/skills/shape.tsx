"use client";

import { FLAT_CARD, SKY } from "@/components/pages/security/kit";
import { useInView } from "@/lib/hooks";
import { PilotMarkP } from "@/components/logo";
import { LineIcon, type IconName } from "@/components/pages/compatibility/marks";
import { SKILL_GROUPS, SKILL_TOTAL } from "./data";

const ICON: Record<string, IconName> = {
  communication: "chat",
  files: "file",
  trust: "shield",
  discovery: "radar",
  events: "broadcast",
  bridges: "link",
  "service-agents": "data",
};

/** Sky site: each group's icon beside its name (the core skill gets the P). */
function ShapeIcon({ group }: { group: string }) {
  if (group === "core") return <PilotMarkP className="h-[12px] w-[14px] shrink-0 text-(--sky-accent) max-sm:hidden" />;
  return <LineIcon name={ICON[group] ?? "file"} className="size-[14px] text-(--sky-accent) max-sm:hidden" />;
}

/** Index of each group's first skill across the whole catalogue, for the stagger. */
const OFFSETS = SKILL_GROUPS.map((_, i) => SKILL_GROUPS.slice(0, i).reduce((n, g) => n + g.skills.length, 0));

/** The catalogue at a glance: one packet per skill, one row per group. Each row jumps to its group. */
export function CatalogueShape() {
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px" });
  return (
    <div ref={ref} className={SKY ? `w-full max-w-[500px] lg:w-[492px] ${FLAT_CARD} rise-in p-5 [--delay:240ms]` : "w-full max-w-[460px] lg:w-[452px]"}>
      {SKY ? (
        <p className="text-[13px] text-mute">
          <span className="font-medium text-fg tabular-nums">{SKILL_TOTAL}</span> skills, one dot each
        </p>
      ) : (
        <p className="font-mono text-[12px] text-dim">
          <span className="text-fg">{SKILL_TOTAL}</span> skills, one square each
        </p>
      )}
      <ul className="mt-4 flex flex-col">
        {SKILL_GROUPS.map((g, gi) => (
          <li key={g.id}>
            <a
              href={`#group-${g.id}`}
              className={
                SKY
                  ? "group grid grid-cols-[134px_minmax(0,1fr)] items-center gap-3 py-[5px] sm:grid-cols-[170px_minmax(0,1fr)]"
                  : "group grid grid-cols-[124px_minmax(0,1fr)] items-center gap-3 py-[5px] sm:grid-cols-[168px_minmax(0,1fr)]"
              }
            >
              <span className="flex items-baseline justify-between gap-2 text-[12.5px] text-mute transition-colors group-hover:text-fg">
                <span className="flex min-w-0 items-center gap-2 self-center">
                  {SKY && <ShapeIcon group={g.id} />}
                  <span className="truncate">{g.name}</span>
                </span>
                <span className={`text-dim tabular-nums ${SKY ? "text-[12px]" : "font-mono text-[11px]"}`}>{g.skills.length}</span>
              </span>
              <span className={SKY ? "flex flex-wrap gap-[2px]" : "flex flex-wrap gap-[2px] sm:gap-[3px]"}>
                {g.skills.map((s, si) => {
                  const i = OFFSETS[gi] + si;
                  return (
                    <span
                      key={s.id}
                      aria-hidden
                      className={
                        SKY
                          ? "size-[6px] rounded-full bg-(--sky-fill) transition-[opacity,transform,background-color] duration-500 ease-(--ease-out) group-hover:bg-(--sky-accent) motion-reduce:transition-none"
                          : "size-[6px] bg-lime transition-[opacity,transform] duration-500 ease-(--ease-out) group-hover:bg-lime-hi motion-reduce:transition-none"
                      }
                      style={{
                        opacity: on ? 1 : 0,
                        transform: on ? "none" : "translateX(-6px)",
                        transitionDelay: `${180 + i * 14}ms`,
                      }}
                    />
                  );
                })}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
