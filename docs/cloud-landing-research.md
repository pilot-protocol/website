# Landing pages for a hard decision — research brief

> **25 October 2026:** The current audience, message hierarchy, claim checks, and preview copy are in [cloud-messaging.md](cloud-messaging.md). This older brief is retained as research history. Its third-party conversion figures are not forecasts for Pilot, and its implementation notes no longer describe the current warm preview.

Prepared for the Pilot Cloud (`/cloud`) landing page. Goal: find website experiences that
convert better when the visitor has a difficult decision to make, and turn the findings into
a page that is calmer and more focused than the current one.

Current state of `/cloud` (`website/src/pages/cloud.astro`, 280 lines, ~9 sections):

- full site `Nav` (5 mega-menu groups, 30+ links) and the full `Footer` (4 columns + fine print);
- two hero CTAs ("Get started", "See how it works");
- seven more CTAs down the page (install Pilot, MCP + Pilot, status, see how it works, privacy);
- three separate "fork" points: hosted vs self-host, 9 AI apps to choose from, and circles/plans;
- 6 FAQ entries, 4 use cases, 3 platform rows.

That is a lot of exits. Every extra link is a way to leave.

---

## 1. What the evidence says

| Finding | Evidence | What it means here |
|---|---|---|
| Removing navigation from a dedicated landing page lifted conversion **+16.5%** | GrowthLayer experiment `landing-remove-navigation-from-landing-pages-tunnel` | The single highest-leverage change. "Convert or leave" is the standard for dedicated pages. |
| High-converting landing pages have **one CTA and no global nav**; they are "a stand alone web page with a single goal" | Copyhackers, CXL, Apexure (12-element framework) | `/cloud` currently has ~9 CTAs. |
| A simple one-page site out-converted a full site by **~6x** | Swipefile, "The Website Complexity Trap" | Fewer choices, one CTA, less perceived effort. |
| Two signup forms → one form converted better; users asked "which one should I use?" | Indie Hackers thread; Mert Topal, "Your SaaS Homepage Has Four Next Steps. Visitors Need One." | Two doors is already risky; nine is a maze. |
| **Defaults** are among the most effective choice-architecture tools (meta-analysis, 58 studies, n=73,675) | Jachimowicz, Duncan, Weber, Johnson — "When and why defaults influence decisions" | Pre-select the recommended path instead of presenting a neutral fork. |
| **Reframing a choice** (not adding options) lifted paid subscriptions **+19%** | Conversion Rate Experts / Mobbin win report | Copy and framing, not more features, moves the number. |
| **Paradox of choice / Hick's law**: more options → slower, worse decisions | Riley Log, choice architecture; Columbia, "Nudging App Adoption" (n=594,997) | Nine app logos + circles + platforms is decision fatigue. |
| A **multi-step quiz beat a single form by 61%** completion; quiz funnels report 2–4x | Conversion Sciences A/B test; GetFunnelAI | If there *is* a real decision, ask it one step at a time with big answer tiles. |
| Put the **first question on the first screen**; a button that jumps to a quiz is one more click | 99takes, quiz funnel guide | Don't hide the decision behind "Get started". |
| **Email gate after 5+ answered questions** lifts submission (sunk cost) | Heyflow, logic-based guided selling | Only relevant if we adopt a quiz variant. |
| Explain the recommendation, name its source, keep it adjustable | ScreensDesign, personalized onboarding | Trust comes from "here's why", not from confidence. |
| **Security/trust callouts** at the form reduce anxiety and lift sign-up | NextAfter experiment | Keep one quiet reassurance line, not a privacy block. |
| **Calm, plain-spoken, editorial** pages convert by feeling honest: no nav bar, an index of links, a signed letter, real numbers | Basecamp teardowns (PageProofer, Attention to Detail) | The "chill" register the brief asks for already has a proven model. |
| Show the product **early**, keep distractions out; signup feels like the obvious next step | Ploy, Linear landing page breakdown | One screenshot of the real thing beats three device frames. |

### The pattern

Sites that convert on a hard decision all do the same four things:

1. **Remove the exits.** No global nav, no footer sitemap, no "see also". One door out, or the back button.
2. **Name the decision in the headline.** Not "here is a product", but "which of these two things are you?" The visitor should recognise their own question in the H1.
3. **Make one option the default.** A recommendation with a reason ("we suggest this because…"), not a neutral table. The unchosen path stays visible but quiet.
4. **Lower the stakes of choosing.** "You can change this later", "nothing to install", "takes a minute" — the decision feels reversible, so it gets made.

### The register ("more chill")

Basecamp is the reference: plain sentences, almost no decoration, one link colour, white cards
on a pale field, a short page that reads like a confident letter. Practically:

