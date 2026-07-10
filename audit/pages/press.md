# Claim audit: src/pages/press.astro

Audited: 2026-07-10 · Sentences examined: 68 · verified: 51 · false: 0 · unverifiable: 1 · opinion: 16 · example: 0

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 58 | Contact: `press@pilotprotocol.network` | Domain has valid MX (Google Workspace, `aspmx.l.google.com` verified via dig), but the existence of the specific `press@` mailbox/alias cannot be confirmed from outside | Google Workspace admin user/alias list, or a delivered test message to that address |

## Verified claims (grouped by source)
- **public/brand/ directory listing (ls -la)**: /brand/ index.html exists (Downloads row "Full brand kit (HTML)"); pilot-brand-kit.pdf = 1,518,579 B ≈ 1.5 MB; pilot-logo-dark@1x.png = 49,538 B ≈ 49 KB; @2x = 169,157 B ≈ 169 KB; @3x = 348,462 B ≈ 348 KB; pilot-logo-source.png = 771,562 B ≈ 771 KB; tailwind.config.js = 1,161 B ≈ 1 KB — all seven Downloads-table rows and both CTA hrefs (/brand/, /brand/pilot-brand-kit.pdf) resolve.
- **sips on logo PNGs**: dimensions 200×200 (1x), 400×400 (2x), 600×600 (3x), 1024×1024 (source) — matches line 91 sentence and all four Downloads-table format cells.
- **PNG inspection (PIL + sips hasAlpha)**: logo has transparent background with full-color artwork — supports "All assets work on both dark and light backgrounds" (line 74); "Use the dark variant on dark backgrounds" consistent with `pilot-logo-dark` asset naming.
- **public/brand/index.html (brand kit)**: "Brand Kit v1.0" + "2026" (lines 6, 432, 929 → press line 46 "v1.0 — 2026"); "Dark mode is the default. Light mode must also work. Never use pure white #ffffff — use #fafaf7 instead. Accent is for CTAs and highlights only." (kit line 458 → press lines 74, 212, 224); accent `#C5F000` dark (kit line 21) / `#82AA14` light (kit line 44); Light mode palette section (kit line 545 → "Light mode equivalents included in the full kit"); typography table Inter Tight / JetBrains Mono / Instrument Serif (kit lines 635–637); "Use Mono for all labels, eyebrows, nav" (673); "Stick to weights 400, 500, 600 only" (675); "Maintain clear space equal to logo height on all sides" (734, 893); spacing spec "All spacing values are multiples of 4px. Max content width: 1440px. Standard component padding: 24px. Section padding: 80px." (806) + "8pt grid scale" heading (809) + "Use the 8pt grid — multiples of 4px only" (891) → all four Spacing-table rows and the 8pt Do item; Don't items: "Use accent for body text or large fills" (878), "Introduce blues, purples, or reds" (879), "Use pure white — use #fafaf7 instead" (880), "Recolor the logo" / "Stretch, rotate, or add effects" (740–741), "Separate mark from wordmark without approval" (742).
- **src/styles/global.css**: dark palette variables match all eight swatch title attributes — `--bg #0b0b0a` (10), `--bg-2 #111110` (11), `--ink #eceae3` (13), `--ink-dim #8a8a83` (14), `--ink-faint #3a3a37` (15), `--line #1d1d1b` (16), `--term-bg #060605` (22); light `--bg: #fafaf7` (46); font stacks Instrument Serif / Inter Tight / JetBrains Mono (26–28).
- **Jira PILOT-28 (mcp jira_get_issue, vulturelabs.atlassian.net)**: "Brand kit (visual identity package)" — assignee and stated owner "Artemii Amelin" → press line 50 Design credit; also confirms brand-kit deliverables (logo PNG 1x/2x/3x, palette, typography, Tailwind tokens, /brand page) matching the hero-sub and meta-description content claims.
- **curl (live, 2026-07-10)**: https://pilotprotocol.network → HTTP/2 200 (line 54 Website value; canonical URL https://pilotprotocol.network/press also 200).
- **dig MX pilotprotocol.network**: Google MX records present (context for the flagged press@ address — domain accepts mail, mailbox itself unverified).

Opinion/label items (not flagged, no factual content): "PRESS KIT", "Brand assets.", "Overview", "At a glance.", "Logo", "Dark BG", "Surface", "Colors", "Typography", "Spacing", "Downloads", "Everything you need.", "Guidelines", "Quick rules.", "Do", "Don't".

Note (not a flag): line 91 "Use the dark variant on dark backgrounds" implies a light logo variant exists, but only `pilot-logo-dark@*` ships in public/brand/ — Jira PILOT-28 acceptance criteria called for "dark + light variants". The sentence itself makes no false claim, but a light variant is missing from the kit.
