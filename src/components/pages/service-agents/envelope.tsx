"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SKY } from "@/components/pages/security/kit";
import { EnvelopeArt } from "./sky-envelope-art";
import { SPLIT, SPLIT_ART, SPLIT_TEXT } from "./split";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

type Field = { id: string; keys: ReactNode; body: ReactNode };

const C = ({ children }: { children: ReactNode }) => <code className="font-mono text-[13px] text-soft">{children}</code>;

const FIELDS: Field[] = [
  { id: "source", keys: "source", body: "The agent that answered." },
  { id: "items", keys: "items", body: "The records from the upstream source, as it returned them." },
  { id: "count", keys: "count, total", body: "Records in this reply, and in the whole result when the source reports it." },
  { id: "page", keys: "page, size, next, has_more", body: "Pagination, for sources that paginate." },
  {
    id: "truncated",
    keys: "truncated",
    body: (
      <>
        <C>true</C> when the reply went over the 200,000-byte budget for overlay delivery and records were dropped from the
        end. Narrow the filters or paginate.
      </>
    ),
  },
  { id: "upstream", keys: "upstream_url", body: "The exact request the agent made, so you can see where the data came from." },
];

// The real reply to the nhtsa-recalls query, trimmed as on the source page. [text, field it belongs to]
const K = (k: string) => <span className="text-fg">&quot;{k}&quot;</span>;
const S = (s: string) => <span className="text-lime-ink/90">&quot;{s}&quot;</span>;
const V = (v: string) => <span className={SKY ? "sa-num" : "text-[#9fc6e8]"}>{v}</span>;
const D = ({ children }: { children: ReactNode }) => <span className="text-dim">{children}</span>;

const LINES: { t: ReactNode; f?: string }[] = [
  { t: "{" },
  { t: <>  {K("source")}: {S("nhtsa-recalls")},</>, f: "source" },
  { t: <>  {K("items")}: [</>, f: "items" },
  { t: <>    {"{"}</>, f: "items" },
  { t: <>      {K("NHTSACampaignNumber")}: {S("20V771000")},</>, f: "items" },
  { t: <>      {K("ReportReceivedDate")}: {S("10/12/2020")},</>, f: "items" },
  { t: <>      {K("Component")}: {S("ELECTRICAL SYSTEM:BODY CONTROL MODULE:SOFTWARE")},</>, f: "items" },
  { t: <>      {K("Consequence")}: {S("Various system malfunctions such as inoperative windshield")}</>, f: "items" },
  { t: <D>        wipers, defroster, rearview camera, or exterior lighting can increase the</D>, f: "items" },
  { t: <D>        risk of a crash.&quot;,</D>, f: "items" },
  { t: <D>      … Summary, Remedy, Notes, ModelYear, Make, Model</D>, f: "items" },
  { t: <>    {"}"},</>, f: "items" },
  { t: <D>    … 4 more recall campaigns</D>, f: "items" },
  { t: <>  ],</>, f: "items" },
  { t: <>  {K("count")}: {V("5")},</>, f: "count" },
  { t: <>  {K("total")}: {V("5")},</>, f: "count" },
  { t: <>  {K("page")}: {V("null")},</>, f: "page" },
  { t: <>  {K("size")}: {V("null")},</>, f: "page" },
  { t: <>  {K("next")}: {V("null")},</>, f: "page" },
  { t: <>  {K("has_more")}: {V("false")},</>, f: "page" },
  { t: <>  {K("truncated")}: {V("false")},</>, f: "truncated" },
  {
    t: (
      <>
        {"  "}
        {K("upstream_url")}: {S("https://api.nhtsa.gov/recalls/recallsByVehicle?make=Honda&model=Accord&modelYear=2020&format=json")}
      </>
    ),
    f: "upstream",
  },
  { t: "}" },
];

const CYCLE_MS = 2600;

/** Steps through the fields while the section is in view; pointing at one holds it. */
function useFieldCycle() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-20% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || held || reduced) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % FIELDS.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [inView, held, reduced]);

  return { ref, active, setActive, setHeld };
}

