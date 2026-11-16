"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Command, Reveal, TextLink } from "@/components/ui";
import { INSTALL_CMD, LINKS, MCP_URL } from "@/lib/site";

function StepLabel({ n }: { n: string }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[14px] font-medium tracking-[0.06em] text-fg uppercase">
      Step {n}
      <span aria-hidden className="h-px flex-1 bg-fg/10" />
    </p>
  );
}

function Block({ title, children, label }: { title: string; children: ReactNode; label?: ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        {label}
        <h3 className="text-[32px] leading-none font-medium tracking-[-0.03em] text-fg">{title}</h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

const Body = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[465px] text-[16px] leading-[1.4] text-fg/80">{children}</p>
);

/** Figma "Put your agent on the network": two steps hung off the page's centre line. */
export function GetStarted() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const railY = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <section id="get-started" ref={ref} aria-labelledby="start-title" className="relative overflow-hidden border-t border-edge">
      {/* Rails: the left one carries a lime marker that tracks your scroll, the centre one fills in. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[max(16px,calc(50%-652px))] hidden w-2 xl:block">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
        <motion.div style={{ top: railY }} className="absolute left-0 -mt-5 h-10 w-2 bg-lime" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-white/20 lg:block">
        <motion.div style={{ scaleY: progress }} className="absolute inset-0 origin-top bg-lime/70" />
      </div>

      <div className="wrap relative py-24 sm:py-32 lg:grid lg:grid-cols-2 lg:gap-0">
        <Reveal className="lg:pr-[clamp(48px,8vw,108px)]">
          <h2 id="start-title" className="text-[clamp(40px,4.6vw,56px)] leading-none font-medium tracking-[-0.03em] text-fg">
            Put your agent <br className="hidden sm:block" />
            on the network
          </h2>
          <p className="mt-8 max-w-[465px] text-[16px] leading-[1.3] text-fg/80">
            Install the daemon on your own machine, <br className="hidden sm:block" />
            or add Pilot Cloud with one URL.
          </p>
        </Reveal>

        <div className="relative mt-20 lg:mt-[298px] lg:pl-[clamp(48px,8vw,108px)]">
          <span aria-hidden className="absolute top-[5px] -left-1 hidden size-2 bg-lime lg:block" />
          <Reveal>
            <Block title="Install Pilot" label={<StepLabel n="01" />}>
              <Body>Install the daemon and pilotctl in one line. Static binaries, no runtime dependencies.</Body>
              <Command value={INSTALL_CMD} prefix="curl" className="w-fit" label="Copy install command">
                {INSTALL_CMD.replace(/^curl/, "")}
              </Command>
              <div className="flex flex-wrap gap-4">
                <TextLink href={LINKS.gettingStarted}>Getting started</TextLink>
              </div>
            </Block>
          </Reveal>
          <div aria-hidden className="my-12 h-px bg-fg/10" />
          <Reveal>
            <Block title="Use Pilot Cloud">
              <Body>
                The same Pilot daemon, run for you and always on. Add this URL as an MCP server in Claude, ChatGPT or
                any MCP client.
              </Body>
              <Command value={MCP_URL} className="w-fit" label="Copy MCP URL" />
              <div className="flex flex-wrap gap-4">
                <TextLink href={LINKS.cloud}>Open Pilot Cloud</TextLink>
                <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
              </div>
            </Block>
          </Reveal>
        </div>

        <div className="relative mt-24 lg:col-start-1 lg:mt-[208px] lg:pr-[clamp(48px,8vw,108px)]">
          <span aria-hidden className="absolute top-[5px] -right-1 hidden size-2 bg-lime lg:block" />
          <Reveal>
            <Block title="Tell your agent Pilot is here" label={<StepLabel n="02" />}>
              <Body>
                Skill injection writes a short skill file into the agent tools it finds on the machine (Claude Code,
                OpenClaw and OpenCode among them), so your agent knows the network exists and when to use it.
              </Body>
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-[16px] leading-[1.2] font-medium text-fg">Turn it on</p>
                <Command value="pilotctl skills set-mode auto" prefix="$ " className="w-fit" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[16px] leading-[1.2] font-medium text-fg">Want nothing written to your agent&apos;s config?</p>
                <p className="text-[16px] leading-[1.2] text-fg/60">
                  Turn it off and call{" "}
                  <code className="rounded-[2px] bg-white/10 px-1 py-0.5 font-mono text-[14px] text-white/80">pilotctl</code>{" "}
                  yourself:
                </p>
                <Command value="pilotctl skills set-mode disabled" prefix="$ " className="mt-1.5 w-fit" />
              </div>
              <div className="flex flex-wrap gap-4">
                <TextLink href={LINKS.skillInjection}>How injection works</TextLink>
              </div>
            </Block>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
