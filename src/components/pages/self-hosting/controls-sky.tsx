"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, XIcon } from "@/components/icons";
import { ObjTile, Stage, Tile, WIRE } from "@/components/pages/security/infra";
import { Beam } from "@/components/sky/beam";
import { AppIcon } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * The sky site's drawings for "Controls in the open-source code": each control as a small piece of real-looking UI
 * (pills, rows, a segmented control, a capacity strip) with the real objects and marks in it (the agents, the
 * identity card, the directory file, Splunk, the two servers of a hot standby), using the numbers from the source
 * (1,000 audit events, 100 dead letters, 5-minute JWKS cache, 30-day invites, a 50-member cap).
 */

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[12px] leading-none font-medium whitespace-nowrap";
const INK = `${PILL} bg-fg text-bg`;
const SKY = `${PILL} bg-(--sky-fill) text-white`;
const TINT = `${PILL} bg-(--sky-tint) text-(--sky-accent)`;
const QUIET = `${PILL} bg-fg/[0.06] text-soft`;
const RING = `${PILL} text-mute shadow-[inset_0_0_0_1px_var(--color-edge-2)]`;
const OFF = `${PILL} text-faint line-through shadow-[inset_0_0_0_1px_var(--color-edge)]`;
const NOTE = "text-[12.5px] leading-[1.4] text-dim";
const MONO = "font-mono text-[12px] text-fg";

function Arrow() {
  return <ArrowRightIcon aria-hidden className="size-3 shrink-0 text-faint" />;
}

const Networks = (
  <div className="flex flex-col gap-3.5">
    <div className="flex w-fit gap-0.5 rounded-[6px] bg-fg/[0.05] p-[3px] text-[12px] leading-none font-medium">
      <span className="rounded-[3px] px-2.5 py-[6px] text-soft">Open</span>
      <span className="rounded-[3px] px-2.5 py-[6px] text-soft">Token</span>
      <span className="rounded-[3px] bg-[#1a1a1a] px-2.5 py-[6px] text-white dark:bg-[#f2f2ec] dark:text-[#141413]">Invite-only</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="flex gap-1.5">
        <AppIcon src="/harness/claude-color.svg" size={26} pad />
        <AppIcon src="/harness/openclaw.png" size={26} pad />
        <AppIcon src="/harness/hermes.png" size={26} />
      </span>
      <span className={NOTE}>Members reach each other</span>
    </div>
  </div>
);

const Roles = (
  <ul className="flex flex-col gap-2">
    {(
      [
        ["claude-code", "claude", "Owner", INK],
        ["openclaw", "openclaw", "Admin", SKY],
        ["hermes", "hermes", "Member", RING],
      ] as const
    ).map(([name, brand, role, cls]) => (
      <li key={name} className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <Tile size={22}>
            <BrandMark brand={brand as Brand} className="size-3" />
          </Tile>
          <span className={MONO}>{name}</span>
        </span>
        <span className={cls}>{role}</span>
      </li>
    ))}
  </ul>
);

const Oidc = (
  <div className="flex flex-col gap-3">
    <p className="flex items-center gap-2.5">
      <ObjTile name="idBadge" size={30} />
      <span className={MONO}>JWT</span>
      <span className={NOTE}>RS256 · HS256</span>
    </p>
    <div className="flex flex-wrap gap-1.5">
      {["iss", "aud", "exp"].map((c) => (
        <span key={c} className={TINT}>
          <CheckIcon aria-hidden className="size-3" />
          <span className="font-mono">{c}</span>
        </span>
      ))}
    </div>
    <p className={NOTE}>Keys from your JWKS, cached 5 min</p>
  </div>
);

const Directory = (
  <ul className="flex flex-col gap-2">
    {(
      [
        ["alice@example.com", "Admin", SKY],
        ["bob@example.com", "Member", RING],
        ["not in the file", "Removed", OFF],
      ] as const
    ).map(([who, role, cls], i) => (
      <li key={who} className="flex items-center justify-between gap-3">
        <span className={i === 2 ? "text-[12.5px] whitespace-nowrap text-faint line-through" : `${MONO} truncate`}>{who}</span>
        <span className={cls}>{role}</span>
      </li>
    ))}
  </ul>
);

const Policy = (
  <div className="flex flex-col gap-3.5">
    <div className="flex items-center gap-2.5">
      <span aria-hidden className="flex gap-[3px]">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={`size-2 rounded-full ${i < 8 ? "bg-fg/70" : "shadow-[inset_0_0_0_1px_var(--color-edge-3)]"}`}
          />
        ))}
      </span>
      <span className={TINT}>Cap</span>
    </div>
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={TINT}>
        <span className="font-mono">1001</span>
      </span>
      <span className={TINT}>
        <span className="font-mono">1002</span>
      </span>
      <span className={OFF}>other</span>
    </div>
    <p className={NOTE}>Unlisted ports are dropped</p>
  </div>
);

