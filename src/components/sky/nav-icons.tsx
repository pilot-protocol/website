import type { ReactNode } from "react";

/* Line icons for the Protocol menu (Nucleo UI outline, 18px), one per page; drawn in currentColor. */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const NAV_ICONS: Record<string, ReactNode> = {
  "/docs/concepts": (
    <>
      <path {...S} d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
      <path
        {...S}
        d="M16.25 9.35v-.7c0-.51-.38-.94-.89-1l-1.1-.12-.5-1.21.69-.86a1 1 0 0 0-.08-1.33l-.5-.5a1 1 0 0 0-1.33-.08l-.86.69-1.21-.5-.12-1.1a1 1 0 0 0-1-.89h-.7c-.51 0-.94.38-1 .89l-.12 1.1-1.21.5-.86-.69a1 1 0 0 0-1.33.08l-.5.5a1 1 0 0 0-.08 1.33l.69.86-.5 1.21-1.1.12c-.5.06-.89.49-.89 1v.71c0 .51.38.94.89 1l1.1.12.5 1.21-.69.86a1 1 0 0 0 .08 1.33l.5.5a1 1 0 0 0 1.33.08l.86-.69 1.21.5.12 1.1c.06.5.49.89 1 .89h.71c.51 0 .94-.38 1-.89l.12-1.1 1.21-.5.86.69a1 1 0 0 0 1.33-.08l.5-.5a1 1 0 0 0 .08-1.33l-.69-.86.5-1.21 1.1-.12c.5-.06.89-.49.89-1Z"
      />
    </>
  ),
  "/security": (
    <path
      {...S}
      d="M9.3 1.85l5.25 1.68c.42.13.7.52.7.95v6.52c0 3.03-4.68 4.75-5.94 5.16a1 1 0 0 1-.62 0c-1.26-.41-5.94-2.13-5.94-5.16V4.48c0-.43.28-.82.7-.95l5.25-1.68a1 1 0 0 1 .6 0Z"
    />
  ),
  "/self-hosting": (
    <>
      <rect {...S} x="1.75" y="2.75" width="14.5" height="5" rx="1.5" />
      <rect {...S} x="1.75" y="10.25" width="14.5" height="5" rx="1.5" />
      <circle cx="4.25" cy="5.25" r=".75" fill="currentColor" />
      <circle cx="6.75" cy="5.25" r=".75" fill="currentColor" />
      <circle cx="4.25" cy="12.75" r=".75" fill="currentColor" />
      <circle cx="6.75" cy="12.75" r=".75" fill="currentColor" />
    </>
  ),
  "/for/p2p": (
    <>
      <path {...S} d="M14.75 12.25v-1.5a2 2 0 0 0-2-2h-7.5a2 2 0 0 0-2 2v1.5M9 5.25v7" />
      <circle {...S} cx="3.25" cy="14" r="1.75" />
      <circle {...S} cx="14.75" cy="14" r="1.75" />
      <circle {...S} cx="9" cy="14" r="1.75" />
      <circle {...S} cx="9" cy="3.5" r="1.75" />
    </>
  ),
  "/for/compatibility": (
    <>
      <path {...S} d="M4.25 14.75a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h9.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2" />
      <path {...S} d="M.75 14.75h16.5" />
    </>
  ),
  "/learn": (
    <>
      <path {...S} d="M9 15.05c.17 0 .34-.04.49-.13.65-.37 1.74-.85 3.15-.85.9 0 1.66.2 2.27.44.65.25 1.34-.24 1.34-.94V4.49c0-.35-.18-.68-.49-.86a6.2 6.2 0 0 0-3.14-.87c-1.89 0-3.2.88-3.62 1.19" />
      <path {...S} d="M9 15.05c-.17 0-.34-.04-.49-.13-.65-.37-1.74-.85-3.15-.85-.9 0-1.66.2-2.27.44-.65.25-1.34-.24-1.34-.94V4.49c0-.35.18-.68.49-.86a6.2 6.2 0 0 1 3.14-.87c1.89 0 3.2.88 3.62 1.19v11.1Z" />
    </>
  ),
  "/docs/research": (
    <>
      <path {...S} d="M5.07 11.25h7.86M5.75 1.75h6.5" />
      <path {...S} d="M7.25 1.75V7l-3.63 7.07a1.5 1.5 0 0 0 1.34 2.18h8.09a1.5 1.5 0 0 0 1.33-2.18L10.75 7V1.75" />
    </>
  ),
};

/** The icon for a menu entry, in an 18px box. */
export function NavIcon({ href, className = "size-[18px]" }: { href: string; className?: string }) {
  const icon = NAV_ICONS[href];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 18 18" aria-hidden className={className}>
      {icon}
    </svg>
  );
}
