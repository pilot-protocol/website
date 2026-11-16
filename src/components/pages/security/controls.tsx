"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { at, NodeLabel, ObjTile, Stage, WIRE, type ObjName } from "@/components/pages/security/infra";
import { Code, FLAT_CARD, SectionHead, SKY, SKY_PILL, SkySplit, Soft, Switch, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal, SmartLink } from "@/components/ui";
import { useInView } from "@/lib/hooks";

type Control = { title: string; body: ReactNode; tag?: ReactNode; href: string; on: boolean };

const CONTROLS: Control[] = [
  {
    title: "Ed25519 identity",
    body: "Each daemon has a persistent key pair. Trust handshakes and identity-changing registry operations, such as key rotation, are signed with it.",
    tag: "signed handshakes",
    href: "/docs/security",
    on: true,
  },
  {
    title: "Encrypted tunnels",
    body: "X25519 key agreement gives each pair of peers its own secret. AES-256-GCM encrypts and authenticates every tunnel packet.",
    tag: (
      <>
        off only with <Code>--no-encrypt</Code>
      </>
    ),
    href: "/docs/security",
    on: true,
  },
  {
    title: "Mutual trust handshakes",
    body: "A private node accepts streams and datagrams only from peers it trusts or shares a network with. A handshake has to be approved.",
    tag: (
      <>
        revoke with <Code>pilotctl untrust</Code>
      </>
    ),
    href: "/docs/trust",
    on: true,
  },
  {
    title: "Private by default",
    body: "Directory lookups don’t hand a private node’s endpoint to untrusted peers. Some metadata, such as a hostname you set, stays visible.",
    href: "/docs/trust",
    on: true,
  },
  {
    title: "Package signing and pinning",
    body: "Catalogue apps are reviewed, signature-verified and SHA-256 pinned before they install. You accept an app’s declared grants at install.",
    href: "/docs/app-store",
    on: true,
  },
  {
    title: "Pre-trust hardening",
    body: "Flags on the daemon, registry and beacon extend trust checks to key exchange, directory lookups, registration and hole punching. Whoever runs each component turns them on.",
    tag: "operator flags",
    href: "/self-hosting#hardening",
    on: false,
  },
];

/** "In the code you can read": a column of switches, five that flip on as you arrive and one that stays off. */
export function Controls() {
  if (SKY) return <SkyControls />;
  return <GreenControls />;
}

