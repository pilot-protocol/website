"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isSky } from "@/components/page/sky";
import "@/components/sky/kit.css";
import "@/components/article/prose-sky.css";

/** Sky site: the kit's flat code blocks and images (src/components/article/prose-sky.css). */
const SKY_PROSE = isSky ? "sky-prose" : "";

/**
 * Renders migrated HTML with the site's prose styles and adds a copy button
 * to every code block. The HTML is sanitized at migration time
 * (scripts/migrate-content.py): semantic tags only, no scripts or handlers.
 */
function useCopyButtons(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const buttons: HTMLButtonElement[] = [];
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector("[data-copy]")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.copy = "";
      btn.setAttribute("aria-label", "Copy code");
      btn.textContent = "Copy";
      btn.className =
        "absolute top-2.5 right-2.5 rounded-md border border-edge-2 bg-card px-2 py-1 font-mono text-[11px] text-dim opacity-0 transition-opacity duration-200 hover:text-fg focus-visible:opacity-100 [pre:hover_&]:opacity-100";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText.replace(/\nCopied$|\nCopy$/, ""));
          btn.textContent = "Copied";
          window.setTimeout(() => (btn.textContent = "Copy"), 1400);
        } catch {}
      });
      pre.appendChild(btn);
      buttons.push(btn);
    });
    return () => buttons.forEach((b) => b.remove());
  }, [dep]);

  return ref;
}

export function Prose({ html, className = "" }: { html: string; className?: string }) {
  const ref = useCopyButtons(html);
  return <div ref={ref} className={`pp-prose ${SKY_PROSE} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Same styles and copy buttons around server-rendered children (Payload rich text). */
export function ProseShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useCopyButtons(children);
  return (
    <div ref={ref} className={`pp-prose ${SKY_PROSE} ${className}`}>
      {children}
    </div>
  );
}
