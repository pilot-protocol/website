/* eslint-disable @next/next/no-img-element */
import { Fragment, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { Glyph, OBJECT_TILE, type GlyphName } from "@/components/pages/about/glyphs";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { APPS } from "@/lib/apps";

/*
 * Sky: the small picture at the head of each roadmap card, so a reader can tell the items apart before reading
 * them: the release tags, the command, the apps or sources it touches, the sign-in buttons. Every piece is named
 * in the item's own text.
 */

export type Media =
  | { kind: "tags"; tags: string[] }
  | { kind: "code"; code: string; to?: { glyph: GlyphName; label: string } }
  | { kind: "marks"; brands: Brand[]; glyphs?: GlyphName[]; tag?: string }
  | { kind: "apps"; ids: string[]; tags?: string[] }
  | { kind: "signals" }
  | { kind: "repo"; repo: string; glyph: GlyphName };

const CHIP = "inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-bg px-2 font-mono text-[11.5px] leading-none text-soft ring-1 ring-(--sky-card-line)";
const TAG = "inline-flex h-6 items-center gap-1 rounded-full px-[7px] text-[11.5px] leading-none font-medium tabular-nums";
const TILE = `grid size-7 shrink-0 place-items-center rounded-[7px] ${OBJECT_TILE}`;

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 16 8" className="w-3 shrink-0 text-fg/30">
      <path d="M0 4h14M11 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A run of version tags, the last one (what shipped, or what's coming) in blue. */
function Tags({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.map((t, i) => (
        <Fragment key={t}>
          {i > 0 && <Arrow />}
          <span className={`${TAG} ${i === tags.length - 1 ? "bg-(--sky-tint) text-(--sky-accent)" : "bg-fg/[0.06] text-mute"}`}>
            {i === tags.length - 1 && <Glyph name="tag" className="size-3" />}
            {t}
          </span>
        </Fragment>
      ))}
    </>
  );
}

export function MediaRow({ media }: { media: Media }) {
  let body: ReactNode = null;
  switch (media.kind) {
    case "tags":
      body = <Tags tags={media.tags} />;
      break;
    case "code":
      body = (
        <>
          <span className={CHIP}>
            <span className="text-(--sky-accent)">$</span>
            {media.code}
          </span>
          {media.to && (
            <>
              <Arrow />
              <span className={`${CHIP} font-sans text-[12px]`}>
                <Glyph name={media.to.glyph} className="size-3.5" />
                {media.to.label}
              </span>
            </>
          )}
        </>
      );
      break;
    case "marks":
      body = (
        <>
          {media.brands.map((b) => (
            <span key={b} className={TILE}>
              <BrandMark brand={b} className="size-[15px]" />
            </span>
          ))}
          {media.glyphs?.map((g) => (
            <span key={g} className={TILE}>
              <Glyph name={g} className="size-[15px]" />
            </span>
          ))}
          {media.tag && (
            <>
              <Arrow />
              <Tags tags={[media.tag]} />
            </>
          )}
        </>
      );
      break;
    case "apps":
      body = (
        <>
          {/* A row of icons, overlapping when there are many, so a long list still fits the column. */}
          <span className="flex">
            {media.ids.map((id, i) => {
              const a = APPS.find((x) => x.id === id);
              if (!a) return null;
              const tight = media.ids.length > 4;
              return (
                <img
                  key={id}
                  src={a.icon}
                  alt=""
                  width={28}
                  height={28}
                  loading="lazy"
                  className={`relative size-7 rounded-[23%] ${tight ? "ring-2 ring-card" : "shadow-tile"} ${tight && i ? "-ml-1.5" : ""}`}
                  style={{ zIndex: media.ids.length - i }}
                />
              );
            })}
          </span>
          {media.tags && (
            <span className="ml-1 flex items-center gap-1.5">
              <Tags tags={media.tags} />
            </span>
          )}
        </>
      );
      break;
    case "signals":
      // Stopping an app: SIGTERM to the whole group, SIGKILL three seconds later.
      body = (
        <>
          <span className={`${CHIP} px-1.5 text-fg`}>SIGTERM</span>
          <span className="flex items-center gap-1 text-[11px] text-mute">
            <span className="h-px w-2.5 bg-fg/25" />
            3s
            <span className="h-px w-2.5 bg-fg/25" />
          </span>
          <span className={`${CHIP} px-1.5 text-fg`}>SIGKILL</span>
        </>
      );
      break;
    case "repo":
      body = (
        <a
          href={`https://github.com/pilot-protocol/${media.repo}`}
          aria-label={`${media.repo} on GitHub`}
          className={`${CHIP} transition-colors duration-150 hover:bg-fg/[0.09]`}
        >
          <BrandMark brand="github" className="size-3.5 text-fg" />
          {media.repo}
          <Glyph name={media.glyph} className="size-3.5 text-mute" />
        </a>
      );
      break;
  }
  return (
    <div
      aria-hidden={media.kind === "repo" ? undefined : true}
      className={`mb-3.5 flex min-h-7 flex-wrap items-center ${media.kind === "tags" ? "gap-1" : "gap-1.5"}`}
    >
      {body}
    </div>
  );
}

/** Each product's tile, at the head of its track. */
export function LaneTile({ lane, className = "size-7 rounded-[8px]" }: { lane: number; className?: string }) {
  const glyph: GlyphName[] = ["terminal", "database", "apps", "cloud"];
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center ${OBJECT_TILE} ${className}`}>
      {lane === 0 ? <LogoMark className="h-[44%] w-auto" /> : <Glyph name={glyph[lane]} className="size-[55%]" />}
    </span>
  );
}
