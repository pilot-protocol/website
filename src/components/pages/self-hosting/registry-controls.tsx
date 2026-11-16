"use client";

import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { Code, FLAT_CARD, SectionHead, SKY, Soft } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { SKY_ART } from "@/components/pages/self-hosting/controls-sky";
import { Reveal, SmartLink } from "@/components/ui";
import { useInView } from "@/lib/hooks";
import "./self-hosting.css";

/*
 * "Controls in the open-source code": twelve cells, each with a small drawing
 * of how the control actually behaves, using the numbers from the source
 * (1,000 audit events, 100 dead letters, 5-minute JWKS cache, 30-day invites).
 */

const LINE = "stroke-fg/24";
const FAINT = "stroke-fg/14";
const T = "fill-dim font-mono text-[10.5px]";
const TF = "fill-fg font-mono text-[10.5px]";
const TL = "fill-lime-ink font-mono text-[10.5px]";

function Sq({ x, y, s = 8, lime, hollow }: { x: number; y: number; s?: number; lime?: boolean; hollow?: boolean }) {
  return (
    <rect
      x={x - s / 2}
      y={y - s / 2}
      width={s}
      height={s}
      className={hollow ? `fill-none ${LINE}` : lime ? "fill-lime" : "fill-fg"}
    />
  );
}

function Cross({ x, y, s = 4 }: { x: number; y: number; s?: number }) {
  return <path d={`M${x - s} ${y - s} l${2 * s} ${2 * s} M${x + s} ${y - s} l${-2 * s} ${2 * s}`} className="stroke-mute" strokeWidth={1.4} />;
}

