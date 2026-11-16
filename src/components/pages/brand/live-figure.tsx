"use client";

import { bySite } from "@/components/page/sky";
import { LiveDot } from "@/components/ui";
import { approx, useStats } from "@/lib/stats";

/** The registry's live daemon count, the way the home page quotes it. */
export function LiveFigure() {
  const stats = useStats();
  return (
    <span className={`flex items-center gap-2.5 ${bySite("font-mono text-[12px] text-soft", "text-[14px] text-soft")}`}>
      <LiveDot /> {approx(stats.activeNodes)} daemons seen in 30 minutes
    </span>
  );
}
