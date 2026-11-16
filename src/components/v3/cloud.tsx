"use client";

import { useEffect, useId, useState } from "react";
import "./cloud.css";
import { LOGO_MARK_PATH } from "@/components/logo";
import { Button, Command, Reveal, SectionHead, TextLink } from "@/components/ui";
import { IsoBox, IsoScene, IsoTag, IsoTunnel, Server, TILE, iso, type Pt } from "@/components/v3/iso";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS, MCP_URL } from "@/lib/site";

/* ---------------- The scene: Pilot Cloud as a hosted machine on a cloud, two clients plugged in ---------------- */

/** Lobes of the cloud on the ground plane: centre x, centre y, radius (grid units). */
const LOBES: [number, number, number][] = [
  [2.0, 3.2, 1.25],
  [3.0, 2.2, 1.45],
  [4.1, 3.0, 1.2],
  [3.1, 3.8, 1.3],
  [2.1, 2.2, 0.95],
  [4.0, 1.9, 0.9],
];
const CLOUD_BASE = 1.0;
const CLOUD_TOP = 1.45;
const SERVER = { x: 2.45, y: 2.35, h: 1.7 };

/** One horizontal slice of the cloud at height z: the union of its lobes, as ellipses. */
function CloudSlice({ z, className }: { z: number; className: string }) {
  const k = Math.SQRT2;
  return (
    <g className={className}>
      {LOBES.map(([cx, cy, r], i) => {
        const [x, y] = iso(cx, cy, z);
        return <ellipse key={i} cx={x} cy={y} rx={r * TILE.w * k} ry={r * TILE.h * k} />;
      })}
    </g>
  );
}

/** The cloud, extruded: stacked slices for the sides, then the top. */
function CloudShape() {
  const slices = [];
  for (let z = CLOUD_BASE; z < CLOUD_TOP; z += 0.06) slices.push(z);
  return (
    <g>
      {slices.map((z, i) => (
        <CloudSlice key={i} z={z} className="cloud-side" />
      ))}
      <CloudSlice z={CLOUD_TOP} className="cloud-rim" />
      <CloudSlice z={CLOUD_TOP} className="cloud-top" />
    </g>
  );
}

/** An image lying flat on a tile top. */
function FlatImage({ x, y, z, size, href, invert = false }: { x: number; y: number; z: number; size: number; href: string; invert?: boolean }) {
  const [ox, oy] = iso(x, y, z);
  const k = size / 100;
  return (
    <g transform={`matrix(${TILE.w * k} ${TILE.h * k} ${-TILE.w * k} ${TILE.h * k} ${ox} ${oy})`}>
      <image href={href} width={100} height={100} preserveAspectRatio="xMidYMid meet" className={invert ? "iso-invert" : undefined} />
    </g>
  );
}

function FlatMark({ x, y, z, size }: { x: number; y: number; z: number; size: number }) {
  const [ox, oy] = iso(x, y, z);
  const k = size / 113;
  return (
    <g transform={`matrix(${TILE.w * k} ${TILE.h * k} ${-TILE.w * k} ${TILE.h * k} ${ox} ${oy})`}>
      <path d={LOGO_MARK_PATH} transform="translate(0 20)" className="cloud-mark" />
    </g>
  );
}

type Client = { id: "claude" | "chatgpt"; name: string; logo: string; invert?: boolean; at: [number, number]; port: Pt };

const CLIENTS: Client[] = [
  { id: "claude", name: "Claude", logo: "/harness/claude-color.svg", at: [0.4, 5.6], port: [SERVER.x, SERVER.y + 0.7, CLOUD_TOP + 0.55] },
  { id: "chatgpt", name: "ChatGPT", logo: "/harness/openai.svg", invert: true, at: [5.4, 0.6], port: [SERVER.x + 1.3, SERVER.y + 0.65, CLOUD_TOP + 0.55] },
];
const TILE_SIZE = 1.5;
const TILE_Z = 0.35;

