"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import { BrandMark } from "@/components/v4/logos";
import { LINKS } from "@/lib/site";
import { AppMark, ArrowUpGlyph, MailGlyph, MaskMark } from "./marks";

/*
 * Sky: "One link. Then just ask." Each step carries the bit of Pilot Cloud you touch at that point, and each works:
 * the sign-in buttons open Pilot Cloud's sign-in, the AI app picker picks (and the chat in step 3 follows it), and
 * the message sends.
 */

const TILE = "grid size-10 shrink-0 place-items-center rounded-[10px] border border-(--sky-card-line) bg-card text-fg";

/** Apple, Google, GitHub, or the six-digit code from your email: each opens Pilot Cloud's sign-in. */
function SignIn() {
  const tile = `${TILE} transition-[border-color,box-shadow] duration-200 hover:border-fg/25 hover:shadow-(--shadow-tile)`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={LINKS.cloud} aria-label="Sign in to Pilot Cloud with Apple" className={tile}>
        <BrandMark brand="apple" className="size-[18px] -translate-y-px" />
      </a>
      <a href={LINKS.cloud} aria-label="Sign in to Pilot Cloud with Google" className={tile}>
        <MaskMark file="google.svg" className="size-[17px]" />
      </a>
      <a href={LINKS.cloud} aria-label="Sign in to Pilot Cloud with GitHub" className={tile}>
        <MaskMark file="github.svg" className="size-[18px]" />
      </a>
      <span className="mx-1 text-[12.5px] text-mute">or</span>
      <a
        href={LINKS.cloud}
        aria-label="Sign in to Pilot Cloud with a code from your email"
        className="flex items-center gap-1.5 rounded-[10px] border border-(--sky-card-line) bg-card py-1.5 pr-1.5 pl-2.5 transition-[border-color,box-shadow] duration-200 hover:border-fg/25 hover:shadow-(--shadow-tile)"
      >
        <MailGlyph className="size-4 text-mute" />
        <span aria-hidden className="flex gap-1 font-mono text-[13px] text-fg">
          {["4", "1", "8", "2", "", ""].map((n, i) => (
            <span
              key={i}
              className={`grid h-7 w-[22px] place-items-center rounded-[6px] ${
                i === 4 ? "ring-[1.5px] ring-(--sky-fill) ring-inset" : "bg-fg/[0.05]"
              }`}
            >
              {n}
            </span>
          ))}
        </span>
      </a>
    </div>
  );
}

const APPS = ["Claude", "ChatGPT", "Muse", "Gemini", "Grok", "Le Chat", "Perplexity"];

/** The AI app picker. Claude to start with; pick another and step 3 opens a chat in that one. */
function PickAI({ ai, onPick }: { ai: string; onPick: (a: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Your AI app" className="flex flex-wrap gap-1.5 sm:gap-2">
      {APPS.map((a) => {
        const on = a === ai;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={a}
            title={a}
            onClick={() => onPick(a)}
            className={`relative grid size-9 cursor-pointer place-items-center rounded-[10px] border bg-card transition-[border-color,box-shadow] duration-200 outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--sky-fill) sm:size-10 ${
              on ? "border-(--sky-fill) shadow-[0_0_0_3px_var(--sky-tint)]" : "border-(--sky-card-line) hover:border-fg/25"
            }`}
          >
            <AppMark app={a} className="size-5" />
            {on && (
              <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-(--sky-fill) text-white ring-2 ring-card">
                <CheckIcon className="size-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A new chat in the AI app picked above, with "Start Pilot" typed. Send it and it goes. */
function StartPilot({ ai }: { ai: string }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return;
    const id = window.setTimeout(() => setSent(false), 2200);
    return () => window.clearTimeout(id);
  }, [sent]);
  return (
    <div className="flex h-11 w-full max-w-[320px] items-center gap-2.5 rounded-[12px] border border-(--sky-card-line) bg-card pr-1.5 pl-3">
      <AppMark app={ai} className="size-4" />
      <span className="text-[14px] text-fg" aria-live="polite">
        {sent ? (
          <span className="text-mute">Sent to {ai}</span>
        ) : (
          <>
            Start Pilot
            <span
              aria-hidden
              className="ml-px inline-block h-[15px] w-px translate-y-[3px] bg-fg motion-safe:animate-[caret-blink_1.1s_steps(1)_infinite]"
            />
          </>
        )}
      </span>
      <button
        type="button"
        onClick={() => setSent(true)}
        aria-label={`Send "Start Pilot" to ${ai}`}
        className="ml-auto grid size-8 cursor-pointer place-items-center rounded-[9px] bg-(--sky-fill) text-white transition-transform duration-150 outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--sky-fill) active:scale-95"
      >
        {sent ? <CheckIcon className="size-3.5" /> : <ArrowUpGlyph className="size-3.5" />}
      </button>
    </div>
  );
}

export type Step = { title: string; body: ReactNode };

/** The numbered steps (Figma 218:22856), each with its piece of the app under the words. */
export function CloudSteps({ steps }: { steps: Step[] }) {
  const [ai, setAi] = useState("Claude");
  const show = [<SignIn key="1" />, <PickAI key="2" ai={ai} onPick={setAi} />, <StartPilot key="3" ai={ai} />];
  return (
    <ol className="border-t border-(--sky-card-line)">
      {steps.map((s, i) => (
        <li key={s.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 border-b border-(--sky-card-line) py-5">
          <span className="sky-step-dot tabular-nums">{i + 1}</span>
          <div className="min-w-0">
            <p className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{s.title}</p>
            <div className="mt-1.5 text-[14.5px] leading-[1.5] text-pretty text-mute">{s.body}</div>
            <div className="mt-3.5">{show[i]}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
