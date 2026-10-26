// Rebuild the warm Cloud preview's social card from existing, credited assets.
// Run: node scripts/build-cloud-social.mjs
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), 'pilot-cloud-social-'));
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const font = resolve(root, 'public/fonts/NGSwv5HMAFg6IuGlBNMjxLsH8ag.woff2');
const previousConfig = process.env.FONTCONFIG_FILE;
try {
  // Limit font discovery to the same self-hosted fonts used by the page.
  const config = join(scratch, 'fonts.conf');
  await writeFile(config, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${escape(resolve(root, 'public/fonts'))}</dir><cachedir>${escape(scratch)}</cachedir></fontconfig>`);
  process.env.FONTCONFIG_FILE = config;
  const { default: sharp } = await import('sharp');
  const svg = (body, width = 1200, height = 630) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`);
  const layers = [];
  const text = async (value, size, left, top, color = '#483b32', weight = 'normal') => {
    const input = await sharp({ text: {
      text: `<span foreground="${color}" weight="${weight}">${escape(value)}</span>`,
      font: `Inter Tight ${size}`, fontfile: font, rgba: true, dpi: 72,
    } }).png().toBuffer();
    layers.push({ input, left, top });
  };
  const roundedPhoto = await sharp(resolve(root, 'public/cloud/warm/friends-cafe.webp'))
    .resize(476, 280, { fit: 'cover' })
    .composite([{ input: svg('<rect width="476" height="280" rx="18" fill="white"/>', 476, 280), blend: 'dest-in' }])
    .png().toBuffer();
  layers.push({ input: roundedPhoto, left: 650, top: 104 });
  layers.push({ input: await sharp(resolve(root, 'public/img/pilot-96.webp')).resize(48, 48).png().toBuffer(), left: 62, top: 48 });
  layers.push({ input: await sharp(resolve(root, 'public/cloud/pups/friends-duo.webp')).resize(235, 235).png().toBuffer(), left: 624, top: 366 });

  await text('Pilot', 32, 122, 55, '#483b32', 'semibold');
  await text('cloud', 18, 211, 66, '#766454');
  await text('Less back-and-forth.', 52, 64, 180, '#483b32', 'semibold');
  await text('More “see you soon.”', 52, 64, 247, '#ad503b', 'semibold');
  await text('Connect your AI.\nMake a plan together.', 28, 66, 347, '#766454');
  await text('Start free · Bring one friend', 20, 86, 516, '#fffdf8', 'semibold');
  await text('pilotprotocol.network', 16, 66, 581, '#766454');
  await text('less planning, more this.', 21, 781, 400, '#71503a');
  await text('EXAMPLE PLAN', 12, 883, 469, '#636c54', 'semibold');
  await text('Thursday at 7?', 27, 883, 493, '#475440', 'semibold');
  await text('One plan. Both of you.', 18, 883, 533, '#636c54');

  const background = svg(`
    <rect width="1200" height="630" fill="#faf7f2"/>
    <ellipse cx="902" cy="320" rx="275" ry="270" fill="#f1e7d7"/>
    <rect x="636" y="90" width="504" height="345" rx="30" fill="#e7d9c7" opacity=".45"/>
    <rect x="636" y="88" width="504" height="345" rx="30" fill="#fffdf9"/>
    <rect x="858" y="444" width="300" height="134" rx="25" fill="#fffdf9"/>
    <rect x="864" y="450" width="288" height="122" rx="20" fill="#edf0de"/>
    <rect x="64" y="498" width="295" height="57" rx="28.5" fill="#b94e36"/>
    <path d="M606 110v50m-25-25h50m-43-18 36 36m0-36-36 36" stroke="#bc704e" stroke-width="3" stroke-linecap="round"/>
  `);
  const output = resolve(root, 'public/cloud/warm/cloud-social.jpg');
  await sharp(background).composite(layers).jpeg({ quality: 90, mozjpeg: true }).toFile(output);
  console.log(`Built ${output} (1200 × 630)`);
} finally {
  if (previousConfig === undefined) delete process.env.FONTCONFIG_FILE;
  else process.env.FONTCONFIG_FILE = previousConfig;
  await rm(scratch, { recursive: true, force: true });
}
