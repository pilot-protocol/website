import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(root, 'public/blog/banners');
const outputDirectory = path.join(sourceDirectory, 'optimized');
const manifestPath = path.join(root, 'src/data/bannerImageManifest.json');
const rasterExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

await mkdir(outputDirectory, { recursive: true });

const files = (await readdir(sourceDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && rasterExtensions.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => entry.name)
  .sort();

const manifest = {};

for (const file of files) {
  const sourcePath = path.join(sourceDirectory, file);
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`No dimensions available for ${file}`);

  const stem = path.basename(file, path.extname(file));
  const largeTarget = Math.min(1200, metadata.width);
  const smallTarget = Math.min(720, largeTarget);
  const largeName = `${stem}-${largeTarget}.webp`;
  const smallName = `${stem}-${smallTarget}.webp`;

  const largeInfo = await sharp(sourcePath)
    .rotate()
    .resize({ width: largeTarget, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(path.join(outputDirectory, largeName));

  let smallInfo = largeInfo;
  if (smallTarget !== largeTarget) {
    smallInfo = await sharp(sourcePath)
      .rotate()
      .resize({ width: smallTarget, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(outputDirectory, smallName));
  }

  const sourceUrl = `/blog/banners/${file}`;
  const largeUrl = `/blog/banners/optimized/${largeName}`;
  const smallUrl = `/blog/banners/optimized/${smallName}`;
  manifest[sourceUrl] = {
    src: largeUrl,
    srcset: smallTarget === largeTarget
      ? `${largeUrl} ${largeInfo.width}w`
      : `${smallUrl} ${smallInfo.width}w, ${largeUrl} ${largeInfo.width}w`,
    width: largeInfo.width,
    height: largeInfo.height,
  };
  process.stdout.write('.');
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write('\n');
console.log(`Optimized ${files.length} blog banners into ${path.relative(root, outputDirectory)}.`);
