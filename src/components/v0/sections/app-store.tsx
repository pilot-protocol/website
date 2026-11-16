"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import { Terminal, type TermLine } from "@/components/terminal";
import { Command, Eyebrow, GhostButton, Reveal, TextLink } from "@/components/ui";
import { APPS, type App } from "@/lib/apps";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS, SITE_URL } from "@/lib/site";

// Only apps with their own artwork go on the rail.
const RAIL = APPS.filter((a) => a.icon);
const N = RAIL.length;
const SLOT = 92;
const TOUR_MS = 2800;

const PLAINWEB: TermLine[] = [
  { note: "# installed once with: pilotctl appstore install io.pilot.plainweb" },
  { cmd: `pilotctl appstore call io.pilot.plainweb plainweb.fetch '{"url":"https://example.com"}'` },
  { out: "{" },
  { out: '  "content_type": "text/markdown; charset=utf-8",' },
  { out: '  "content": "This domain is for use in documentation examples' },
  { out: "    without needing permission. This is not a service; avoid" },
  { out: '    relying on it for testing and monitoring purposes.\\n"' },
  { out: "}" },
];

function AppIcon({ app, size }: { app: App; size: number }) {
  if (app.icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={app.icon}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="rounded-[22%]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid place-items-center rounded-[22%] border border-current/15 font-mono font-medium"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {app.code}
    </span>
  );
}

/**
 * Three copies of the catalogue on one strip, slid so the featured app sits in
 * the white slot in the middle. `pos` only grows; once it leaves the middle copy
 * it's wrapped back without a transition, so the loop never visibly rewinds.
 */
