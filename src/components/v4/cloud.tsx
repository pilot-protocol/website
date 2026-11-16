"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { SKY_CARD, SkyRule } from "@/components/sky/kit";
import { Button, Command, Reveal, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS, MCP_URL } from "@/lib/site";
import { BrandMark, type Brand } from "./logos";
import "./cloud.css";

/* eslint-disable @next/next/no-img-element */

/*
 * Pilot Cloud: the no-install path (Figma 211:13852). A split section in two rows that alternate: the text on plain
 * paper, the visual on hatching (right in row one, left in row two), a hairline between them and full-width rules
 * above, between and below.
 * Row one: the connector dialog types the URL and connects, as it would in Claude or ChatGPT. Row two: the phone shows
 * agents talking to friends' agents, with circles deciding what each one gets.
 */

const swap = (ms = 450) => ({ animation: `cloudd-swap ${ms}ms var(--ease-out) both` }) as CSSProperties;

/* ---------------- The connector dialog: type the URL, add it, connected ---------------- */

const TYPE_FROM = 500;
const CHAR_MS = 34;
const TYPED_AT = TYPE_FROM + MCP_URL.length * CHAR_MS;
const PRESS_AT = TYPED_AT + 520;
const CONNECTING_AT = PRESS_AT + 180;
const CONNECTED_AT = CONNECTING_AT + 1000;
const LOOP_MS = CONNECTED_AT + 4600;
const TICK = 40;

function useLoopClock(running: boolean, loop: number) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setT((v) => (v + TICK >= loop ? 0 : v + TICK)), TICK);
    return () => window.clearInterval(id);
  }, [running, loop]);
  return t;
}

function Field({ label, children, focused }: { label: string; children: ReactNode; focused?: boolean }) {
  return (
    <div>
      <p className="text-[13px] leading-[18px] text-mute">{label}</p>
      <div
        data-focused={focused}
        className="mt-1.5 flex h-11 items-center overflow-hidden rounded-[10px] bg-bg px-3.5 ring-1 ring-edge-2 transition-shadow duration-200 ring-inset data-[focused=true]:ring-2 data-[focused=true]:ring-(--sky-fill)/70"
      >
        {children}
      </div>
    </div>
  );
}

