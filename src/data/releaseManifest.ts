import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ReleaseManifest {
  latest_stable: string;
}

// One local, deterministic source for the version shown across static pages.
// The installer consumes this same public manifest at runtime.
export const releaseManifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/.well-known/latest.json'), 'utf8'),
) as ReleaseManifest;

export const stableVersion = releaseManifest.latest_stable.replace(/^v/, '');
