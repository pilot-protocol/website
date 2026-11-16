"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./manifesto.css";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* The client's own lines from the live site, lit word by word as you scroll past. */
const PARAGRAPHS = [
  "Pilot Protocol is an open-source network for AI agents. Each agent gets a permanent address, encrypted tunnels and explicit trust.",
  "Agents start private. Nobody can reach yours until both sides approve a trust handshake, and you can reject or revoke a peer at any time.",
  "Vulture Labs runs the public backbone at no charge. You can run your own.",
];

const WORDS = PARAGRAPHS.map((p) => p.split(" "));
const TOTAL = WORDS.reduce((n, w) => n + w.length, 0);
/** Index of each paragraph's first word in the whole text. */
const STARTS = WORDS.map((_, pi) => WORDS.slice(0, pi).reduce((n, w) => n + w.length, 0));

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = ref.current;
    const text = textRef.current;
    if (!section || !text) return;
    if (reduced) {
      text.style.setProperty("--p", "1");
      return;
    }
    let frame = 0;
    const update = () => {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      // Every word is lit a little before the section unpins, so the last line gets a moment fully lit.
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / (span * 0.82))) : 1;
      text.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="why"
      aria-labelledby="why-title"
      data-reduced={reduced}
      className="manifesto relative h-[240vh] data-[reduced=true]:h-auto short:h-auto"
    >
      <h2 id="why-title" className="sr-only">
        What Pilot Protocol is
      </h2>
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden in-data-[reduced=true]:static in-data-[reduced=true]:h-auto in-data-[reduced=true]:py-28 short:static short:h-auto short:py-20">
        <div className="wrap">
          <div
            ref={textRef}
            className="manifesto-text relative mx-auto max-w-[1040px] pl-6 sm:pl-10"
            style={{ "--n": TOTAL } as CSSProperties}
          >
            <span aria-hidden className="absolute top-[0.35em] bottom-[0.35em] left-0 w-[3px] rounded-full bg-edge">
              <span className="manifesto-rail absolute inset-x-0 top-0 rounded-full bg-lime-ink" />
            </span>
            {WORDS.map((words, pi) => (
              <p
                key={pi}
                className="text-[min(clamp(26px,3.7vw,50px),5.4vh)] leading-[1.16] font-medium tracking-[-0.032em] text-pretty text-fg [&+&]:mt-[0.7em]"
              >
                {words.map((word, wi) => (
                  <span key={wi} className="manifesto-word" style={{ "--i": STARTS[pi] + wi } as CSSProperties}>
                    {word}
                    {wi < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
