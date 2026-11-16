"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckIcon, LockIcon } from "@/components/icons";
import { ObjTile } from "@/components/pages/security/infra";
import { Code, CodePanel, FLAT_CARD, SectionHead, SKY, Soft } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { BrandMark } from "@/components/v4/logos";
import { HatchPanel } from "@/components/sky/kit";
import { Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import "./self-hosting.css";

/*
 * The ops-blueprint.json from the source, next to the network it produces.
 * When it scrolls into view the provision runs in the registry's apply order,
 * lighting each block of JSON as its part of the network appears. Afterwards,
 * hovering either side links a JSON block to what it set.
 */

const BLUEPRINT = `{
  "name": "ops",
  "join_rule": "invite",
  "enterprise": true,
  "policy": { "max_members": 50, "allowed_ports": [1001, 1002] },
  "roles": [
    { "external_id": "alice@example.com", "role": "admin" }
  ],
  "identity_provider": {
    "type": "oidc",
    "url": "https://login.example.com/.well-known/jwks.json",
    "issuer": "https://login.example.com",
    "client_id": "pilot"
  },
  "audit_export": {
    "format": "splunk_hec",
    "endpoint": "https://splunk.example.com:8088/services/collector"
  }
}`;

type PartKey = "network" | "enterprise" | "policy" | "identity" | "audit" | "roles";

// In the order the registry applies them.
const PARTS: { key: PartKey; lines: [number, number]; step: string }[] = [
  { key: "network", lines: [1, 2], step: "find or create" },
  { key: "enterprise", lines: [3, 3], step: "enterprise" },
  { key: "policy", lines: [4, 4], step: "policy" },
  { key: "identity", lines: [8, 13], step: "identity provider" },
  { key: "audit", lines: [14, 17], step: "audit export" },
  { key: "roles", lines: [5, 7], step: "roles" },
];

const STEP_MS = 900;

function partAt(line: number): PartKey | null {
  return PARTS.find((p) => line >= p.lines[0] && line <= p.lines[1])?.key ?? null;
}

function Block({
  k,
  done,
  lit,
  onHover,
  title,
  children,
}: {
  k: PartKey;
  done: boolean;
  lit: boolean;
  onHover: (k: PartKey | null) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      data-done={done}
      data-lit={lit}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(k)}
      onPointerLeave={() => onHover(null)}
      className={`relative border-t border-edge px-5 py-4 transition-[background-color] duration-300 sm:px-6 ${
        SKY ? "data-[lit=true]:bg-(--sky-tint)" : "data-[lit=true]:bg-lime/[0.06]"
      }`}
    >
      {lit && <span aria-hidden className={`absolute inset-y-0 left-0 w-[2px] ${SKY ? "bg-(--sky-fill)" : "bg-lime"}`} />}
      {SKY ? (
        <p className="text-[13px] leading-5 text-mute first-letter:uppercase">{title}</p>
      ) : (
        <p className="font-mono text-[11.5px] text-dim">{title}</p>
      )}
      <div
        className={`mt-2.5 transition-[opacity,filter,transform] duration-500 ease-(--ease-out) ${
          done ? "opacity-100 blur-[0px]" : "translate-y-1 opacity-20 blur-[2px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function Blueprint() {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -25% 0px" });
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState(0);
  const [applied, setApplied] = useState(0); // how many parts are in place
  const [hover, setHover] = useState<PartKey | null>(null);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const id = window.setTimeout(() => setApplied(PARTS.length), 0);
      return () => window.clearTimeout(id);
    }
    const timers = PARTS.map((_, i) => window.setTimeout(() => setApplied(i + 1), 700 + i * STEP_MS));
    const reset = window.setTimeout(() => setApplied(0), 0);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(reset);
    };
  }, [inView, reduced, run]);

  const running = applied < PARTS.length;
  const current = running && applied > 0 ? PARTS[applied - 1].key : null;
  const focus = hover ?? current;
  const range = focus ? PARTS.find((p) => p.key === focus)!.lines : null;
  const done = (k: PartKey) => PARTS.findIndex((p) => p.key === k) < applied;

  // Sky site (Figma 233:1195): the heading, the file and what it applies share one hatched showcase panel.
  const Frame = SKY ? HatchPanel : "div";
  return (
    <section id="blueprint" aria-labelledby="blueprint-title" className={SKY ? "pb-24 sm:pb-32" : "border-t border-edge py-24 sm:py-32"}>
      <div className="wrap">
        <Frame className={SKY ? "px-4 py-14 sm:px-8 sm:py-20 lg:px-12" : ""}>
        <SectionHead
          id="blueprint-title"
          kicker="Blueprints"
          center={SKY}
          title={
            SKY ? (
              <>
                One file <span className="block text-mute">describes a network.</span>
              </>
            ) : (
              <>
                One file <Soft>describes a network.</Soft>
              </>
            )
          }
          lede={
            <>
              Join rule, policy, role pre-assignments, identity provider and audit export, applied with{" "}
              <Code>pilotctl extras provision</Code>. Applying the same blueprint again updates the network instead of
              making a second one.
            </>
          }
        />

        <Reveal delay={80} className="mt-14 sm:mt-16">
          <div
            ref={ref}
            className={
              SKY
                ? "grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,13fr)_minmax(0,11fr)]"
                : "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,13fr)_minmax(0,11fr)] lg:gap-8"
            }
          >
            <div className="order-2 min-w-0 lg:order-1">
              <CodePanel
                className={SKY ? "h-full" : ""}
                title="ops-blueprint.json"
                meta="blueprint"
                lang="json"
                code={BLUEPRINT}
                highlight={range}
                onLineHover={(l) => setHover(l === null ? null : partAt(l))}
              />
            </div>

            <div className={`order-1 min-w-0 lg:order-2 ${SKY ? `${FLAT_CARD} overflow-hidden [--color-edge:var(--sky-card-line)]` : ""}`}>
              <div
                className={
                  SKY
                    ? "flex h-11 items-center gap-2.5 pr-2 pl-4 font-mono text-[12px]"
                    : "flex items-center gap-2.5 rounded-t-[16px] border border-b-0 border-edge-2 bg-bg-deep py-2 pr-2 pl-4 font-mono text-[12px]"
                }
              >
                <span className={SKY ? "text-(--sky-accent)" : "text-lime-ink"}>$</span>
                <span className="min-w-0 flex-1 truncate text-fg">pilotctl extras provision ops-blueprint.json</span>
                <button
                  type="button"
                  onClick={() => setRun((r) => r + 1)}
                  disabled={running}
                  className={`pressable rounded-[10px] px-2 py-1 transition-opacity hover:text-fg disabled:opacity-0 ${
                    SKY ? "font-sans text-[13px] text-mute" : "text-dim"
                  }`}
                >
                  Replay
                </button>
              </div>
              <div
                className={
                  SKY
                    ? ""
                    : "overflow-hidden rounded-b-[16px] border border-edge-2 bg-card"
                }
              >
                <ol
                  className={`flex flex-wrap gap-x-4 gap-y-1.5 px-5 py-3 sm:px-6 ${SKY ? "text-[12.5px]" : "font-mono text-[11.5px]"}`}
                  aria-label="Apply steps"
                >
                  {PARTS.map((p, i) => (
                    <li
                      key={p.key}
                      className={`flex items-center gap-1.5 transition-colors duration-300 ${i < applied ? "text-soft" : "text-faint"}`}
                    >
                      <span
                        className={`grid size-3 place-items-center transition-colors duration-300 ${
                          SKY
                            ? i < applied
                              ? "rounded-full bg-(--sky-fill) text-white"
                              : "rounded-full shadow-[inset_0_0_0_1px_var(--color-edge-3)] text-transparent"
                            : i < applied
                              ? "rounded-[5px] bg-lime text-ink"
                              : "rounded-[5px] border border-edge-3 text-transparent"
                        }`}
                      >
                        <CheckIcon className="size-2" />
                      </span>
                      {p.step}
                    </li>
                  ))}
                </ol>

                {SKY ? (
                  <NetworkPicture done={done} focus={focus} onHover={setHover} applied={applied} />
                ) : (
                  <>
                <Block k="network" done={done("network")} lit={focus === "network"} onHover={setHover} title="network">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[30px] leading-none font-medium tracking-[-0.03em] text-fg">ops</span>
                    {SKY ? (
                      <span className="flex flex-wrap gap-1.5 text-[12.5px] leading-none font-medium">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-fg px-2.5 py-1.5 text-bg">
                          <LockIcon className="size-3" /> Invite-only
                        </span>
                        <span
                          data-on={done("enterprise")}
                          onPointerEnter={(e) => e.pointerType === "mouse" && setHover("enterprise")}
                          onPointerLeave={() => setHover(null)}
                          className={`rounded-full px-2.5 py-1.5 transition-[background-color,color,box-shadow] duration-500 ${
                            done("enterprise")
                              ? "bg-(--sky-fill) text-white"
                              : "text-faint shadow-[inset_0_0_0_1px_var(--color-edge-2)]"
                          }`}
                        >
                          Enterprise
                        </span>
                      </span>
                    ) : (
                    <span className="flex flex-wrap gap-1.5 font-mono text-[11.5px]">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-edge-3 px-2 py-1 text-fg">
                        <LockIcon className="size-3" /> invite-only
                      </span>
                      <span
                        data-on={done("enterprise")}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHover("enterprise")}
                        onPointerLeave={() => setHover(null)}
                        className={`rounded-md border px-2 py-1 transition-colors duration-500 ${
                          done("enterprise") ? "border-lime-ink/70 text-lime-ink" : "border-edge-2 text-faint"
                        } ${focus === "enterprise" ? "bg-lime/[0.1]" : ""}`}
                      >
                        enterprise
                      </span>
                    </span>
                    )}
                  </div>
                  <p className="mt-2.5 text-[13.5px] leading-[1.5] text-mute">
                    Invited nodes have to accept. Members reach each other without a separate handshake.
                  </p>
                </Block>

                <Block k="policy" done={done("policy")} lit={focus === "policy"} onHover={setHover} title="policy">
                  {SKY ? (
                    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-3 gap-y-3.5 text-[13.5px]">
                      <span className="text-[13px] text-mute">Members</span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span aria-hidden className="grid grid-cols-[repeat(25,6px)] gap-[3px]">
                          {Array.from({ length: 50 }, (_, i) => (
                            <span key={i} className="size-[6px] rounded-full bg-fg/[0.12]" />
                          ))}
                        </span>
                        <span className="text-[13px] whitespace-nowrap text-fg tabular-nums">Up to 50</span>
                      </span>
                      <span className="text-[13px] text-mute">Ports</span>
                      <span className="flex flex-wrap gap-1.5 text-[12.5px] leading-none">
                        <span className="rounded-full bg-(--sky-tint) px-2.5 py-1.5 text-(--sky-accent)">
                          <span className="font-mono font-medium">1001</span> data exchange
                        </span>
                        <span className="rounded-full bg-(--sky-tint) px-2.5 py-1.5 text-(--sky-accent)">
                          <span className="font-mono font-medium">1002</span> event stream
                        </span>
                        <span className="rounded-full px-2.5 py-1.5 text-faint line-through shadow-[inset_0_0_0_1px_var(--color-edge-2)]">
                          others
                        </span>
                      </span>
                    </div>
                  ) : (
                  <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-3 gap-y-3 text-[13.5px]">
                    <span className="font-mono text-[11.5px] text-dim">members</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span aria-hidden className="grid grid-cols-[repeat(25,6px)] gap-[2px]">
                        {Array.from({ length: 50 }, (_, i) => (
                          <span key={i} className="size-[6px] border border-edge-3" />
                        ))}
                      </span>
                      <span className="font-mono text-[11.5px] whitespace-nowrap text-fg">max 50</span>
                    </span>
                    <span className="font-mono text-[11.5px] text-dim">ports</span>
                    <span className="flex flex-wrap gap-1.5 font-mono text-[11.5px]">
                      <span className="rounded-md border border-lime-ink/60 px-2 py-1 text-fg">
                        1001 <span className="text-dim">data exchange</span>
                      </span>
                      <span className="rounded-md border border-lime-ink/60 px-2 py-1 text-fg">
                        1002 <span className="text-dim">event stream</span>
                      </span>
                      <span className="rounded-md border border-dashed border-edge-2 px-2 py-1 text-faint line-through">
                        others
                      </span>
                    </span>
                  </div>
                  )}
                </Block>

                <Block k="identity" done={done("identity")} lit={focus === "identity"} onHover={setHover} title="identity provider">
                  <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[12.5px] text-fg">
                    oidc <span className="text-dim">·</span> login.example.com <span className="text-dim">· client</span> pilot
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-mute">
                    Tokens checked for issuer, audience and expiry against the JWKS.
                  </p>
                </Block>

                <Block k="audit" done={done("audit")} lit={focus === "audit"} onHover={setHover} title="audit export">
                  <p className="flex flex-wrap items-center gap-x-2 font-mono text-[12.5px] text-fg">
                    splunk_hec <span className="text-dim">→</span> splunk.example.com:8088
                  </p>
                </Block>

                <Block k="roles" done={done("roles")} lit={focus === "roles"} onHover={setHover} title="roles">
                  <p className="flex flex-wrap items-center gap-x-2 font-mono text-[12.5px] text-fg">
                    alice@example.com <span className="text-dim">→</span>
                    <span
                      className={
                        SKY
                          ? "rounded-full bg-(--sky-fill) px-2.5 py-1 font-sans text-[12px] leading-none font-medium text-white"
                          : "rounded-md bg-lime px-1.5 py-0.5 text-ink"
                      }
                    >
                      {SKY ? "Admin" : "admin"}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-mute">Applied when a node with that identity joins.</p>
                </Block>
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>
        </Frame>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: the network the file makes, drawn                         */
/* ------------------------------------------------------------------ */

/** A part of the picture: dim until the provision reaches it, lit (and its JSON lit) while it's the focus. */
function Part({
  k,
  done,
  focus,
  onHover,
  className = "",
  children,
}: {
  k: PartKey;
  done: (k: PartKey) => boolean;
  focus: PartKey | null;
  onHover: (k: PartKey | null) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-done={done(k)}
      data-lit={focus === k}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(k)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
      // Touch has no hover: a tap lights the part (and its lines in the file), a second tap clears it.
      onPointerUp={(e) => e.pointerType !== "mouse" && onHover(focus === k ? null : k)}
      className={`rounded-[12px] transition-[opacity,filter,box-shadow,background-color] duration-500 ease-(--ease-out) data-[done=false]:opacity-25 data-[done=false]:blur-[1.5px] data-[lit=true]:bg-(--sky-tint) data-[lit=true]:shadow-[0_0_0_1.5px_var(--sky-fill)] ${className}`}
    >
      {children}
    </div>
  );
}

/** A short vertical wire from the network down to a service it was given; the beam runs it as the part applies. */
function Drop({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 20 36" className="mx-auto block h-9 w-5 overflow-visible" aria-hidden>
      <path d="M10 0 L10 36" className="infra-wire" data-lit={on} />
      {on && <Beam d="M10 0 L10 36" run={1} duration={520} tail={24} width={1.5} />}
    </svg>
  );
}

/**
 * The network the blueprint describes, as a picture: the "ops" network with its join rule and enterprise flag, the
 * 50 seats its policy allows, the two ports it lets through, and alice's admin role inside it; under it, the two
 * services it's wired to, the identity provider and the audit export to Splunk. Each part fades in as the provision
 * applies it, and hovering one lights its lines of JSON.
 */
function NetworkPicture({
  done,
  focus,
  onHover,
  applied,
}: {
  done: (k: PartKey) => boolean;
  focus: PartKey | null;
  onHover: (k: PartKey | null) => void;
  applied: number;
}) {
  return (
    <div className="border-t border-(--sky-card-line) bg-[color-mix(in_srgb,var(--color-fg)_2.5%,var(--color-card))] px-4 py-6 sm:px-6">
      {/* The network itself. */}
      <div className="rounded-[18px] bg-card p-3 shadow-[0_0_0_1px_var(--sky-card-line),0_10px_24px_-14px_rgb(10_42_156/0.3)] sm:p-4">
        <Part k="network" done={done} focus={focus} onHover={onHover} className="flex flex-wrap items-center gap-3 p-1.5">
          <ObjTile name="nodes" size={40} lit={done("network")} />
          <span className="flex min-w-0 flex-[1_1_11rem] flex-col">
            <span className="text-[24px] leading-none font-medium tracking-[-0.04em] text-fg">ops</span>
            <span className="mt-1 text-[12.5px] leading-4 text-mute">Invited nodes have to accept</span>
          </span>
          <span className="flex flex-wrap gap-1.5 text-[12px] leading-none font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fg px-2.5 py-1.5 text-bg">
              <LockIcon className="size-3" /> Invite-only
            </span>
            <span
              onPointerEnter={(e) => e.pointerType === "mouse" && onHover("enterprise")}
              className={`rounded-full px-2.5 py-1.5 transition-[background-color,color,box-shadow] duration-500 ${
                done("enterprise") ? "bg-(--sky-fill) text-white" : "text-faint shadow-[inset_0_0_0_1px_var(--color-edge-2)]"
              }`}
            >
              Enterprise
            </span>
          </span>
        </Part>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Part k="policy" done={done} focus={focus} onHover={onHover} className="p-1.5">
            <p className="text-[12.5px] leading-4 text-mute">Seats, up to 50</p>
            <span aria-hidden className="mt-2 grid w-fit grid-cols-[repeat(25,7px)] gap-[3px]">
              {Array.from({ length: 50 }, (_, i) => (
                <span key={i} className={`size-[7px] rounded-full ${i === 0 && done("roles") ? "bg-(--sky-fill)" : "bg-fg/[0.12]"}`} />
              ))}
            </span>
            <p className="mt-3 text-[12.5px] leading-4 text-mute">Ports let through</p>
            <span className="mt-2 flex flex-wrap gap-1.5 text-[12px] leading-none">
              <span className="rounded-full bg-(--sky-tint) px-2.5 py-1.5 text-(--sky-accent)">
                <span className="font-mono font-medium">1001</span> data exchange
              </span>
              <span className="rounded-full bg-(--sky-tint) px-2.5 py-1.5 text-(--sky-accent)">
                <span className="font-mono font-medium">1002</span> event stream
              </span>
              <span className="rounded-full px-2.5 py-1.5 text-faint line-through shadow-[inset_0_0_0_1px_var(--color-edge-2)]">others</span>
            </span>
          </Part>
          <Part k="roles" done={done} focus={focus} onHover={onHover} className="flex items-center gap-2.5 p-1.5 sm:flex-col sm:items-start">
            <ObjTile name="user" size={36} />
            <span className="flex flex-col gap-1">
              <span className="font-mono text-[12px] leading-4 text-fg">alice@example.com</span>
              <span className="w-fit rounded-full bg-(--sky-fill) px-2.5 py-1 text-[12px] leading-none font-medium text-white">Admin</span>
            </span>
          </Part>
        </div>
      </div>

      {/* What it's wired to. */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Drop on={applied >= 4} />
          <Part k="identity" done={done} focus={focus} onHover={onHover} className="flex flex-col items-center gap-2 bg-card p-3 text-center shadow-[0_0_0_1px_var(--sky-card-line)]">
            <ObjTile name="idBadge" size={40} lit={done("identity")} />
            <span className="text-[13px] leading-4 font-medium text-fg">Identity provider</span>
            <span className="flex flex-col font-mono text-[11.5px] leading-4 text-mute">
              <span>oidc</span>
              <span>login.example.com</span>
            </span>
          </Part>
        </div>
        <div>
          <Drop on={applied >= 5} />
          <Part k="audit" done={done} focus={focus} onHover={onHover} className="flex flex-col items-center gap-2 bg-card p-3 text-center shadow-[0_0_0_1px_var(--sky-card-line)]">
            <span className="infra-tile" data-lit={done("audit")} style={{ width: 40, height: 40, borderRadius: 11 }}>
              <BrandMark brand="splunk" className="size-6" />
            </span>
            <span className="text-[13px] leading-4 font-medium text-fg">Audit export</span>
            <span className="flex flex-col font-mono text-[11.5px] leading-4 text-mute">
              <span>splunk_hec</span>
              <span>
                splunk.example.com<span className="max-sm:hidden">:8088</span>
              </span>
            </span>
          </Part>
        </div>
      </div>
    </div>
  );
}
