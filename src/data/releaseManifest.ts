import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ReleaseManifest {
  latest_stable: string;
}

// On pilotprotocol.network, /.well-known/latest.json is rendered per request by
// the pilot-release Worker (pilot-protocol/release) from the GitHub releases of
// pilot-protocol/pilotprotocol; install.sh reads it there. The Worker owns
// /.well-known/*, so public/.well-known/latest.json never serves in production:
// it is the snapshot for preview deploys and the fallback for offline builds.
const LIVE_MANIFEST_URL = 'https://pilotprotocol.network/.well-known/latest.json';
const STABLE_TAG = /^v\d+\.\d+\.\d+$/;

function snapshotManifest(): ReleaseManifest {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), 'public/.well-known/latest.json'), 'utf8'),
  ) as ReleaseManifest;
}

async function liveManifest(): Promise<ReleaseManifest | null> {
  try {
    const res = await fetch(LIVE_MANIFEST_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const body = (await res.json()) as Partial<ReleaseManifest>;
    return typeof body.latest_stable === 'string' && STABLE_TAG.test(body.latest_stable)
      ? (body as ReleaseManifest)
      : null;
  } catch {
    return null;
  }
}

let stable: Promise<string> | undefined;

// Resolved once per build: the live release when the manifest answers, else
// the checked-in snapshot, so a release shows up on the next deploy.
export function getStableVersion(): Promise<string> {
  stable ??= liveManifest().then((live) => (live ?? snapshotManifest()).latest_stable.replace(/^v/, ''));
  return stable;
}
