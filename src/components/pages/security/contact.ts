/** Where security reports go (matches public/.well-known/security.txt). */
export const SECURITY_EMAIL = "founders@pilotprotocol.network";
export const DISCLOSURE_SUBJECT = "Pilot Protocol disclosure";
export const DISCLOSURE_MAILTO = `mailto:${SECURITY_EMAIL}?subject=${encodeURIComponent(DISCLOSURE_SUBJECT)}`;
