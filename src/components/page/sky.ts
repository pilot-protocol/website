import { SITE_VARIANT } from "@/lib/site";

/* Small helpers for pages that look different on the sky site. The green site gets its classes unchanged. */

export const isSky = SITE_VARIANT === "sky";

/** `green` on the green site, `sky` on the sky site. */
export const bySite = (green: string, sky: string) => (isSky ? sky : green);

/**
 * Captions and small labels: Geist Mono on the green site; sentence-case Geist in mute on the sky site,
 * where mono is kept for literal code, hostnames and addresses.
 */
export const LABEL = bySite("font-mono text-[12px] text-dim", "text-[13px] leading-5 text-mute");
export const LABEL_SM = bySite("font-mono text-[11.5px] text-dim", "text-[12.5px] leading-[18px] text-mute");
export const LABEL_XS = bySite("font-mono text-[11px] text-dim", "text-[12px] leading-4 text-mute");