function Tick({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 4} ${y} l3 3 l5 -6`} className="fill-none stroke-lime-ink" strokeWidth={1.5} />;
}

const Networks = (
  <>
    <rect x={92} y={10} width={160} height={80} rx={3} className={`fill-none ${LINE}`} strokeDasharray="3 4" />
    <text x={102} y={26} className={T}>
      network
    </text>
    <path d="M138 62 L186 44 L222 70 Z" className={`fill-none ${LINE}`} />
    <Sq x={138} y={62} />
    <Sq x={186} y={44} />
    <Sq x={222} y={70} />
    {(
      [
        ["open", 26],
        ["token", 50],
        ["invite", 74],
      ] as const
    ).map(([t, y]) => (
      <g key={t}>
        <text x={8} y={y + 4} className={t === "invite" ? TL : TF}>
          {t}
        </text>
        <path d={`M58 ${y} H88`} className={FAINT} strokeDasharray="2 3" />
        <path d={`M84 ${y - 3} l4 3 l-4 3`} className={`fill-none ${LINE}`} />
      </g>
    ))}
  </>
);

const Roles = (
  <>
    {(
      [
        ["owner", 22, 1],
        ["admin", 50, 2],
        ["member", 78, 6],
      ] as const
    ).map(([t, y, n]) => (
      <g key={t}>
        <text x={8} y={y + 4} className={t === "owner" ? TF : T}>
          {t}
        </text>
        {Array.from({ length: n }, (_, i) => (
          <Sq key={i} x={74 + i * 16} y={y} lime={t === "owner"} />
        ))}
      </g>
    ))}
    <path d="M176 70 V30" className={`fill-none ${LINE}`} />
    <path d="M172 34 l4 -5 l4 5" className={`fill-none ${LINE}`} />
    <path d="M188 30 V70" className={`fill-none ${LINE}`} />
    <path d="M184 66 l4 5 l4 -5" className={`fill-none ${LINE}`} />
    <text x={200} y={40} className={T}>
      promote
    </text>
    <text x={200} y={66} className={T}>
      demote
    </text>
  </>
);

const Oidc = (
  <>
    <rect x={8} y={30} width={98} height={40} rx={2} className={`fill-none ${LINE}`} />
    <text x={18} y={47} className={TF}>
      JWT
    </text>
    <text x={18} y={61} className={T}>
      RS256 · HS256
    </text>
    {(["iss", "aud", "exp"] as const).map((c, i) => (
      <g key={c}>
        <text x={120} y={30 + i * 22} className={TF}>
          {c}
        </text>
        <Tick x={154} y={26 + i * 22} />
      </g>
    ))}
    <rect x={174} y={18} width={82} height={64} rx={2} className={`fill-none ${LINE}`} strokeDasharray="3 4" />
    <text x={182} y={36} className={TF}>
      JWKS
    </text>
    <text x={182} y={54} className={T}>
      by key ID
    </text>
    <text x={182} y={70} className={TL}>
      cached 5 min
    </text>
  </>
);

const Directory = (
  <>
    {(
      [
        ["alice@example.com", "admin", false],
        ["bob@example.com", "member", false],
        ["not in the file", "removed", true],
      ] as const
    ).map(([who, role, gone], i) => {
      const y = 22 + i * 26;
      return (
        <g key={who}>
          <text x={8} y={y + 4} className={gone ? T : TF} textDecoration={gone ? "line-through" : undefined}>
            {who}
          </text>
          <path d={`M138 ${y} H176`} className={FAINT} strokeDasharray="2 3" />
          <rect x={182} y={y - 9} width={70} height={18} rx={2} className={gone ? `fill-none ${FAINT}` : `fill-none ${LINE}`} />
          <text x={217} y={y + 4} textAnchor="middle" className={gone ? T : role === "admin" ? TL : TF}>
            {role}
          </text>
        </g>
      );
    })}
  </>
);

const Policy = (
  <>
    <text x={8} y={22} className={T}>
      members
    </text>
    {Array.from({ length: 10 }, (_, i) => (
      <Sq key={i} x={82 + i * 15} y={18} lime={false} hollow={i > 7} />
    ))}
    <path d="M232 10 V26" className="stroke-lime-ink" strokeWidth={1.5} />
    <text x={238} y={22} className={TL}>
      cap
    </text>
    <text x={8} y={64} className={T}>
      ports
    </text>
    {(
      [
        ["1001", 82, true],
        ["1002", 130, true],
        ["other", 178, false],
      ] as const
    ).map(([p, x, ok]) => (
      <g key={p}>
        <rect x={x - 4} y={48} width={42} height={24} rx={2} className={ok ? "fill-none stroke-lime-ink" : `fill-none ${FAINT}`} />
        <text x={x + 17} y={64} textAnchor="middle" className={ok ? TF : T}>
          {p}
        </text>
      </g>
    ))}
    <Cross x={234} y={60} />
    <text x={8} y={92} className={T}>
      unlisted ports are dropped
    </text>
  </>
);

const Audit = (
  <>
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect x={8 + i * 22} y={26} width={14} height={14} className={i === 5 ? "fill-lime" : `fill-none ${LINE}`} />
        {i < 5 && <path d={`M${22 + i * 22} 33 H${30 + i * 22}`} className={LINE} />}
      </g>
    ))}
    <text x={8} y={60} className={T}>
      1,000 events, hash-chained
    </text>
    <path d="M150 33 H176" className={LINE} />
    <path d="M172 29 l4 4 l-4 4" className={`fill-none ${LINE}`} />
    {(["splunk_hec", "syslog_cef", "json"] as const).map((f, i) => (
      <text key={f} x={184} y={22 + i * 15} className={i === 0 ? TF : T}>
        {f}
      </text>
    ))}
    <text x={8} y={88} className={T}>
      3 tries
    </text>
    {[0, 8, 24].map((dx, i) => (
      <rect key={i} x={62 + dx} y={81} width={4} height={8} className="fill-mute" />
    ))}
    <text x={104} y={88} className={T}>
      exponential backoff
    </text>
  </>
);

const Webhooks = (
  <>
    <Sq x={14} y={36} lime />
    <text x={4} y={62} className={T}>
      event
    </text>
    <path d="M24 36 H98" className={LINE} strokeDasharray="3 4" />
    {[44, 62, 80].map((x) => (
      <Cross key={x} x={x} y={36} s={3} />
    ))}
    <rect x={102} y={22} width={64} height={28} rx={2} className={`fill-none ${LINE}`} />
    <text x={134} y={40} textAnchor="middle" className={TF}>
      webhook
    </text>
    <path d="M134 50 V66 H186" className={`fill-none ${LINE}`} />
    <path d="M182 62 l4 4 l-4 4" className={`fill-none ${LINE}`} />
    <rect x={190} y={52} width={62} height={28} rx={2} className="fill-none stroke-lime-ink" />
    <text x={221} y={70} textAnchor="middle" className={TL}>
      DLQ · 100
    </text>
    <text x={4} y={92} className={T}>
      keeps the last 100 failed events
    </text>
  </>
);

const Blueprints = (
  <>
    <path d="M8 14 H54 L66 26 V86 H8 Z" className={`fill-none ${LINE}`} />
    <path d="M54 14 V26 H66" className={`fill-none ${LINE}`} />
    <text x={16} y={46} className={TF}>
      {"{ }"}
    </text>
    <text x={16} y={62} className={T}>
      .json
    </text>
    <path d="M74 50 H134" className={LINE} />
    <path d="M130 46 l4 4 l-4 4" className={`fill-none ${LINE}`} />
    <text x={74} y={42} className={T}>
      provision
    </text>
    <rect x={138} y={14} width={118} height={72} rx={3} className="fill-none stroke-lime-ink" strokeDasharray="3 4" />
    {["join rule", "policy · roles", "identity · audit"].map((l, i) => (
      <text key={l} x={146} y={36 + i * 18} className={i === 0 ? TF : T}>
        {l}
      </text>
    ))}
  </>
);

const Keys = (
  <>
    <path d="M8 44 H252" className={LINE} />
    <Sq x={30} y={44} s={10} />
    <text x={18} y={26} className={T}>
      key
    </text>
    <path d="M58 36 q16 -18 32 0" className="fill-none stroke-lime-ink" />
    <path d="M86 32 l4 4 l-4 3" className="fill-none stroke-lime-ink" />
    <text x={52} y={66} className={TL}>
      signed rotate
    </text>
    <Sq x={116} y={44} s={10} lime />
    <text x={104} y={26} className={T}>
      key′
    </text>
    <path d="M186 30 V58" className="stroke-fg" strokeWidth={1.5} />
    <text x={168} y={24} className={TF}>
      expiry
    </text>
    <Cross x={226} y={44} />
    <text x={146} y={78} className={T}>
      heartbeat refused
    </text>
  </>
);

const Invites = (
  <>
    <Sq x={18} y={40} />
    <text x={6} y={64} className={T}>
      owner
    </text>
    <path d="M30 40 H70" className={LINE} />
    <rect x={74} y={30} width={22} height={20} rx={1} className={`fill-none ${LINE}`} />
    <path d="M74 31 l11 9 l11 -9" className={`fill-none ${LINE}`} />
    <path d="M100 40 H134" className={LINE} strokeDasharray="3 4" />
    <rect x={138} y={26} width={68} height={28} rx={2} className={`fill-none ${LINE}`} strokeDasharray="3 4" />
    <text x={172} y={44} textAnchor="middle" className={T}>
      pending
    </text>
    <path d="M210 40 H226" className={LINE} />
    <Tick x={238} y={40} />
    <text x={214} y={64} className={TL}>
      accept
    </text>
    <path d="M138 74 H206" className={FAINT} />
    <path d="M138 70 V78 M206 70 V78" className={LINE} />
    <text x={172} y={92} textAnchor="middle" className={TF}>
      30 days
    </text>
  </>
);

const Standby = (
  <>
    <rect x={8} y={26} width={76} height={40} rx={2} className={`fill-none ${LINE}`} />
    <text x={46} y={50} textAnchor="middle" className={TF}>
      primary
    </text>
    <rect x={176} y={26} width={76} height={40} rx={2} className="fill-none stroke-lime-ink" strokeDasharray="3 4" />
    <text x={214} y={50} textAnchor="middle" className={TL}>
      standby
    </text>
    <path d="M84 46 H176" className={LINE} />
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={84}
        y={42}
        width={8}
        height={8}
        className="fill-lime kit-motion sh-wal"
        style={{ animationDelay: `${i * 0.6}s` }}
      />
    ))}
    <text x={130} y={36} textAnchor="middle" className={T}>
      WAL
    </text>
    <text x={8} y={88} className={T}>
      -standby · -repl-token
    </text>
  </>
);

const Dashboard = (
  <>
    <rect x={8} y={10} width={130} height={80} rx={2} className={`fill-none ${LINE}`} />
    <text x={18} y={28} className={TF}>
      -http
    </text>
    {[22, 34, 18, 46, 30, 52, 40].map((h, i) => (
      <rect key={i} x={20 + i * 16} y={80 - h} width={9} height={h} className={i === 5 ? "fill-lime" : "fill-fg/24"} />
    ))}
    <text x={150} y={32} className={T}>
      public-stats
    </text>
    <text x={150} y={46} className={T}>
      JSON
    </text>
    <text x={150} y={70} className={TF}>
      per-network:
    </text>
    <text x={150} y={84} className={TL}>
      -dashboard-token
    </text>
  </>
);

type Cell = { cat: string; title: string; art: ReactNode; body: ReactNode; href: string };

const CELLS: Cell[] = [
  {
    cat: "Membership",
    title: "Private networks",
    art: Networks,
    body: "Open, token or invite-only join rules; invite-only needs the network’s enterprise flag. Members reach each other without a separate trust handshake.",
    href: "/docs/networks",
  },
  {
    cat: "Administration",
    title: "Owner, admin, member",
    art: Roles,
    body: "Owners promote and demote admins and can transfer ownership. Owners and admins invite and remove members. A per-network admin token delegates one network.",
    href: "/docs/enterprise-rbac",
  },
  {
    cat: "Identity",
    title: "OIDC/JWT with JWKS",
    art: Oidc,
    body: "Tokens checked for issuer, audience and expiry. Other providers connect through an identity webhook you run, with HMAC-signed requests.",
    href: "/docs/enterprise-identity",
  },
  {
    cat: "Identity",
    title: "Directory sync",
    art: Directory,
    body: (
      <>
        Set roles from a directory file, pre-assign roles to identities that haven’t joined, and with{" "}
        <Code>--remove-unlisted</Code> remove members who aren’t in it.
      </>
    ),
    href: "/docs/enterprise-identity",
  },
  {
    cat: "Policy",
    title: "Network policy",
    art: Policy,
    body: "A membership cap and a port allowlist per network: joins over the cap are refused. Versioned expression policies add rules, with admin-assigned member tags as inputs.",
    href: "/docs/enterprise-policies",
  },
  {
    cat: "Evidence",
    title: "Audit export",
    art: Audit,
    body: "Registry changes are recorded as structured events and exported in Splunk HEC, CEF or JSON format.",
    href: "/docs/enterprise-audit",
  },
  {
    cat: "Evidence",
    title: "Webhooks with a DLQ",
    art: Webhooks,
    body: "Registry events go to your webhook with retries. Events that still fail land in a dead-letter queue you can read back.",
    href: "/docs/enterprise-audit",
  },
  {
    cat: "Provisioning",
    title: "Blueprints",
    art: Blueprints,
    body: (
      <>
        One JSON file describes a network. Apply it with <Code>pilotctl extras provision</Code>.
      </>
    ),
    href: "#blueprint",
  },
  {
    cat: "Keys",
    title: "Rotation and expiry",
    art: Keys,
    body: "Nodes rotate their keys with a signed request. You can set an expiry per node; a node whose key has expired is refused at heartbeat.",
    href: "/docs/enterprise-rbac",
  },
  {
    cat: "Membership",
    title: "Invites with consent",
    art: Invites,
    body: "On an invite-only network the invited node has to accept. Pending invites expire after 30 days.",
    href: "/docs/networks",
  },
  {
    cat: "Operations",
    title: "Hot standby",
    art: Standby,
    body: "Every change goes through a write-ahead log. A hot standby, authenticated with a replication token, replicates from the primary.",
    href: "https://github.com/pilot-protocol/rendezvous",
  },
  {
    cat: "Operations",
    title: "Dashboard",
    art: Dashboard,
    body: "A live dashboard and the same public-stats JSON the public backbone publishes. Per-network figures need a dashboard token.",
    href: "https://github.com/pilot-protocol/rendezvous",
  },
];

const WIDE = new Set(["Private networks", "Audit export", "Hot standby", "Dashboard"]);

function ControlsHead() {
  return (
    <SectionHead
      id="controls-title"
      kicker="What’s in the registry"
      title={
        <>
          Controls in the <Soft>open-source code.</Soft>
        </>
      }
      lede="All of these work on a registry you run. The reference docs cover each one in detail."
    />
  );
}

/**
 * Sky site (Figma 233:1195, the app store panel 213:20181): the heading and twelve flat cards on one hatched
 * showcase panel, each control drawn as a small piece of the UI it amounts to.
 */
function SkyControls() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  return (
    <section aria-labelledby="controls-title" className="pb-24 sm:pb-32">
      <div className="wrap">
        <HatchPanel className="px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
          <SectionHead
            center
            id="controls-title"
            title={
              <>
                Controls in the <span className="block text-mute">open-source code.</span>
              </>
            }
            lede="All of these work on a registry you run. The reference docs cover each one in detail."
          />
          <div
            ref={ref}
            data-play={inView}
            className="sh-play mt-12 grid grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {CELLS.map((c, i) => {
              // A bento, not a grid of twelve equal cards: four of them run two columns wide on the widest screens,
              // the drawing on one side and the words on the other.
              const wide = WIDE.has(c.title);
              return (
                <Reveal key={c.title} delay={(i % 4) * 50} className={`flex ${wide ? "xl:col-span-2" : ""}`}>
                  <SmartLink
                    href={c.href}
                    className={`group flex w-full flex-col p-5 sm:p-6 ${wide ? "xl:grid xl:grid-cols-2 xl:items-center xl:gap-8" : ""} ${FLAT_CARD}`}
                  >
                    <span aria-hidden className={`flex min-h-[104px] flex-col justify-center ${wide ? "xl:order-2" : ""}`}>
                      {SKY_ART[c.title]}
                    </span>
                    <span className="flex flex-col">
                      <span className={`mt-5 flex items-center justify-between text-[13px] leading-5 text-mute ${wide ? "xl:mt-0" : ""}`}>
                        {c.cat}
                        <ArrowUpRightIcon className="size-3 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--sky-accent)" />
                      </span>
                      <span className="mt-1 text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{c.title}</span>
                      <span className="mt-1.5 text-[14px] leading-[1.55] text-pretty text-mute">{c.body}</span>
                    </span>
                  </SmartLink>
                </Reveal>
              );
            })}
          </div>
        </HatchPanel>
      </div>
    </section>
  );
}

export function RegistryControls() {
  return SKY ? <SkyControls /> : <GreenControls />;
}

function GreenControls() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  return (
    <section aria-labelledby="controls-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <ControlsHead />
        <div
          ref={ref}
          data-play={inView}
          className="sh-play mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {CELLS.map((c, i) => (
            <Reveal key={c.title} delay={(i % 4) * 50} className="bg-bg">
              <SmartLink
                href={c.href}
                className="group flex h-full flex-col p-5 transition-colors duration-300 hover:bg-fg/[0.03] sm:p-6"
              >
                <span className="flex items-center justify-between font-mono text-[12px] text-dim">
                  {c.cat}
                  <ArrowUpRightIcon className="size-3 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime-ink" />
                </span>
                <svg viewBox="0 0 260 100" className="mt-5 h-auto w-full max-w-[320px]" aria-hidden>
                  {c.art}
                </svg>
                <span className="mt-6 text-[17px] font-medium tracking-[-0.015em] text-fg">{c.title}</span>
                <span className="mt-1.5 text-[14px] leading-[1.55] text-mute">{c.body}</span>
              </SmartLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
