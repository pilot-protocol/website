"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";

const ITEMS = [
  { icon: "agents", text: "Reach other agents" },
  { icon: "data", text: "Query live data agents" },
  { icon: "apps", text: "Install apps with one command" },
  { icon: "sql", text: "Run SQL on a real database" },
  { icon: "microvm", text: "Run code in a microVM" },
  { icon: "phone", text: "Get its own phone number" },
  { icon: "sms", text: "Send an SMS" },
  { icon: "markdown", text: "Read any web page as Markdown" },
  { icon: "usdc", text: "Pay in USDC over x402" },
  { icon: "mcp", text: "Connect over MCP" },
];

/**
 * Figma "icon - trigger by scroll": a pinned list that lights up one line at a
 * time as you scroll, with that line's 3D icon set right after its last word.
 */
export function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(ITEMS.length - 1, Math.max(0, Math.floor(p * ITEMS.length))));
  });

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + span * ((i + 0.5) / ITEMS.length), behavior: "smooth" });
  }

  return (
    <section ref={ref} aria-labelledby="capabilities-title" className="relative h-[340vh] border-t border-edge">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="wrap [--row:min(clamp(36px,4.6vw,62px),calc((100dvh-180px)/10))]">
          <h2 id="capabilities-title" className="font-mono text-[13px] text-dim">
            With Pilot and the apps in its App Store, your agent can
          </h2>
          <ol className="mt-6">
            {ITEMS.map((item, i) => {
              const state = i === active ? "now" : i < active ? "done" : "next";
              return (
                <li key={item.icon} className="h-(--row)">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={state === "now" ? "step" : undefined}
                    data-state={state}
                    className="group flex h-full items-center text-left text-[min(clamp(22px,3.6vw,48px),calc(var(--row)*0.74))] leading-none font-medium tracking-[-0.035em] whitespace-nowrap text-graphite transition-colors duration-500 ease-(--ease-out) data-[state=done]:text-faint data-[state=now]:text-fg"
                  >
                    {item.text}
                    {i === ITEMS.length - 1 ? "." : ","}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/icons3d/${item.icon}.webp`}
                      alt=""
                      width={144}
                      height={144}
                      className="ml-[0.28em] size-[1.25em] -translate-y-[0.04em] -rotate-12 scale-60 object-contain opacity-0 blur-[6px] transition-[opacity,scale,rotate,filter] duration-500 ease-(--ease-out) group-data-[state=now]:scale-[1.35] group-data-[state=now]:rotate-0 group-data-[state=now]:opacity-100 group-data-[state=now]:blur-[0px]"
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
