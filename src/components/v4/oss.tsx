"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BranchIcon, GitHubIcon, KeyIcon, LockIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { SKY_CARD } from "@/components/sky/kit";
import { AppIcon, Button, Reveal, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { useRepo } from "@/lib/github";
import { LINKS } from "@/lib/site";

/*
 * Open source: trust and control (Figma 211:13851). First the code itself (the repository, with live GitHub stars) and
 * what running your own registry gives you (a private network with members, roles, policy and an audit trail): two
 * flat bordered cards straight on the paper. Then the line between Pilot and your application, as a ledger in two
 * halves: what Pilot handles, and what you decide.
 */

/** The kit's flat card: white, a hairline border, 12px corners. */
const CARD = `${SKY_CARD} flex h-full flex-col overflow-hidden`;

/* ---------------- The repository ---------------- */

const TOPICS = ["peer-to-peer", "nat-traversal", "encryption", "virtual-addresses", "overlay-network"];
const TREE: { name: string; dir?: boolean; note?: string }[] = [
  { name: "cmd", dir: true, note: "daemon, pilotctl" },
  { name: "pkg", dir: true },
  { name: "internal", dir: true },
  { name: "catalogue", dir: true },
  { name: "LICENSE", note: "AGPL-3.0" },
];


function StarIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round">
      <path d="M8 1.75l1.9 3.85 4.25.62-3.08 3 .73 4.23L8 11.45l-3.8 2 .73-4.23-3.08-3 4.25-.62L8 1.75z" />
    </svg>
  );
}

function ScaleIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v12M4.5 14h7M2.5 4.5h11M8 2.75 2.5 4.5M8 2.75l5.5 1.75M2.5 4.5 1 9a1.6 1.6 0 0 0 3 0L2.5 4.5zM13.5 4.5 12 9a1.6 1.6 0 0 0 3 0l-1.5-4.5z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-dim" aria-hidden fill="currentColor">
      <path d="M1.75 3.5c0-.55.45-1 1-1h3.4l1.5 1.5h5.6c.55 0 1 .45 1 1v7.25c0 .55-.45 1-1 1H2.75c-.55 0-1-.45-1-1V3.5z" opacity="0.85" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-dim" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round">
      <path d="M3.5 1.75h6l3 3v9.5h-9V1.75zM9.5 1.75v3h3" />
    </svg>
  );
}

