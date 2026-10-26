# Motion direction for the warm Cloud preview

The brief is a living, welcoming page. Motion should make Pilot feel present and make changes understandable while leaving the reading surface steady. This applies to `/cloud-landing`; it is not a claim that animation will improve conversion.

## What could become overwhelming

| Risk on this page | Research | Decision |
| --- | --- | --- |
| Puppies, logos, numbers, and photographs all looping independently | [NN/g: Animation for Attention and Comprehension](https://www.nngroup.com/articles/animation-usability/) explains how peripheral movement captures attention and asks designers to consider purpose, frequency, and mechanics. | Give the hero a small living composition. Allow only one decorative scene to loop in view. Keep logos, proof numbers, and reading text stationary after their entrance. |
| Big zooms, parallax, or a page that continues moving against the reader's intent | [WebKit: Responsive Design for Motion](https://webkit.org/blog/7551/responsive-design-for-motion/) describes scaling, spinning, and movement at different speeds as potential triggers. | No camera zoom, cursor parallax, rotated page surface, or translated scrolling wrapper. Keep actual document scrolling, with direct touch and keyboard takeover. |
| Repeated animations delaying an ordinary action | [Apple: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) recommends purposeful, brief feedback, cancellation, and optional motion. | Button springs keep their current velocity when retargeted. Content changes immediately; animations never block links or selectors. Entrances run once. |
| Autoplay that cannot be stopped | [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) calls for control of automatically moving content lasting over five seconds alongside other content; it also recommends a common control for multiple animations. | A footer text setting (“Reduce motion” / “Enable motion”) pauses the extra motion. The preference persists locally. Background/offscreen animation is stopped or paused. |
| Treating reduced motion as only a CSS concern | [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) addresses disabling nonessential interaction-triggered motion. | The OS preference and page control affect CSS loops, Web Animations, button springs, enhanced scrolling, and chat replay. Essential content remains available. |

The particular amplitudes and timing below are design decisions for Pilot, not universal thresholds proven by these sources.

## Motion map

- **Hero:** a seven-pixel photo float over eight seconds, gentle puppy movement, and a short initial drawing/arrival for the plan and doodle. Headline, explanation, and main action stay still.
- **Sections:** one entrance of up to 18px over 650ms. Parallel cards stagger by 85ms. Text stays at full opacity throughout; the underlying HTML is visible and no animation completion is required to reveal content. Entrances are skipped while the page is hidden.
- **Demo:** the first example plays once when its conversation is in view. User-selected scenarios and replay remain explicit controls. The conversation reserves its height during playback to avoid moving surrounding content. Pause restores all messages immediately.
- **Identity:** changing AI animates the changed connection and gives the puppy a small greeting. Handle, link, and circles stay unchanged.
- **Images:** supporting puppies greet on arrival or pointer interaction. Only one of the hero, identity avatar, or closing illustration runs a decorative loop at a given time. The identity avatar uses a five-second Higgsfield clip with a blink and small head tilt.
- **Controls:** damped springs for hover and press, preserving velocity during reversal. Reduced motion restores a still surface.
- **Scrolling:** a nearly critically damped desktop wheel response and section navigation. Touch, zoom gestures, nested scrolling, keyboard navigation, browser edge behavior, and reduced motion keep native handling. The footer motion setting also disables custom scrolling.

## Higgsfield asset brief

One short mascot clip is appropriate; a full-page moving background is not needed. Use the existing Pilot illustration as the reference, preserve the character and linework, and keep the camera locked. A blink and tiny head tilt are enough. Keep the background uniform warm cream, return to the opening pose, omit audio and text, and avoid extra characters or morphing.

The implemented asset is a local 384px H.264 video (71,409 bytes) with a 16,402-byte WebP poster. The source was generated in Higgsfield Cinema Studio 4.0 on 25 October 2026 using one available free generation and the existing Pilot wave illustration. It has no audio stream. Its source is assigned only when the avatar becomes the active visible scene; playback stops offscreen, in a background tab, and when the page or OS disables motion. A blocked autoplay leaves the poster available. The generated frames were inspected before integration. Generation is not evidence of product behavior, and the asset should not be presented as a customer testimonial.

## Verification

Check wide, tablet, and narrow layouts; pause/resume; reload with the saved motion preference; demo selection/replay; identity switching; FAQ expansion; navigation interruption; keyboard focus; and reduced-motion fallback. Physics checks cover matching trajectories at 30–240 Hz, velocity continuity on reversal, settling, native input exceptions, and animation-loop cleanup. These checks are separate from usability testing with real visitors.

### Verification record — 25 October 2026

The first pass reviewed desktop, 820px, 390px, and 320px layouts and exercised the demo, identity choices, FAQ, section anchor, desktop scrolling, and pause/resume. Its reduced-motion lifecycle checks used mocked media-query events; that was not an OS-setting check.

The follow-up after removing navigation added these direct checks:

| Check | Method and observed result |
| --- | --- |
| 320 × 844 layout | Safari Responsive Design Mode. Visually inspected the header, hero, proof/logos, conversation controls, setup cards, identity copy/button/AI choices, expanded FAQ, and closing CTA/footer. Fixed the mobile setup illustration spacing so the puppy clears its heading. No visible clipping in the reviewed sections. This was a visual review, not an automated geometric overflow measurement. |
| Reduced motion in a browser | Chrome DevTools Rendering → `prefers-reduced-motion: reduce`. The page switched to `data-motion="paused"`; the header control became disabled and read “Animations off: your device prefers reduced motion.” This also held after reload. Replay returned the complete example immediately; switching to ChatGPT retained the handle and circles. Removing emulation restored the running state. The system-wide OS preference was not changed. |
| Page pause and persistence | Chrome: Pause changed the control to Play and the page state to paused; Play remained after reload. Resuming restored Pause. |
| Landing-page structure | Parsed built HTML: zero `<nav>` elements; one header link, for signup; three full signup buttons in the body; four signup links total, all to the same destination. The brand is not a link. |
| Build | `npm run build` passes. The previous TypeScript check had only the same pre-existing repository errors; this follow-up changes markup/styles, not motion logic. |

The earlier ad hoc physics/lifecycle checks cover frame-rate consistency, retargeted velocity, native input exceptions, delayed video loading, exclusive visible-scene playback, page/OS/background/offscreen pause, reuse of the source, and cleanup. These are code-level checks, separate from the browser observations above and from usability testing with real visitors.

### Two-sided demo follow-up — 25 October 2026

The demo now includes a reply from the other person's AI (two replies in the weekend example). Its existing reveal, reserve-height, pause, and reduced-motion code is unchanged. The longest sequence has five messages, so its last reveal starts at 3.4 seconds. Mobile choices use a two-column grid to avoid an uneven three-plus-one row.

- Manually reviewed the changed hero/demo and proof layout in Safari desktop and Responsive Design Mode at 320 × 844, 390 × 844, and 820 × 844. No visible clipped text or cards in the inspected regions. These are visual checks, not automated document-width measurements.
- Selected all four scenarios; checked the Claude, ChatGPT, and Gemini responses and final result. Pausing replay revealed every message. The saved pause state survived a page reload; normal motion was restored afterward.
- Reduced-motion browser emulation was verified in the preceding pass above; it was not repeated or represented as a new OS-setting test here.
- `npm run build` passes (457 pages); `npm run check:plain` passes. The complete `npx tsc --noEmit` diagnostic output is identical to the pre-existing baseline (30 lines).
- Built HTML checks found zero nav elements, four identical “Start free” signup links to one destination, proof after the demo, 39 image elements with existing local assets, and no duplicate IDs. Both social metadata tags point at the new 1200 × 630 JPEG; the local asset returns HTTP 200 (81,871 bytes). The preview remains noindex and unpublished.

### Header cleanup — 25 October 2026

Removed the header play/pause icon at the user’s request. The same global motion preference is now a plain-text footer setting: “Reduce motion” / “Enable motion.” Device-level reduced motion remains authoritative and disables the setting. Historical checks above describe the earlier control location and labels.

Build passed (457 pages). The TypeScript diagnostics are byte-for-byte identical to the pre-existing baseline. Built markup has one header action (signup), no header motion button, and one motion setting in the footer.

### Publication verification — 25 October 2026

Updated the preview branch to the current main branch before publication. The standalone `/cloud-landing` route remains `noindex,nofollow`; `/cloud` is unchanged by this preview. The sitemap now omits the preview. The integrity checker still checks its content, accessibility markup, and internal references, while correctly omitting noindex pages from the search-facing sitemap and inlink requirements.

- `npm run check:plain`, `npm run build`, and `npm run check:site` pass. The current main branch builds 333 Astro pages; integrity checks cover 337 HTML files and 24,396 internal references.
- Chromium measurements at 1280, 820, 390, and 320 pixels found no document-width overflow. All local assets loaded, with no browser page errors. The header has no navigation or play/pause button; all four signup links say “Start free.”
- Exercised all four example selectors, ChatGPT identity switching, and FAQ expansion. The footer motion control pauses the page, persists after reload, and resumes. Browser reduced-motion emulation pauses the page and disables the control. This was browser emulation, not a changed OS setting.
- Strict TypeScript checking passes for all three new motion modules. The repository-wide TypeScript command still reports diagnostics in unchanged Cloudflare functions, analytics, and worker files, plus the local untracked film project. These files are outside this publication change.
- The film project, its exports and music, and `.context/` are excluded from the website commit.
