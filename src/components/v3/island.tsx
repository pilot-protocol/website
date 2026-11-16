"use client";

import { useEffect, useState } from "react";
import { GitHubIcon } from "@/components/icons";
import { Button, Reveal, SectionHead, TextLink } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import { Containers, IsoBox, IsoScene, IsoTag, IsoTunnel, Laptop, Server, Tower } from "./iso";



const REPO = "pilot-protocol/pilotprotocol";

function useStars() {
  const [stars, setStars] = useState(148);
  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ stargazers_count?: number }>) : null))
      .then((d) => {
        if (alive && typeof d?.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return stars;
}

/* Self-hosting features from the self-hosting page, as they're named there. */
const FEATURES = [
  "Joining by token or invite",
  "Owner, admin and member roles",
  "OIDC and JWT",
  "Membership caps",
  "Port allowlists",
  "Audit export to Splunk HEC, CEF/syslog or JSON",
  "Blueprints",
  "Keys that expire",
];

const Z = 0.45;

/** The public backbone: one registry, one beacon and the machines that use them. */
function PublicIsland({ packets }: { packets: number }) {
  return (
    <IsoScene view={[-220, -110, 510, 360]} label="The public backbone: a registry and a beacon, with machines connected over tunnels.">
      <IsoBox x={0} y={0} w={8} d={6} h={Z} className="iso-ground" />
      <IsoTunnel points={[[1.9, 4.3, Z], [4.1, 3.95, Z]]} packets={packets} duration={2.6} />
      <IsoTunnel points={[[4.1, 3.95, Z], [6.65, 3.95, Z]]} packets={packets} duration={2.4} />
      <IsoTunnel points={[[4.1, 3.95, Z], [6.25, 1.55, Z]]} packets={packets} duration={3} />
      <Tower x={1} y={0.8} z={Z} kind="registry" />
      <Tower x={3.4} y={0.6} z={Z} kind="beacon" />
      <Laptop x={0.9} y={3.6} z={Z} />
      <Server x={5.6} y={0.9} z={Z} h={2} />
      <Containers x={3.2} y={3.4} z={Z} lime={-1} />
      <Laptop x={4.3} y={4.3} z={Z} />
      <Server x={6} y={3.3} z={Z} h={1.5} />
    </IsoScene>
  );
}

/** Your own network: your registry and beacon, a fence, a gate, and members with roles. */
function PrivateIsland({ packets }: { packets: number }) {
  return (
    <IsoScene
      view={[-190, -140, 410, 335]}
      label="Your private network: your own registry and beacon behind a fence, a gate that needs a token or an invite, and three members with owner, admin and member roles."
    >
      <IsoBox x={0} y={0} w={6} d={5} h={Z} className="iso-ground" />
      {/* Back fence */}
      <IsoBox x={0} y={0} z={Z} w={6} d={0.12} h={0.32} />
      <IsoBox x={0} y={0} z={Z} w={0.12} d={5} h={0.32} />

      <IsoTunnel points={[[1.9, 3.4, Z], [4.5, 3.45, Z]]} packets={packets} duration={2.4} />
      <IsoTunnel points={[[1.9, 3.4, Z], [4.85, 1.45, Z]]} packets={packets} duration={2.8} />
      <IsoTunnel points={[[4.85, 1.45, Z], [4.5, 3.45, Z]]} packets={packets} duration={2.2} />

      <Tower x={0.8} y={0.7} z={Z} kind="registry" />
      <Tower x={2.6} y={0.5} z={Z} kind="beacon" />
      <Laptop x={0.9} y={2.7} z={Z} lit />
      <Server x={4.2} y={0.8} z={Z} h={1.8} />
      <Containers x={3.6} y={2.9} z={Z} />

      {/* Front fence, with a gap for the gate */}
      <IsoBox x={0} y={4.88} z={Z} w={0.9} d={0.12} h={0.32} />
      <IsoBox x={2.13} y={4.88} z={Z} w={3.87} d={0.12} h={0.32} />
      <IsoBox x={5.88} y={0} z={Z} w={0.12} d={5} h={0.32} />
      {/* The gate */}
      <IsoBox x={0.9} y={4.82} z={Z} w={0.18} d={0.24} h={1} tone="ink" />
      <IsoBox x={1.95} y={4.82} z={Z} w={0.18} d={0.24} h={1} tone="ink" />
      <IsoBox x={0.9} y={4.82} z={Z + 1} w={1.23} d={0.24} h={0.16} tone="lime" />

      <IsoTag at={[2.1, 0.9, Z + 3.6]} label="Your registry and beacon" sub="you hold the admin token" />
      <IsoTag at={[1.9, 2.75, Z + 1.5]} label="claude-code" sub="Owner" logo="/harness/claude-color.svg" mono />
      <IsoTag at={[4.85, 1.45, Z + 2.8]} label="openclaw" sub="Admin" logo="/harness/openclaw.png" mono />
      <IsoTag at={[4.5, 3.45, Z + 1.85]} label="hermes" sub="Member" logo="/harness/hermes.png" mono />
      <IsoTag at={[1.5, 5, Z + 1.16]} label="Token or invite" tone="lime" />
    </IsoScene>
  );
}

export function Island() {
  const stars = useStars();
  const reduced = usePrefersReducedMotion();
  const packets = reduced ? 0 : 2;

  return (
    <section id="open-source" aria-labelledby="oss-title" className="overflow-hidden py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="oss-title"
            title="Open source."
            muted="Run your own network."
            lede={
              <>
                The daemon, <code className="font-mono text-[0.88em] text-fg">pilotctl</code>, the registry and the beacon
                are all on GitHub under AGPL-3.0. Vulture Labs runs the public backbone at no charge. Run your own and you
                hold the admin token.
              </>
            }
          />
          <Reveal delay={80} className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 lg:pb-1">
            <Button href={LINKS.selfHosting}>Self-hosting guide</Button>
            <a
              href={LINKS.github}
              className="pressable inline-flex h-10 items-center gap-2.5 rounded-[10px] bg-card px-3.5 text-[14px] font-medium text-fg shadow-tile hover:bg-card-2"
            >
              <GitHubIcon className="size-[18px]" />
              Source on GitHub
              <span className="flex items-center gap-1 rounded-full bg-fg/[0.06] px-2 py-0.5 text-[12px] text-mute tabular-nums">
                <svg viewBox="0 0 16 16" className="size-3" aria-hidden fill="currentColor">
                  <path d="M8 1.75l1.9 3.85 4.25.62-3.08 3 .73 4.23L8 11.45l-3.8 2 .73-4.23-3.08-3 4.25-.62L8 1.75z" />
                </svg>
                {stars.toLocaleString("en-US")}
              </span>
            </a>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 items-end gap-x-6 gap-y-14 sm:mt-20 lg:grid-cols-[51fr_46fr] lg:gap-x-10">
          <Reveal as="figure" className="mx-auto w-full max-w-[560px] opacity-90 lg:max-w-none">
            <PublicIsland packets={packets} />
            <figcaption className="mt-6 text-center text-[14px] leading-[1.45] text-mute">
              <span className="font-medium text-fg">The public backbone.</span> One registry and one beacon, run by Vulture
              Labs at no charge.
            </figcaption>
          </Reveal>
          <Reveal as="figure" delay={120} className="mx-auto w-full max-w-[520px] lg:max-w-none">
            <PrivateIsland packets={packets} />
            <figcaption className="mt-6 text-center text-[14px] leading-[1.45] text-mute">
              <span className="font-medium text-fg">Your network.</span> Your own registry and beacon, and only the members
              you let in.
            </figcaption>
          </Reveal>
        </div>

        <Reveal delay={60} className="mt-14 flex flex-col items-center gap-4 sm:mt-16">
          <p className="text-[14px] text-dim">What you control on your own network</p>
          <ul className="flex max-w-[860px] flex-wrap justify-center gap-2">
            {FEATURES.map((f) => (
              <li key={f} className="rounded-full bg-card px-3.5 py-1.5 text-[13.5px] text-soft shadow-tile">
                {f}
              </li>
            ))}
          </ul>
          <TextLink href={LINKS.selfHosting} className="mt-2">
            How self-hosting works
          </TextLink>
        </Reveal>
      </div>
    </section>
  );
}
