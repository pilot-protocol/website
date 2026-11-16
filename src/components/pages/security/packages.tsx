"use client";

import { CheckIcon } from "@/components/icons";
import { at, ObjTile, Stage, WIRE, type ObjName } from "@/components/pages/security/infra";
import { FLAT_CARD, SectionHead, SKY, SkySplit, Soft, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal, TextLink } from "@/components/ui";

const STAGES = [
  { t: "Reviewed", b: "Review answers whether a listing meets the catalogue’s requirements." },
  { t: "Signature verified", b: "The daemon checks the package signature before it installs." },
  { t: "SHA-256 pinned", b: "The package has to match its pinned hash." },
  { t: "Grants accepted", b: "The manifest declares what the app asks the daemon to do; you accept it at install." },
  { t: "Ordinary process", b: "Not OS-sandboxed. It runs with your user’s permissions." },
];

const DURATIONS = [1000, 1000, 1000, 1200, 2600] as const;

const ICON = "/apps/agentphone.webp";

export function Packages() {
  if (SKY) return <SkyPackages />;
  return <GreenPackages />;
}

function GreenPackages() {
  const { ref, step } = useStepper<HTMLDivElement>(STAGES.length, DURATIONS);

  return (
    <section aria-labelledby="packages-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <SectionHead
            id="packages-title"
            kicker="App Store"
            title={
              <>
                Checked packages. <Soft>Ordinary processes.</Soft>
              </>
            }
            lede="Apps in the App Store are made by their publishers. Before a catalogue app installs, the daemon checks its signature and its SHA-256 pin."
          />
          <Reveal delay={60} className="flex flex-col gap-3 lg:items-end">
            <div className="flex max-w-full items-center gap-2.5 rounded-md border border-edge-3 py-2 pr-3 pl-3 font-mono text-[12px] text-fg">
              <span className="text-lime-ink">$</span>
              <span className="truncate">pilotctl appstore install io.pilot.agentphone</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-14 sm:mt-16">
          <div ref={ref} className="relative">
            <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-5">
              {STAGES.map((s, i) => {
                const last = i === STAGES.length - 1;
                const state = i < step ? "passed" : i === step ? "here" : "ahead";
                return (
                  <li
                    key={s.t}
                    data-state={state}
                    className={`relative grid grid-cols-[48px_minmax(0,1fr)_auto] gap-x-4 p-5 transition-colors duration-500 md:flex md:flex-col md:pb-7 ${
                      last ? "bg-bg-deep" : "bg-bg"
                    }`}
                  >
                    {last && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-2 rounded-md border border-dashed border-edge-3 md:inset-3"
                      />
                    )}
                    <span className="relative col-start-3 row-start-1 flex items-center justify-between font-mono text-[12px] text-dim md:order-none">
                      <span className="max-md:hidden">0{i + 1}</span>
                      {!last && (
                        <span
                          data-state={state}
                          className="grid size-5 place-items-center rounded-[5px] border border-edge-2 text-transparent transition-[background-color,border-color,color] duration-500 data-[state=passed]:border-lime data-[state=passed]:bg-lime data-[state=passed]:text-ink"
                        >
                          <CheckIcon className="size-3" />
                        </span>
                      )}
                    </span>
                    {/* The app tile sits in the stage it has reached. */}
                    <span className="relative col-start-1 row-start-1 flex size-12 items-center md:mt-6 md:h-14 md:w-auto">
                      <span
                        aria-hidden
                        className="absolute inset-0 grid size-12 place-items-center rounded-[10px] border border-dashed border-edge-2 font-mono text-[11px] text-faint md:hidden"
                      >
                        0{i + 1}
                      </span>
                      <span
                        data-show={i === step}
                        className="relative size-12 overflow-hidden rounded-[10px] border border-edge-2 opacity-0 blur-[4px] transition-[opacity,filter,transform] duration-500 ease-(--ease-out) data-[show=true]:opacity-100 data-[show=true]:blur-[0px] motion-reduce:transition-none"
                        style={{ transform: i === step ? "none" : i < step ? "translate(12px, 12px)" : "translate(-12px, -12px)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ICON} alt="" width={48} height={48} className="size-full object-cover" />
                      </span>
                    </span>
                    <span className="relative col-start-2 row-start-1 md:mt-5">
                      <span className="block text-[17px] font-medium tracking-[-0.015em] text-fg">{s.t}</span>
                      <span className="mt-1.5 block text-[14px] leading-[1.5] text-mute">{s.b}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>

        <Reveal className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline">
          <p className="max-w-[720px] text-[15px] leading-[1.55] text-mute">
            The daemon checks grants on calls it brokers. Most apps run locally and are free. Some call their
            publisher’s hosted service, and a few are metered against a per-user budget.
          </p>
          <TextLink href="/docs/app-store">Read the App Store model</TextLink>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Sky site (Figma 233:1195): a split, the visual on the left. On the hatched half, the install as it runs: the
 * command, the app, its four checks ticking blue in turn, then how it runs once installed, set apart because it is
 * a fact about the app, not a check. With reduced motion every check shows as passed.
 */
function SkyPackages() {
  return (
    <SkySplit
      flip
      labelledBy="packages-title"
      className="pt-24 sm:pt-32"
      text={
        <SectionHead
          id="packages-title"
          title={
            <>
              Checked packages. <span className="block text-mute">Ordinary processes.</span>
            </>
          }
          lede="Apps in the App Store are made by their publishers. Before a catalogue app installs, the daemon checks its signature and its SHA-256 pin, and it checks grants on every call it brokers."
        >
          <TextLink href="/docs/app-store" className="mt-7">
            Read the App Store model
          </TextLink>
        </SectionHead>
      }
      visual={
        <Reveal delay={60} className="w-full max-w-[500px]">
          <InstallCard />
        </Reveal>
      }
    />
  );
}

const PIPE: { obj: ObjName; label: string }[] = [
  { obj: "badgeCheck", label: "Reviewed" },
  { obj: "signature", label: "Signature" },
  { obj: "fingerprint", label: "SHA-256" },
  { obj: "idBadge", label: "Grants" },
  { obj: "terminal", label: "Runs" },
];
const PW = 460;
const PH = 92;
const PX = (i: number) => 34 + i * ((PW - 68) / (PIPE.length - 1));
const PY = 30;

/**
 * The install as it runs: the command, the app, then the package travelling through its four checks (each tile
 * takes a tick as it passes) into an ordinary process. Under the picture, what each check means; at the foot, how
 * the app runs once it's in.
 */
function InstallCard() {
  const { ref, step: live, run, reduced, inView } = useStepper<HTMLDivElement>(STAGES.length, DURATIONS);
  const step = reduced ? STAGES.length - 1 : live;
  const checks = STAGES.slice(0, -1);
  const last = STAGES[STAGES.length - 1];
  const done = step === STAGES.length - 1;
  const wire = `M${PX(0)} ${PY} L${PX(PIPE.length - 1)} ${PY}`;
  const hop = (i: number) => `M${PX(i)} ${PY} L${PX(i + 1)} ${PY}`;
  return (
    <div ref={ref} className={`overflow-hidden ${FLAT_CARD}`}>
      <p className="flex h-11 items-center gap-2 border-b border-(--sky-card-line) px-4 font-mono text-[12.5px] text-fg sm:px-5">
        <span className="text-(--sky-accent) select-none">$</span>
        <span className="truncate">pilotctl appstore install io.pilot.agentphone</span>
      </p>
      <div className="flex items-center gap-3 px-4 pt-5 sm:px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ICON} alt="" width={40} height={40} className="size-10 rounded-[9px] object-cover shadow-tile" />
        <span className="min-w-0">
          <span className="block text-[15px] leading-5 font-medium tracking-[-0.02em] text-fg">AgentPhone</span>
          <span className="block truncate font-mono text-[12px] leading-5 text-mute">io.pilot.agentphone</span>
        </span>
      </div>

      <div className="px-3 pt-6 sm:px-5" aria-hidden>
        <Stage
          w={PW}
          h={PH}
          svg={
            <>
              <path d={wire} className={WIRE} />
              <path d={`M${PX(0)} ${PY} L${PX(Math.min(step, PIPE.length - 1))} ${PY}`} className={WIRE} data-lit />
              {inView && step > 0 && <Beam key={run} d={hop(step - 1)} run={run} duration={620} tail={36} />}
            </>
          }
        >
          {PIPE.map((n, i) => (
            <div key={n.label} style={at(PX(i), PY, PW, PH, 44)} className="flex flex-col items-center">
              <ObjTile
                name={n.obj}
                size={44}
                lit={i === step}
                dim={i > step}
                badge={
                  i < step || (done && i === PIPE.length - 1) ? (
                    <span className="infra-pop grid size-full place-items-center rounded-full bg-(--sky-fill) text-white">
                      <CheckIcon className="size-3" />
                    </span>
                  ) : undefined
                }
              />
              <span className={`mt-2.5 text-[12.5px] leading-4 font-medium whitespace-nowrap transition-colors duration-300 ${i <= step ? "text-fg" : "text-dim"}`}>
                {n.label}
              </span>
            </div>
          ))}
        </Stage>
      </div>

      <ol className="px-4 pt-2 pb-3 sm:px-5">
        {checks.map((s, i) => {
          const state = i < step ? "passed" : i === step ? "here" : "ahead";
          return (
            <li key={s.t} data-state={state} className="flex gap-3 border-b border-(--sky-card-line) py-2.5 last:border-b-0">
              <span
                aria-hidden
                data-state={state}
                className="mt-[3px] grid size-4 shrink-0 place-items-center rounded-full bg-fg/[0.07] text-transparent transition-[background-color,color,box-shadow] duration-500 data-[state=here]:shadow-[inset_0_0_0_1.5px_var(--sky-fill)] data-[state=here]:bg-transparent data-[state=passed]:bg-(--sky-fill) data-[state=passed]:text-white"
              >
                <CheckIcon className="size-2.5" />
              </span>
              <span className="min-w-0 text-[14px] leading-[1.5] text-mute">
                <span className={`font-medium transition-colors duration-500 ${state === "ahead" ? "text-soft" : "text-fg"}`}>{s.t}.</span>{" "}
                {s.b}
                <span className="sr-only">{state === "passed" ? " Passed." : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Once installed: an ordinary process, as a process list shows it. */}
      <div
        data-on={done}
        className="border-t border-(--sky-card-line) bg-fg/[0.025] px-4 py-4 transition-colors duration-500 data-[on=true]:bg-(--sky-tint) sm:px-5"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1.5 text-[12.5px] leading-4">
          <span className="text-mute">Process</span>
          <span className="text-mute">User</span>
          <span className="text-mute">Sandbox</span>
          <span className="flex min-w-0 items-center gap-2 font-mono text-fg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON} alt="" width={18} height={18} className="size-[18px] rounded-[5px]" />
            <span className="truncate">agentphone</span>
          </span>
          <span className="font-mono text-fg">you</span>
          <span className="font-mono text-fg">none</span>
        </div>
        <p className="mt-3 text-[14px] leading-[1.5] text-mute">
          <span className="font-medium text-fg">Then: {last.t.toLowerCase()}.</span> {last.b}
        </p>
      </div>
    </div>
  );
}
