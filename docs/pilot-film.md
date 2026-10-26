# Pilot film publication

`/pilot-film` is a separate noindex viewing page with widescreen/vertical selection, ordinary video controls, downloads, and a full text transcript. It has no autoplay. The teaser loads no film files.

Revision 17 lasts 29.800 seconds at 60fps in 1920×1080 and 1080×1920. It follows the same seven-part story as `/cloud-teaser` and `/cloud-landing`: a hypothetical time question, everyday requests, the last chore, the Pilot link, agents coordinating with approval, the same link everywhere, and taking your life back. Pilot and agents enter at 14.633 seconds. The primary action is Claim your handle; setup is Claim, Connect, Share.

## Sequential requests

From 3.117 to 11.750 seconds, “How does a ‘quick question’ turn into 30 minutes?” stays fixed while eight requests replace one another in a single large card. Each replacement happens on a measured drum attack. There is no accumulated wall, overlapping request text, or text crossfade. The first request and the longer feedback question last 1.433 seconds each; the other six last about 0.96 seconds. Alternating cream and clay cards mark the swaps. Both formats use identical text and timing.

The previous film's later scene durations are retained. The longer request sequence adds 2.883 seconds, keeping the total below 30 seconds. The complete final CTA remains visible for 2.60 seconds before the picture fade. These reading holds follow the user's slower-pacing direction and override the motion skill's generic 0.6-second stillness target.

## Content and provenance

The opening is the complete question “What would you do with 20% more time?” It is not a measured time-use statistic or a promised saving; 30 minutes is rhetorical. The link reveal groups the real handle URL format with `@maya`. Priya's agent reaches Maya's agent after Maya accepts the connection. A proposed coffee time becomes confirmed only after separate human approval. Both connected AIs and the illustrative demonstration are labeled. The same link stays in the same screen position through bio, email-signature and message cuts. The ending retains “You approve connections and plans.”

Picture: existing café photography, illustrated components and Higgsfield reunion footage (wide job `43933a0b-8a7f-4269-8c5b-6da310ebea55`, vertical job `43a9edd7-b165-4cc2-8980-34a3ed8b14d2`). Typeface and brand marks are reused from the website. One Inter Tight family, cream/clay/ink palette and a human ending align the three surfaces.

Audio: the user-supplied first seven seconds of Imagine Dragons’ “Believer”, arranged into the approved drum loop at its original tempo. The revised WAV is sample-identical to the prior soundtrack through 24.48 seconds. An existing complete loop extends the cut; the final two seconds fade to silence. No narration or new effects. Picture fades over the final 1.05 seconds. This records provenance, not a representation of a music license.

The editable production source, all text/timings, waveform provenance, previous cuts and independent reviews remain in the local `launch-video/drums/output/rhythm-v17/` archive. Only final MP4s, posters and the full transcript are published. Player assets use the `v=17` cache key.

## Release verification

Both exports fully decode and contain 1,788 frames at 60fps. Picture duration is 29.800 seconds; the AAC container duration is 29.803 seconds. Audio and picture start at zero. The final frame is completely black, and final-10ms decoded audio RMS is 3.8e-07. Encoded audio correlation to the arranged WAV is 0.999872. These are numerical measurements, not an independent listening test.

All 26 major cuts and state changes were compared with measured waveform attacks; the maximum offset is 14.0ms, less than one 60fps frame. Independent component review inspected both formats every 0.1 seconds and immediately before, at and after every replacement. It found exactly the seven internal request changes, no overlap or blank replacement frame, and no clipped text. The headline stays fixed. Full-film review and measurements are archived in `VERIFICATION.md` and `checks.json`.

Film lint/type checks, the website build, plain coverage, teaser scroll regressions and site integrity passed. The local player selects the correct v17 asset and download for each format.
