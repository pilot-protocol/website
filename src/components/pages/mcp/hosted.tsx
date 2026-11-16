"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { LineIcon } from "@/components/pages/compatibility/marks";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { MCP_URL } from "@/lib/site";
import "./mcp.css";

/*
 * Sky site: going hosted, as it happens in the client. In Claude (then ChatGPT, on the next pass) you add the URL as a
 * custom connector, sign in to Pilot Cloud with one of its four ways (an emailed code, Apple, Google or GitHub), and
 * the connector shows up connected, with a node of your own. A picture: hidden from assistive tech; the text beside
 * it says the same.
 */

const CLIENTS: { name: string; brand: Brand }[] = [
  { name: "Claude", brand: "claude" },
  { name: "ChatGPT", brand: "openai" },
];

const TYPE_FROM = 600;
const CHAR_MS = 30;
const TYPED = TYPE_FROM + MCP_URL.length * CHAR_MS;
const PRESS_ADD = TYPED + 500;
const SIGN_IN = PRESS_ADD + 260;
const PRESS_GH = SIGN_IN + 1500;
const CONNECTED = PRESS_GH + 700;
const LOOP = CONNECTED + 4200;
const TICK = 40;

function useClock() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTotal((v) => v + TICK), TICK);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  return { ref, t: reduced ? CONNECTED : total % LOOP, pass: Math.floor(total / LOOP), reduced };
}

const swap = (delay = 0): CSSProperties => ({ animation: `mcp-swap 420ms var(--ease-out) ${delay}ms both` });

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

function SignInButton({ children, pressed, icon }: { children: ReactNode; pressed?: boolean; icon: ReactNode }) {
  return (
    <span
      data-pressed={pressed}
      className="flex h-11 items-center gap-3 rounded-[10px] bg-card px-3.5 text-[14px] font-medium text-fg ring-1 ring-edge-2 transition-[transform,box-shadow,background-color] duration-200 ease-(--ease-out) ring-inset data-[pressed=true]:scale-[0.98] data-[pressed=true]:bg-fg/[0.04] data-[pressed=true]:ring-2 data-[pressed=true]:ring-(--sky-fill)/70"
    >
      <span className="flex w-5 justify-center text-fg">{icon}</span>
      {children}
    </span>
  );
}

