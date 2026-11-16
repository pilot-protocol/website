import type { CSSProperties, ReactNode } from "react";
import { bySite, isSky, LABEL } from "@/components/page/sky";
import { FLAT_CARD } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Reveal, TextLink } from "@/components/ui";
import { BASE_MEDIA, ITEMS, LANES, type Item, type Stage } from "./data";
import { LaneTile, MediaRow } from "./media";

/*
 * The roadmap as four tracks, one per product. Solid track is what has shipped,
 * the dashed track below "Now" is work underway, with no dates attached.
 * Wide screens get one column per product; narrow ones get a git-style graph
 * down the left edge with the items listed beside it.
 *
 * The sky site sets the whole board on a hatched showcase panel, each item a flat bordered card on its track.
 */

/** Sky: the card each item (and each product's baseline) sits in. */
const ITEM_CARD = isSky ? `${FLAT_CARD} p-4 xl:p-5` : "";

type Rail = "solid" | "dashed" | "fade" | null;

const RAIL_CLASS: Record<Exclude<Rail, null>, string> = {
  solid: "bg-fg/22",
  dashed: "roadmap-dash",
  fade: "roadmap-dash roadmap-fade",
};

function byStage(stage: Stage) {
  const rows = [0, 0, 0, 0];
  return ITEMS.filter((i) => i.stage === stage).map((item) => ({ item, row: ++rows[item.lane] }));
}

const SHIPPED = byStage("shipped");
const PROGRESS = byStage("progress");

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Node({ stage, className = "", style }: { stage: Stage | "origin"; className?: string; style?: CSSProperties }) {
  // The sky site: round dots in the sky's blue; work in progress is a ring with a breathing centre.
  if (isSky) {
    if (stage === "progress") {
      return (
        <span aria-hidden style={style} className={`grid size-2 place-items-center rounded-full bg-bg ring-[1.5px] ring-(--sky-600) ${className}`}>
          <span className="size-[3px] rounded-full bg-(--sky-600) motion-safe:animate-[blink-soft_2.4s_ease-in-out_infinite]" />
        </span>
      );
    }
    return <span aria-hidden style={style} className={`block rounded-full bg-(--sky-600) ${stage === "origin" ? "size-2.5" : "size-2"} ${className}`} />;
  }
  if (stage === "progress") {
    return (
      <span aria-hidden style={style} className={`grid size-2 place-items-center border border-lime-ink bg-bg ${className}`}>
        <span className="size-[3px] bg-lime motion-safe:animate-[blink-soft_2.4s_ease-in-out_infinite]" />
      </span>
    );
  }
  return <span aria-hidden style={style} className={`block bg-lime ${stage === "origin" ? "size-2.5" : "size-2"} ${className}`} />;
}

