"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import "./apps.css";
import { CheckIcon } from "@/components/icons";
import { LOGO_MARK_PATH } from "@/components/logo";
import { Button, GhostButton, Reveal, SectionHead } from "@/components/ui";
import { IsoBox, IsoScene, IsoTag, IsoTile, IsoTunnel, Laptop, TILE, iso } from "@/components/v3/iso";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";

/* The six apps that land on the machine, in order, and the rest of the catalogue beside it. */
const FEATURED = ["io.pilot.agentphone", "io.pilot.postgres", "io.pilot.plainweb", "io.pilot.wallet", "io.pilot.otto", "io.pilot.smol"];
const CATALOGUE = APPS.filter((a) => a.id !== "io.pilot.aegis");
const LANDING = FEATURED.map((id) => CATALOGUE.find((a) => a.id === id)).filter((a): a is App => Boolean(a));
const REST = CATALOGUE.filter((a) => !FEATURED.includes(a.id));

/* Grid layout: the ground is "your machine", the daemon sits at the back, two columns of app slots beside it. */
const GROUND = { x: 0, y: 0, w: 6.6, d: 6.3, h: 0.35 };
const Z = GROUND.h;
const SLOT = 1.3;
const SLOTS: [number, number][] = [
  [3.1, 0.5],
  [4.7, 0.5],
  [3.1, 2.1],
  [4.7, 2.1],
  [3.1, 3.7],
  [4.7, 3.7],
];
const DAEMON = { x: 0.5, y: 0.6, w: 1.8, d: 1.8 };
const daemonPort: [number, number, number] = [DAEMON.x + DAEMON.w, DAEMON.y + DAEMON.d / 2, Z];

type Phase = "idle" | "command" | "landed" | "done";
const STEP_MS = { command: 1100, landed: 1000 };

/** An image lying flat on a tile top, like a decal. */
function FlatImage({ x, y, z, size, href, radius = 22 }: { x: number; y: number; z: number; size: number; href: string; radius?: number }) {
  const id = useId();
  const S = 100;
  const [ox, oy] = iso(x, y, z);
  const k = size / S;
  return (
    <g transform={`matrix(${TILE.w * k} ${TILE.h * k} ${-TILE.w * k} ${TILE.h * k} ${ox} ${oy})`}>
      <clipPath id={id}>
        <rect width={S} height={S} rx={radius} />
      </clipPath>
      <image href={href} width={S} height={S} clipPath={`url(#${id})`} preserveAspectRatio="xMidYMid slice" />
    </g>
  );
}

function useInstallLoop(active: boolean, reduced: boolean) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!active || reduced) return;
    let i = 0;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    function next() {
      if (i >= LANDING.length) {
        setPhase("done");
        // Hold the full shelf, then clear it and start over.
        at(4200, () => {
          i = 0;
          setStep(0);
          setPhase("idle");
          at(700, next);
        });
        return;
      }
      setStep(i);
      setPhase("command");
      at(STEP_MS.command, () => setPhase("landed"));
      at(STEP_MS.command + STEP_MS.landed, () => {
        i += 1;
        next();
      });
    }
    at(500, next);
    return () => timers.forEach(clearTimeout);
  }, [active, reduced]);

  // With reduced motion, show the finished shelf.
  if (reduced) return { installed: LANDING.length, step: LANDING.length - 1, phase: "done" as Phase };
  const installed = phase === "idle" ? 0 : phase === "done" ? LANDING.length : step + (phase === "landed" ? 1 : 0);
  return { installed, step, phase };
}

function MachineScene({ installed, reduced }: { installed: number; reduced: boolean }) {
  const pad = 0.12;
  return (
    <IsoScene
      view={[-232, -96, 470, 330]}
      label={`Your machine: the Pilot daemon with ${installed} App Store apps installed next to it, and an agent calling it.`}
    >
      {/* Shadow under the machine */}
      <IsoTile x={-0.3} y={-0.3} z={-0.15} w={GROUND.w + 0.9} d={GROUND.d + 0.9} className="apps-shadow" />
      <IsoBox x={GROUND.x} y={GROUND.y} w={GROUND.w} d={GROUND.d} h={GROUND.h} className="iso-ground" />

      {/* Empty slots, marked on the board */}
      {SLOTS.map(([sx, sy], i) => (
        <IsoTile key={i} x={sx} y={sy} z={Z + 0.005} w={SLOT} d={SLOT} className="apps-slot" />
      ))}

      {/* Traces from the daemon to each slot (local IPC), and to the agent */}
      {SLOTS.map(([sx, sy], i) => (
        <IsoTunnel
          key={i}
          className="apps-trace"
          on={i < installed}
          packets={reduced ? 0 : 1}
          duration={2.4 + i * 0.2}
          points={[daemonPort, [sx - 0.25, daemonPort[1], Z], [sx - 0.25, sy + SLOT / 2, Z], [sx, sy + SLOT / 2, Z]]}
        />
      ))}
      <IsoTunnel
        className="apps-trace"
        on={installed > 0}
        packets={reduced ? 0 : 1}
        duration={2}
        points={[
          [DAEMON.x + DAEMON.w / 2, DAEMON.y + DAEMON.d, Z],
          [DAEMON.x + DAEMON.w / 2, 3.95, Z],
        ]}
      />

      {/* The daemon: an ink block with a lime cap and the Pilot mark */}
      <IsoBox x={DAEMON.x} y={DAEMON.y} z={Z} w={DAEMON.w} d={DAEMON.d} h={0.85} tone="ink" />
      <IsoBox x={DAEMON.x} y={DAEMON.y} z={Z + 0.85} w={DAEMON.w} d={DAEMON.d} h={0.14} tone="lime" />
      <FlatMark x={DAEMON.x + 0.35} y={DAEMON.y + 0.35} z={Z + 0.99} size={DAEMON.w - 0.7} />

      {/* The agent that calls it */}
      <Laptop x={0.4} y={4.1} z={Z} />

      {/* App tiles, landing one by one */}
      {SLOTS.map(([sx, sy], i) => {
        const app = LANDING[i];
        if (!app) return null;
        return (
          <g key={app.id} className="apps-tile" data-in={i < installed} style={{ "--i": i } as CSSProperties}>
            <IsoBox x={sx} y={sy} z={Z} w={SLOT} d={SLOT} h={0.26} />
            <FlatImage x={sx + pad} y={sy + pad} z={Z + 0.26} size={SLOT - pad * 2} href={app.icon} />
          </g>
        );
      })}

      <IsoTag at={[DAEMON.x + DAEMON.w / 2, DAEMON.y + DAEMON.d / 2, Z + 1.05]} label="Pilot daemon" tone="ink" />
      <IsoTag at={[0.9, 4.9, Z + 1.45]} label="Your agent" />
    </IsoScene>
  );
}

