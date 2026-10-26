# Pilot horizontal teaser

Standalone route: `/cloud-teaser`. This is a `noindex,nofollow` design preview, excluded from the sitemap. It does not replace `/cloud` or `/cloud-landing`.

## The story

1. **The last chore you’ll ever do.** The friend-group qualifier and an unresolved dinner conversation establish the coordination problem.
2. **First, you need an agent.** Muse, Dots, Grok Bot, Hermes, and OpenClaw lead; MCP-compatible chat apps remain a smaller, explicit alternative. Background operation requires enabled check-ins.
3. **Run your friend group on autopilot.** A two-agent exchange ends in a useful result. The visitor can try plans, updates, introductions, and files. The dinner example asks for approval; the introduction asks permission before connecting people.
4. **Your agent. Meet their agents.** People using different AI apps connect through Pilot, by invitation.
5. **New AI. Same handle.** Switching the sample AI changes the connected app, while the handle, link, and people remain. The profile is clearly an example, not a link to a real user.
6. **Claim your handle. Invite your friends.** `Start now` opens `https://cloud.pilotprotocol.network`; `Learn more` opens `/cloud-landing`. Both people connect an AI. The service is hosted, free to start, and requests require acceptance.

The short story deliberately leaves earnings, business-agent coverage, and ecosystem expansion out. Their conditions and roadmap status need more room than a teaser affords. Product qualifications follow `docs/cloud-messaging.md`.

## Visual and interaction choices

One typeface (Inter Tight), cream, clay/coral, soft green, large type, and existing Pilot illustrations. The film contributes full-screen color changes, the dinner exchange, and the portable handle. It contributes no soundtrack, autoplay, or timed reading pressure. Human photography closes on the reason to coordinate: seeing each other.

The page uses the existing licensed café photo and crops for illustrative avatars. Its source and credit are in `public/cloud/warm/CREDITS.md`. Agent marks come from the existing landing-page assets. `public/cloud/teaser/social.jpg` is a separate social card branded Pilot.

Normal vertical document scrolling translates the story horizontally to the next panel on the right. Native mandatory scroll snapping settles on a complete chapter after the gesture; `scroll-snap-stop: always` marks each chapter as a stop for snap-based scrolling. Because the visual panels share a sticky viewport, one non-interactive document-position target per chapter supplies the vertical snap positions. They are disabled in the automatic vertical fallback. The last chapter reserves a complete viewport of scroll room even when mobile browser chrome changes its height.

A passive listener schedules one animation frame per scroll update. There is no wheel/touch interception, synthetic momentum, or automatic advance. The track and small illustration offsets share the same scroll position. Previous/next controls and Left/Right keys offer deliberate chapter navigation; browser-native scrolling keys still work. Resizing settles on the nearest complete chapter.

Native snapping references: [MDN scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type) and [MDN scroll-snap-stop](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-stop).

Inactive chapters are inert in horizontal mode, so keyboard focus and screen readers do not visit invisible controls. Chapter status changes only at chapter boundaries. The header contains only Pilot and Start now. Reduced motion, small landscape windows, oversized text, or content that cannot fit automatically use the ordinary vertical page; there is no reading-view toggle or stored mode preference. Compact phone layouts reduce illustration size and simplify the example card while retaining its disclosure and approval control. Without JavaScript, the entire story and both destination links remain available vertically; the sample interaction controls are hidden.

References: [MDN sticky positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position), [WAI carousel interaction guidance](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/), [MDN inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert), and [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Files

- `src/pages/cloud-teaser.astro`: story, metadata, and static accessible content.
- `src/styles/cloud-teaser.css`: scoped responsive design.
- `src/scripts/cloud-teaser.ts`: scroll snapping, automatic vertical fallback, and local illustrative demos.
- `src/pages/sitemap.xml.ts`: preview exclusion.

## Verification — 25 October 2026

- `npm run build`: passed (334 Astro pages plus generated error documents).
- `npm run check:plain`: passed, 100 required pairs.
- `npm run check:site`: passed, 338 HTML files and 24,437 internal references; includes the new image, metadata, preview exclusion, and both CTA destinations.
- Targeted TypeScript check for `cloud-teaser.ts`: passed. Repository-wide `npx tsc --noEmit` still fails in untouched Cloudflare function/worker types, analytics, and the untracked film directory. No errors point to the teaser.
- Chrome at 1280 × 667: all six chapters fit horizontally; plan approval, switching to the updates example, handle switching from Muse to Dots, and chapter controls verified. The example handle and people stayed fixed.
- Chrome at 390 × 844: horizontal story, agent marks, longest introduction example, and final CTA/photo composition visually checked. Native keyboard scrolling reached the final chapter.
- Chrome at 820 × 1180: stacked portrait composition and horizontal enhancement verified. All chapters pass the content-fit check before that enhancement enables.
- Chrome at 320 × 568: ordinary vertical fallback, wrapping, final CTA destinations, and the photo/footer checked.
- Emulated `prefers-reduced-motion: reduce` switches to the full vertical page and removes horizontal controls. Restoring the preference re-enables the story.
- Left/Right chapter navigation and native scrolling verified. Offscreen chapters are absent from Chrome’s accessibility tree while horizontal mode is active. Console showed only Vite development messages during the final pass.
- Contrast pass: cream text on coral measures 4.67:1; small coral-scene text uses that pair. Large peach display text is reserved for headlines. No timed animation, audio, or video runs on this route.

These are Chrome checks, including device emulation; they are not a claim of physical-device Safari testing. Build output contains the complete static story for the no-JavaScript reading path.

### Snap and mobile follow-up

- Removed the reading-mode button and its localStorage behavior as requested. The header is brand plus Start now.
- Desktop partial and larger native scroll gestures settle on complete chapters. Reverse scrolling at 375 × 667 also settles cleanly; no custom wheel handler is used.
- 375 × 667 now fits the horizontal story. The phone-specific layout simplifies the handle card, keeps sample buttons at least 40px tall, and fits the longest introduction example with its disclosure above the chapter controls. The fit check covers every chapter before horizontal mode enables.
- Rechecked 390 × 844 after the follow-up: full chapter snapping remains enabled, including after a resize. A more compact result card keeps the longest introduction example above the controls. Mobile chapter arrows have 44px touch targets.
- Type check of the teaser script, production build, and full site-integrity checks pass after these changes.