function GreenControls() {
  const [ref, inView] = useInView<HTMLUListElement>({ margin: "0px 0px -20% 0px" });

  return (
    <section aria-labelledby="controls-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <div className="lg:sticky lg:top-28">
            <SectionHead
              id="controls-title"
              kicker="Controls that ship"
              title={
                <>
                  In the code <Soft>you can read.</Soft>
                </>
              }
              lede="Five run in every daemon by default. The sixth is a set of stricter checks operators can turn on; they are off by default so older clients keep working."
            />
            <Reveal delay={80} className="mt-8 flex flex-col gap-3 font-mono text-[12px] text-dim">
              <span className="flex items-center gap-3">
                <Switch on /> On in every daemon
              </span>
              <span className="flex items-center gap-3">
                <Switch on={false} /> Off until an operator turns it on
              </span>
            </Reveal>
          </div>
        </div>

        <ul ref={ref} className="flex flex-col border-t border-edge">
          {CONTROLS.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 50} className="border-b border-edge">
              <SmartLink
                href={c.href}
                className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 py-6 transition-colors duration-300 sm:gap-x-6"
              >
                <span className="pt-[3px]">
                  <Switch on={c.on && inView} delay={300 + i * 140} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span
                      className={`inline-flex items-center gap-2 text-[18px] leading-[1.3] font-medium tracking-[-0.015em] ${c.on ? "text-fg" : "text-soft"}`}
                    >
                      {c.title}
                      <ArrowUpRightIcon className="size-2.5 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime-ink" />
                    </span>
                    {c.tag && <span className="font-mono text-[12px] text-dim">{c.tag}</span>}
                  </span>
                  <span className="mt-2 max-w-[560px] text-[15px] leading-[1.55] text-mute">{c.body}</span>
                </span>
              </SmartLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: the daemon and the six checks around it                   */
/* ------------------------------------------------------------------ */

const OBJ_OF: ObjName[] = ["fingerprint", "lock", "users", "eyeSlash", "boxCheck", "shield"];
const SHORT = ["Ed25519 identity", "Encrypted tunnels", "Trust handshakes", "Private by default", "Signed packages", "Pre-trust hardening"];

// Around the daemon, clockwise from the top.
const W = 540;
const H = 420;
const CENTER: [number, number] = [270, 205];
const SPOTS: [number, number][] = [
  [270, 34],
  [446, 118],
  [446, 292],
  [270, 376],
  [94, 292],
  [94, 118],
];
const DURATIONS = [3200, 3200, 3200, 3200, 3200, 3600] as const;

/**
 * Sky site (Figma 233:1195): a split section. The heading on paper; on the hatched half, the daemon with the six
 * controls around it: five wired in and lit (they run in every daemon), the sixth on a dashed wire and grey (an
 * operator turns it on). Each is a button; the card under the picture says what the chosen one does.
 */
function SkyControls() {
  const { ref, step, run, go, inView, reduced } = useStepper<HTMLDivElement>(CONTROLS.length, DURATIONS);
  // The five switch on in turn the first time the picture is seen.
  const [armed, setArmed] = useState(0);
  useEffect(() => {
    if (!inView || armed >= 5) return;
    if (reduced) {
      const id = window.setTimeout(() => setArmed(5), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setArmed((n) => n + 1), armed === 0 ? 500 : 260);
    return () => window.clearTimeout(id);
  }, [inView, armed, reduced]);
  const c = CONTROLS[step];

  return (
    <SkySplit
      labelledBy="controls-title"
      textClassName="lg:justify-start"
      text={
        <div className="lg:sticky lg:top-28">
          <SectionHead
            id="controls-title"
            title={
              <>
                In the code <span className="block text-mute">you can read.</span>
              </>
            }
            lede="Five run in every daemon by default. The sixth is a set of stricter checks operators can turn on; they are off by default so older clients keep working."
          />
        </div>
      }
      visual={
        <Reveal delay={60} className="w-full max-w-[560px]">
          <div ref={ref}>
            <div className="hidden sm:block">
              <Stage
                w={W}
                h={H}
                svg={
                  <>
                    {SPOTS.map((p, i) => (
                      <path
                        key={i}
                        d={`M${CENTER[0]} ${CENTER[1]} L${p[0]} ${p[1]}`}
                        className={WIRE}
                        data-lit={CONTROLS[i].on && i < armed}
                        strokeDasharray={CONTROLS[i].on ? undefined : "3 6"}
                      />
                    ))}
                    {inView &&
                      SPOTS.map((p, i) =>
                        CONTROLS[i].on && i === step ? (
                          <Beam key={`${i}-${run}`} d={`M${CENTER[0]} ${CENTER[1]} L${p[0]} ${p[1]}`} run={run} duration={700} tail={44} />
                        ) : null,
                      )}
                  </>
                }
              >
                <div style={at(CENTER[0], CENTER[1], W, H, 84)} className="flex flex-col items-center">
                  <ObjTile name="laptop" size={84} lit={armed >= 5} />
                  <NodeLabel title="Your daemon" sub="pilot-daemon" className="mt-2.5 rounded-[8px] bg-bg px-2 py-1" />
                </div>
                {SPOTS.map((p, i) => (
                  <div key={i} style={at(p[0], p[1], W, H)}>
                    <ControlChip i={i} on={CONTROLS[i].on && i < armed} picked={i === step} onPick={() => go(i)} />
                  </div>
                ))}
              </Stage>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:hidden">
              {CONTROLS.map((_, i) => (
                <ControlChip key={i} i={i} on={CONTROLS[i].on && i < armed} picked={i === step} onPick={() => go(i)} block />
              ))}
            </div>

            <div aria-live="polite" className={`mt-5 p-5 sm:mt-6 sm:p-6 ${FLAT_CARD}`}>
              <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{c.title}</span>
                {c.on ? (
                  <span className={SKY_PILL}>On by default</span>
                ) : (
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] leading-4 font-medium text-mute shadow-[0_0_0_1px_var(--color-edge-2)]">
                    Operator flags
                  </span>
                )}
              </p>
              <p className="mt-2 min-h-[66px] text-[14.5px] leading-[1.5] text-pretty text-mute">{c.body}</p>
              <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="text-[13px] leading-5 text-dim">{c.tag}</span>
                <SmartLink
                  href={c.href}
                  className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-fg"
                >
                  Read how it works
                  <ArrowUpRightIcon className="size-2.5 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--sky-accent)" />
                </SmartLink>
              </p>
            </div>
          </div>
        </Reveal>
      }
    />
  );
}

/** One control around the daemon: its object on a tile and a short name. A button that shows it in the card. */
function ControlChip({ i, on, picked, onPick, block = false }: { i: number; on: boolean; picked: boolean; onPick: () => void; block?: boolean }) {
  const off = !CONTROLS[i].on;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      className={`flex items-center gap-2.5 rounded-full bg-card py-1.5 pr-4 pl-1.5 text-left transition-[box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sky-accent) ${
        picked
          ? "shadow-[0_0_0_1.5px_var(--sky-fill),0_8px_18px_-10px_rgb(10_42_156/0.35)]"
          : "shadow-[0_0_0_1px_var(--sky-card-line),0_8px_18px_-12px_rgb(10_42_156/0.25)] hover:shadow-[0_0_0_1px_var(--color-edge-3),0_8px_18px_-12px_rgb(10_42_156/0.25)]"
      } ${block ? "w-full" : "whitespace-nowrap"}`}
    >
      <ObjTile name={OBJ_OF[i]} size={34} dim={off || !on} />
      <span className="flex flex-col">
        <span className={`text-[13.5px] leading-[18px] font-medium tracking-[-0.02em] ${off ? "text-mute" : "text-fg"}`}>{SHORT[i]}</span>
        <span className={`text-[12px] leading-4 ${on ? "text-(--sky-accent)" : "text-dim"}`}>{off ? "Off by default" : on ? "On by default" : "\u00a0"}</span>
      </span>
    </button>
  );
}
