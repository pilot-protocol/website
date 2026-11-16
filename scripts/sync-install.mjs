// Refresh public/install.sh from pilot-protocol/release, the installer's source of truth, before each build.
// The live /install.sh is served by the pilot-release Worker; this copy is the fallback, and
// .github/workflows/sync-install-sh.yml fails if it drifts. Keeps the committed copy if GitHub can't be reached.
import { writeFile } from "node:fs/promises";

const SOURCE = "https://raw.githubusercontent.com/pilot-protocol/release/main/install.sh";

try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text.startsWith("#!")) throw new Error("not a shell script");
  await writeFile(new URL("../public/install.sh", import.meta.url), text);
  console.log(`install.sh synced (${text.length} bytes)`);
} catch (err) {
  console.warn(`install.sh not synced, keeping the committed copy: ${err.message}`);
}
