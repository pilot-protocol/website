# Next scope: an invitation with a plan inside

Status: proposed follow-up, not implemented. The founder chose to finish the landing page first on 25 October 2026.

## What exists

- `hosted/control/handles.go`: `/@handle` renders a profile/connection page and sends the recipient to `/me?add=handle`. Its preview is a generic puppy-pair card. There is no proposed time or guest response action on that page.
- `hosted/control/invites.go`: email invitations accept a short note. `/i/token` shows the inviter and note, then takes the recipient to sign-in. The existing token represents an invitation to join; it is not a plan, calendar permission, or confirmation.
- `hosted/control/web/index.html`: the share button shares a handle link; the sender can queue a message until a friend accepts. Agent check-in depends on the connected AI running/checking in. A hosted node alone does not guarantee an instant AI reply.

The read-only inspection found no existing guest plan-response path in these flows. The hosted repo has no `.context/overview.md`; read its README and relevant control-plane code before implementing there.

## Proposed first version

One sender, one recipient, one proposed plan. The sender reviews the proposed time, time zone, place (optional), and message before sharing a new plan link. A plan invitation stays distinct from the permanent `/@handle` identity link.

The recipient sees “Priya suggests dinner Thursday at 7:30” and two actions: **Works for me** and **Suggest another time**. This is a proposal until the recipient agrees; do not claim the recipient is free without information they actually supplied. Both actions should work without an account. Offer Pilot signup after the response has been saved, with the plan preserved if the recipient joins later.

The reply is stored server-side and shown to the sender even if neither AI is currently running. A guest’s reply must not accept a friendship, grant access to private conversation history, create an account, or silently book a venue/calendar event. Those are separate actions with their existing consent requirements.

## Work needed before shipping

1. A small plan record with sender, recipient capability, proposal revision, explicit time zone, expiry, and response state. Treat the response token as access to this plan only; keep account identifiers and email addresses out of the share preview.
2. A recipient page, server-side reply endpoints, and a sender status view. Handle repeat submissions, changed proposals, declined/revoked/expired links, and attempts to reply to an old revision. “Suggest another time” returns a counterproposal for the sender to accept; it must not silently confirm both people.
3. A preview that carries the value of the plan while avoiding private details in crawler-visible metadata. Decide which details the sender knowingly makes visible to anyone holding the link; default the OG card to sender + general plan type until that decision is made.
4. Sender-triggered sharing first. Reuse email delivery only after the plan flow is sound and its sending behavior has been reviewed. No automatic reminders or invitation sends are part of this landing-page work.
5. Outcome measurement: invitation viewed → response saved → plan agreed; optional signup happens after response. Then measure invite completion into a Pilot pair, useful pair activity at day 30, and adding a third person. Log event IDs/statuses, not private plan text.

## Review bar

A person with no Pilot account can open the invitation, understand the proposed plan, respond, reload, and still see their saved response. The sender sees the same state without relying on an AI being online. A repeat tap cannot duplicate an event; an old proposal cannot be accepted after a change; a forwarded link cannot grant broader account access. Only after this works should the landing page claim an account-free recipient experience.

Research basis: [Arranged Thing](../../research_notes/software-websites/viral.md), [cold-start analysis](../../research_notes/software-websites/cold-start.md), and [activation](../../research_notes/software-websites/activation.md). These support the hypothesis to test, not a guaranteed conversion lift.