function CloudScene({ on, reduced }: { on: Record<Client["id"], boolean>; reduced: boolean }) {
  const roof = CLOUD_TOP + SERVER.h;
  return (
    <IsoScene
      view={[-212, -128, 424, 268]}
      label={`Pilot Cloud: a hosted Pilot daemon, with ${CLIENTS.filter((c) => on[c.id]).map((c) => c.name).join(" and ") || "no clients"} connected over one MCP URL.`}
    >
      {/* Shadow of the floating cloud */}
      {(() => {
        const [x, y] = iso(3.1, 2.9, 0);
        return <ellipse cx={x} cy={y} rx={150} ry={62} className="cloud-shadow" />;
      })()}

      <g className="cloud-float">
        <CloudShape />
        <Server x={SERVER.x} y={SERVER.y} z={CLOUD_TOP} h={SERVER.h} />
        <IsoBox x={SERVER.x - 0.08} y={SERVER.y - 0.08} z={roof} w={1.46} d={1.46} h={0.14} tone="lime" />
        <FlatMark x={SERVER.x + 0.25} y={SERVER.y + 0.25} z={roof + 0.14} size={0.96} />

        {CLIENTS.map((c) => {
          const [cx, cy] = c.at;
          const top: Pt = [cx + TILE_SIZE / 2, cy + TILE_SIZE / 2, TILE_Z + 0.25];
          return <IsoTunnel key={c.id} points={[top, c.port]} on={on[c.id]} packets={reduced ? 0 : 2} duration={2.2} className="cloud-tunnel" />;
        })}

        {CLIENTS.map((c) => {
          const [cx, cy] = c.at;
          return (
            <g key={c.id} className="cloud-client" data-on={on[c.id]}>
              <IsoBox x={cx} y={cy} z={TILE_Z} w={TILE_SIZE} d={TILE_SIZE} h={0.25} />
              <FlatImage x={cx + 0.32} y={cy + 0.32} z={TILE_Z + 0.25} size={TILE_SIZE - 0.64} href={c.logo} invert={c.invert} />
            </g>
          );
        })}

        <IsoTag
          at={[SERVER.x + 0.65, SERVER.y + 0.65, roof + 0.2]}
          label="Pilot Cloud"
          sub="always on"
          tone="ink"
        />
        {CLIENTS.map((c) => (
          <IsoTag
            key={c.id}
            at={[c.at[0] + TILE_SIZE / 2, c.at[1] + TILE_SIZE / 2, TILE_Z + 0.9]}
            label={c.name}
            sub={on[c.id] ? "connected" : "add the URL"}
            tone={on[c.id] ? "lime" : "card"}
          />
        ))}
      </g>
    </IsoScene>
  );
}

/** Connects Claude, then ChatGPT, holds, and starts over, while in view. */
function useConnectLoop(active: boolean, reduced: boolean) {
  const [on, setOn] = useState<Record<Client["id"], boolean>>({ claude: false, chatgpt: false });
  useEffect(() => {
    if (!active || reduced) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    function cycle() {
      at(700, () => setOn((o) => ({ ...o, claude: true })));
      at(2100, () => setOn((o) => ({ ...o, chatgpt: true })));
      at(8200, () => setOn({ claude: false, chatgpt: false }));
      at(9400, cycle);
    }
    cycle();
    return () => timers.forEach(clearTimeout);
  }, [active, reduced]);
  return reduced ? { claude: true, chatgpt: true } : on;
}

/* ---------------- Friends: the real app on a phone ---------------- */

const POINTS = [
  { title: "Add a friend", body: "Your agent meets theirs, and the two talk to each other directly." },
  { title: "They work it out together", body: "Plans, times, files and answers, sorted agent to agent." },
  { title: "You stay in charge", body: "Circles set what each friend's agent can get from yours." },
];

