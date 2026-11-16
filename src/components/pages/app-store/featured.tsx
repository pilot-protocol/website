"use client";

import { useEffect, useState, type ReactNode, type Ref } from "react";
import { CheckIcon } from "@/components/icons";
import { SKY } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Command, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { ALSO_FEATURED, FEATURED_ID, POSTGRES_DEMO, POSTGRES_METHODS, byId, categoriesOf, type Facts } from "./data";
import { Glyph, PlatformMarks } from "./parts";

/* eslint-disable @next/next/no-img-element */

const STEP_MS = 2600;

function platforms(id: string) {
  const a = byId(id);
  return [a.mac && "macOS", a.linux && "Linux"].filter(Boolean).join(" · ");
}

/** PostgreSQL, the featured app, with its publisher's usage demo playing step by step. */
export function Featured({ facts }: { facts: Facts }) {
  const app = byId(FEATURED_ID);
  const f = facts[app.id];
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || held || reduced) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % POSTGRES_DEMO.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [inView, held, reduced]);

  const now = POSTGRES_DEMO[step];
  const pick = (i: number) => {
    setHeld(true);
    setStep(i);
  };

  if (SKY) return <SkyFeatured facts={facts} step={step} onPick={pick} demoRef={ref} />;

  return (
    <div className="flex flex-col gap-3">
      <div ref={ref} className="grid grid-cols-1 overflow-hidden rounded-[16px] border border-edge-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col border-b border-edge p-6 sm:p-8 lg:border-r lg:border-b-0">
          <p className="flex items-center gap-2.5 font-mono text-[12px] text-dim">
            <span aria-hidden className="size-2 bg-lime" />
            Latest featured app
          </p>
          <div className="mt-6 flex items-center gap-5">
            <img
              src={app.icon}
              alt=""
              width={80}
              height={80}
              className="size-[72px] shrink-0 rounded-[22%] shadow-tile sm:size-20"
            />
            <div className="min-w-0">
              <h2 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-fg sm:text-[32px]">{app.name}</h2>
              <p className="mt-1 font-mono text-[12px] text-dim">
                {app.publisher} · {f?.version}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-[440px] text-[16px] leading-[1.5] text-mute">{app.description}</p>
          <dl className="mt-6 grid grid-cols-3 border-y border-edge font-mono text-[11.5px]">
            {[
              ["category", categoriesOf(app.id)[0]?.name ?? ""],
              ["platforms", platforms(app.id)],
              ["methods", f?.methods ?? ""],
            ].map(([k, v], i) => (
              <div key={k} className={`py-3 ${i > 0 ? "border-l border-edge pl-3" : "pr-3"}`}>
                <dt className="text-dim">{k}</dt>
                <dd className="mt-1 text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <Command value={`pilotctl appstore install ${app.id}`} prefix="$ " className="mt-6" label="Copy install command" />
          <div className="mt-5 lg:mt-auto lg:pt-6">
            <TextLink href={`/apps/${app.id}`}>View PostgreSQL</TextLink>
          </div>
        </div>

        <div className="flex min-w-0 flex-col bg-bg-deep">
          <p className="border-b border-edge px-5 py-3.5 font-mono text-[12px] text-dim sm:px-6">
            Full usage demo <span className="text-faint">· from nothing to a query in five calls</span>
          </p>
          <ol className="px-2 py-2 sm:px-3">
            {POSTGRES_DEMO.map((d, i) => {
              const on = i === step;
              const done = i < step;
              return (
                <li key={d.method}>
                  <button
                    type="button"
                    onClick={() => {
                      setHeld(true);
                      setStep(i);
                    }}
                    aria-pressed={on}
                    className={`grid w-full grid-cols-[22px_minmax(0,1fr)] items-center gap-x-3 rounded-[16px] px-3 py-2.5 text-left transition-colors duration-300 sm:grid-cols-[22px_minmax(0,1fr)_auto] ${
                      on ? "bg-fg/[0.05]" : "hover:bg-fg/[0.03]"
                    }`}
                  >
                    <span
                      className={`grid size-[22px] place-items-center font-mono text-[11px] font-medium transition-colors duration-300 ${
                        on ? "bg-lime text-ink" : done ? "bg-fg/15 text-fg" : "border border-edge-2 text-dim"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-[14.5px] transition-colors duration-300 ${on ? "text-fg" : "text-mute"}`}>{d.label}</span>
                    <code className={`col-start-2 font-mono text-[11.5px] sm:col-start-3 ${on ? "text-lime-ink" : "text-dim"}`}>{d.method}</code>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-auto border-t border-edge px-5 py-4 sm:px-6" aria-live="polite">
            <div key={step} className="motion-safe:animate-[row-in_450ms_var(--ease-out)_both]">
              <p tabIndex={0} className="no-scrollbar overflow-x-auto font-mono text-[12px] leading-[1.6] whitespace-nowrap text-soft">
                <span className="text-lime-ink select-none">$ </span>
                pilotctl appstore call {app.id} <span className="text-fg">{now.method}</span> &apos;{now.args}&apos;
              </p>
              <p className="mt-1.5 font-mono text-[12px] leading-[1.6] text-dim">
                <span className="text-lime-ink">→</span> {now.result}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ALSO_FEATURED.map((id) => {
          const a = byId(id);
          return (
            <a
              key={id}
              href={`/apps/${id}`}
              className="group flex items-center gap-4 rounded-[16px] border border-edge p-4 transition-[border-color,background-color] duration-300 hover:border-edge-3 hover:bg-fg/[0.03]"
            >
              <img src={a.icon} alt="" width={44} height={44} loading="lazy" className="size-11 shrink-0 rounded-[22%]" />
              <div className="min-w-0">
                <p className="flex items-baseline gap-2.5">
                  <span className="text-[15px] font-medium text-fg">{a.name}</span>
                  <span className="font-mono text-[11px] text-faint">also featured</span>
                </p>
                <p className="mt-0.5 truncate text-[14px] text-mute">{a.description}</p>
              </div>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-dim max-sm:hidden">{platforms(id)}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site                                                            */
/* ------------------------------------------------------------------ */

/** Sky: a flat card with the focal 20px corners (composed: the kit's unlayered `.sky-card` would win over a radius utility). */
const FOCAL = "rounded-[20px] border border-(--sky-card-line) bg-card";

/** What each of the five demo calls leaves behind on the machine, in the demo's order. */
const BUILDS: (keyof typeof Glyph)[] = ["terminal", "folder", "server", "database", "table"];

/**
 * The featured app on a hatch panel (Figma 213:20181, the home page's App Store): PostgreSQL as its store listing
 * (icon, publisher, the facts as marks and numbers, its 13 methods, the install command) beside its publisher's
 * five-call demo, each call shown with what it builds, then the two other featured apps.
 */
function SkyFeatured({
  facts,
  step,
  onPick,
  demoRef,
}: {
  facts: Facts;
  step: number;
  onPick: (i: number) => void;
  demoRef: Ref<HTMLDivElement>;
}) {
  const app = byId(FEATURED_ID);
  const f = facts[app.id];
  const now = POSTGRES_DEMO[step];
  const category = categoriesOf(app.id)[0]?.name;
  const lastStep = step === POSTGRES_DEMO.length - 1;

  return (
    <HatchPanel className="p-3 sm:p-8 lg:p-12">
      <div ref={demoRef} className="grid grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* The store listing. */}
        <div className={`flex min-w-0 flex-col p-5 sm:p-8 ${FOCAL}`}>
          <p className="inline-flex w-fit items-center rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12px] leading-4 font-medium text-(--sky-accent)">
            Latest featured app
          </p>
          <div className="mt-5 flex items-center gap-4 sm:gap-5">
            <img src={app.icon} alt="" width={88} height={88} className="size-[72px] shrink-0 rounded-[23%] shadow-tile sm:size-[88px]" />
            <div className="min-w-0">
              <h2 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-fg sm:text-[32px]">{app.name}</h2>
              <p className="mt-1 text-[13.5px] leading-5 text-pretty text-mute">
                {app.publisher}
                {category && ` · ${category}`}
              </p>
            </div>
          </div>
          <p className="mt-5 text-[15.5px] leading-[1.5] text-soft">{app.description}</p>
          <dl className="mt-5 grid grid-cols-3 border-y border-(--sky-card-line)">
            {(
              [
                ["Version", f?.version],
                ["Methods", f?.methods],
                ["Runs on", <PlatformMarks key="p" mac={app.mac} linux={app.linux} className="size-4" />],
              ] as [string, ReactNode][]
            ).map(([k, v], i) => (
              <div key={k} className={`min-w-0 py-3 ${i > 0 ? "border-l border-(--sky-card-line) pl-4" : "pr-4"}`}>
                <dt className="text-[12px] leading-4 text-mute">{k}</dt>
                <dd className="mt-1 flex h-6 items-center text-[17px] font-medium tracking-[-0.01em] text-fg tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <ul aria-label={`${app.name}'s methods`} className="mt-4 flex flex-wrap gap-1.5">
            {POSTGRES_METHODS.map((m) => (
              <li key={m} className="rounded-[6px] bg-fg/[0.05] px-1.5 py-[3px] font-mono text-[11.5px] leading-4 text-soft">
                {m}
              </li>
            ))}
          </ul>
          <Command value={`pilotctl appstore install ${app.id}`} prefix="$ " className="mt-6" label="Copy install command" />
          <div className="mt-5 lg:mt-auto lg:pt-6">
            <TextLink href={`/apps/${app.id}`}>View PostgreSQL</TextLink>
          </div>
        </div>

        {/* The publisher's demo: five calls, each with the thing it builds. */}
        <div className={`flex min-w-0 flex-col overflow-hidden ${FOCAL}`}>
          <div className="px-5 pt-5 pb-3 sm:px-7 sm:pt-6">
            <p className="text-[15px] font-medium tracking-[-0.01em] text-fg">Full usage demo</p>
            <p className="mt-0.5 text-[13.5px] text-mute">From nothing to a query in five calls.</p>
          </div>
          <ol className="relative px-2 pb-3 sm:px-4">
            {POSTGRES_DEMO.map((d, i) => {
              const on = i === step;
              const done = i < step;
              const G = Glyph[BUILDS[i]];
              return (
                <li key={d.method} className="relative">
                  {i < POSTGRES_DEMO.length - 1 && (
                    <span
                      aria-hidden
                      data-on={done}
                      className="absolute top-[50px] bottom-[-4px] left-[29px] w-px bg-(--sky-card-line) transition-colors duration-300 data-[on=true]:bg-(--sky-fill)/50"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onPick(i)}
                    aria-pressed={on}
                    data-on={on}
                    className="relative grid w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-x-3 rounded-[12px] px-3 py-2.5 text-left transition-colors duration-300 hover:bg-fg/[0.03] data-[on=true]:bg-(--sky-tint) sm:grid-cols-[34px_minmax(0,1fr)_auto]"
                  >
                    <span
                      className={`relative row-span-2 grid size-[34px] place-items-center rounded-[10px] transition-[background-color,color,box-shadow] duration-300 sm:row-span-1 ${
                        on ? "bg-(--sky-fill) text-white" : done ? "bg-card text-(--sky-accent) shadow-tile" : "bg-fg/[0.05] text-mute"
                      }`}
                    >
                      <G className="size-[18px]" />
                      {done && (
                        <span className="absolute -right-1 -bottom-1 grid size-3.5 place-items-center rounded-full bg-(--sky-fill) text-white ring-2 ring-card">
                          <CheckIcon className="size-2" />
                        </span>
                      )}
                    </span>
                    <span className={`text-[14.5px] leading-5 transition-colors duration-300 ${on ? "font-medium text-fg" : "text-soft"}`}>{d.label}</span>
                    <code className={`col-start-2 font-mono text-[12px] leading-4 sm:col-start-3 ${on ? "text-(--sky-accent)" : "text-mute"}`}>{d.method}</code>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-auto min-h-[136px] border-t border-(--sky-card-line) bg-fg/[0.02] px-5 py-4 sm:px-7" aria-live="polite">
            <div key={step} className="motion-safe:animate-[row-in_450ms_var(--ease-out)_both]">
              <p tabIndex={0} className="no-scrollbar overflow-x-auto font-mono text-[12px] leading-[1.6] whitespace-nowrap text-mute">
                <span className="text-(--sky-accent) select-none">$ </span>
                pilotctl appstore call {app.id} <span className="text-fg">{now.method}</span> &apos;{now.args}&apos;
              </p>
              {lastStep ? (
                // "One row: id=1, name=pen", as the table it is.
                <table className="mt-3 overflow-hidden rounded-[8px] border border-(--sky-card-line) bg-card text-left font-mono text-[12px] leading-5">
                  <caption className="sr-only">{now.result}</caption>
                  <thead className="text-mute">
                    <tr className="border-b border-(--sky-card-line)">
                      <th className="px-3 py-1 font-normal">id</th>
                      <th className="border-l border-(--sky-card-line) px-3 py-1 font-normal">name</th>
                    </tr>
                  </thead>
                  <tbody className="text-fg">
                    <tr>
                      <td className="px-3 py-1 tabular-nums">1</td>
                      <td className="border-l border-(--sky-card-line) px-3 py-1">pen</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="mt-2 text-[13.5px] leading-[1.5] text-soft">
                  <span className="text-(--sky-accent)">→</span> {now.result}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5">
        {ALSO_FEATURED.map((id) => {
          const a = byId(id);
          return (
            <a
              key={id}
              href={`/apps/${id}`}
              className="group flex items-center gap-4 rounded-[12px] border border-(--sky-card-line) bg-card p-4 transition-[border-color] duration-300 hover:border-fg/20 sm:p-5"
            >
              <img src={a.icon} alt="" width={44} height={44} loading="lazy" className="size-11 shrink-0 rounded-[23%] shadow-tile" />
              <div className="min-w-0">
                <p className="flex items-baseline gap-2.5">
                  <span className="text-[15px] font-medium text-fg">{a.name}</span>
                  <span className="text-[12.5px] text-mute">Also featured</span>
                </p>
                <p className="mt-0.5 truncate text-[14px] text-mute">{a.description}</p>
              </div>
              <span className="ml-auto shrink-0 max-sm:hidden">
                <PlatformMarks mac={a.mac} linux={a.linux} />
              </span>
            </a>
          );
        })}
      </div>
    </HatchPanel>
  );
}
