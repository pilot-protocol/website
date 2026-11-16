"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BranchIcon, GitHubIcon, LockIcon } from "@/components/icons";
import { AppIcon, Button, Card, Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";

/* ---------------- The repository ---------------- */

const REPO = "pilot-protocol/pilotprotocol";
const TOPICS = ["peer-to-peer", "nat-traversal", "encryption", "virtual-addresses", "overlay-network"];
const TREE: { name: string; dir?: boolean; note?: string }[] = [
  { name: "cmd", dir: true, note: "daemon, pilotctl" },
  { name: "pkg", dir: true },
  { name: "internal", dir: true },
  { name: "catalogue", dir: true },
  { name: "LICENSE", note: "AGPL-3.0" },
];

function useRepo() {
  const [repo, setRepo] = useState({ stars: 148, forks: 20 });
  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ stargazers_count?: number; forks_count?: number }>) : null))
      .then((d) => {
        if (alive && typeof d?.stargazers_count === "number") {
          setRepo({ stars: d.stargazers_count, forks: d.forks_count ?? 20 });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return repo;
}

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
    <Card className="flex h-full flex-col overflow-hidden">
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
          <p className="mt-3 text-[14.5px] leading-[1.45] text-mute">Pilot Protocol: The Internet of Agents</p>
        </div>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[12px] text-mute shadow-[0_0_0_1px_var(--color-edge-2)]">
          Public
        </span>
      </div>

      <ul className="flex flex-wrap gap-1.5 px-5 sm:px-6">
        {TOPICS.map((t) => (
          <li key={t} className="rounded-full bg-lime/25 px-2.5 py-1 text-[12px] leading-none font-medium text-lime-ink dark:bg-lime/10">
            {t}
          </li>
        ))}
      </ul>

      <ul className="mx-5 mt-5 overflow-hidden rounded-[12px] shadow-[0_0_0_1px_var(--color-edge)] sm:mx-6">
        {TREE.map((f) => (
          <li key={f.name} className="flex items-center gap-3 border-b border-edge px-3.5 py-2.5 text-[13.5px] last:border-b-0">
            {f.dir ? <FolderIcon /> : <FileIcon />}
            <span className="text-fg">{f.name}</span>
            {f.note && <span className="ml-auto truncate text-[12.5px] text-dim">{f.note}</span>}
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
        <span className="flex items-center gap-1.5 tabular-nums">
          <StarIcon />
          {stars.toLocaleString("en-US")}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <BranchIcon className="size-3.5" />
          {forks.toLocaleString("en-US")}
        </span>
      </div>
    </Card>
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
  Admin: "bg-lime text-ink",
  Member: "text-soft shadow-[0_0_0_1px_var(--color-edge-2)]",
};

const POLICY: [string, string][] = [
  ["Membership cap", "Joins over the cap are refused"],
  ["Port allowlist", "Traffic to unlisted ports is dropped"],
  ["Key expiry", "Expired keys are refused at heartbeat"],
];

const EXPORTS = ["Splunk HEC", "CEF/syslog", "JSON"];

function Toggle({ on, delay }: { on: boolean; delay: number }) {
  return (
    <span
      aria-hidden
      data-on={on}
      style={{ transitionDelay: `${delay}ms` }}
      className="group/t relative inline-flex h-[22px] w-[38px] shrink-0 rounded-full bg-fg/12 transition-colors duration-300 ease-(--ease-out) data-[on=true]:bg-lime"
    >
      <span
        style={{ transitionDelay: `${delay}ms` }}
        className="absolute top-[3px] left-[3px] size-4 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-(--ease-out) group-data-[on=true]/t:translate-x-4"
      />
    </span>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="px-5 pt-5 pb-2 text-[12.5px] font-medium text-dim sm:px-6">{children}</p>;
}

function NetworkCard() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const [seenRef, seen] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  const reduced = usePrefersReducedMotion();
  const [sink, setSink] = useState(0);

  // The audit export destination cycles, as if an operator were trying each one.
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setSink((s) => (s + 1) % EXPORTS.length), 2400);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  const on = seen || reduced;

  return (
    <div ref={ref} className="h-full">
      <Card className="flex h-full flex-col overflow-hidden">
        <div ref={seenRef} className="flex items-start justify-between gap-4 border-b border-edge p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-ink text-lime shadow-tile">
              <LockIcon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[15.5px] font-medium text-fg">
                Your network
                <span className="rounded-full bg-fg/[0.07] px-2 py-0.5 text-[11.5px] font-medium text-soft">Private</span>
              </p>
              <p className="mt-0.5 text-[13.5px] text-mute">Joining needs a token or an invite.</p>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-soft shadow-[0_0_0_1px_var(--color-edge-2)] sm:flex">
            <span aria-hidden className="size-1.5 rounded-full bg-lime" />
            OIDC · JWT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-edge">
          <div className="pb-4">
            <Label>Members</Label>
            <ul className="px-2.5 sm:px-3.5">
              {MEMBERS.map((m, i) => (
                <li
                  key={m.name}
                  data-on={on}
                  style={{ transitionDelay: `${150 + i * 90}ms` }}
                  className="flex translate-y-1.5 items-center gap-3 rounded-[12px] px-2.5 py-2 opacity-0 blur-[3px] transition-[opacity,transform,filter] duration-600 ease-(--ease-out) data-[on=true]:translate-y-0 data-[on=true]:opacity-100 data-[on=true]:blur-none"
                >
                  <AppIcon src={m.icon} size={32} pad={m.pad} />
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg">{m.name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] leading-none font-medium ${ROLE_STYLE[m.role]}`}>
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
            <p className="px-5 pt-2 text-[12.5px] leading-[1.45] text-dim sm:px-6">
              Members reach each other without a separate handshake.
            </p>
          </div>
          <div className="border-t border-edge pb-2 md:border-t-0">
            <Label>Policy</Label>
            <ul className="px-5 sm:px-6">
              {POLICY.map(([title, note], i) => (
                <li key={title} className="flex items-center justify-between gap-4 border-b border-edge py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-[14px] text-fg">{title}</p>
                    <p className="text-[12.5px] text-dim">{note}</p>
                  </div>
                  <Toggle on={on} delay={500 + i * 160} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-edge bg-card-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <p className="text-[14px] text-fg">
            Audit export <span className="text-dim">· hash-chained registry events</span>
          </p>
          <div role="presentation" className="flex rounded-full bg-fg/[0.06] p-1">
            {EXPORTS.map((e, i) => (
              <span
                key={e}
                data-active={i === sink}
                className="rounded-full px-3 py-1.5 text-[12.5px] leading-none whitespace-nowrap text-mute transition-[background-color,color,box-shadow] duration-300 ease-(--ease-out) data-[active=true]:bg-card data-[active=true]:text-fg data-[active=true]:shadow-tile"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function OpenSource() {
  return (
    <section id="open-source" aria-labelledby="oss-title" className="py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="oss-title"
            title="Open source."
            muted="Run your own network."
            lede={
              <>
                The daemon, <code className="font-mono text-[0.88em] text-fg">pilotctl</code>, the registry and the beacon are
                all on GitHub under AGPL-3.0. Vulture Labs runs the public backbone, one registry and one beacon, at no charge.
                Run your own and you hold the admin token.
              </>
            }
          />
          <Reveal delay={80} className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 lg:pb-1">
            <Button href={LINKS.selfHosting}>Self-hosting guide</Button>
            <TextLink href={LINKS.github}>Source on GitHub</TextLink>
          </Reveal>
        </div>

        <Reveal delay={60} className="mt-14 rounded-[28px] bg-bg-deep p-2.5 sm:mt-16 sm:p-5 lg:p-8">
          <div className="grid grid-cols-1 gap-2.5 sm:gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <RepoCard />
            <NetworkCard />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