/** The reply with its fields annotated: point at a field, and its lines light up. */
export function Envelope() {
  const { ref, active, setActive, setHeld } = useFieldCycle();
  const field = FIELDS[active].id;

  return (
    <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <ul className="flex flex-col border-t border-edge" onPointerLeave={() => setHeld(false)}>
        {FIELDS.map((f, i) => {
          const on = i === active;
          return (
            <li key={f.id} className="border-b border-edge">
              <button
                type="button"
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  setHeld(true);
                  setActive(i);
                }}
                onClick={() => {
                  setHeld(true);
                  setActive(i);
                }}
                aria-pressed={on}
                className="grid w-full grid-cols-[14px_minmax(0,1fr)] gap-x-3 py-3.5 text-left"
              >
                <span aria-hidden className={`mt-[7px] size-1.5 transition-colors duration-300 ${on ? "bg-lime" : "bg-fg/15"}`} />
                <span className="min-w-0">
                  <code className={`font-mono text-[13.5px] transition-colors duration-300 ${on ? "text-fg" : "text-soft"}`}>{f.keys}</code>
                  <span className={`mt-1 block text-[14.5px] leading-[1.5] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
                    {f.body}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <figure className="min-w-0">
        <div className="pp-island">
          <div className="flex h-10 items-center justify-between border-b border-edge px-4 font-mono text-[11.5px] text-dim">
            <span>reply · nhtsa-recalls · trimmed</span>
            <span>7.8 KB</span>
          </div>
          <pre tabIndex={0} className="no-scrollbar overflow-x-auto py-4 font-mono text-[12px] leading-[1.75] text-soft sm:text-[12.5px]">
            {LINES.map(({ t: text, f }, i) => {
              const on = f === field;
              return (
                <div
                  key={i}
                  className={`w-max min-w-full border-l-2 pr-5 pl-[14px] whitespace-pre transition-[background-color,border-color,opacity] duration-300 sm:pl-[18px] ${
                    on ? "border-lime-ink bg-lime/[0.07]" : "border-transparent"
                  } ${f && !on ? "opacity-55" : ""}`}
                >
                  {text}
                </div>
              );
            })}
          </pre>
        </div>
        <figcaption className="mt-3 font-mono text-[11.5px] text-dim">The real reply to the query above, trimmed.</figcaption>
      </figure>
    </div>
  );
}

/**
 * The sky site's version (Figma 218:23847): a split section. The heading and the fields on plain paper, the reply
 * on a flat card in the hatched half; pointing at a field lights up its lines. `head` is the heading and lede.
 */
export function SkyEnvelope({ head }: { head: ReactNode }) {
  const { ref, active, setActive, setHeld } = useFieldCycle();
  const field = FIELDS[active].id;

  return (
    <div ref={ref} className={SPLIT}>
      <div className={SPLIT_TEXT}>
        {head}
        <ul className="mt-10 flex flex-col border-t border-(--sky-card-line)" onPointerLeave={() => setHeld(false)}>
          {FIELDS.map((f, i) => {
            const on = i === active;
            return (
              <li key={f.id} className="border-b border-(--sky-card-line)">
                <button
                  type="button"
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    setHeld(true);
                    setActive(i);
                  }}
                  onClick={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  aria-pressed={on}
                  className="grid w-full grid-cols-[6px_minmax(0,1fr)] gap-x-4 py-4 text-left"
                >
                  <span
                    aria-hidden
                    className={`mt-[7px] size-1.5 rounded-full transition-colors duration-300 ${on ? "bg-(--sky-fill)" : "bg-fg/15"}`}
                  />
                  <span className="min-w-0">
                    <code className="font-mono text-[13.5px] leading-5 text-fg">{f.keys}</code>
                    <span className={`mt-1.5 block text-[14.5px] leading-[1.5] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
                      {f.body}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={SPLIT_ART}>
        <EnvelopeArt field={field} />
      </div>
    </div>
  );
}