- cut the section count roughly in half;
- one screenshot, not three device frames;
- no emoji in headings, no marquee, no gradient hero;
- generous whitespace, one accent colour, body text at a comfortable measure (~60ch);
- short sentences, second person, no superlatives.

---

## 2. The four framings considered

These were the candidate "one decisions". They are not mutually exclusive in principle, but a
page can only lead with one. All four were built as switchable previews first; A was kept as a
section rather than a fork, and the page now leads with the promise (see §3).

### A — "Hosted or yours"

The page's one question: **should Pilot run your agent, or do you?**
Pilot Cloud pre-selected as the default, self-hosting a single quiet line.
Matches `/plans` ("two paths, one protocol").

### B — "Start, or don't"

No fork. One promise, one button. App choice happens after sign-in.

### C — "Which AI app?"

Centre the page on the app the visitor already uses; nine logos become one tap.

### D — "Yours, or your team's"

Fork between an individual and a team, mirroring the personal/enterprise split.

### What we settled on instead

The user asked for a **sales page that sells the whole thing**, with one message: coordinating
with people is admin, and Pilot removes it — "this is the last chore of this type you'll ever
do." So the page leads with the **promise**, not a fork, and adopts the Pain → Dream → Fix
structure (Amy Hoy / JTBD):

1. **Hero** — the promise in one sentence, one CTA, three quiet proof points.
2. **The chore** — the pain, shown as four concrete before/after pairs rather than adjectives.
3. **Install once** — the dream: the last time you are the messenger.
4. **What happens** — the fix: three steps, once, with three real screens.
5. **Fair questions** — objections in the order they occur.
6. **Works with** — quiet compatibility row.
7. **Rather run it yourself** — the single fork, near the end, quiet.
8. **Close** — the same promise, the same button.

Framing A survives as section 7 (hosted vs self-host), which is where it belongs: after the
promise has landed, not before it.

---

## 3. What was built

`website/src/pages/cloud-landing.astro` — a **standalone** sales page. Not a variant of `/cloud`:
it shares the design tokens and nothing else. Verified in the browser: **zero `<nav>` elements,
zero links in the header, no horizontal overflow** at 1280px or 390px.

Its only exits are the three "Start free" CTAs, one quiet "Install Pilot" (self-host), and the
legal links in a minimal footer. The brand in the top corner is a **mark, not a link**, because a
link in the top corner is the first thing people use to leave.

Deliberate departures from `/cloud`, all from §1:

- **no site Nav and no full Footer** — a wordmark and a legal line instead;
- **one promise repeated**, not nine sections of features;
- **one message, three CTAs**, all the same action;
- **the pain shown**, not described: four before/after pairs with the actual sentence to say;
- **three real screenshots**, captioned with what is happening, instead of six device mock-ups;
- copy in Basecamp's register: short, plain, second person, no superlatives;
- proof is structural (live agent count, encryption, free) because the site has no testimonials
  and inventing them would break the "honest and calm" register that makes these pages work;
- a global cookie-consent banner still appears (required, from `BaseHead`) — it is a dialog, not
  navigation.

The page carries `noindex,nofollow` and is absent from the sitemap: it is a proposal, not a
replacement. `/cloud` is untouched.

## 4. The next round of research

The user asked for continuous research until we know what works. Open questions worth testing,
in order of expected value:

1. **Does the promise or the mechanism win the hero?** "The last time you organise anything"
   (aspirational) vs "Your agent does the back and forth" (descriptive). Same page, one H1 swap.
2. **Pain-first vs promise-first.** This page opens with the promise and shows the pain second.
   The reverse is a common alternate in the Pain → Dream → Fix literature.
3. **Does the demo help?** Interactive demos report 32% higher conversion and ~7.9x engagement
   (Storylane, Walnut, PageDuel) versus static screenshots. Three static screens may be the
   weakest part of this page.
4. **Proof without testimonials.** What is the strongest honest proof available: live network
   numbers, a public status page, an open-source repo, or named early users (with permission)?
5. **The last section.** "The next plan you make, let it make itself" vs a harder close.
6. **Where the self-host link belongs.** Currently near the end and quiet; a segment of this
   audience may be developers who want it early.

## 5. How to measure it

Use the `data-track` attributes the site already has (`cta_click`, `cta_click_target`,
`cta_click_location`). This page sets locations `cloud_sales_hero`, `cloud_sales_last`,
`cloud_sales_close` so the three CTAs can be compared against each other.

The metric that matters is **sign-ins completed at `cloud.pilotprotocol.network`**, not CTA
clicks. Measure: pageview → CTA click → sign-in completed → first message to a friend. The last
step is the real one: a visitor who signs in and never messages anyone has not had the promise
kept.
