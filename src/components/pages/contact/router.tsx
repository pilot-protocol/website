"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { bySite, isSky, LABEL, LABEL_SM } from "@/components/page/sky";
import { Glyph, OBJECT_TILE, type GlyphName } from "@/components/pages/about/glyphs";
import { sCurve, useAnchors } from "@/components/pages/about/use-anchors";
import { FLAT_CARD, SKY_H2, SKY_LEDE, SkySplit } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal, SmartLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * Pick what you're writing about and the route lights up to where it should go:
 * most things reach the founders' inbox, press has its own, and security
 * reports take the disclosure form. The message opens in your own mail app.
 */

const FOUNDERS = "founders@pilotprotocol.network";
const PRESS = "press@pilotprotocol.network";

type Topic = {
  id: string;
  label: string;
  to: { kind: "email"; address: string } | { kind: "form"; href: string; name: string };
  note: ReactNode;
};

const DESTS = [FOUNDERS, PRESS, "Disclosure form"];

const link = "text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg";
// The lit route.
const ON_LINE = isSky ? "bg-(--sky-400)" : "bg-lime";

const TOPICS: Topic[] = [
  {
    id: "question",
    label: "Question",
    to: { kind: "email", address: FOUNDERS },
    note: (
      <>
        About Pilot Protocol, the data service agents, the App Store or Pilot Cloud. The{" "}
        <SmartLink href="/docs" className={link}>
          documentation
        </SmartLink>{" "}
        may already have the answer.
      </>
    ),
  },
  {
    id: "app-publishing",
    label: "App publishing",
    to: { kind: "email", address: FOUNDERS },
    note: (
      <>
        Apps are submitted through the{" "}
        <SmartLink href="/publish" className={link}>
          publish page
        </SmartLink>
        . Write to us if a submission is stuck or you have a question about the review.
      </>
    ),
  },
  {
    id: "partnership",
    label: "Partnership",
    to: { kind: "email", address: FOUNDERS },
    note: <>Straight to the founding team, who reply by email.</>,
  },
  {
    id: "press",
    label: "Press",
    to: { kind: "email", address: PRESS },
    note: (
      <>
        Press has its own inbox. Logos, facts and papers are in the{" "}
        <SmartLink href="/press" className={link}>
          press kit
        </SmartLink>
        .
      </>
    ),
  },
  {
    id: "correction",
    label: "Correction",
    to: { kind: "email", address: FOUNDERS },
    note: <>If something on this site is wrong, tell us the page and what it should say.</>,
  },
  {
    id: "security",
    label: "Bug or security",
    to: { kind: "form", href: "/security/disclosure", name: "Disclosure form" },
    note: <>Use the bug and security disclosure form, so the report follows the right handling path.</>,
  },
  {
    id: "other",
    label: "Something else",
    to: { kind: "email", address: FOUNDERS },
    note: <>Straight to the founding team, who reply by email.</>,
  },
];

/** Sky: where each destination goes, as the object it is: the team's inbox, the press inbox, the disclosure form. */
const DEST_ICON: (GlyphName | "pilot")[] = ["pilot", "newspaper", "shieldCheck"];
const DEST_NOTE = ["Founding team", "Press", "Security reports"];

/**
 * Sky: you, and a wire to each of the three places a message can go. The one your topic takes is lit, and the
 * message runs along it (the shared beam) each time you pick a topic. Side by side from sm up; on phones the
 * destinations hang off a line down from you.
 */
