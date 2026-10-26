# Warm landing-page photography

- `friends-cafe.webp` and `friends-cafe-small.webp`: photo by Vitaly Gariev, downloaded from https://unsplash.com/photos/two-women-laughing-at-a-cafe-table-uwZ-dOjw8Bo on 2026-10-25.
- Source image: https://images.unsplash.com/photo-1758525225816-8dd1901ef6ec
- Source page states “Free to use under the Unsplash License”: https://unsplash.com/license
- Resized to 1200px and 640px wide and converted to WebP. This is illustrative lifestyle photography, not a customer testimonial.
- Puppy illustrations are existing Pilot assets in `public/cloud/pups/`.

## Mascot animation

- `pilot-idle.mp4` and `pilot-idle-poster.webp`: generated in Higgsfield Cinema Studio 4.0 on 2026-10-25 from the existing Pilot wave illustration (`public/cloud/pups/wave.webp`).
- Brief: preserve the character and illustration style; fixed camera, warm cream background, one blink and a tiny head tilt; no audio, text, additional characters, or camera movement.
- Inspected source: five seconds, 1440 × 1440, 24 fps, HEVC, no audio stream. Optimized to 384 × 384 H.264 with a matching WebP poster for the identity example. The original download remains outside the website repository.
- This is an illustrative brand mascot, not a customer or product-activity recording.

## Social preview

- `cloud-social.jpg`: 1200 × 630 composition of the café photo above, existing Pilot logo and puppy-pair illustration, and the same self-hosted Inter Tight font used by the page. Rebuild with `node scripts/build-cloud-social.mjs`.
- The dinner card is explicitly an example, not a customer result or a personalized invitation.

## Agent logos

- `../logos/openclaw.png` and `../logos/hermes.png`: copied from the existing Pilot Cloud product assets at `hosted/control/web/logos/` on 2026-10-25.
- Muse and Grok Bot reuse the existing Muse and Grok assets. These indicate compatibility/recommendations, not endorsements by the named companies.
- `../logos/dots.webp`: yellow dots mascot cropped from the founder-provided screenshot of OpenAI’s [Introducing dots](https://openai.com/index/introducing-dots/) page (supplied 2026-10-25). Cropped to the circular artwork, with transparent outer corners, and resized to 128 × 128 WebP. This is source artwork from the screenshot, not an AI-generated logo. The official page also links a plain ring mark (`https://images.ctfassets.net/kftzwdyauwt9/KKSjto3MtJguvsLQsM1Bp/1704a6937d22b1bb3cac38dc5f43f9df/dots-o.svg`); that mark was inspected but not used because the founder requested the yellow character.
