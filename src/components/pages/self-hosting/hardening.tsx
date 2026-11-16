"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LockIcon } from "@/components/icons";
import { at, curve, ObjTile, Stage, WIRE } from "@/components/pages/security/infra";
import { Code, CodePanel, FLAT_CARD, SectionHead, SKY, SkySplit, Soft, Switch } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

type Flag = { flag: string; body: ReactNode };

const REGISTRY: Flag[] = [
  {
    flag: "-strict-directory-auth",
    body: "Requires trust or a shared network before lookups, resolves, punch requests and listings return a node.",
  },
  {
    flag: "-strict-registration-auth",
    body: "Requires a proof-of-possession signature on registrations that submit a public key.",
  },
  {
    flag: "-strict-heartbeat-freshness",
    body: "Binds a timestamp into signed heartbeats so a captured heartbeat can’t be replayed.",
  },
  { flag: "-strict-expiry-binding", body: "Binds the requested expiry into the key-expiry signature." },
  {
    flag: "-tls",
    body: (
      <>
        TLS for registry connections, with your certificate (<Code>-tls-cert</Code>, <Code>-tls-key</Code>) or a
        self-signed one generated at start.
      </>
    ),
  },
];

const OTHERS: (Flag & { where: string })[] = [
  {
    where: "Standalone beacon",
    flag: "-require-punch-token",
    body: (
      <>
        Releases a peer’s endpoint only for a punch token issued by that peer. A flag on{" "}
        <a
          href="https://github.com/pilot-protocol/beacon"
          className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg"
        >
          pilot-protocol/beacon
        </a>
        ; the beacon built into rendezvous doesn’t expose it.
      </>
    ),
  },
  {
    where: "Daemon",
    flag: "PILOT_STRICT_DATAPLANE_TRUST=1",
    body: "A private node refuses key exchange and control traffic from peers it doesn’t trust.",
  },
];

const BASE = [
  "$ ./rendezvous -registry-addr :9000 \\",
  "    -beacon-addr :9001 \\",
  "    -store /var/lib/pilot/registry.json \\",
  "    -http 127.0.0.1:3000",
];