const Audit = (
  <div className="flex flex-col gap-3.5">
    <div className="flex items-center">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`size-3.5 rounded-[4px] ${i === 5 ? "bg-(--sky-fill)" : "shadow-[inset_0_0_0_1.5px_var(--color-edge-3)]"}`}
          />
          {i < 5 && <span className="h-[1.5px] w-2.5 bg-edge-3" />}
        </span>
      ))}
      <ArrowRightIcon aria-hidden className="mx-2 size-3 shrink-0 text-faint" />
      <span className="infra-tile overflow-hidden" style={{ width: 64, height: 30, borderRadius: 9 }}>
        <BrandMark brand="splunk" className="size-9" />
      </span>
    </div>
    <p className={NOTE}>1,000 events, hash-chained</p>
    <div className="flex w-fit gap-0.5 rounded-[6px] bg-fg/[0.05] p-[3px] text-[12px] leading-none font-medium">
      <span className="rounded-[3px] bg-[#1a1a1a] px-2.5 py-[6px] text-white dark:bg-[#f2f2ec] dark:text-[#141413]">Splunk HEC</span>
      <span className="rounded-[3px] px-2.5 py-[6px] text-soft">CEF</span>
      <span className="rounded-[3px] px-2.5 py-[6px] text-soft">JSON</span>
    </div>
  </div>
);

const Webhooks = (
  <div className="flex flex-col gap-3.5">
    <div className="flex items-center gap-2">
      <ObjTile name="webhook" size={30} />
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="grid size-5 place-items-center rounded-full text-mute shadow-[inset_0_0_0_1px_var(--color-edge-2)]"
          >
            <XIcon aria-hidden className="size-2.5" />
          </span>
        ))}
      </span>
      <Arrow />
      <ObjTile name="archive" size={30} />
    </div>
    <p className={NOTE}>Retried with backoff, then held with the last 100 failures</p>
  </div>
);

const Blueprints = (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <ObjTile name="file" size={30} />
      <span className="font-mono text-[12px] text-mute">.json</span>
      <Arrow />
      <ObjTile name="nodes" size={30} lit />
      <span className={INK}>ops</span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {["Join rule", "Policy", "Roles", "Identity", "Audit"].map((t) => (
        <span key={t} className={RING}>
          {t}
        </span>
      ))}
    </div>
  </div>
);

const Keys = (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <ObjTile name="key" size={30} dim />
      <Arrow />
      <ObjTile name="key" size={30} lit />
      <span className={SKY}>New key</span>
      <span className={NOTE}>signed</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={QUIET}>Expired key</span>
      <Arrow />
      <span className={RING}>
        <XIcon aria-hidden className="size-2.5" />
        Refused
      </span>
    </div>
  </div>
);

const Invites = (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-3 rounded-[12px] py-2 pr-2 pl-3 shadow-[inset_0_0_0_1px_var(--color-edge-2)]">
      <span className="min-w-0 text-[12.5px] leading-tight text-fg">
        Invite to <span className="font-mono text-[12px]">ops</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span className={QUIET}>Pending</span>
        <span className={SKY}>Accept</span>
      </span>
    </div>
    <p className={NOTE}>Expires after 30 days</p>
  </div>
);

/** The primary streams its write-ahead log to the standby: two servers, the log travelling between them. */
function StandbyArt() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1100);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  const wire = "M22 22 L178 22";
  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className="w-[200px]">
        <Stage
          w={200}
          h={64}
          svg={
            <>
              <path d={wire} className={WIRE} data-lit />
              {inView && <Beam key={tick} d={wire} run={tick} duration={900} tail={36} width={1.5} />}
            </>
          }
        >
          <span className="absolute top-0 left-0 flex flex-col items-center gap-1.5">
            <ObjTile name="server" size={44} lit />
            <span className="text-[11.5px] leading-none text-mute">Primary</span>
          </span>
          <span className="absolute top-0 right-0 flex flex-col items-center gap-1.5">
            <ObjTile name="server" size={44} />
            <span className="text-[11.5px] leading-none text-mute">Standby</span>
          </span>
        </Stage>
      </div>
      <p className={NOTE}>
        Write-ahead log, <span className="font-mono text-[11.5px]">-repl-token</span>
      </p>
    </div>
  );
}

const Standby = <StandbyArt />;

const Dashboard = (
  <div className="flex items-end gap-4">
    <span aria-hidden className="flex h-[64px] items-end gap-[5px]">
      {[22, 34, 18, 46, 30, 58, 40].map((h, i) => (
        <span
          key={i}
          className={`w-[9px] rounded-[3px] ${i === 5 ? "bg-(--sky-fill)" : "bg-fg/[0.12]"}`}
          style={{ height: h }}
        />
      ))}
    </span>
    <span className="flex flex-col gap-1.5 pb-0.5">
      <span className={NOTE}>public-stats JSON</span>
      <span className="font-mono text-[11.5px] text-mute">-dashboard-token</span>
    </span>
  </div>
);

export const SKY_ART: Record<string, ReactNode> = {
  "Private networks": Networks,
  "Owner, admin, member": Roles,
  "OIDC/JWT with JWKS": Oidc,
  "Directory sync": Directory,
  "Network policy": Policy,
  "Audit export": Audit,
  "Webhooks with a DLQ": Webhooks,
  Blueprints,
  "Rotation and expiry": Keys,
  "Invites with consent": Invites,
  "Hot standby": Standby,
  Dashboard,
};
