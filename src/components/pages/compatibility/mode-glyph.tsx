import type { Mode } from "@/components/pages/compatibility/data";
import { SKY } from "@/components/pages/security/kit";

/** Sky site: the same six marks, round and in sky blue, so they match the home page's dots. */
function SkyGlyph({ mode, className }: { mode: Mode | "auto"; className: string }) {
  const base = `inline-block size-2.5 shrink-0 rounded-full ${className}`;
  switch (mode) {
    case "udp":
      return <span aria-hidden className={`${base} bg-(--sky-fill)`} />;
    case "compat":
      return <span aria-hidden className={`${base} border-[1.5px] border-(--sky-fill)`} />;
    case "proxy":
      return (
        <span aria-hidden className={`${base} grid place-items-center border-[1.5px] border-(--sky-fill)`}>
          <span className="size-[3px] rounded-full bg-(--sky-fill)" />
        </span>
      );
    case "allowlist":
      return <span aria-hidden className={`${base} border-[1.5px] border-(--sky-fill) bg-[linear-gradient(90deg,var(--sky-fill)_50%,transparent_50%)]`} />;
    case "auto":
      return <span aria-hidden className={`${base} border-[1.5px] border-(--sky-fill) bg-[linear-gradient(135deg,var(--sky-fill)_50%,transparent_50%)]`} />;
    case "unshipped":
      return <span aria-hidden className={`${base} border-[1.5px] border-faint`} />;
    default:
      return (
        <svg aria-hidden viewBox="0 0 10 10" className={`size-2.5 shrink-0 text-dim ${className}`}>
          <circle cx="5" cy="5" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 8 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

/** One glyph per transport mode, used in the matrix, its legend and the worked examples. */
export function ModeGlyph({ mode, className = "" }: { mode: Mode | "auto"; className?: string }) {
  if (SKY) return <SkyGlyph mode={mode} className={className} />;
  const base = `inline-block size-2.5 shrink-0 ${className}`;
  switch (mode) {
    case "udp":
      return <span aria-hidden className={`${base} bg-lime`} />;
    case "compat":
      return <span aria-hidden className={`${base} border-[1.5px] border-lime-ink`} />;
    case "proxy":
      return (
        <span aria-hidden className={`${base} grid place-items-center border-[1.5px] border-lime-ink`}>
          <span className="size-[3px] bg-lime" />
        </span>
      );
    case "allowlist":
      return <span aria-hidden className={`${base} border-[1.5px] border-lime-ink bg-[linear-gradient(90deg,var(--color-lime)_50%,transparent_50%)]`} />;
    case "auto":
      return <span aria-hidden className={`${base} bg-[linear-gradient(135deg,var(--color-lime)_50%,transparent_50%)] ring-[1.5px] ring-lime ring-inset`} />;
    case "unshipped":
      return <span aria-hidden className={`${base} border-[1.5px] border-dashed border-faint`} />;
    default:
      return (
        <svg aria-hidden viewBox="0 0 10 10" className={`size-2.5 shrink-0 text-dim ${className}`}>
          <rect x="0.75" y="0.75" width="8.5" height="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 9 9 1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}
