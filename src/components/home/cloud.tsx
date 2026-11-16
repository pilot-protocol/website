"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { Button, Command, Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS, MCP_URL } from "@/lib/site";
import "./cloud.css";

/* eslint-disable @next/next/no-img-element */

const swap = (ms = 450) => ({ animation: `cloud-swap ${ms}ms var(--ease-out) both` }) as CSSProperties;

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
      <p className="text-[12.5px] leading-[18px] text-mute">{label}</p>
      <div
        data-focused={focused}
        className="mt-1.5 flex h-11 items-center overflow-hidden rounded-[10px] bg-bg px-3.5 ring-1 ring-edge-2 transition-shadow duration-200 ring-inset data-[focused=true]:ring-2 data-[focused=true]:ring-lime-ink/70"
      >
        {children}
      </div>
    </div>
  );
}

function PilotTile({ size = "size-10" }: { size?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-[11px] bg-ink shadow-tile ${size}`}>
      <LogoMark className="h-auto w-[56%] text-lime" />
    </span>
  );
}

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
      className="w-full max-w-[400px] min-w-0 rounded-[22px] bg-card p-5 shadow-float transition-[opacity,filter,transform] duration-300 ease-(--ease-out) data-[leaving=true]:translate-y-1 data-[leaving=true]:opacity-0 data-[leaving=true]:blur-[3px] sm:p-6"
      data-leaving={leaving}
    >
      {connected ? (
        <div key="connected" style={reduced ? undefined : swap(520)}>
          <div className="flex items-center gap-3.5">
            <PilotTile size="size-11" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[16px] leading-[22px] font-medium tracking-[-0.01em] text-fg">
                Pilot
                <span className="flex h-[22px] items-center gap-1 rounded-full bg-lime px-2 text-[11.5px] font-medium tracking-normal text-ink">
                  <CheckIcon className="size-[10px]" />
                  Connected
                </span>
              </p>
              <p className="mt-0.5 truncate font-mono text-[12px] leading-[18px] text-mute">cloud.pilotprotocol.network/mcp</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-px overflow-hidden rounded-[14px] bg-edge">
            {[
              ["Always on", "Run for you on Pilot Cloud"],
              ["Nothing to install", "No daemon or server on your side"],
            ].map(([title, note]) => (
              <div key={title} className="flex items-center gap-3 bg-card-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-[20px] text-fg">{title}</p>
                  <p className="text-[12.5px] leading-[18px] text-mute">{note}</p>
                </div>
                <span className="flex h-[22px] w-[38px] shrink-0 items-center justify-end rounded-full bg-lime p-[3px]">
                  <span className="size-4 rounded-full bg-paper shadow-[0_1px_2px_rgb(0_0_0/0.25)]" />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-[18px] text-dim">Free. Sign-ups are capped by capacity.</p>
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

const HARNESSES: { name: string; logo?: string; mono?: boolean }[] = [
  { name: "Claude Code", logo: "/harness/claude-color.svg" },
  { name: "OpenClaw", logo: "/harness/openclaw.png" },
  { name: "Hermes", logo: "/harness/hermes.png" },
  { name: "Muse", logo: "/harness/muse.svg", mono: true },
  { name: "Grok Bot", logo: "/harness/grok.svg", mono: true },
  { name: "Dots" },
];

function WorksWith() {
  return (
    <div>
      <p className="text-[13px] text-dim">Works with</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {HARNESSES.map((h) => (
          <li key={h.name} className="flex h-9 items-center gap-2 rounded-full bg-card pr-3.5 pl-1.5 text-[13.5px] text-soft shadow-tile">
            <span className="grid size-6 place-items-center overflow-hidden rounded-full bg-paper">
              {h.logo ? (
                <img src={h.logo} alt="" width={16} height={16} className="size-4 object-contain" />
              ) : (
                <span className="flex gap-[2px]" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-[3px] rounded-full bg-ink" />
                  ))}
                </span>
              )}
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
    <div className="relative aspect-[562/1128] w-(--w) drop-shadow-[0_30px_40px_rgb(0_0_0/0.22)]">
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
              className="absolute left-[3.4%] w-[93.2%] scale-[1.03] rounded-[calc(var(--w)*0.05)] opacity-0 shadow-[0_0_0_3px_var(--color-lime),0_0_0_4px_rgb(11_11_10/0.18)] transition-[opacity,scale] duration-500 ease-(--ease-out) data-[on=true]:scale-100 data-[on=true]:opacity-100"
              style={{ top: `${p.mark.top}%`, height: `${p.mark.height}%` }}
            />
          ) : null,
        )}
      </div>
      <img src="/phone/iphone-16-pro.png" alt="" width={562} height={1128} className="pointer-events-none absolute inset-0 size-full select-none" />
    </div>
  );
}

function FriendsPoints({ active, onPick, running }: { active: number; onPick: (i: number) => void; running: boolean }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {POINTS.map((p, i) => {
        const on = i === active;
        return (
          <li key={p.title}>
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              data-on={on}
              className="group relative w-full overflow-hidden rounded-[18px] px-5 py-4 text-left transition-[background-color,box-shadow] duration-300 ease-(--ease-out) hover:bg-fg/[0.03] data-[on=true]:bg-card data-[on=true]:shadow-card"
            >
              <span className="flex items-center gap-3">
                <span
                  data-on={on}
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-fg/[0.07] font-mono text-[11.5px] text-mute transition-colors duration-300 data-[on=true]:bg-lime data-[on=true]:text-ink"
                >
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[22px] font-medium tracking-[-0.01em] text-mute transition-colors duration-300 group-data-[on=true]:text-fg">
                  {p.title}
                </span>
              </span>
              <span className="mt-1.5 block pl-9 text-[14.5px] leading-[1.5] text-dim transition-colors duration-300 group-data-[on=true]:text-mute">
                {p.body}
              </span>
              {on && running && (
                <span
                  key={`bar-${active}`}
                  aria-hidden
                  className="absolute inset-x-5 bottom-0 h-[2px] origin-left rounded-full bg-lime-ink/60"
                  style={{ animation: `cloud-progress ${POINT_MS}ms linear both` }}
                />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Section ---------------- */

export function Cloud() {
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
    <section id="cloud" aria-labelledby="cloud-title" className="py-28 sm:py-36">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex h-8 items-center gap-2 rounded-full bg-card pr-3.5 pl-1.5 text-[13px] text-soft shadow-tile">
                <span className="rounded-full bg-lime px-2 py-[3px] text-[11px] leading-none font-medium tracking-[0.02em] text-ink">
                  New
                </span>
                Pilot Cloud
              </span>
            </Reveal>
            <SectionHead
              id="cloud-title"
              className="mt-6"
              title="Add Pilot to Claude or ChatGPT"
              muted="with one URL."
              lede="Pilot Cloud runs the same daemon for you, always on. Paste the URL into Claude, ChatGPT or any MCP client and it can use Pilot. It's free, and sign-ups are capped by capacity."
            />
            <Reveal delay={80} className="mt-8">
              <p className="text-[13px] text-dim">Add this URL as an MCP server</p>
              <Command value={MCP_URL} className="mt-2.5 w-full sm:w-fit" label="Copy the MCP URL">
                <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime-ink">/mcp</span>
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

          <Reveal delay={60}>
            <div
              ref={dialogRef}
              className="relative grid min-h-[420px] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden rounded-[28px] bg-bg-deep px-4 py-12 [background-image:radial-gradient(var(--color-edge-2)_1px,transparent_1.2px)] [background-size:20px_20px] sm:min-h-[520px] sm:px-10"
            >
              <ConnectorDialog t={t} reduced={reduced} />
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid grid-cols-1 items-center gap-10 sm:mt-32 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[auto_auto] lg:gap-x-16 lg:gap-y-8">
          <Reveal className="lg:col-start-2 lg:row-start-1 lg:self-end">
            <h3 className="text-[clamp(28px,3vw,38px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg">
              Your agent can talk to your friends&apos; agents.
              <span className="block text-mute">You decide what each one gets.</span>
            </h3>
          </Reveal>

          <Reveal delay={60} className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div
              ref={phoneRef}
              className="relative flex justify-center overflow-hidden rounded-[28px] bg-bg-deep px-6 pt-12 pb-10 [--w:236px] sm:pt-14 sm:[--w:264px] lg:[--w:280px]"
            >
              <Phone active={active} />
              <span className="absolute bottom-5 left-1/2 flex h-8 -translate-x-1/2 items-center gap-2 rounded-full bg-card px-3.5 text-[12.5px] whitespace-nowrap text-soft shadow-float">
                <span aria-hidden className="size-1.5 rounded-full bg-lime" />
                Mobile app coming soon
              </span>
            </div>
          </Reveal>

          <Reveal
            delay={100}
            className="lg:col-start-2 lg:row-start-2 lg:self-start"
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
      </div>
    </section>
  );
}
