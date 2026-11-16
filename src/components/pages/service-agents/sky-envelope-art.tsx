import type { ReactNode } from "react";
import { BrandMark } from "@/components/v4/logos";
import { AgentTile } from "./marks";

/*
 * The envelope on the sky site, drawn as one: an open envelope with the records rising out of it as letters, the
 * envelope's own fields printed on its face like a label, and the upstream as its stamp. The values are the real
 * reply to the nhtsa-recalls query on this page (trimmed). `field` is the field the list on the left points at;
 * its part of the envelope lights up.
 */

const URL = "https://api.nhtsa.gov/recalls/recallsByVehicle?make=Honda&model=Accord&modelYear=2020&format=json";

/** A printed field: the key as on the wire, its value under it. */
function KV({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-mono text-[10.5px] leading-4 text-mute">{k}</span>
      <span className={`font-mono text-[13px] leading-5 ${accent ? "text-(--sky-accent)" : "text-fg"}`}>{v}</span>
    </span>
  );
}

/** A part of the envelope that lights up with its field. */
function Part({ on, className = "", children }: { on: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      data-on={on}
      className={`rounded-[10px] ring-1 ring-transparent transition-[background-color,box-shadow] duration-300 ring-inset data-[on=true]:ring-(--sky-fill)/60 data-[on=true]:ring-[1.5px] ${className}`}
    >
      {children}
    </div>
  );
}

/** One of the letters: a recall campaign, as the source returned it. Only the front one is legible. */
function Letter({ front = false, i = 0, lift = false }: { front?: boolean; i?: number; lift?: boolean }) {
  // The four behind it fan out a little, alternately left and right, and sit higher the further back they are.
  const tilt = front ? 0 : (i % 2 ? 1 : -1) * (1.2 + i * 0.5);
  const up = front ? 0 : 6 + i * 7;
  return (
    <div
      aria-hidden={!front}
      className={`sa-letter absolute inset-x-0 top-0 h-[190px] rounded-[10px] transition-transform duration-500 ease-(--ease-out) ${
        front ? "px-4 pt-3.5 sm:px-5 sm:pt-4" : ""
      }`}
      style={{ transform: `translateY(${(lift ? -10 : 0) - up}px) rotate(${tilt}deg)`, zIndex: 10 - i }}
    >
      {front && (
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10.5px] leading-4 text-mute">items[0]</span>
            <span className="font-mono text-[10.5px] leading-4 text-mute">1 of 5</span>
          </div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-[11.5px] leading-[18px] sm:text-[12px]">
            <span className="text-mute">NHTSACampaignNumber</span>
            <span className="text-fg">20V771000</span>
            <span className="text-mute">ReportReceivedDate</span>
            <span className="text-fg">10/12/2020</span>
            <span className="text-mute">Component</span>
            <span className="truncate text-fg">ELECTRICAL SYSTEM:BODY CONTROL MODULE:SOFTWARE</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function EnvelopeArt({ field }: { field: string }) {
  const on = (id: string) => field === id;
  return (
    <figure className="relative mx-auto w-full max-w-[480px] pt-[150px]">
      {/* The open flap, behind the letters. */}
      <svg aria-hidden viewBox="0 0 480 150" preserveAspectRatio="none" className="sa-flap absolute inset-x-0 top-0 h-[151px] w-full">
        <path d="M1 149.5 L234 3.6 Q240 0 246 3.6 L479 149.5" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* The letters: the five recall campaigns in `items`. */}
      <div className="absolute inset-x-[11%] top-[46px]">
        {[4, 3, 2, 1].map((i) => (
          <Letter key={i} i={i} lift={on("items")} />
        ))}
        <Letter front lift={on("items")} />
      </div>

      {/* The pocket: the envelope's face, with its fields printed on it and the source as its stamp. */}
      <div className="sa-pocket relative z-20 px-3 pt-7 pb-3 sm:px-4 sm:pt-8 sm:pb-4">
        {/* The seams of the bottom flap, behind what's printed on it. */}
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="sa-seams pointer-events-none absolute inset-0 size-full">
          <path d="M0.5 0.5 L50 62 L99.5 0.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="flex items-start justify-between gap-3">
          <Part on={on("source")} className="sa-field -ml-1 flex min-w-0 items-center gap-3 px-2 py-2">
            <AgentTile size={36} />
            <KV k="source" v="nhtsa-recalls" />
          </Part>
          {/* The stamp: where the data came from. */}
          <Part on={on("upstream")} className="-mt-3 -mr-1 shrink-0 p-1.5">
            <span className="sa-stamp relative grid h-[66px] w-[78px] place-items-center sm:h-[72px] sm:w-[86px]">
              <span aria-hidden className="sa-stamp-edge absolute inset-0" />
              <span className="relative z-[2] flex flex-col items-center gap-2">
                <span className="block h-[22px] w-[52px] sm:h-[24px] sm:w-[58px]">
                  <BrandMark brand="nhtsa" className="size-full" />
                </span>
                <span className="font-mono text-[9px] leading-none text-[#696962]">api.nhtsa.gov</span>
              </span>
            </span>
          </Part>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Part on={on("count")} className="flex gap-5 sa-field px-3 py-2">
            <KV k="count" v="5" accent />
            <KV k="total" v="5" accent />
          </Part>
          <Part on={on("truncated")} className="sa-field px-3 py-2">
            <KV k="truncated" v="false" accent />
          </Part>
          <Part on={on("page")} className="flex flex-1 gap-4 sa-field px-3 py-2 sm:gap-5">
            <KV k="page" v="null" accent />
            <KV k="size" v="null" accent />
            <KV k="next" v="null" accent />
            <KV k="has_more" v="false" accent />
          </Part>
        </div>

        <Part on={on("upstream")} className="mt-1.5 sa-field px-3 py-2">
          <span className="font-mono text-[10.5px] leading-4 text-mute">upstream_url</span>
          <p className="mt-0.5 font-mono text-[11.5px] leading-[17px] break-all text-soft">{URL}</p>
        </Part>
      </div>
    </figure>
  );
}