function SkyRoute({ dest, hops }: { dest: string; hops: number }) {
  const [ref, geo] = useAnchors<HTMLDivElement>();
  const [viewRef, seen] = useInView<HTMLDivElement>();
  const you = geo?.at.you;
  const paths = DESTS.map((_, i) => {
    const d = geo?.at[`dest-${i}`];
    if (!you || !d) return null;
    const cy = d.y + d.h / 2;
    if (d.x > you.x + you.w + 24) return sCurve(you.x + you.w, you.y + you.h / 2, d.x, cy);
    // Phones: down from you, then a rounded turn into the destination.
    const x = you.x + you.w / 2;
    const r = 10;
    return `M${x} ${you.y + you.h}V${cy - r}Q${x} ${cy} ${x + r} ${cy}H${d.x}`;
  });

  return (
    <div ref={viewRef}>
      <div ref={ref} className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
        {geo && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={geo.w} height={geo.h}>
            {paths.map((d, i) =>
              d ? (
                <g key={i}>
                  <path
                    d={d}
                    fill="none"
                    strokeWidth={DESTS[i] === dest ? 1.5 : 1.25}
                    className={`transition-[stroke] duration-300 ${DESTS[i] === dest ? "stroke-(--sky-fill)/50" : "stroke-fg/15"}`}
                  />
                  <Beam d={d} run={DESTS[i] === dest && seen ? hops : null} duration={900} width={1.5} tail={60} />
                </g>
              ) : null,
            )}
          </svg>
        )}
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-2">
          <span data-anchor="you" className={`grid size-11 place-items-center rounded-[12px] ${OBJECT_TILE}`}>
            <Glyph name="user" className="size-5" />
          </span>
          <span className="text-[13px] font-medium text-fg">You</span>
        </div>
        <ul className="relative flex min-w-0 flex-col gap-2.5 pl-10 sm:ml-auto sm:pl-0">
          {DESTS.map((d, i) => {
            const on = d === dest;
            const icon = DEST_ICON[i];
            return (
              <li key={d} className={`flex min-w-0 items-center gap-2.5 transition-opacity duration-300 ${on ? "opacity-100" : "opacity-55"}`}>
                <span
                  data-anchor={`dest-${i}`}
                  className={`grid size-9 shrink-0 place-items-center rounded-[10px] transition-[box-shadow] duration-300 ${
                    icon === "pilot" ? "bg-(--sky-fill) text-white shadow-tile" : OBJECT_TILE
                  } ${on ? "ring-2 ring-(--sky-fill)/60 ring-offset-2 ring-offset-card" : ""}`}
                >
                  {icon === "pilot" ? <LogoMark className="h-[14px] w-auto" /> : <Glyph name={icon} className="size-[17px]" />}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate leading-[18px] ${on ? "text-fg" : "text-mute"} ${
                      i < 2 ? "font-mono text-[11.5px] sm:text-[12px]" : `text-[13px] ${on ? "font-medium" : ""}`
                    }`}
                  >
                    {d}
                  </span>
                  <span className="block text-[12px] leading-4 text-mute">{DEST_NOTE[i]}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function Router() {
  const [id, setId] = useState("question");
  const [message, setMessage] = useState("");
  const [hops, setHops] = useState(0);
  const reduced = usePrefersReducedMotion();
  const topic = TOPICS.find((t) => t.id === id) ?? TOPICS[0];
  const dest = topic.to.kind === "email" ? topic.to.address : topic.to.name;

  const mailto =
    topic.to.kind === "email"
      ? `mailto:${topic.to.address}?subject=${encodeURIComponent(`${topic.label}: `)}${
          message.trim() ? `&body=${encodeURIComponent(message.trim())}` : ""
        }`
      : null;

  // Sky: the topics as a quiet list, the chosen one tinted blue (the service page's category list).
  const skyTopics = (
    <fieldset className="mt-10">
      <legend className="sr-only">What&apos;s it about?</legend>
      <div className="grid grid-cols-2 gap-1 lg:max-w-[440px] lg:grid-cols-1">
        {TOPICS.map((t) => {
          const on = t.id === id;
          return (
            <label
              key={t.id}
              className={`relative flex h-10 cursor-pointer items-center gap-3 rounded-[6px] px-3 text-[14.5px] transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-(--sky-accent) max-lg:last:col-span-2 ${
                on ? "bg-(--sky-tint) font-medium text-(--sky-accent)" : "text-mute hover:bg-fg/[0.04] hover:text-fg"
              }`}
            >
              <input
                type="radio"
                name="topic"
                value={t.id}
                checked={on}
                onChange={() => {
                  setId(t.id);
                  setHops((h) => h + 1);
                }}
                className="sr-only"
              />
              <span aria-hidden className={`size-2 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-(--sky-600)" : "bg-fg/15"}`} />
              <span className="truncate">{t.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  const card = (
    <div className={`flex min-w-0 flex-col ${bySite("rounded-[16px] border border-edge-2", `w-full ${FLAT_CARD}`)}`}>
        {/* The route */}
        <div className={`border-b p-5 sm:p-7 ${bySite("border-edge", "border-(--sky-card-line)")}`}>
          {isSky ? (
            <SkyRoute dest={dest} hops={hops} />
          ) : (
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className={`shrink-0 text-soft max-sm:hidden ${bySite(
                "rounded-lg border border-edge-2 px-2.5 py-1.5 font-mono text-[12px]",
                "rounded-full bg-bg px-3 py-1.5 text-[13px] font-medium",
              )}`}
            >
              You
            </span>
            <span aria-hidden className={`relative h-px min-w-6 flex-1 max-sm:hidden ${bySite("bg-lime/60", "bg-(--sky-400)")}`}>
              {!reduced && (
                <span
                  key={hops}
                  className={`absolute top-1/2 -mt-1 size-2 animate-[slide-x_800ms_var(--ease-in-out)_both] ${bySite("bg-lime", "rounded-full bg-(--sky-600)")}`}
                />
              )}
            </span>
            {/* Three ways out; the one your topic takes is lit. */}
            <ul className="relative flex min-w-0 flex-col gap-2 pl-5 max-sm:w-full sm:-ml-4">
              <span
                aria-hidden
                className={`absolute top-[15px] bottom-1/2 left-0 w-px transition-colors duration-300 ${dest === DESTS[0] ? ON_LINE : "bg-fg/20"}`}
              />
              <span
                aria-hidden
                className={`absolute top-1/2 bottom-[15px] left-0 w-px transition-colors duration-300 ${dest === DESTS[2] ? ON_LINE : "bg-fg/20"}`}
              />
              {DESTS.map((d) => {
                const on = d === dest;
                return (
                  <li key={d} className="relative flex min-w-0 items-center">
                    <span
                      aria-hidden
                      className={`absolute top-1/2 -left-5 h-px w-5 transition-colors duration-300 ${on ? ON_LINE : "bg-fg/20"}`}
                    />
                    <span
                      className={`truncate transition-[border-color,background-color,color,box-shadow] duration-300 ${bySite(
                        "rounded-md border px-2.5 py-1.5 font-mono text-[12px]",
                        "rounded-full px-3 py-1.5 text-[13px]",
                      )} ${
                        on
                          ? bySite("border-lime-ink/70 bg-lime/[0.07] text-fg", "bg-(--sky-tint) font-medium text-fg ring-1 ring-(--sky-400) ring-inset")
                          : bySite("border-edge text-dim", "text-mute ring-1 ring-edge-2 ring-inset")
                      }`}
                    >
                      {d}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          )}
          <p key={id} className="mt-5 max-w-[560px] animate-[row-in_420ms_var(--ease-out)_both] text-[15px] leading-[1.55] text-mute">
            {topic.note}
          </p>
        </div>

        {/* The message */}
        {mailto ? (
          <form
            className="flex flex-1 flex-col p-5 sm:p-7"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailto;
            }}
          >
            <label htmlFor="contact-message" className="text-[14px] font-medium text-fg">
              How can we help?
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={8000}
              rows={6}
              placeholder={
                isSky ? "What would you like to ask or tell us? Leave out passwords, keys and other secrets." : "What would you like to ask or tell us?"
              }
              className={`mt-3 w-full flex-1 resize-y p-3.5 text-[15px] leading-[1.55] text-fg outline-none placeholder:text-faint ${bySite(
                "rounded-[10px] border border-edge-2 bg-transparent focus:border-fg/40",
                "rounded-[12px] bg-bg ring-1 ring-edge ring-inset transition-shadow duration-200 focus:ring-(--sky-400)",
              )}`}
            />
            {!isSky && (
              <p className={`mt-3 ${LABEL_SM}`}>
                Opens in your email app, addressed and titled. Please don&apos;t include passwords, keys or other secrets.
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="submit"
                className="pressable inline-flex h-10 items-center gap-2.5 rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88"
              >
                Write the email
                <ArrowUpRightIcon className="size-3" />
              </button>
              <span className={bySite("font-mono text-[12px] text-dim", "text-[13px] text-mute")}>
                or write to <span className="text-soft select-all">{topic.to.kind === "email" ? topic.to.address : ""}</span>
              </span>
            </div>
          </form>
        ) : (
          <div className="flex flex-1 flex-col justify-between gap-8 p-5 sm:p-7">
            <p className="max-w-[520px] text-[15px] leading-[1.55] text-soft">
              Security-sensitive reports use the separate disclosure channel rather than the founders&apos; inbox.
            </p>
            <SmartLink
              href={topic.to.kind === "form" ? topic.to.href : "/security/disclosure"}
              className="pressable inline-flex h-10 w-fit items-center gap-2.5 rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88"
            >
              Open the disclosure form
              <ArrowUpRightIcon className="size-3" />
            </SmartLink>
          </div>
        )}
      </div>
  );

  if (isSky)
    return (
      <SkySplit
        labelledBy="write-title"
        text={
          <Reveal>
            <h2 id="write-title" className={SKY_H2}>
              What&apos;s it about? <span className="block text-mute">Pick a topic.</span>
            </h2>
            <p className={`mt-5 max-w-[460px] ${SKY_LEDE}`}>
              Most messages reach the founding team. Press has its own inbox, and security reports take the disclosure form.
            </p>
            {skyTopics}
          </Reveal>
        }
        visual={card}
      />
    );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
      <fieldset>
        <legend className={LABEL}>What&apos;s it about?</legend>
        <div
          className={`mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] lg:grid-cols-1 ${bySite(
            "border border-edge bg-edge",
            "bg-edge shadow-card",
          )}`}
        >
          {TOPICS.map((t) => {
            const on = t.id === id;
            return (
              <label
                key={t.id}
                className={`relative flex h-12 cursor-pointer items-center gap-3 px-4 text-[14.5px] max-lg:last:col-span-2 transition-colors duration-200 has-focus-visible:outline-1 has-focus-visible:outline-lime-ink ${
                  on ? bySite("bg-raised text-fg", "bg-card font-medium text-fg") : bySite("bg-bg text-mute hover:text-fg", "bg-card text-mute hover:text-fg")
                }`}
              >
                <input
                  type="radio"
                  name="topic"
                  value={t.id}
                  checked={on}
                  onChange={() => {
                    setId(t.id);
                    setHops((h) => h + 1);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`size-2 shrink-0 transition-colors duration-200 ${isSky ? "rounded-full" : ""} ${
                    on ? bySite("bg-lime", "bg-(--sky-600)") : "bg-fg/15"
                  }`}
                />
                <span className="truncate">{t.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {card}
    </div>
  );
}