function ItemBody({ item }: { item: Item }) {
  const lane = LANES[item.lane];
  return (
    <>
      {isSky && <MediaRow media={item.media} />}
      <p className={`flex flex-wrap items-baseline gap-x-2 ${bySite("font-mono text-[11.5px] leading-[1.5]", "text-[13px] leading-5")}`}>
        <span className="text-dim lg:hidden">{lane.name}</span>
        <span aria-hidden className="text-faint lg:hidden">
          ·
        </span>
        {isSky && item.stage === "progress" ? (
          // A tag that may wrap in a narrow column, so its corners stay square-ish rather than a pill.
          <span className="rounded-[7px] bg-(--sky-tint) px-2 py-1 text-[12px] leading-4 font-medium text-(--sky-accent)">{item.status}</span>
        ) : (
          <span className={item.stage === "progress" ? "text-lime-ink" : bySite("text-soft", "text-mute")}>{item.status}</span>
        )}
      </p>
      <h4 className={`mt-2 font-medium text-balance text-fg ${bySite("text-[17px] leading-[1.3] tracking-[-0.015em]", "mt-3 text-[16px] leading-[1.3] tracking-[-0.025em]")}`}>
        {item.title}
      </h4>
      <p className={`mt-2 text-mute ${bySite("text-[14.5px] leading-[1.55]", "text-[14px] leading-[1.5] text-pretty")}`}>{item.body}</p>
      <TextLink href={item.link.href} className="mt-4 text-[13px]!">
        {item.link.label}
      </TextLink>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Wide: one column per product                                        */
/* ------------------------------------------------------------------ */

const COLS = bySite("grid grid-cols-4 gap-x-6 xl:gap-x-8", "grid grid-cols-4 gap-x-5 xl:gap-x-6");

// The "Now" line across the tracks.
const NOW_CHIP = bySite(
  "rounded-md bg-lime px-2 py-[3px] font-mono text-[11.5px] font-medium text-ink",
  "rounded-full bg-(--sky-600) px-2.5 py-[3px] text-[12px] leading-4 font-medium text-white",
);
const NOW_LINE = bySite("bg-lime", "bg-(--sky-400)");
const NOW_NOTE = bySite("font-mono text-[11.5px] text-dim", "text-[13px] text-mute");

/** Four vertical rails behind a band, lined up with the columns. */
function Rails({ kind }: { kind: Rail | Rail[] }) {
  const kinds = Array.isArray(kind) ? kind : [kind, kind, kind, kind];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${COLS}`}>
      {kinds.map((k, i) => (
        <div key={i} className="relative">
          {k && <span className={`absolute inset-y-0 left-[4px] w-px ${RAIL_CLASS[k]}`} />}
        </div>
      ))}
    </div>
  );
}

function BandHead({ title, note, id }: { title: string; note: string; id?: string }) {
  return (
    <div className={`relative ${bySite("py-14", "py-10")}`}>
      <Rails kind={id === "now-title" ? "dashed" : "solid"} />
      {/* Sky: a cut-out of paper on the hatching, so the tracks pass behind the heading. */}
      <div className={`relative w-fit max-w-[560px] bg-bg ${bySite("ml-7 pr-6", "-my-3 ml-4 px-3 py-3")}`}>
        <h3 id={id} className="text-[clamp(24px,2.4vw,30px)] leading-[1.1] font-medium tracking-[-0.03em] text-fg">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-[1.5] text-mute">{note}</p>
      </div>
    </div>
  );
}

function cell(item: Item, row: number, i: number) {
  return (
    <Reveal
      key={item.id}
      delay={i * 50}
      className={`relative pl-7 ${bySite("pb-14", "pb-5")}`}
      style={{ gridColumn: item.lane + 1, gridRow: row } as CSSProperties}
    >
      <Node stage={item.stage} className={`absolute left-[0.5px] ${bySite("top-[6px]", "top-[26px]")}`} />
      {isSky ? (
        <div className={ITEM_CARD}>
          <ItemBody item={item} />
        </div>
      ) : (
        <ItemBody item={item} />
      )}
    </Reveal>
  );
}

/** Product names stay pinned while you read down the tracks. */
function LaneBar() {
  return (
    <div
      className={`sticky top-[65px] z-10 hidden lg:block ${bySite(
        "border-b border-edge bg-bg/85 backdrop-blur-xl",
        // Sky: a solid strip of paper (no translucent glass), the products' names over their tracks.
        "-mx-6 border-b border-(--sky-frame) bg-bg px-6 xl:-mx-8 xl:px-8",
      )}`}
    >
      <div className={COLS}>
        {LANES.map((lane) => (
          <p key={lane.name} className={`flex items-center gap-3 text-[15px] font-medium text-fg ${isSky ? "h-16" : "h-14"}`}>
            {isSky ? <LaneTile lane={LANES.indexOf(lane)} /> : <Node stage="origin" />}
            {lane.name}
          </p>
        ))}
      </div>
    </div>
  );
}

function BoardShipped() {
  return (
    <div className="hidden lg:block">
      <div className="relative pt-10">
        <Rails kind="solid" />
        <div className={`relative w-fit bg-bg ${bySite("ml-7 pr-6 pb-8", "mb-6 ml-4 px-3 py-2")}`}>
          <h3 className={bySite(LABEL, "text-[15px] leading-5 font-medium text-fg")}>Available today, and the base for everything below</h3>
        </div>
        <div className={`relative ${COLS}`}>
          {LANES.map((lane, i) => (
            <Reveal key={lane.name} delay={i * 60} className="relative pb-4 pl-7">
              {isSky ? (
                <div className={`h-full ${ITEM_CARD}`}>
                  <MediaRow media={BASE_MEDIA[i]} />
                  <p className="text-[14px] leading-[1.5] text-pretty text-soft">{lane.baseline}</p>
                </div>
              ) : (
                <p className="text-[14.5px] leading-[1.55] text-soft">{lane.baseline}</p>
              )}
            </Reveal>
          ))}
        </div>
      </div>

      <BandHead title="Shipped in October." note="Releases and changes that reached users this month." id="shipped-title" />
      <div className="relative">
        <Rails kind="solid" />
        <div className={`relative ${COLS}`}>{SHIPPED.map(({ item, row }, i) => cell(item, row, i))}</div>
      </div>
      <NowLine />
    </div>
  );
}

function BoardProgress() {
  return (
    <div className="hidden lg:block">
      <BandHead
        title="Being worked on now."
        note="Open work in the public repositories and in Pilot Cloud. No dates: scope can change, and some of it may not ship."
        id="now-title"
      />
      <div className="relative">
        <Rails kind="dashed" />
        <div className={`relative ${COLS}`}>
          {PROGRESS.map(({ item, row }, i) => cell(item, row, i))}
          {/* The data agents have nothing open right now; say so instead of leaving a hole. */}
          {isSky ? (
            <div className="relative col-start-2 row-start-1 pb-5 pl-7">
              <p className="rounded-[12px] border border-dashed border-fg/20 bg-bg p-5 text-[13px] leading-5 text-mute">Nothing listed in progress.</p>
            </div>
          ) : (
            <p className="relative col-start-2 row-start-1 pl-7 font-mono text-[12px] leading-[1.5] text-dim">Nothing listed in progress.</p>
          )}
        </div>
      </div>
      <div className="relative h-28">
        <Rails kind="fade" />
      </div>
    </div>
  );
}

function NowLine() {
  return (
    <div className="relative py-2">
      <Rails kind={["solid", "solid", "solid", "solid"]} />
      <div className="relative flex items-center gap-3">
        <span className={`relative z-[1] ${NOW_CHIP}`}>Now</span>
        <span className={`h-px flex-1 ${NOW_LINE}`} />
        <span className={`relative z-[1] bg-bg pl-3 ${bySite("", "pr-3")} ${NOW_NOTE}`}>Updated October 2026</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Narrow: a git-style graph beside the list                           */
/* ------------------------------------------------------------------ */

const LANE_X = [4, 17, 30, 43];

function Graph({ rails, node, nodeLane, top = 6 }: { rails: Rail[]; node?: Stage | "origin"; nodeLane?: number; top?: number }) {
  return (
    <div aria-hidden className="relative">
      {rails.map((k, i) =>
        k ? (
          <span
            key={i}
            className={`absolute bottom-0 w-px ${RAIL_CLASS[k]}`}
            style={{ left: LANE_X[i], top: node === "origin" && nodeLane === i ? top + 4 : 0 }}
          />
        ) : null,
      )}
      {node && nodeLane !== undefined && (
        <Node
          stage={node}
          className="absolute"
          style={{ left: LANE_X[nodeLane] - (node === "origin" ? 4.5 : 3.5), top }}
        />
      )}
    </div>
  );
}

function Row({ graph, children, className = "" }: { graph: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-[56px_minmax(0,1fr)] ${className}`}>
      {graph}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const SOLID: Rail[] = ["solid", "solid", "solid", "solid"];
const DASHED: Rail[] = ["dashed", "dashed", "dashed", "dashed"];

function ListShipped() {
  return (
    <div className="lg:hidden">
      <p className={bySite(LABEL, "text-[15px] leading-5 font-medium text-fg")}>Available today</p>
      <div className="mt-5">
        {LANES.map((lane, i) => (
          <Row
            key={lane.name}
            graph={<Graph rails={LANE_X.map((_, j) => (j <= i ? "solid" : null))} node="origin" nodeLane={i} top={isSky ? 22 : 5} />}
          >
            {isSky ? (
              <div className="pb-4">
                <div className={ITEM_CARD}>
                  <h3 className="flex items-center gap-2.5 text-[16px] leading-[1.3] font-medium text-fg">
                    <LaneTile lane={i} className="size-6 rounded-[7px]" />
                    {lane.name}
                  </h3>
                  <div className="mt-3">
                    <MediaRow media={BASE_MEDIA[i]} />
                  </div>
                  <p className="text-[14.5px] leading-[1.55] text-mute">{lane.baseline}</p>
                </div>
              </div>
            ) : (
              <div className="pb-7">
                <h3 className="text-[16px] leading-[1.3] font-medium text-fg">{lane.name}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.55] text-mute">{lane.baseline}</p>
              </div>
            )}
          </Row>
        ))}
      </div>

      <Row graph={<Graph rails={SOLID} />}>
        <div className="pt-6 pb-10">
          <h3 className="text-[24px] leading-[1.1] font-medium tracking-[-0.03em] text-fg">Shipped in October.</h3>
          <p className="mt-2 text-[15px] leading-[1.5] text-mute">Releases and changes that reached users this month.</p>
        </div>
      </Row>
      {SHIPPED.map(({ item }) => (
        <Row key={item.id} graph={<Graph rails={SOLID} node="shipped" nodeLane={item.lane} top={isSky ? 22 : 6} />}>
          <Reveal className={bySite("pb-10", "pb-4")}>
            <div className={ITEM_CARD}>
              <ItemBody item={item} />
            </div>
          </Reveal>
        </Row>
      ))}

      <div className="flex items-center gap-3 py-1">
        <span className={NOW_CHIP}>Now</span>
        <span className={`h-px flex-1 ${NOW_LINE}`} />
        <span className={NOW_NOTE}>Updated October 2026</span>
      </div>
    </div>
  );
}

function ListProgress() {
  return (
    <div className="lg:hidden">
      <Row graph={<Graph rails={DASHED} />}>
        <div className="pt-6 pb-10">
          <h3 className="text-[24px] leading-[1.1] font-medium tracking-[-0.03em] text-fg">Being worked on now.</h3>
          <p className="mt-2 text-[15px] leading-[1.5] text-mute">
            Open work in the public repositories and in Pilot Cloud. No dates: scope can change, and some of it may not
            ship.
          </p>
        </div>
      </Row>
      {PROGRESS.map(({ item }) => (
        <Row key={item.id} graph={<Graph rails={DASHED} node="progress" nodeLane={item.lane} top={isSky ? 22 : 6} />}>
          <Reveal className={bySite("pb-10", "pb-4")}>
            <div className={ITEM_CARD}>
              <ItemBody item={item} />
            </div>
          </Reveal>
        </Row>
      ))}
      <Row graph={<Graph rails={["fade", "fade", "fade", "fade"]} />}>
        <div className="h-20" />
      </Row>
    </div>
  );
}

export function Track() {
  const board = (
    <>
      <LaneBar />
      <BoardShipped />
      <ListShipped />
      {/* One anchor for both layouts, right where "now" begins. */}
      <div id="now" aria-hidden className="scroll-mt-20 lg:scroll-mt-[124px]" />
      <BoardProgress />
      <ListProgress />
    </>
  );
  if (isSky) return <HatchPanel className="px-3 pt-8 sm:px-6 lg:pt-0 xl:px-8">{board}</HatchPanel>;
  return <div>{board}</div>;
}
