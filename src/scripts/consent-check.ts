// Consent check utilities for analytics modules.
// Shared between BaseHead (GA4) and analytics.ts (PostHog).
// Listens for the 'pilot-consent-change' custom event.
// Also checks localStorage on load for late-initializing scripts.

const CONSENT_KEY = 'pilot_consent';

type Consent = 'accepted' | 'rejected' | null;
type Listener = (value: Consent) => void;

let cachedConsent: Consent = null;
const listeners: Listener[] = [];

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'accepted') return 'accepted';
    if (v === 'rejected') return 'rejected';
    return null;
  } catch {
    return null;
  }
}

// Initialize on load
cachedConsent = readConsent();

// Subscribe to future changes
window.addEventListener('pilot-consent-change', ((e: CustomEvent) => {
  cachedConsent = e.detail as Consent;
  listeners.forEach((fn) => fn(cachedConsent));
}) as EventListener);

export function getConsent(): Consent {
  return cachedConsent;
}

export function onConsentChange(fn: Listener): () => void {
  listeners.push(fn);
  // Fire immediately with current value if already set
  if (cachedConsent) fn(cachedConsent);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function hasConsent(): boolean {
  return cachedConsent === 'accepted';
}
