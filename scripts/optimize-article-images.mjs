import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageRoots = ['blog', 'learn', 'news'].map((directory) => path.join(root, 'src/pages', directory));
const outputDirectory = path.join(root, 'public/blog/media');
const manifestPath = path.join(root, 'src/data/articleImageManifest.json');
const managedHost = 'csuxjmfbwmkxiegfpljm.supabase.co';

const decodeHtmlUrl = (value) => value.replaceAll('&amp;', '&');

async function listAstroFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listAstroFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith('.astro') ? [absolutePath] : [];
  }));
  return files.flat();
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchImage(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'PilotProtocol-site-image-optimizer/1.0' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

async function optimizeImage(url) {
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
  const buffer = await fetchImage(url);
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error('image dimensions are unavailable');

  const largeTarget = Math.min(1200, metadata.width);
  const smallTarget = Math.min(720, largeTarget);
  const largeName = `${hash}-${largeTarget}.webp`;
  const smallName = `${hash}-${smallTarget}.webp`;
  const largePath = path.join(outputDirectory, largeName);
  const smallPath = path.join(outputDirectory, smallName);

  let largeInfo;
  if (await fileExists(largePath)) {
    largeInfo = await sharp(largePath).metadata();
  } else {
    largeInfo = await sharp(buffer)
      .rotate()
      .resize({ width: largeTarget, withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(largePath);
  }

  let smallInfo = largeInfo;
  if (smallTarget !== largeTarget) {
    if (await fileExists(smallPath)) {
      smallInfo = await sharp(smallPath).metadata();
    } else {
      smallInfo = await sharp(buffer)
        .rotate()
        .resize({ width: smallTarget, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(smallPath);
    }
  }

  const largeUrl = `/blog/media/${largeName}`;
  const smallUrl = `/blog/media/${smallName}`;
  const srcset = smallTarget === largeTarget
    ? `${largeUrl} ${largeInfo.width}w`
    : `${smallUrl} ${smallInfo.width}w, ${largeUrl} ${largeInfo.width}w`;

  return {
    src: largeUrl,
    srcset,
    width: largeInfo.width,
    height: largeInfo.height,
  };
}

const files = (await Promise.all(pageRoots.map(listAstroFiles))).flat();
const sources = new Set();

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/<img\b[^>]*\bsrc\s*=\s*(["'])(https:\/\/[^"']+)\1/gi)) {
    const url = decodeHtmlUrl(match[2]);
    if (new URL(url).hostname === managedHost) sources.add(url);
  }
}

await mkdir(outputDirectory, { recursive: true });

let previousManifest = {};
try {
  previousManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  // A missing manifest is expected on the first run.
}

const urls = [...sources].sort();
const manifest = {};
const queue = [...urls];
const failures = [];

async function worker() {
  while (queue.length > 0) {
    const url = queue.shift();
    const previous = previousManifest[url];
    const previousAsset = previous?.src
      ? path.join(root, 'public', previous.src.replace(/^\//, ''))
      : undefined;

    try {
      if (previous && previousAsset && await fileExists(previousAsset)) {
        manifest[url] = previous;
      } else {
        manifest[url] = await optimizeImage(url);
      }
      process.stdout.write('.');
    } catch (error) {
      failures.push(`${url}: ${error.message}`);
      process.stdout.write('x');
    }
  }
}

await Promise.all(Array.from({ length: Math.min(6, urls.length) }, worker));
process.stdout.write('\n');

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  const sortedManifest = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, `${JSON.stringify(sortedManifest, null, 2)}\n`);
  console.log(`Optimized ${urls.length} article images into ${path.relative(root, outputDirectory)}.`);
}
