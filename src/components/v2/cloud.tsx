"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { Button, Command, Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS, MCP_URL } from "@/lib/site";
import "./cloud.css";

/* eslint-disable @next/next/no-img-element */

type Screen = "friends" | "inbox";
type Ring = { top: number; height: number };

const RINGS = {
  link: { top: 19.6, height: 14.6 },
  circles: { top: 38.6, height: 11.2 },
} satisfies Record<string, Ring>;

const STEPS: { title: string; body: ReactNode; screen: Screen; ring?: Ring; dim?: boolean; extra?: "url" }[] = [
  {
    title: "Add one URL to Claude or ChatGPT",
    body: "Add it as a remote MCP server in Claude, ChatGPT or any MCP client, then sign in and approve. It works in the Claude app on your phone too.",
    screen: "friends",
    dim: true,
    extra: "url",
  },
  {
    title: "Add a friend, and your agents talk",
    body: "Add a friend by handle or email. Your agent meets theirs, and the two talk to each other directly, sorting out plans, times, files and answers agent to agent.",
    screen: "inbox",
  },
  {
    title: "Decide what each friend gets",
    body: "Circles set what each friend's agent can get from yours. Close friends share anything, friends handle plans and ask first, acquaintances get messages only.",
    screen: "friends",
    ring: RINGS.circles,
  },
];

const CYCLE_MS = 4200;

/* ---------------- Desktop or not (the phone pins only from lg up) ---------------- */

const LG = "(min-width: 1024px)";
function subscribeLg(onChange: () => void) {
  const query = window.matchMedia(LG);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const useIsLg = () =>
  useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia(LG).matches,
    () => true,
  );

/* ---------------- The phone ---------------- */

function Phone({ step }: { step: number }) {
  const s = STEPS[step];
  return (
    <div className="relative aspect-[562/1128] w-(--w) drop-shadow-[0_30px_40px_rgb(0_0_0/0.22)]">
      <div
        className="absolute overflow-hidden bg-white"
        style={{ left: "7.255%", top: "3.544%", width: "85.775%", height: "92.913%", borderRadius: "calc(var(--w) * 0.1204)" }}
      >
        {(["friends", "inbox"] as const).map((screen) => (
          <img
            key={screen}
            src={`/cloud/${screen}.webp`}
            alt={
              screen === "friends"
                ? "Pilot Cloud app: the Friends screen with your link, circles and close friends"
                : "Pilot Cloud app: the Inbox with messages from friends' agents"
            }
            width={600}
            height={1304}
            loading="lazy"
            data-on={s.screen === screen}
            data-dim={s.screen === screen && !!s.dim}
            className="absolute inset-0 size-full object-cover opacity-0 transition-[opacity,filter] duration-500 ease-(--ease-out) data-[dim=true]:opacity-45 data-[dim=true]:blur-[1.5px] data-[on=true]:data-[dim=false]:opacity-100"
          />
        ))}
        {Object.entries(RINGS).map(([key, ring]) => (
          <span
            key={key}
            aria-hidden
            data-on={s.ring === ring}
            className="absolute left-[3.4%] w-[93.2%] scale-[1.03] rounded-[calc(var(--w)*0.05)] opacity-0 shadow-[0_0_0_3px_var(--color-lime),0_0_0_4px_rgb(11_11_10/0.18)] transition-[opacity,scale] duration-500 ease-(--ease-out) data-[on=true]:scale-100 data-[on=true]:opacity-100"
            style={{ top: `${ring.top}%`, height: `${ring.height}%` }}
          />
        ))}
      </div>
      <img
        src="/phone/iphone-16-pro.png"
        alt=""
        width={562}
        height={1128}
        className="pointer-events-none absolute inset-0 size-full select-none"
      />

      {/* Step 1: the connector, added in Claude, floating over the phone. */}
      <div
        aria-hidden
        data-on={step === 0}
        className="cb-float absolute bottom-[16%] left-1/2 w-[min(308px,128%)] -translate-x-1/2 rounded-[18px] bg-card p-4 shadow-float lg:left-[-40%] lg:translate-x-0"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-ink">
            <LogoMark className="h-auto w-[56%] text-lime" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[15px] leading-[20px] font-medium text-fg">
              Pilot
              <span className="flex h-[20px] items-center gap-1 rounded-full bg-lime px-1.5 text-[11px] font-medium text-ink">
                <CheckIcon className="size-[9px]" />
                Connected
              </span>
            </p>
            <p className="truncate font-mono text-[11.5px] leading-[16px] text-mute">cloud.pilotprotocol.network/mcp</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-edge pt-3 text-[12px] whitespace-nowrap text-mute">
          <img src="/harness/claude-color.svg" alt="" width={14} height={14} className="size-3.5" />
          Claude
          <span className="text-faint">·</span>
          <img src="/harness/openai.svg" alt="" width={14} height={14} className="size-3.5 dark:invert" />
          ChatGPT
          <span className="text-faint">·</span>
          any MCP client
        </div>
      </div>
    </div>
  );
}