/** The Pilot mark, flat on the daemon's cap. */
function FlatMark({ x, y, z, size }: { x: number; y: number; z: number; size: number }) {
  const [ox, oy] = iso(x, y, z);
  const k = size / 113;
  return (
    <g transform={`matrix(${TILE.w * k} ${TILE.h * k} ${-TILE.w * k} ${TILE.h * k} ${ox} ${oy})`}>
      <path d={LOGO_MARK_PATH} transform="translate(0 20)" className="apps-mark" />
    </g>
  );
}

function Toast({ step, phase }: { step: number; phase: Phase }) {
  const app = LANDING[step];
  const done = phase === "done";
  const landed = phase === "landed";
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3 sm:bottom-5">
      <div
        aria-live="polite"
        data-show={phase !== "idle"}
        className="apps-toast flex max-w-full min-w-0 items-center gap-3 rounded-[14px] bg-card/95 py-2 pr-2.5 pl-2 shadow-float backdrop-blur-md"
      >
        {app && !done && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.icon} alt="" width={32} height={32} className="size-8 shrink-0 rounded-[9px] object-cover" />
        )}
        <div className="min-w-0 leading-tight">
          {done ? (
            <p className="text-[13px] font-medium text-fg">{LANDING.length} apps installed, each next to the daemon</p>
          ) : landed && app ? (
            <>
              <p className="truncate text-[13px] font-medium text-fg">{app.name} installed</p>
              <p className="mt-0.5 truncate text-[11.5px] text-mute">{app.description}</p>
            </>
          ) : app ? (
            <>
              <p className="truncate font-mono text-[12px] text-fg">
                <span className="text-dim">$</span> pilotctl appstore install {app.id}
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-mute">Checking the SHA-256 and the signature</p>
            </>
          ) : null}
        </div>
        <span className="grid size-6 shrink-0 place-items-center">
          {done || landed ? (
            <span className="grid size-6 place-items-center rounded-full bg-lime text-ink">
              <CheckIcon className="size-3" />
            </span>
          ) : (
            <span className="block size-4 animate-spin rounded-full border-[1.5px] border-edge-3 border-t-fg" />
          )}
        </span>
      </div>
    </div>
  );
}

export function Apps() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px 0px -15% 0px" });
  const reduced = usePrefersReducedMotion();
  const { installed, step, phase } = useInstallLoop(inView, reduced);

  return (
    <section id="app-store" aria-labelledby="apps-c-title" className="py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="apps-c-title"
            title="Apps your agent installs"
            muted="with one command."
            lede="Give your agent a Postgres database, a phone number, an inbox, a real Chrome tab or a USDC wallet. Each app runs on your machine, next to the daemon."
          />
          <Reveal delay={80} className="flex shrink-0 flex-wrap gap-2 lg:pb-1">
            <Button href={LINKS.appStore}>Browse all {CATALOGUE.length + 1} apps</Button>
            <GhostButton href={LINKS.publish}>Publish your app</GhostButton>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
          <Reveal>
            <div
              ref={ref}
              className="relative overflow-hidden rounded-[28px] bg-bg-deep px-2 pt-12 pb-24 [background-image:radial-gradient(var(--color-edge-2)_1px,transparent_1.2px)] [background-size:22px_22px] sm:px-8 sm:pt-14 sm:pb-28"
            >
              <MachineScene installed={installed} reduced={reduced} />
              <Toast step={step} phase={phase} />
            </div>
          </Reveal>

          <Reveal delay={80} className="flex flex-col">
            <div className="rounded-[28px] bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[15px] font-medium text-fg">Also in the App Store</h3>
                <span className="text-[13px] text-dim">{REST.length} more</span>
              </div>
              <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-5">
                {REST.map((app) => (
                  <li key={app.id}>
                    <a href={`/apps/${app.id}`} title={app.description} className="group flex flex-col items-center gap-1.5 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={app.icon}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        className="size-11 rounded-[23%] object-cover shadow-tile transition-transform duration-300 ease-(--ease-out) group-hover:-translate-y-0.5 sm:size-12"
                      />
                      <span className="w-full truncate text-[11.5px] text-soft">{app.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-5 px-1 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-[14px] font-medium text-fg">Curated</dt>
                <dd className="mt-1 text-[14px] leading-[1.5] text-mute">
                  Every app is reviewed, SHA-256 pinned and signature-verified before installation.
                </dd>
              </div>
              <div>
                <dt className="text-[14px] font-medium text-fg">Mostly free</dt>
                <dd className="mt-1 text-[14px] leading-[1.5] text-mute">
                  A few are metered against a per-user USD 5 budget and list their prices in their help method.
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