function RepoCard() {
  const { stars, forks } = useRepo();
  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <a
            href={LINKS.github}
            className="flex min-w-0 items-center gap-2.5 text-[15px] text-fg decoration-fg/30 underline-offset-[3px] hover:underline"
          >
            <GitHubIcon className="size-5 shrink-0" />
            <span className="truncate">
              <span className="text-mute">pilot-protocol /</span> <span className="font-medium">pilotprotocol</span>
            </span>
          </a>
          <p className="mt-3 text-[14.5px] leading-[21px] text-mute">Pilot Protocol: The Internet of Agents</p>
        </div>
        <span className="shrink-0 py-0.5 text-[12px] leading-[18px] text-mute">Public</span>
      </div>

      <ul className="flex flex-wrap gap-x-1 gap-y-1.5 px-5 sm:px-6">
        {TOPICS.map((t) => (
          <li key={t}>
            {/* As on GitHub: each topic opens its topic page. */}
            <a
              href={`https://github.com/topics/${t}`}
              className="block rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12px] leading-3 font-medium text-(--sky-accent) transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--sky-fill)_16%,transparent)]"
            >
              {t}
            </a>
          </li>
        ))}
      </ul>

      <ul className="mt-6 border-y border-edge">
        {TREE.map((f) => (
          <li key={f.name} className="border-b border-edge last:border-b-0">
            {/* Each row opens that folder or file in the repository, as GitHub's own listing does. */}
            <a
              href={`${LINKS.github}/${f.dir ? "tree" : "blob"}/main/${f.name}`}
              className="group/row flex items-center gap-3 px-5 py-2.5 text-[13.5px] leading-[20px] transition-colors duration-150 hover:bg-fg/[0.03] sm:px-6"
            >
              {f.dir ? <FolderIcon /> : <FileIcon />}
              <span className="text-fg decoration-fg/30 underline-offset-[3px] group-hover/row:underline">{f.name}</span>
              {f.note && <span className="ml-auto truncate text-[12.5px] text-dim">{f.note}</span>}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pt-5 pb-5 text-[13px] text-mute sm:px-6 sm:pb-6">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-[#00ADD8]" />
          Go
        </span>
        <span className="flex items-center gap-1.5">
          <ScaleIcon />
          AGPL-3.0
        </span>
        <a
          href={`${LINKS.github}/stargazers`}
          aria-label={`${stars.toLocaleString("en-US")} stars on GitHub`}
          className="flex items-center gap-1.5 tabular-nums transition-colors duration-150 hover:text-fg"
        >
          <StarIcon />
          {stars.toLocaleString("en-US")}
        </a>
        <a
          href={`${LINKS.github}/forks`}
          aria-label={`${forks.toLocaleString("en-US")} forks on GitHub`}
          className="flex items-center gap-1.5 tabular-nums transition-colors duration-150 hover:text-fg"
        >
          <BranchIcon className="size-3.5" />
          {forks.toLocaleString("en-US")}
        </a>
      </div>
    </div>
  );
}

/* ---------------- A private network on your own registry ---------------- */

const MEMBERS: { name: string; icon: string; pad?: boolean; role: "Owner" | "Admin" | "Member" }[] = [
  { name: "claude-code", icon: "/harness/claude-color.svg", pad: true, role: "Owner" },
  { name: "openclaw", icon: "/harness/openclaw.png", pad: true, role: "Admin" },
  { name: "hermes", icon: "/harness/hermes.png", role: "Member" },
];

const ROLE_STYLE = {
  Owner: "bg-fg text-bg",
  Admin: "bg-(--sky-fill) text-white",
  Member: "text-soft",
};

const POLICY: [string, string][] = [
  ["Membership cap", "Joins over the cap are refused"],
  ["Port allowlist", "Traffic to unlisted ports is dropped"],
  ["Key expiry", "Expired keys are refused at heartbeat"],
];

/* The three formats `pilotctl extras audit-export set --format …` takes (docs: enterprise-audit). */
const EXPORTS = [
  { label: "Splunk HEC", format: "splunk_hec", target: "Splunk HTTP Event Collector" },
  { label: "CEF/syslog", format: "syslog_cef", target: "ArcSight, QRadar, any CEF SIEM" },
  { label: "JSON", format: "json", target: "Any HTTP endpoint" },
];

/** A policy switch. It turns on by itself as the card comes into view; after that it's yours to flip. */
function Toggle({ on, delay, label, onFlip }: { on: boolean; delay: number; label: string; onFlip: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onFlip}
      data-on={on}
      style={{ transitionDelay: `${delay}ms` }}
      className="group/t relative inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full bg-fg/12 transition-colors duration-300 ease-(--ease-out) outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--sky-fill) data-[on=true]:bg-(--sky-fill)"
    >
      <span
        style={{ transitionDelay: `${delay}ms` }}
        className="absolute top-[3px] left-[3px] size-4 rounded-full bg-white shadow-(--shadow-tile) transition-transform duration-300 ease-(--ease-out) group-data-[on=true]/t:translate-x-4 motion-reduce:transition-none"
      />
    </button>
  );
}

function Label({ children, tag }: { children: ReactNode; tag?: string }) {
  return (
    <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 pt-5 pb-2 text-[13px] leading-[19.5px] text-mute sm:px-6">
      {children}
      {tag && <span className="py-0.5 text-[12px] leading-4 whitespace-nowrap text-mute">{tag}</span>}
    </p>
  );
}

function NetworkCard() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const [seenRef, seen] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  const reduced = usePrefersReducedMotion();
  const [sink, setSink] = useState(0);
  // Once someone picks a format themselves, the card stops trying them on its own.
  const [picked, setPicked] = useState(false);
  // Policy switches someone has flipped (null: still the card's own state).
  const [flipped, setFlipped] = useState<(boolean | null)[]>(() => POLICY.map(() => null));

  // The audit export destination cycles, as if an operator were trying each one.
  useEffect(() => {
    if (!inView || reduced || picked) return;
    const id = window.setInterval(() => setSink((s) => (s + 1) % EXPORTS.length), 2400);
    return () => window.clearInterval(id);
  }, [inView, reduced, picked]);

  const on = seen || reduced;
  const pick = (i: number) => {
    setPicked(true);
    setSink(i);
  };

  return (
    <div ref={ref} className="h-full">
      <div className={CARD}>
        <div ref={seenRef} className="flex items-start justify-between gap-4 border-b border-edge p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-(--sky-fill) text-white shadow-(--shadow-tile)">
              <LockIcon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[15.5px] font-medium text-fg">
                Your network
                <span className="rounded-full bg-fg/[0.07] px-2 py-0.5 text-[11.5px] leading-[17px] font-medium text-soft">Private</span>
              </p>
              <p className="mt-0.5 text-[13.5px] leading-[20px] text-pretty text-mute">On your own registry. Joining needs a token or an invite.</p>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 py-1 text-[12px] leading-[18px] font-medium text-soft sm:flex">
            <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
            OIDC · JWT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-edge">
          <div className="pb-4">
            <Label tag="No handshake between members">Members</Label>
            <ul className="px-2.5 sm:px-3.5">
              {MEMBERS.map((m, i) => (
                <li
                  key={m.name}
                  data-on={on}
                  style={{ transitionDelay: `${150 + i * 90}ms` }}
                  className="flex translate-y-1.5 items-center gap-3 rounded-[12px] px-2.5 py-2 opacity-0 blur-[3px] transition-[opacity,transform,filter] duration-600 ease-(--ease-out) data-[on=true]:translate-y-0 data-[on=true]:opacity-100 data-[on=true]:blur-none motion-reduce:translate-y-0 motion-reduce:blur-none"
                >
                  <AppIcon src={m.icon} size={32} pad={m.pad} className="shadow-(--shadow-tile)!" />
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg">{m.name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] leading-none font-medium ${ROLE_STYLE[m.role]}`}>
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-edge pb-2 md:border-t-0">
            <Label>Policy</Label>
            <ul className="px-5 sm:px-6">
              {POLICY.map(([title, note], i) => {
                const isOn = flipped[i] ?? on;
                return (
                  <li key={title} className="flex items-center justify-between gap-4 border-b border-edge py-3 last:border-b-0">
                    <div className="min-w-0">
                      <p className="text-[14px] leading-[21px] text-fg">{title}</p>
                      <p className="text-[12.5px] leading-[19px] text-dim">{note}</p>
                    </div>
                    <Toggle
                      on={isOn}
                      delay={flipped[i] === null ? 500 + i * 160 : 0}
                      label={title}
                      onFlip={() => setFlipped((f) => f.map((v, j) => (j === i ? !isOn : v)))}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-auto border-t border-edge bg-card-2 p-5 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start xl:flex-row xl:items-center">
            <p id="oss-audit-label" className="text-[14px] text-fg">
              Audit export <span className="text-dim">· hash-chained registry events</span>
            </p>
            <div
              role="radiogroup"
              aria-labelledby="oss-audit-label"
              className="flex rounded-full bg-fg/[0.06] p-1"
              onKeyDown={(e) => {
                const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                if (!step) return;
                e.preventDefault();
                const next = (sink + step + EXPORTS.length) % EXPORTS.length;
                pick(next);
                (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
              }}
            >
              {EXPORTS.map((e, i) => (
                <button
                  key={e.format}
                  type="button"
                  role="radio"
                  aria-checked={i === sink}
                  tabIndex={i === sink ? 0 : -1}
                  onClick={() => pick(i)}
                  data-active={i === sink}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] leading-none whitespace-nowrap text-mute transition-[background-color,color,box-shadow] duration-300 ease-(--ease-out) outline-offset-1 hover:text-fg focus-visible:outline-2 focus-visible:outline-(--sky-fill) data-[active=true]:bg-card data-[active=true]:text-fg data-[active=true]:shadow-(--shadow-tile)"
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          {/* What picking a format does: the command that sets it, and what it feeds. */}
          <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[12px] leading-[18px] text-mute">
            <span className="min-w-0">
              <span className="text-dim">$ </span>pilotctl extras audit-export set --format{" "}
              <span key={EXPORTS[sink].format} className="text-(--sky-accent) motion-safe:animate-[row-in_300ms_var(--ease-out)_both]">
                {EXPORTS[sink].format}
              </span>
            </span>
            <span className="font-sans text-[12px] text-dim">{EXPORTS[sink].target}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- What Pilot handles, and what you decide ---------------- */

const HANDLES: [string, string][] = [
  ["Identity", "An Ed25519 keypair per agent"],
  ["Encryption", "X25519 and AES-256-GCM per tunnel"],
  ["Trust", "A handshake both sides approve"],
  ["Reachability", "Direct through NAT, or relayed"],
];

const DECIDES: [string, string][] = [
  ["Permissions", "What a trusted peer may ask for"],
  ["Spending", "Budgets, and apps that cost money"],
  ["Approvals", "When a person signs off first"],
  ["Data", "What leaves, and what stays"],
];

/** One half of the ledger: a grey band with its mark and title, then four hairline rows of term and plain answer. */
function Half({ title, mark, rows }: { title: string; mark: ReactNode; rows: [string, string][] }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 bg-fg/[0.05] px-5 pt-5 pb-4 sm:px-6">
        {mark}
        <h4 className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{title}</h4>
      </div>
      <dl className="border-t border-edge">
        {rows.map(([term, answer]) => (
          <div
            key={term}
            className="flex flex-col gap-0.5 border-b border-edge px-5 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
          >
            <dt className="text-[15px] leading-6 tracking-[-0.015em] text-fg">{term}</dt>
            <dd className="text-[14.5px] leading-6 tracking-[-0.013em] text-mute sm:text-right">{answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* A content-wide hairline that fades out at both ends, above and below the ledger. */
const FADE_LINE =
  "pointer-events-none absolute inset-x-0 h-px bg-[linear-gradient(90deg,transparent,var(--sky-rule-ink)_25%,var(--sky-rule-ink-mid)_50%,var(--sky-rule-ink)_75%,transparent)]";

/* The dashed line between the halves, fading out at its ends: down the middle on a wide screen, across on a narrow one. */
const DASH_FADE =
  "pointer-events-none absolute bg-[repeating-linear-gradient(var(--dash-dir),var(--sky-rule-ink-mid)_0_4px,transparent_4px_8px)] [mask-image:linear-gradient(var(--dash-dir),transparent,#000_20%,#000_80%,transparent)]";

function TrustSplit() {
  return (
    <div id="security" className="mt-20 scroll-mt-24 sm:mt-[88px]">
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12">
        <h3 className="text-[clamp(30px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg">
          Private until <span className="text-mute">both sides approve.</span>
        </h3>
        <TextLink href={LINKS.security} className="shrink-0 md:pb-1">
          Read the security page
        </TextLink>
      </Reveal>
      <Reveal delay={80} className="relative mt-10 sm:mt-12">
        <span aria-hidden className={`${FADE_LINE} top-0`} />
        <div className="grid grid-cols-1 py-8 lg:grid-cols-2 lg:py-10">
          <div className="pb-8 lg:pr-10 lg:pb-0">
            <Half
              title="Pilot handles"
              rows={HANDLES}
              mark={
                <span className="grid size-8 place-items-center rounded-[9px] bg-(--sky-fill) text-white shadow-(--shadow-tile)">
                  <PilotMarkP className="h-[14px] w-auto" />
                </span>
              }
            />
          </div>
          <div className="relative pt-8 lg:pt-0 lg:pl-10">
            <span aria-hidden className={`${DASH_FADE} inset-x-0 top-0 h-px [--dash-dir:to_right] lg:hidden`} />
            <span
              aria-hidden
              className={`${DASH_FADE} -top-10 -bottom-10 left-0 hidden w-px [--dash-dir:to_bottom] lg:block`}
            />
            <Half
              title="You decide"
              rows={DECIDES}
              mark={
                <span className="grid size-8 place-items-center rounded-[9px] bg-fg/[0.06] text-fg">
                  <KeyIcon className="size-[15px]" />
                </span>
              }
            />
          </div>
        </div>
        <span aria-hidden className={`${FADE_LINE} bottom-0`} />
      </Reveal>
    </div>
  );
}

export function OpenSourceD() {
  return (
    <section id="open-source" aria-labelledby="oss-d-title" className="py-20 sm:py-24 lg:py-[104px]">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-[640px]">
            <h2
              id="oss-d-title"
              className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
            >
              Open source. <span className="block text-mute">Run your own network.</span>
            </h2>
            <p className="mt-6 max-w-[520px] text-[17px] leading-[1.5] text-pretty text-mute sm:mt-8 sm:text-[18px]">
              The daemon,{" "}
              <code className="rounded-[2px] bg-fg/10 px-1 py-[3px] font-mono text-[13px] leading-[1.3] text-fg/80">pilotctl</code>, the registry and the beacon are
              all on GitHub under AGPL-3.0. Vulture Labs runs the public backbone, one registry and one beacon, at no
              charge. Run your own and you hold the admin token.
            </p>
          </Reveal>
          <Reveal delay={80} className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 lg:pb-1">
            <Button href={LINKS.selfHosting}>Self-hosting guide</Button>
            <TextLink href={LINKS.github}>Source on GitHub</TextLink>
          </Reveal>
        </div>

        <Reveal delay={60} className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <RepoCard />
          <NetworkCard />
        </Reveal>

        <TrustSplit />
      </div>
    </section>
  );
}