function PilotTile({ size = "size-10" }: { size?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-[11px] bg-(--sky-fill) text-white ${size}`}>
      <PilotMarkP className="h-[44%] w-auto" />
    </span>
  );
}

export function HostedDialog() {
  const { ref, t, pass, reduced } = useClock();
  const client = CLIENTS[pass % CLIENTS.length];
  const chars = reduced ? MCP_URL.length : Math.max(0, Math.min(MCP_URL.length, Math.floor((t - TYPE_FROM) / CHAR_MS)));
  const stage = t < SIGN_IN ? "add" : t < CONNECTED ? "signin" : "done";
  const leaving = !reduced && t >= LOOP - 360;

  return (
    <div ref={ref} aria-hidden className="w-full max-w-[420px] select-none">
      {/* Where this happens: the client's connector settings. */}
      <div className="mb-3 flex items-center gap-2 px-1 text-[13px] text-mute">
        <span key={client.name} className="flex items-center gap-2 text-fg" style={reduced ? undefined : swap()}>
          <BrandMark brand={client.brand} className="size-4" />
          {client.name}
        </span>
        <span className="text-faint">/</span>
        Settings
        <span className="text-faint">/</span>
        Connectors
      </div>
      <div
        data-leaving={leaving}
        className="sky-card min-h-[372px] rounded-[20px]! p-5 transition-[opacity,filter,transform] duration-300 ease-(--ease-out) data-[leaving=true]:translate-y-1 data-[leaving=true]:opacity-0 data-[leaving=true]:blur-[3px] sm:p-6"
      >
        {stage === "add" && (
          <div key={`add-${pass}`} style={reduced ? undefined : swap()}>
            <div className="flex items-start gap-3.5">
              <PilotTile />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] leading-[22px] font-medium tracking-[-0.01em] text-fg">Add custom connector</p>
                <p className="text-[13px] leading-[18px] text-mute">A remote MCP server, by its URL</p>
              </div>
              <XIcon className="mt-1 size-[13px] shrink-0 text-dim" />
            </div>
            <div className="mt-6 flex flex-col gap-3.5">
              <Field label="Name">
                <span className="text-[14.5px] text-fg">Pilot</span>
              </Field>
              <Field label="Remote MCP server URL" focused={t < PRESS_ADD}>
                <span className="min-w-0 overflow-hidden text-left font-mono text-[12.5px] whitespace-nowrap text-fg [direction:rtl] sm:text-[13px]">
                  <span dir="ltr" className="[unicode-bidi:isolate]">
                    {MCP_URL.slice(0, chars) || <span className="font-sans text-[14px] text-faint">https://</span>}
                  </span>
                </span>
                {t < PRESS_ADD && <span className="caret-blink ml-px h-[17px] w-[1.5px] shrink-0 bg-fg" />}
              </Field>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <span className="grid h-10 place-items-center px-4 text-[14px] font-medium text-mute">Cancel</span>
              <span
                data-ready={chars === MCP_URL.length}
                data-pressed={t >= PRESS_ADD}
                className="grid h-10 min-w-[84px] place-items-center rounded-[10px] bg-fg/15 px-4 text-[14px] font-medium text-bg transition-[background-color,transform] duration-200 ease-(--ease-out) data-[pressed=true]:scale-[0.96] data-[ready=true]:bg-fg"
              >
                Add
              </span>
            </div>
          </div>
        )}

        {stage === "signin" && (
          <div key={`in-${pass}`} style={reduced ? undefined : swap()}>
            <div className="flex flex-col items-center pt-1 text-center">
              <PilotTile size="size-11" />
              <p className="mt-4 text-[17px] leading-6 font-medium tracking-[-0.02em] text-fg">Sign in to Pilot Cloud</p>
              <p className="mt-0.5 text-[13px] leading-[18px] text-mute">
                to connect <span className="text-fg">{client.name}</span>
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <SignInButton icon={<BrandMark brand="apple" className="size-[17px]" />}>Continue with Apple</SignInButton>
              <SignInButton icon={<BrandMark brand="google" className="size-[16px]" />}>Continue with Google</SignInButton>
              <SignInButton icon={<BrandMark brand="github" className="size-[17px]" />} pressed={t >= PRESS_GH}>
                Continue with GitHub
              </SignInButton>
              <SignInButton icon={<LineIcon name="mail" className="size-[17px]" />}>Email me a code</SignInButton>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div key={`done-${pass}`} style={reduced ? undefined : swap()}>
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
            <div className="mt-6 divide-y divide-edge border-y border-edge">
              {(
                [
                  ["Signed in", <span key="g" className="flex items-center gap-2"><BrandMark brand="github" className="size-[14px]" />GitHub</span>],
                  ["Your node", <span key="n" className="font-mono text-[13px] tabular-nums">0:0000.0000.<span className="text-(--sky-accent)">7C21</span></span>],
                  ["Runs", <span key="r" className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-(--sky-fill)" />Always on, in Pilot Cloud</span>],
                ] as const
              ).map(([k, v], i) => (
                <div key={k} className="flex items-center justify-between gap-4 py-3.5" style={reduced ? undefined : swap(80 + i * 70)}>
                  <p className="text-[13.5px] leading-5 text-mute">{k}</p>
                  <div className="text-[13.5px] leading-5 whitespace-nowrap text-fg">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2.5 text-[13.5px] leading-5 text-soft" style={reduced ? undefined : swap(320)}>
              <LineIcon name="plug" className="size-[16px] text-(--sky-accent)" />
              Tools ready in {client.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