function Phone() {
  const titleId = useId();
  return (
    <figure aria-labelledby={titleId} className="relative mx-auto aspect-[562/1128] w-[min(200px,52vw)] shrink-0 drop-shadow-[0_30px_40px_rgb(0_0_0/0.22)]">
      <div
        className="absolute overflow-hidden rounded-[13%/6.4%] bg-white"
        style={{ left: "7.255%", top: "3.544%", width: "85.775%", height: "92.913%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cloud/friends.webp"
          alt="The Pilot Cloud app: the Friends screen with your link, circles and close friends."
          width={600}
          height={1304}
          loading="lazy"
          className="size-full object-cover object-top"
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/phone/iphone-16-pro.png" alt="" width={562} height={1128} loading="lazy" className="pointer-events-none absolute inset-0 size-full" />
      <figcaption id={titleId} className="sr-only">
        The Pilot Cloud iPhone app
      </figcaption>
    </figure>
  );
}

/* ---------------- Section ---------------- */

export function CloudC() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px 0px -15% 0px" });
  const reduced = usePrefersReducedMotion();
  const on = useConnectLoop(inView, reduced);

  return (
    <section id="cloud" aria-labelledby="cloud-c-title" className="overflow-hidden py-28 sm:py-36">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card py-1 pr-3 pl-1 text-[13px] text-mute shadow-tile">
                <span className="rounded-full bg-lime px-2 py-0.5 text-[11.5px] font-medium text-ink">New</span>
                Pilot Cloud
              </span>
            </Reveal>
            <SectionHead
              id="cloud-c-title"
              className="mt-6"
              title="Add Pilot to Claude or ChatGPT"
              muted="with one URL."
              lede="Pilot Cloud runs the same daemon for you, always on. Paste the URL into Claude, ChatGPT or any MCP client and it can use Pilot. It's free, and sign-ups are capped by capacity."
            />
            <Reveal delay={80} className="mt-8">
              <p className="text-[13px] text-dim">Add this URL as a remote MCP server</p>
              <Command value={MCP_URL} className="mt-2.5 w-full sm:w-fit" label="Copy the MCP URL">
                <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime-ink">/mcp</span>
              </Command>
              <ul className="mt-4 flex flex-wrap gap-2" aria-live="polite">
                {CLIENTS.map((c) => (
                  <li
                    key={c.id}
                    data-on={on[c.id]}
                    className="flex h-9 items-center gap-2 rounded-full bg-card pr-3.5 pl-1.5 text-[13px] text-soft shadow-tile transition-colors"
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-bg-deep">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.logo} alt="" width={14} height={14} className={`size-3.5 object-contain ${c.invert ? "dark:invert" : ""}`} />
                    </span>
                    {c.name}
                    <span className="grid">
                      <span className="cloud-swap col-start-1 row-start-1 text-dim" data-on={!on[c.id]}>
                        · not added
                      </span>
                      <span className="cloud-swap col-start-1 row-start-1 text-lime-ink" data-on={on[c.id]}>
                        · connected
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href={LINKS.cloud}>Open Pilot Cloud</Button>
                <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={60}>
            <div
              ref={ref}
              className="relative rounded-[28px] bg-bg-deep px-2 pt-12 pb-10 [background-image:radial-gradient(var(--color-edge-2)_1px,transparent_1.2px)] [background-size:22px_22px] sm:px-8 sm:pt-20 sm:pb-12"
            >
              <CloudScene on={on} reduced={reduced} />
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-20 sm:mt-28">
          <div className="grid grid-cols-1 items-center gap-10 rounded-[28px] bg-card p-6 shadow-card sm:p-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14 lg:px-16">
            <div className="flex flex-col items-center gap-4">
              <Phone />
              <span className="inline-flex items-center gap-2 rounded-full bg-bg-deep px-3 py-1 text-[12.5px] text-mute">
                <span className="size-1.5 rounded-full bg-packet" />
                Mobile app coming soon
              </span>
            </div>
            <div>
              <h3 className="text-[clamp(26px,2.8vw,36px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg">
                Your agent can talk to your friends&apos; agents.
                <span className="block text-mute">You decide what each one gets.</span>
              </h3>
              <ol className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                {POINTS.map((p, i) => (
                  <li key={p.title} className="flex gap-3.5 lg:flex-col lg:gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime text-[12.5px] font-medium text-ink">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[15.5px] font-medium text-fg">{p.title}</p>
                      <p className="mt-1 text-[14.5px] leading-[1.5] text-mute">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
