# Pilot horizontal teaser

Standalone route: `/cloud-teaser`. This noindex preview is excluded from the sitemap and does not replace `/cloud` or `/cloud-landing`.

## Five-scene story

1. **The last chore you’ll ever do.** A full-screen café photograph and one line establish the promise: give the back-and-forth to your AI.
2. **Bring your AI.** Muse, Dots, Grok Bot, Hermes, and OpenClaw surround Pilot. MCP-compatible chat apps remain an explicit alternative.
3. **Your friend group, on autopilot.** Muse and Priya’s Dots arrange one dinner. The illustrative example labels both AIs as connected and requires human approval.
4. **New AI. Same handle.** The visitor can switch the example AI while the handle and link remain. The example is not a real profile.
5. **Less planning. More see you soon.** A reunion photograph closes on the human outcome. Claim your handle and invite a friend; Start now opens the Cloud app and Learn more opens `/cloud-landing`. Both people connect an AI.

Earnings, future business coverage, and ecosystem expansion are omitted. Their conditions need more room than a teaser affords. Product qualifications follow `docs/cloud-messaging.md`.

## Design and performance

One Inter Tight typeface, cream/clay colors, unframed photography, and sparse scenes replace the denser six-panel version. The café photograph is licensed stock; the reunion still comes from the existing Higgsfield film footage. Provenance is in `public/cloud/teaser/CREDITS.md`.

Native vertical document scrolling moves the story horizontally. Mandatory CSS snap points settle on full chapters; there is no wheel or touch interception, synthetic momentum, timed advance, background video, or soundtrack. Previous/next buttons and Left/Right keys are available. Inactive chapters are inert.

Supported desktop browsers drive the track with a native CSS scroll timeline. Touch devices always use the measured document scroll position, writing only the track transform once per animation frame. This avoids relying on CSS syntax support as evidence that the sticky track actually advances on iPhone Safari. Other unsupported browsers use the same transform path. The previous inherited per-panel custom-property writes and decorative parallax were removed. Chapter state changes only at boundaries; the progress bar does not animate on touch devices.

The stage uses stable small-viewport height. Height-only resize events on touch devices no longer rebuild the layout or call scrollTo when browser chrome expands or collapses. Real width changes remeasure after a short debounce. The final chapter reserves large-viewport scroll space. These changes address identifiable sources of lag; no physical-phone frame-rate measurement is claimed.

Reduced motion, short windows, or content that cannot fit automatically use the ordinary vertical page. All chapters are measured before horizontal enhancement enables. There is no reading-mode toggle. Without JavaScript, the complete story and destination links remain available. Local demo controls do not send messages or book anything.

Implementation references: [WebKit scroll-driven animations](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/), [Chrome scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [MDN scroll snapping](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type), and [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Verification — 25 October 2026

- Production build passes: 335 Astro pages plus generated error documents.
- Plain coverage passes: 100 required pairs.
- Site integrity passes: 339 HTML files and 24,447 internal references.
- `check:teaser` exercises the actual TypeScript controller in both native/fallback modes: 50 height-only mobile resize events cause no reconfiguration or scrollTo; 30 scroll frames cause zero native transform writes and exactly one per frame in the fallback; width changes preserve the chapter; reduced motion removes horizontal mode and inert states. The regression check runs in CI.
- Chrome desktop and 390×844 compositions were visually inspected. The 375×667 view fits all five scenes, including the dinner disclosure and final CTA. Native scrolling reaches complete chapters; the Muse-to-Dots switch retains the handle. The root class confirms the native scroll-timeline path is active.
- Chrome’s reduced-motion emulation exposes the full vertical story and removes chapter controls; the preference was restored afterward.
- Console inspection showed development-server messages, without application errors.
- The separate `/pilot-film` page was checked at 375×667 in both formats. It starts paused and provides downloads and the full transcript. No film asset loads on the teaser.

Browser checks include Chrome device emulation, not physical iPhone/Safari testing. The previous version’s 320×568 check is not claimed as a fresh visual check of this revision; the same short-window fallback remains covered by the controller logic.

### iPhone Safari frozen-slide follow-up

The founder reported that the new design loaded but stayed on its first slide while scrolling in iPhone Safari. Touch devices now bypass CSS scroll timelines even when CSS.supports returns true. The scroll handler directly positions the track using one transform per frame; it retains native scroll snapping and the height-only resize protection. The regression check now covers touch browsers both with and without advertised CSS timeline support, verifies the actual transform at every chapter, and confirms that the final CTA remains reachable after a width change. Desktop native/fallback paths and reduced motion still pass. This is a targeted compatibility fix; physical-iPhone confirmation remains with the reporter.
