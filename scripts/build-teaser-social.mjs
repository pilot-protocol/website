// Shared social card for the teaser and its Learn more page.
// Run: node scripts/build-teaser-social.mjs
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), 'pilot-link-social-'));
const previousConfig = process.env.FONTCONFIG_FILE;
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
try {
  process.env.FONTCONFIG_FILE = join(scratch, 'fonts.conf');
  await writeFile(process.env.FONTCONFIG_FILE, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${escape(resolve(root, 'public/fonts'))}</dir><cachedir>${escape(scratch)}</cachedir></fontconfig>`);
  const { default: sharp } = await import('sharp');
  const base = await sharp(resolve(root, 'public/cloud/teaser/reunion-wide.webp')).resize(1200,630,{fit:'cover'}).png().toBuffer();
  const layers = [{input:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="wash"><stop stop-color="#faf7f2" stop-opacity=".98"/><stop offset=".52" stop-color="#faf7f2" stop-opacity=".94"/><stop offset="1" stop-color="#faf7f2" stop-opacity=".08"/></linearGradient></defs><rect width="1200" height="630" fill="url(#wash)"/></svg>'),left:0,top:0}];
  layers.push({input:await sharp(resolve(root,'public/img/pilot-96.webp')).resize(58,58).png().toBuffer(),left:60,top:49});
  const text = async(value,size,left,top,color='#392f29',weight='normal') => layers.push({input:await sharp({text:{text:`<span foreground="${color}" weight="${weight}">${escape(value)}</span>`,font:`Inter Tight ${size}`,fontfile:resolve(root,'public/fonts/NGSwv5HMAFg6IuGlBNMjxLsH8ag.woff2'),rgba:true,dpi:72}}).png().toBuffer(),left,top});
  await text('Pilot',40,132,57,'#392f29','semibold');
  await text('Take your',100,60,192,'#392f29','semibold');
  await text('life back.',100,60,300,'#b94e36','semibold');
  await text('One link to your agent.',30,64,451);
  await text('Claim. Connect. Share.',24,64,550,'#6d5c4f');
  await sharp(base).composite(layers).jpeg({quality:90,mozjpeg:true}).toFile(resolve(root,'public/cloud/teaser/social.jpg'));
  console.log('Built Pilot link story social card (1200 × 630).');
} finally {
  if(previousConfig===undefined) delete process.env.FONTCONFIG_FILE;
  else process.env.FONTCONFIG_FILE=previousConfig;
  await rm(scratch,{recursive:true,force:true});
}
