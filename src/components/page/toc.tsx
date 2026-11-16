"use client";

import { useEffect, useState } from "react";
import { LABEL } from "@/components/page/sky";
import type { TocItem } from "@/lib/content";

/** "On this page", with the heading you're reading marked as you scroll. */
export function Toc({ items, className = "" }: { items: TocItem[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!headings.length) return;
    const onScroll = () => {
      let current = headings[0].id;
      for (const h of headings) if (h.getBoundingClientRect().top < 140) current = h.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className={className}>
      <p className={LABEL}>On this page</p>
      <ol className="mt-4 flex flex-col border-l border-edge">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={`relative -ml-px block border-l py-1.5 text-[13.5px] leading-[1.4] transition-colors duration-200 ${
                i.level === 3 ? "pl-7" : "pl-4"
              } ${active === i.id ? "border-lime-ink text-fg" : "border-transparent text-mute hover:text-fg"}`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