export function Hardening() {
  const [on, setOn] = useState<string[]>([]);
  const chosen = REGISTRY.map((f) => f.flag).filter((f) => on.includes(f));
  const lines = [...BASE];
  if (chosen.length) {
    lines[lines.length - 1] += " \\";
    chosen.forEach((f, i) => lines.push(`    ${f}${i < chosen.length - 1 ? " \\" : ""}`));
  }
  const toggle = (f: string) => setOn((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  if (SKY)
    // Sky site (Figma 233:1195): a split. The heading and the command it builds on paper; the flags on the hatched
    // half. The registry's flags are real switches that edit the command; the beacon and daemon settings are marked
    // off by default, since they are set elsewhere.
    return (
      <SkySplit
        id="hardening"
        labelledBy="hardening-title"
        className="pb-24 sm:pb-32"
        textClassName="lg:justify-start"
        text={
          <div className="lg:sticky lg:top-28">
            <SectionHead
              id="hardening-title"
              title={
                <>
                  Stricter checks, <span className="block text-mute">off by default.</span>
                </>
              }
              lede="These flags are off by default so older clients keep working. On your own registry you can turn them on once every client you run supports them."
            />
            <Reveal delay={80} className="mt-10">
              <CodePanel
                title="ops@registry ~ start with the flags you pick"
                meta={<span aria-live="polite">{chosen.length ? `${chosen.length} of ${REGISTRY.length} flags on` : "Flip a flag to add it"}</span>}
                code={lines.join("\n")}
                highlight={chosen.length ? [BASE.length, lines.length - 1] : null}
              />
            </Reveal>
          </div>
        }
        visual={
          <div className="flex w-full max-w-[540px] flex-col gap-4">
            <Reveal className={`${FLAT_CARD} overflow-hidden`}>
              <p className="flex items-baseline justify-between border-b border-(--sky-card-line) px-5 py-3.5 sm:px-6">
                <span className="text-[15px] font-medium tracking-[-0.02em] text-fg">Registry</span>
                <span className="font-mono text-[12px] text-mute">rendezvous</span>
              </p>
              <Lanes on={on} />
              <ul>
                {REGISTRY.map((f) => {
                  const active = on.includes(f.flag);
                  return (
                    <li key={f.flag} className="border-b border-(--sky-card-line) last:border-b-0">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(f.flag)}
                        className="group grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-fg/[0.025] sm:gap-x-5 sm:px-6"
                      >
                        <span className="pt-[1px]">
                          <Switch on={active} />
                        </span>
                        <span className="min-w-0">
                          <code className={`font-mono text-[13.5px] break-all transition-colors ${active ? "text-(--sky-accent)" : "text-fg"}`}>
                            {f.flag}
                          </code>
                          <span className="mt-1.5 block text-[14px] leading-[1.5] text-pretty text-mute">{f.body}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            {OTHERS.map((f) => (
              <Reveal key={f.flag} className={`${FLAT_CARD} overflow-hidden`}>
                <p className="flex items-center justify-between gap-3 border-b border-(--sky-card-line) px-5 py-3 sm:px-6">
                  <span className="flex items-center gap-3 text-[15px] font-medium tracking-[-0.02em] text-fg">
                    <ObjTile name={f.where === "Daemon" ? "laptop" : "antenna"} size={32} dim />
                    {f.where}
                  </span>
                  <span className="rounded-full px-2.5 py-1 text-[12px] leading-4 font-medium text-mute shadow-[0_0_0_1px_var(--color-edge-2)]">
                    Off by default
                  </span>
                </p>
                <div className="px-5 py-4 sm:px-6">
                  <code className="font-mono text-[13.5px] break-all text-fg">{f.flag}</code>
                  <span className="mt-1.5 block text-[14px] leading-[1.5] text-pretty text-mute">{f.body}</span>
                </div>
              </Reveal>
            ))}
          </div>
        }
      />
    );

  return (
    <section id="hardening" aria-labelledby="hardening-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <div className="lg:sticky lg:top-28">
            <SectionHead
              id="hardening-title"
              kicker="Hardening"
              title={
                <>
                  Stricter checks, <Soft>off by default.</Soft>
                </>
              }
              lede="These flags are off by default so older clients keep working. On your own registry you can turn them on once every client you run supports them."
            />
            <Reveal delay={80} className="mt-10">
              <CodePanel
                title="ops@registry ~ start with the flags you pick"
                code={lines.join("\n")}
                highlight={chosen.length ? [BASE.length, lines.length - 1] : null}
              />
              <p aria-live="polite" className="mt-3 font-mono text-[11.5px] text-dim">
                {chosen.length ? `${chosen.length} of ${REGISTRY.length} registry flags on` : "Flip a registry flag to add it to the command."}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <Reveal>
            <p className="flex items-baseline justify-between border-b border-edge-2 pb-3 font-mono text-[12px] text-dim">
              <span className="text-fg">Registry</span>
              <span>rendezvous</span>
            </p>
            <ul>
              {REGISTRY.map((f) => {
                const active = on.includes(f.flag);
                return (
                  <li key={f.flag} className="border-b border-edge">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(f.flag)}
                      className="group grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-5 py-5 text-left"
                    >
                      <span className="pt-[2px]">
                        <Switch on={active} className="group-hover:border-fg/40" />
                      </span>
                      <span className="min-w-0">
                        <code className={`font-mono text-[14px] break-all transition-colors ${active ? "text-lime-ink" : "text-fg"}`}>
                          {f.flag}
                        </code>
                        <span className="mt-1.5 block text-[14.5px] leading-[1.55] text-mute">{f.body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {OTHERS.map((f) => (
            <Reveal key={f.flag}>
              <p className="flex items-baseline justify-between border-b border-edge-2 pb-3 font-mono text-[12px] text-dim">
                <span className="text-fg">{f.where}</span>
              </p>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 border-b border-edge py-5">
                <span className="pt-[2px]">
                  <Switch on={false} />
                </span>
                <span className="min-w-0">
                  <code className="font-mono text-[14px] break-all text-fg">{f.flag}</code>
                  <span className="mt-1.5 block text-[14.5px] leading-[1.55] text-mute">{f.body}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: what each registry flag checks                            */
/* ------------------------------------------------------------------ */

/** The kind of request each registry flag adds a check to, in REGISTRY's order. */
const LANES: { kind: string; check: string }[] = [
  { kind: "Lookups", check: "Trust first" },
  { kind: "Registrations", check: "Key proof" },
  { kind: "Heartbeats", check: "Timestamped" },
  { kind: "Key expiry", check: "Signed" },
  { kind: "Connections", check: "TLS" },
];

const LW = 480;
const LH = 232;
const LEFT: [number, number] = [40, LH / 2];
const RIGHT: [number, number] = [440, LH / 2];
const laneY = (i: number) => 32 + i * 42;
const CHECK_X = 318;

function lanePath(i: number) {
  const y = laneY(i);
  return `${curve(LEFT, [128, y], "x")} L${CHECK_X + 30} ${y} ${curve([CHECK_X + 30, y], RIGHT, "x").replace(/^M[^C]+/, "")}`;
}

/**
 * Daemons on the left, the registry on the right, one lane per kind of request. A flag that's on puts its check on
 * its lane (a shield, or a lock for TLS); requests keep flowing along every lane, through the check where there is one.
 */
function Lanes({ on }: { on: string[] }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 900);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  const lane = tick % LANES.length;
  return (
    <div ref={ref} aria-hidden className="border-b border-(--sky-card-line) px-4 pt-5 pb-3 sm:px-6">
      <Stage
        w={LW}
        h={LH}
        svg={
          <>
            {LANES.map((_, i) => (
              <path key={i} d={lanePath(i)} className={WIRE} data-lit={on.includes(REGISTRY[i].flag)} />
            ))}
            {inView && <Beam key={tick} d={lanePath(lane)} run={tick} duration={1100} tail={44} width={1.5} />}
          </>
        }
      >
        <div style={at(LEFT[0], LEFT[1], LW, LH, 44)} className="flex flex-col items-center">
          <ObjTile name="laptop" size={44} />
          <span className="mt-2 text-[12px] leading-4 text-mute">Daemons</span>
        </div>
        <div style={at(RIGHT[0], RIGHT[1], LW, LH, 48)} className="flex flex-col items-center">
          <ObjTile name="server" size={48} lit={on.length > 0} />
          <span className="mt-2 text-[12px] leading-4 text-mute">Registry</span>
        </div>
        {LANES.map((l, i) => {
          const active = on.includes(REGISTRY[i].flag);
          return (
            <span key={l.kind}>
              <span
                className="absolute -translate-y-full pb-1 text-[12px] leading-4 whitespace-nowrap text-mute"
                style={{ left: `${(140 / LW) * 100}%`, top: `${(laneY(i) / LH) * 100}%` }}
              >
                {l.kind}
              </span>
              <span style={at(CHECK_X, laneY(i), LW, LH)}>
                {active ? (
                  <span key="on" className="infra-pop infra-chip !h-[24px] !gap-1.5 !px-2" data-tone="sky">
                    <span className="grid size-3.5 place-items-center">
                      {l.kind === "Connections" ? <LockIcon className="size-3" /> : <ShieldMark />}
                    </span>
                    {l.check}
                  </span>
                ) : (
                  <span key="off" className="block size-1.5 rounded-full bg-fg/20" />
                )}
              </span>
            </span>
          );
        })}
      </Stage>
    </div>
  );
}

function ShieldMark() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
      <path d="M6 1.2 10 2.6v3c0 2.5-2.3 3.9-4 4.6-1.7-.7-4-2.1-4-4.6v-3Z" fill="currentColor" />
      <path d="m4.2 6 1.3 1.3L8 4.8" fill="none" stroke="var(--color-card)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