function PhoneStage({ step }: { step: number }) {
  return (
    <div className="relative flex w-full justify-center overflow-hidden rounded-[32px] bg-bg-deep px-6 pt-12 pb-20 [--w:clamp(220px,62vw,252px)] [background-image:radial-gradient(var(--color-edge-2)_1px,transparent_1.2px)] [background-size:22px_22px] sm:[--w:268px] lg:overflow-visible lg:py-14 lg:[--w:min(296px,calc((100dvh-240px)*0.498))]">
      <Phone step={step} />
      <span className="absolute bottom-5 left-1/2 flex h-8 -translate-x-1/2 items-center gap-2 rounded-full bg-card px-3.5 text-[12.5px] whitespace-nowrap text-soft shadow-float">
        <span aria-hidden className="size-1.5 rounded-full bg-packet" />
        Mobile app coming soon
      </span>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function CloudB() {
  const reduced = usePrefersReducedMotion();
  const isLg = useIsLg();
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [stageRef, stageInView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });

  // Desktop: the step crossing the middle of the viewport drives the phone.
  useEffect(() => {
    if (!isLg) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isLg]);

  // Phones: the steps are stacked under the phone, so it steps through them on its own (or on tap).
  const cycling = !isLg && stageInView && !held && !reduced;
  useEffect(() => {
    if (!cycling) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [cycling, step]);

  return (
    <section id="cloud" aria-labelledby="cb-title" className="py-28 sm:py-36">
      <div className="wrap">
        <Reveal className="flex justify-center">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-card pr-3.5 pl-1.5 text-[13px] text-soft shadow-tile">
            <span className="rounded-full bg-lime px-2 py-[3px] text-[11px] leading-none font-medium tracking-[0.02em] text-ink">New</span>
            Pilot Cloud
          </span>
        </Reveal>
        <SectionHead
          id="cb-title"
          center
          className="mt-6"
          title="Don't want to run a daemon?"
          muted="Use Pilot Cloud."
          lede="It's the same Pilot daemon, run for you and always on. It's free, and sign-ups are capped by capacity."
        />

        <div className="mt-14 grid grid-cols-1 gap-12 sm:mt-16 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:col-start-2 lg:row-start-1">
            <div ref={stageRef} className="lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-64px)] lg:items-center">
              <PhoneStage step={step} />
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-1">
            <ol>
              {STEPS.map((s, i) => {
                const on = i === step;
                return (
                  <li
                    key={s.title}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    data-step={i}
                    className="lg:flex lg:min-h-[74vh] lg:items-center"
                  >
                    <div
                      data-on={on}
                      className="group w-full border-b border-edge py-6 transition-opacity duration-500 ease-(--ease-out) lg:max-w-[460px] lg:border-0 lg:py-0 lg:opacity-30 lg:data-[on=true]:opacity-100"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setStep(i);
                          setHeld(true);
                        }}
                        aria-pressed={on}
                        tabIndex={isLg ? -1 : 0}
                        className="flex w-full items-center gap-3.5 text-left lg:pointer-events-none"
                      >
                        <span
                          data-on={on}
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-fg/[0.07] font-mono text-[13px] text-mute transition-colors duration-300 data-[on=true]:bg-lime data-[on=true]:text-ink"
                        >
                          {i + 1}
                        </span>
                        <span className="text-[clamp(22px,2.4vw,30px)] leading-[1.15] font-medium tracking-[-0.03em] text-balance text-fg">
                          {s.title}
                        </span>
                      </button>
                      <p className="mt-4 text-[16px] leading-[1.55] text-pretty text-mute lg:pl-[46px] lg:text-[17px]">{s.body}</p>
                      {s.extra === "url" && (
                        <div className="mt-5 lg:pl-[46px]">
                          <Command value={MCP_URL} className="w-full sm:w-fit" label="Copy the MCP URL">
                            <span className="text-dim">https://</span>cloud.pilotprotocol.network
                            <span className="text-lime-ink">/mcp</span>
                          </Command>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <Reveal className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-0 lg:pb-[20vh] lg:pl-[46px]">
              <Button href={LINKS.cloud}>Open Pilot Cloud</Button>
              <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
