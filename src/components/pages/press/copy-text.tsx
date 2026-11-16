"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { bySite } from "@/components/page/sky";

/** A small "Copy" button for a block of text (the boilerplate, an email address). */
export function CopyText({ text, label, className = "" }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          return;
        }
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1600);
      }}
      className={`pressable inline-flex h-8 items-center gap-2 text-soft hover:text-fg ${bySite(
        "rounded-lg border border-edge-2 px-2.5 font-mono text-[12px] hover:border-edge-3",
        "rounded-full border border-(--sky-card-line) bg-card px-3 text-[13px] hover:border-fg/20",
      )} ${className}`}
    >
      {copied ? <CheckIcon className="size-[13px] text-lime-ink" /> : <CopyIcon className="size-[12px]" />}
      {copied ? "Copied" : label}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
