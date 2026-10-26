# Pilot horizontal teaser

Standalone route: `/cloud-teaser`. This noindex preview is excluded from the sitemap and does not replace `/cloud` or `/cloud-landing`.

## Seven-scene story

1. **What would you do with 20% more time?** A complete hypothetical question over café photography. It is not a claim about measured time lost or Pilot savings. No product marks appear yet.
2. **How does a “quick question” turn into 30 minutes?** Eight conversational asks appear together: coffee, an introduction, availability, work, feedback, a plumber, a designer and a pitch. The question is rhetorical, not a measured average.
3. **Let us help.** “Make this the last time you do these chores.” The campaign turn follows the request wall.
4. **One link. That’s it.** The URL prefix and @maya share one visual container. Your handle gives people a way to reach your agent. You connect your AI, share the link and decide who gets in. Supported-agent marks and the both-people-connect qualification remain.
5. **Put the back-and-forth on autopilot.** Priya’s agent asks yours for coffee. You approve the proposal. This local illustration sends no messages and books nothing.
6. **Put your link everywhere.** Bio, email and a message show the same handle. The teaser no longer includes an AI-switching demonstration.
7. **Take your life back.** Claim a handle, connect your AI and share your link. Final links go to the Cloud app and Learn more.

Pilot and agents enter only after the desire, request pile and last-chore turn. Earnings, future business coverage and ecosystem expansion are omitted. Product qualifications follow `docs/cloud-messaging.md`. The link is a profile and connection entry point, not account-free guest chat; connection acceptance and both AIs being connected remain explicit.

The 20% figure is an imagined amount in a question, not an empirical statistic. The [BLS 2025 time-use table](https://www.bls.gov/news.release/atus.t01.htm) measures household activities, not these coordination requests. [McKinsey’s 2012 social-economy report](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy) estimates workweek email/information-search time, not 20% of life. Neither supports the proposed factual hook. No savings chart, citation or badge suggests otherwise.

## Design and performance

One Inter Tight typeface, cream/clay colors, unframed photography, and seven concise chapters carry the link story. The café photograph is licensed stock; the reunion still comes from the existing Higgsfield film footage. Provenance is in `public/cloud/teaser/CREDITS.md`.

Native vertical document scrolling moves the story horizontally. Mandatory CSS snap points settle on full chapters; there is no wheel or touch interception, synthetic momentum, timed advance, background video, or soundtrack. Previous/next buttons and Left/Right keys are available. Inactive chapters are inert.

Supported desktop browsers drive the track with a native CSS scroll timeline. Touch devices always use the measured document scroll position, writing only the track transform once per animation frame. This avoids relying on CSS syntax support as evidence that the sticky track actually advances on iPhone Safari. Other unsupported browsers use the same transform path. The previous inherited per-panel custom-property writes and decorative parallax were removed. Chapter state changes only at boundaries; the progress marker updates once per chapter on touch devices, rather than animating continuously.

The stage uses stable small-viewport height. Height-only resize events on touch devices no longer rebuild the layout or call scrollTo when browser chrome expands or collapses. Real width changes remeasure after a short debounce. The final chapter reserves large-viewport scroll space. These changes address identifiable sources of lag; no physical-phone frame-rate measurement is claimed.

Reduced motion, short windows, or content that cannot fit automatically use the ordinary vertical page. All chapters are measured before horizontal enhancement enables. There is no reading-mode toggle. Without JavaScript, the complete story and destination links remain available. Local demo controls do not send messages or book anything.

Implementation references: [WebKit scroll-driven animations](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/), [Chrome scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [MDN scroll snapping](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type), and [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Verification

The seven-chapter regression harness checks actual touch transforms with and without advertised CSS timeline support, desktop native/fallback modes, toolbar resizing, width changes and reduced motion. It verifies the last chapter remains reachable. Existing phone compatibility behavior is preserved.

Current visual and build checks are recorded with the release. Browser emulation is not physical iPhone testing. The founder’s earlier symptom was a counter advancing while the image stayed frozen; touch devices consequently bypass CSS scroll timelines and use one transform write per animation frame. Physical-iPhone confirmation remains pending.

### Link-story release checks — 25 October 2026

- Production build, plain coverage, site integrity, scroll regression and targeted TypeScript checks pass. Built markup has no navigation elements, duplicate IDs or missing local images in either campaign page. All signup links say “Claim your handle”.
- Chrome device emulation at 375×667: visually reviewed all seven teaser chapters, including the full opening question, four requests, link requirements, approval disclosure, link placements and final actions. Native scrolling visibly changes the slide and settles on a chapter. The long page’s opening, requests, product reveal, interactive examples, placement cards and setup were also reviewed at this size.
- At 1280×800, inspected the opening, product reveal, agent exchange and distribution compositions. The local approval state changes after pressing Looks good; switching Muse to Dots keeps the same handle and placement links. All four Learn more scenarios were selected.
- Reduced-motion and short-window fallbacks are covered by the controller harness. No fresh physical-iPhone performance measurement or OS-level reduced-motion test is claimed. Native browser-control interruptions prevented completing the latter as a new visual check.
- DevTools showed development-server logging; one earlier back/forward navigation caused a Vite WebSocket cache warning, cleared on a new load. It is a dev-server connection, not the published controller.

The new progress marker follows touch chapters with a single boundary update, preserving the one-track-transform-per-frame scrolling path.

### Conversational revision and height correction

The expanded request wall and conversational wording follow the approved quick draft. At 1352×667, the prior distribution composition exceeded its grid content area and switched the whole story into vertical fallback. Compact desktop spacing and height-aware display type restore horizontal mode while retaining the accessibility fallback. The repaired distribution slide and reachable 07/07 were visually checked before this copy revision. Current controller regression covers all seven chapters. A fresh complete physical-phone check is not claimed.

Current conversational revision: fresh Chrome checks at 1352×667 and 375×667 show the expanded request wall fits and horizontal mode remains active. Mobile checks covered the grouped link, autopilot example, distribution and 07/07 final action. Native scrolling visibly advances both slide and counter. Browser emulation only; no new physical-iPhone claim.
