import { SKY } from "@/components/pages/security/kit";
import { AgentTile, MarkTile, SourceTile } from "./marks";

/* The four things an agent answers, drawn as the path each one takes. */

type Hop = "agent" | "source" | "Gemini";

const MODES: { cmd: string; hops: Hop[]; body: string }[] = [
  { cmd: "/help", hops: ["agent"], body: "The agent's filters and source. Static text." },
  { cmd: "/data {json}", hops: ["agent", "source"], body: "Calls the source with your filters and returns the envelope." },
  { cmd: "/summary {json}", hops: ["agent", "source", "Gemini"], body: "The same call, summarized by Google Gemini." },
  { cmd: "free text", hops: ["agent", "Gemini", "source"], body: "A question in words. Gemini picks the filters and calls the source." },
];

function HopChip({ hop }: { hop: Hop }) {
  const model = hop === "Gemini";
  return (
    <span
      className={`rounded-md px-1.5 py-[3px] font-mono text-[11px] leading-none whitespace-nowrap ${
        model ? "border border-dashed border-fg/35 text-soft" : "border border-edge-2 text-soft"
      }`}
    >
      {hop}
    </span>
  );
}

/** One stop on a path: the service agent, the source it wraps (NHTSA, for the agent on this panel) or Gemini. */
function HopTile({ hop }: { hop: Hop }) {
  if (hop === "agent") return <AgentTile size={28} />;
  if (hop === "source") return <SourceTile brand="nhtsa" size={28} />;
  return <MarkTile brand="gemini" size={28} className="sa-model" />;
}

const HOP_NAME: Record<Hop, string> = { agent: "the agent", source: "the source", Gemini: "Gemini" };

/**
 * The sky site's card (Figma 218:23323): flat and bordered, each way to ask with the path it takes drawn in the
 * real tiles (the Pilot node, NHTSA's mark, Gemini's), Gemini's ringed where a model reads the query.
 */
function SkyModes({ className = "" }: { className?: string }) {
  return (
    <div className={`sky-card overflow-hidden rounded-[20px] ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-(--sky-card-line) bg-card-2 px-4 py-3 text-[12.5px] leading-5 whitespace-nowrap text-mute sm:px-5 sm:text-[13px]">
        <p className="min-w-0">Four ways to ask</p>
        <p className="flex shrink-0 items-center gap-2 text-mute">
          <MarkTile brand="gemini" size={20} className="sa-model" />A model sees the query
        </p>
      </div>
      <ul className="flex flex-col px-4 py-2 sm:px-5">
        {MODES.map((m) => {
          const pure = !m.hops.includes("Gemini") && m.hops.includes("source");
          return (
            <li key={m.cmd} className="border-b border-(--sky-card-line) py-4 last:border-b-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:grid-cols-[136px_minmax(0,1fr)]">
                <code className="font-mono text-[12.5px] whitespace-nowrap text-fg sm:text-[13px]">{m.cmd}</code>
                <span className="flex items-center" role="img" aria-label={`You, then ${m.hops.map((h) => HOP_NAME[h]).join(", then ")}`}>
                  {m.hops.map((h, i) => (
                    <span key={h} className="flex items-center">
                      {i > 0 && <span aria-hidden className="mx-1 h-[1.5px] w-3.5 rounded-full bg-fg/15 sm:w-4" />}
                      <HopTile hop={h} />
                    </span>
                  ))}
                </span>
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] leading-[1.45] text-mute">
                {m.body}
                {pure && (
                  <span className="rounded-full bg-(--sky-tint) px-2 py-0.5 text-[12px] leading-[18px] font-medium text-(--sky-accent)">
                    No model in the path
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Modes({ className = "" }: { className?: string }) {
  if (SKY) return <SkyModes className={className} />;
  return (
    <div className="overflow-hidden rounded-[16px] border border-edge-2">
      <p className="border-b border-edge px-4 py-3 font-mono text-[11.5px] text-dim sm:px-5">Four ways to ask, and the path each takes</p>
      <ul>
        {MODES.map((m) => {
          const pure = !m.hops.includes("Gemini") && m.hops.includes("source");
          return (
            <li key={m.cmd} className="border-b border-edge px-4 py-4 last:border-b-0 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <code className="font-mono text-[13px] text-fg">{m.cmd}</code>
                {pure && (
                  <span className="rounded-md bg-lime px-1.5 py-[3px] font-mono text-[10.5px] leading-none font-medium text-ink">
                    no model in the path
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center" aria-label={`you, then ${m.hops.join(", then ")}`}>
                <span className="font-mono text-[11px] text-dim">you</span>
                {m.hops.map((h) => (
                  <span key={h} className="flex items-center">
                    <span aria-hidden className="mx-1.5 h-px w-4 bg-edge-3 sm:w-6" />
                    <HopChip hop={h} />
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-[14px] leading-[1.45] text-mute">{m.body}</p>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-edge px-4 py-3 text-[13px] leading-[1.5] text-dim sm:px-5">
        Dashed means a language model sees the query. Keep secrets out of queries.
      </p>
    </div>
  );
}