function Rail({ pos, onPick, animate }: { pos: number; onPick: (p: number) => void; animate: boolean }) {
  const tiles = [0, 1, 2].flatMap((copy) => RAIL.map((app, i) => ({ app, p: copy * N + i })));
  return (
    <div className="relative h-[150px] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
      <div
        className="absolute top-1/2 left-1/2 flex"
        style={{
          transform: `translate(${-(pos + 0.5) * SLOT}px, -50%)`,
          transition: animate ? "transform 700ms var(--ease-in-out)" : "none",
        }}
      >
        {tiles.map(({ app, p }) => {
          const d = Math.abs(p - pos);
          const featured = d === 0;
          return (
            <button
              key={p}
              type="button"
              tabIndex={d <= 3 ? 0 : -1}
              aria-label={`Feature ${app.name}`}
              aria-pressed={featured}
              onClick={() => onPick(p)}
              className="grid shrink-0 place-items-center"
              style={{ width: SLOT, height: SLOT }}
            >
              <span
                className="grid size-16 place-items-center rounded-[2px] border transition-[scale,background-color,border-color,opacity,color] duration-700 ease-(--ease-in-out)"
                style={{
                  scale: featured ? 1.45 : 1,
                  backgroundColor: featured ? "#f2f2ec" : "#1a1a1a",
                  borderColor: featured ? "#f2f2ec" : "rgb(242 242 236 / 0.1)",
                  color: featured ? "#1a1a1a" : "#8a8a83",
                  opacity: featured ? 1 : Math.max(0.5, 1 - d * 0.08),
                }}
              >
                <AppIcon app={app} size={featured ? 40 : 36} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppStore() {
  const [pos, setPos] = useState(N); // first app, middle copy
  const [animate, setAnimate] = useState(true);
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-20% 0px" });
  const reduced = usePrefersReducedMotion();
  const wrapTimer = useRef<number>(undefined);

  useEffect(() => {
    if (!inView || held || reduced) return;
    const id = window.setInterval(() => setPos((p) => p + 1), TOUR_MS);
    return () => window.clearInterval(id);
  }, [inView, held, reduced]);

  // Once a slide has settled outside the middle copy, jump back into it invisibly.
  useEffect(() => {
    if (pos >= N && pos < 2 * N) return;
    window.clearTimeout(wrapTimer.current);
    wrapTimer.current = window.setTimeout(() => {
      setAnimate(false);
      setPos((p) => (((p % N) + N) % N) + N);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, 760);
    return () => window.clearTimeout(wrapTimer.current);
  }, [pos]);

  const app = RAIL[((pos % N) + N) % N];

  return (
    <section id="app-store" aria-labelledby="apps-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <Reveal className="relative overflow-hidden rounded-[2px] border border-edge">
          <div className="px-6 pt-14 text-center sm:pt-16">
            <Eyebrow index="03" className="justify-center">
              App Store
            </Eyebrow>
            <h2
              id="apps-title"
              className="mx-auto mt-5 max-w-[600px] text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg"
            >
              Apps your agent installs with one command.
            </h2>
          </div>

          <div ref={ref} className="relative mt-10 sm:mt-14">
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-edge-2">
              <span className="absolute -top-1 left-[14%] size-2 bg-lime" />
            </div>
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-edge-2">
              <span className="absolute -top-1 left-[78%] h-2 w-12 bg-lime" />
            </div>
            <Rail
              pos={pos}
              animate={animate}
              onPick={(p) => {
                setHeld(true);
                setPos(p);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-edge p-6 sm:p-8 md:border-r md:border-b-0" aria-live="polite">
              <div key={app.id} className="motion-safe:animate-[row-in_500ms_var(--ease-out)_both]">
                <p className="font-mono text-[12px] text-dim">
                  {app.publisher} · {[app.mac && "macOS", app.linux && "Linux"].filter(Boolean).join(" · ")}
                </p>
                <h3 className="mt-2 text-[24px] leading-tight font-medium tracking-[-0.03em] text-fg">{app.name}</h3>
                <p className="mt-2 min-h-[46px] max-w-[440px] text-[15px] leading-[1.5] text-mute">{app.description}</p>
                <Command
                  value={`pilotctl appstore install ${app.id}`}
                  prefix="$ "
                  className="mt-6"
                  label="Copy install command"
                />
                <div className="mt-4">
                  <TextLink href={`${SITE_URL}/apps/${app.id}`}>View {app.name}</TextLink>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <p className="flex items-start gap-2.5 text-[15px] leading-[1.5] text-mute">
                <CheckIcon className="mt-[4px] size-[13px] shrink-0 text-lime" />
                <span>
                  <span className="text-fg">Curated.</span> Every app is reviewed, SHA-256 pinned and signature-verified
                  before installation.
                </span>
              </p>
              <p className="mt-3 flex items-start gap-2.5 text-[15px] leading-[1.5] text-mute">
                <CheckIcon className="mt-[4px] size-[13px] shrink-0 text-lime" />
                <span>
                  <span className="text-fg">Mostly free.</span> A few are metered against a per-user USD 5 budget and
                  list their prices in their <code className="font-mono text-[13.5px] text-soft">help</code> method.
                </span>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-auto">
                <GhostButton href={LINKS.publish}>Publish your app</GhostButton>
                <TextLink href={LINKS.appStore}>Browse all {APPS.length} apps</TextLink>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal className="flex flex-col">
            <h3 className="text-[clamp(24px,2.4vw,30px)] leading-[1.15] font-medium tracking-[-0.03em] text-fg">
              JSON in, JSON out, over local IPC.
            </h3>
            <p className="mt-5 max-w-[440px] text-[16px] leading-[1.55] text-mute">
              Databases, microVMs and containers, reading and driving the web, search, email and phone, people data and
              paid APIs. Each app runs on your machine next to the daemon.
            </p>
            <p className="mt-4 max-w-[440px] text-[16px] leading-[1.55] text-mute">
              Payments are an app too: <span className="text-fg">Wallet</span> holds USDC on Base, Ethereum and
              Polygon, pays over x402 and enforces spend caps.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Terminal title="agent@node ~ call an app" lines={PLAINWEB} caption="Real output, recorded in October 2026." />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
