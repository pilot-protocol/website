"use client";

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { MoonIcon, SunIcon } from "@/components/icons";

// The <html> class is the source of truth (set before paint by the inline script in the layout).
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => true);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = !dark;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      apply(next);
      return;
    }
    // Reveal the new theme as a circle growing out of the button.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => {
      flushSync(() => apply(next));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.77, 0, 0.175, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className={`pressable relative grid size-10 place-items-center rounded-full text-soft hover:bg-fg/[0.06] hover:text-fg ${className}`}
    >
      <SunIcon
        className="col-start-1 row-start-1 size-[19px] transition-[opacity,filter,rotate,scale] duration-300 ease-(--ease-out) data-[off=true]:scale-50 data-[off=true]:-rotate-90 data-[off=true]:opacity-0 data-[off=true]:blur-[2px]"
        data-off={dark}
      />
      <MoonIcon
        className="col-start-1 row-start-1 size-[18px] transition-[opacity,filter,rotate,scale] duration-300 ease-(--ease-out) data-[off=true]:scale-50 data-[off=true]:rotate-90 data-[off=true]:opacity-0 data-[off=true]:blur-[2px]"
        data-off={!dark}
      />
    </button>
  );
}