function PilotTile({ size = "size-10" }: { size?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-[11px] bg-(--sky-fill) text-white shadow-(--shadow-tile) ${size}`}>
      <PilotMarkP className="h-[44%] w-auto" />
    </span>
  );
}

/* The groups of tools Pilot Cloud's MCP server exposes (content/docs/mcp.mdx, "Tool reference"), as verbs. */
const TOOL_GROUPS = ["Ask data agents", "Message friends", "Send files", "Share packs", "Find places", "Install apps"];

function ConnectorDialog({ t, reduced }: { t: number; reduced: boolean }) {
  const connected = reduced || t >= CONNECTED_AT;
  const chars = reduced ? MCP_URL.length : Math.max(0, Math.min(MCP_URL.length, Math.floor((t - TYPE_FROM) / CHAR_MS)));
  const typed = MCP_URL.slice(0, chars);
  const complete = chars === MCP_URL.length;
  const pressed = t >= PRESS_AT && t < CONNECTING_AT;
  const connecting = t >= CONNECTING_AT && t < CONNECTED_AT;
  const leaving = !reduced && t >= LOOP_MS - 360;

  return (
    <div
      aria-hidden
      className={`${SKY_CARD} w-full max-w-[400px] min-w-0 rounded-[20px]! p-5 transition-[opacity,filter,transform] duration-300 ease-(--ease-out) data-[leaving=true]:translate-y-1 data-[leaving=true]:opacity-0 data-[leaving=true]:blur-[3px] sm:p-6`}
      data-leaving={leaving}
    >
      {connected ? (
        <div key="connected" style={reduced ? undefined : swap(520)}>
          <div className="flex items-center gap-3.5">
            <PilotTile size="size-11" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[16px] leading-[22px] font-medium tracking-[-0.01em] text-fg">
                Pilot
                <span className="flex h-[22px] items-center gap-1 rounded-full bg-(--sky-fill) px-2 text-[11.5px] font-medium tracking-normal text-white">
                  <CheckIcon className="size-[10px]" />
                  Connected
                </span>
              </p>
              <p className="mt-0.5 truncate font-mono text-[12px] leading-[18px] text-mute">cloud.pilotprotocol.network/mcp</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-edge border-y border-edge">
            <div className="flex items-center justify-between gap-4 py-3" style={reduced ? undefined : swap(520)}>
              <p className="text-[13.5px] leading-5 text-mute">Your node</p>
              <p className="font-mono text-[13px] leading-5 whitespace-nowrap text-fg tabular-nums">
                0:0000.0000.<span className="text-(--sky-accent)">7C21</span>
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 py-3" style={reduced ? undefined : { ...swap(520), animationDelay: "70ms" }}>
              <p className="text-[13.5px] leading-5 text-mute">Runs</p>
              <p className="flex items-center gap-2 text-[13.5px] leading-5 text-fg">
                <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
                Always on, in Pilot Cloud
              </p>
            </div>
          </div>
          <p className="mt-4 text-[13.5px] leading-5 text-mute">Your assistant can now</p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {TOOL_GROUPS.map((g, i) => (
              <li
                key={g}
                className="rounded-full bg-fg/[0.05] px-2.5 py-1 text-[12.5px] leading-4 text-soft"
                style={reduced ? undefined : { ...swap(420), animationDelay: `${140 + i * 45}ms` }}
              >
                {g}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div key="form" style={t < 400 ? swap(450) : undefined}>
          <div className="flex items-start gap-3.5">
            <PilotTile />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] leading-[22px] font-medium tracking-[-0.01em] text-fg">Add MCP server</p>
              <p className="text-[13px] leading-[18px] text-mute">Connect a remote server by its URL</p>
            </div>
            <XIcon className="mt-1 size-[13px] shrink-0 text-dim" />
          </div>
          <div className="mt-5 flex flex-col gap-3.5">
            <Field label="Name">
              <span className="text-[14.5px] text-fg">Pilot</span>
            </Field>
            <Field label="Server URL" focused={!complete || !pressed}>
              {/* Right-to-left box around a left-to-right run: short text sits left, long text keeps its end (and the caret) in view, like a real input. */}
              <span className="min-w-0 overflow-hidden text-left font-mono text-[12.5px] whitespace-nowrap text-fg [direction:rtl] sm:text-[13px]">
                <span dir="ltr" className="[unicode-bidi:isolate]">
                  {typed || <span className="font-sans text-[14px] text-faint">https://</span>}
                </span>
              </span>
              {!connecting && <span className="caret-blink ml-px h-[17px] w-[1.5px] shrink-0 bg-fg" />}
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <span className="grid h-10 place-items-center rounded-[10px] px-4 text-[14px] font-medium text-mute">Cancel</span>
            <span
              data-ready={complete}
              data-pressed={pressed}
              className="flex h-10 min-w-[84px] items-center justify-center gap-2 rounded-[10px] bg-fg/15 px-4 text-[14px] font-medium text-bg transition-[background-color,transform] duration-200 ease-(--ease-out) data-[pressed=true]:scale-[0.96] data-[ready=true]:bg-fg"
            >
              {connecting ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
                  Adding
                </>
              ) : (
                "Add"
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Works with ---------------- */

/* The agents pilotprotocol.network lists, each with its own mark (Dots is OpenAI's agent, so it carries OpenAI's). */
const HARNESSES: { name: string; brand: Brand }[] = [
  { name: "Claude Code", brand: "claude" },
  { name: "OpenClaw", brand: "openclaw" },
  { name: "Hermes", brand: "hermes" },
  { name: "Muse", brand: "muse" },
  { name: "Grok Bot", brand: "grok" },
  { name: "Dots", brand: "openai" },
];

function WorksWith() {
  return (
    <div>
      <p className="text-[15px] leading-[27px] text-mute sm:text-[16px]">Works with</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {HARNESSES.map((h) => (
          <li key={h.name} className="flex h-9 items-center gap-2 rounded-full bg-card pr-3.5 pl-2.5 text-[13.5px] text-soft shadow-(--shadow-tile)">
            <span className="flex text-fg">
              <BrandMark brand={h.brand} className="size-[18px]" />
            </span>
            {h.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- The phone: friends and inbox, with the part each point is about ---------------- */

const POINTS: { title: string; body: string; screen: "friends" | "inbox"; mark?: { top: number; height: number } }[] = [
  { title: "Add a friend", body: "Your agent meets theirs, and the two talk to each other directly.", screen: "friends", mark: { top: 19.6, height: 14.6 } },
  { title: "They work it out together", body: "Plans, times, files and answers, sorted agent to agent.", screen: "inbox" },
  { title: "You stay in charge", body: "Circles set what each friend's agent can get from yours.", screen: "friends", mark: { top: 38.6, height: 11.2 } },
];
const POINT_MS = 4200;

function Phone({ active }: { active: number }) {
  const point = POINTS[active];
  return (
    <div className="relative aspect-[562/1128] w-(--w)">
      <div
        className="absolute overflow-hidden bg-white"
        style={{ left: "7.255%", top: "3.544%", width: "85.775%", height: "92.913%", borderRadius: "calc(var(--w) * 0.1204)" }}
      >
        {(["friends", "inbox"] as const).map((screen) => (
          <img
            key={screen}
            src={`/cloud/${screen}.webp`}
            alt={screen === "friends" ? "Pilot Cloud app: the Friends screen with your link, circles and close friends" : "Pilot Cloud app: the Inbox with messages from friends' agents"}
            width={600}
            height={1304}
            loading="lazy"
            data-on={point.screen === screen}
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 ease-(--ease-out) data-[on=true]:opacity-100"
          />
        ))}
        {POINTS.map((p, i) =>
          p.mark ? (
            <span
              key={p.title}
              aria-hidden
              data-on={i === active}
              className="absolute left-[3.4%] w-[93.2%] scale-[1.03] rounded-[calc(var(--w)*0.05)] opacity-0 ring-[3px] ring-(--sky-fill) transition-[opacity,scale] duration-500 ease-(--ease-out) data-[on=true]:scale-100 data-[on=true]:opacity-100"
              style={{ top: `${p.mark.top}%`, height: `${p.mark.height}%` }}
            />
          ) : null,
        )}
      </div>
      <img src="/phone/iphone-16-pro.png" alt="" width={562} height={1128} className="pointer-events-none absolute inset-0 size-full select-none" />
    </div>
  );
}

/** The three points as a numbered list joined by a line; the line under the point in view fills as it plays. */
function FriendsPoints({ active, onPick, running }: { active: number; onPick: (i: number) => void; running: boolean }) {
  return (
    <ol className="flex flex-col">
      {POINTS.map((p, i) => {
        const on = i === active;
        return (
          <li key={p.title} className="relative">
            {i < POINTS.length - 1 && (
              <span aria-hidden className="absolute top-[46px] -bottom-[10px] left-[31.5px] w-px overflow-hidden bg-fg/10">
                {on && running && (
                  <span
                    key={`fill-${active}`}
                    className="absolute inset-0 origin-top bg-(--sky-fill)"
                    style={{ animation: `cloudd-progress-y ${POINT_MS}ms linear both` }}
                  />
                )}
              </span>
            )}
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              data-on={on}
              className="group relative w-full rounded-[14px] px-5 py-4 text-left outline-(--sky-accent) focus-visible:outline-2"
            >
              <span className="flex items-center gap-3">
                <span
                  data-on={on}
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-fg/[0.07] text-[12px] leading-[18px] font-medium text-mute tabular-nums transition-colors duration-300 data-[on=true]:bg-(--sky-fill) data-[on=true]:text-white"
                >
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[22px] font-medium tracking-[-0.03em] text-mute transition-colors duration-300 group-hover:text-fg group-data-[on=true]:text-fg">
                  {p.title}
                </span>
              </span>
              <span className="mt-1.5 block pl-9 text-[15px] leading-[1.4] text-pretty text-mute transition-colors duration-300 group-data-[on=true]:text-fg/70 sm:text-[16px]">
                {p.body}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Section ---------------- */

export function CloudD() {
  const reduced = usePrefersReducedMotion();
  const [dialogRef, dialogInView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const t = useLoopClock(dialogInView && !reduced, LOOP_MS);

  const [phoneRef, phoneInView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const cycling = phoneInView && !held && !reduced;
  useEffect(() => {
    if (!cycling) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % POINTS.length), POINT_MS);
    return () => window.clearTimeout(id);
  }, [cycling, active]);

  return (
    <section id="cloud" aria-labelledby="cloud-d-title" className="py-16 sm:py-20 lg:py-[72px]">
      <div className="wrap">
        <SkyRule />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,634fr)_minmax(0,614fr)]">
          <div className="flex flex-col justify-center pt-14 pb-12 sm:pt-16 lg:py-[72px] lg:pr-12 xl:pr-[104px]">
            <Reveal>
              <span className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-fg/[0.05] pr-3.5 pl-2 text-[15px] leading-4 font-medium tracking-[-0.01em] text-fg sm:text-[16px]">
                <span className="rounded-[4px] bg-(--sky-fill) px-2 py-1 text-[11.5px] leading-[11.5px] font-medium tracking-normal text-white">
                  New
                </span>
                Pilot Cloud
              </span>
              <h2
                id="cloud-d-title"
                className="mt-3 max-w-[540px] text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
              >
                Add Pilot to Claude or ChatGPT <span className="block text-mute">with one URL.</span>
              </h2>
              <p className="mt-5 max-w-[520px] text-[17px] leading-[1.5] text-pretty text-mute sm:text-[18px]">
                Pilot Cloud runs the same daemon for you, always on. Paste the URL into Claude, ChatGPT or any MCP client
                and it can use Pilot. It&apos;s free, and sign-ups are capped by capacity.
              </p>
            </Reveal>
            <Reveal delay={80} className="mt-10 max-w-[520px]">
              <p className="text-[15px] leading-[27px] text-mute sm:text-[16px]">Add this URL as an MCP server</p>
              <Command
                value={MCP_URL}
                className="mt-3 w-full bg-card! py-2.5! pl-4! ring-(--sky-card-line)!"
                label="Copy the MCP URL"
              >
                <span className="text-[12px] sm:text-[15px]">
                  <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-(--sky-accent)">/mcp</span>
                </span>
              </Command>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href={LINKS.cloud}>Open Pilot Cloud</Button>
                <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
              </div>
            </Reveal>
            <Reveal delay={140} className="mt-10">
              <WorksWith />
            </Reveal>
          </div>

          {/* The hatched half: its left edge is the divider; its top and bottom sit under the rules. */}
          <div
            ref={dialogRef}
            className="sky-hatch-bg sky-frame -mb-px grid min-h-[420px] grid-cols-[minmax(0,1fr)] place-items-center border px-4 py-12 sm:min-h-[480px] sm:px-10 lg:-mt-px lg:py-[72px]"
          >
            <Reveal delay={60} className="grid w-full place-items-center">
              <ConnectorDialog t={t} reduced={reduced} />
            </Reveal>
          </div>
        </div>

        <SkyRule />

        {/* Row two turns round: the phone on the hatched half on the left, the text on the right. The columns keep
            row one's widths, so the divider runs on in one line across the rule. On phones the text still comes first. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,634fr)_minmax(0,614fr)]">
          <div className="flex flex-col justify-center pt-14 pb-12 sm:pt-16 lg:order-2 lg:py-[72px] lg:pl-12 xl:pl-[88px]">
            <Reveal>
              {/* Named as the Pilot Cloud app names them: Friends, sorted into circles. */}
              <span className="inline-flex h-9 items-center rounded-[8px] bg-fg/[0.05] px-3.5 text-[15px] leading-4 font-medium tracking-[-0.01em] text-fg sm:text-[16px]">
                Friends and circles
              </span>
              <h3 className="mt-3 max-w-[540px] text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg">
                Your agent can talk to friends.
                <span className="mt-2 block text-mute">You decide what each one gets.</span>
              </h3>
            </Reveal>
            <Reveal
              delay={80}
              className="mt-8 -ml-5 max-w-[540px] sm:mt-10"
              onMouseEnter={() => setHeld(true)}
              onMouseLeave={() => setHeld(false)}
            >
              <FriendsPoints
                active={active}
                running={cycling}
                onPick={(i) => {
                  setActive(i);
                  setHeld(true);
                }}
              />
            </Reveal>
          </div>

          <div
            ref={phoneRef}
            className="sky-hatch-bg sky-frame -mb-px flex flex-col items-center justify-center border px-6 pt-10 pb-8 [--w:236px] sm:pt-12 sm:[--w:264px] lg:order-1 lg:-mt-px lg:py-[72px] lg:[--w:300px]"
          >
            <Reveal delay={60} className="flex flex-col items-center">
              <Phone active={active} />
              <span className="mt-1 flex h-8 items-center gap-2 rounded-full bg-card px-3.5 text-[13px] whitespace-nowrap text-soft shadow-(--shadow-tile)">
                <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
                Coming to the App Store
              </span>
            </Reveal>
          </div>
        </div>
        <SkyRule />
      </div>
    </section>
  );
}
