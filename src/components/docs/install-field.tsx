"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { INSTALL_CMD } from "@/lib/site";

/*
 * The docs home's install command on the sky site (Figma 233:477): a flat white field with a hairline edge, the
 * one-liner in mono with `curl` in sky blue, then a divider and the copy button.
 */
export function InstallField({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={`flex max-w-full min-w-0 items-center gap-4 rounded-[10px] border border-(--sky-card-line) bg-card p-3 sm:gap-8 ${className}`}>
      <code
        // Scrolls sideways on a phone, so keyboard users can reach the rest of it.
        tabIndex={0}
        className="no-scrollbar min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-[18px] font-medium whitespace-nowrap text-soft sm:text-[16px]"
      >
        <span className="text-(--sky-fill) dark:text-(--sky-accent)">curl</span>
        {INSTALL_CMD.replace(/^curl/, "")}
      </code>
      <span className="flex shrink-0 items-center gap-2.5 self-stretch">
        <span aria-hidden className="w-px self-stretch bg-(--sky-card-line)" />
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy install command"}
          className="pressable -my-1.5 grid size-[30px] place-items-center rounded-[7px] text-fg/80 hover:bg-fg/[0.06] hover:text-fg"
        >
          <CopyIcon
            className="col-start-1 row-start-1 size-[14px] transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
            data-hidden={copied}
          />
          <CheckIcon
            className="col-start-1 row-start-1 size-[15px] text-(--sky-accent) transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
            data-hidden={!copied}
          />
        </button>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
