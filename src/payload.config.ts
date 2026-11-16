import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite";
import { BlocksFeature, CodeBlock, EXPERIMENTAL_TableFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { r2Storage } from "@payloadcms/storage-r2";
import { type CloudflareContext, getCloudflareContext } from "@opennextjs/cloudflare";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import type { GetPlatformProxyOptions } from "wrangler";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Users } from "./collections/Users";

/*
 * Payload on Cloudflare: posts live in D1, uploads in R2. Locally (and from the
 * Payload CLI) the bindings come from Wrangler's platform proxy, so `next dev`
 * uses a local D1/R2 under .wrangler/state; in production they're the Worker's.
 */

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined);

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join("payload", "bin.js")));
const isProduction = process.env.NODE_ENV === "production";
// `next build` evaluates this config while collecting routes; nothing at build time needs the
// production database (Payload-backed pages render per request), so use local bindings there.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const createLog =
  (level: string, fn: typeof console.log) =>
  (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === "string") fn(JSON.stringify({ level, msg: objOrMsg }));
    else fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }));
  };

// Workers logs are structured JSON; Payload's default pretty logger isn't.
const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || "info",
  trace: createLog("trace", console.debug),
  debug: createLog("debug", console.debug),
  info: createLog("info", console.log),
  warn: createLog("warn", console.warn),
  error: createLog("error", console.error),
  fatal: createLog("fatal", console.error),
  silent: () => {},
} as never;

const cloudflare =
  isCLI || !isProduction || isBuild
    ? await getCloudflareContextFromWrangler(isProduction && !isBuild)
    : await getCloudflareContext({ async: true });

const CODE_LANGUAGES = { bash: "Bash", json: "JSON", ts: "TypeScript", js: "JavaScript", go: "Go", python: "Python", swift: "Swift", yaml: "YAML", text: "Plain text" };

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Pilot Protocol" },
    theme: "dark",
    components: {
      graphics: {
        Logo: "/components/admin/graphics#AdminLogo",
        Icon: "/components/admin/graphics#AdminIcon",
      },
    },
  },
  collections: [Posts, Media, Users],
  // The site and admin use the REST and Local APIs only.
  graphQL: { disable: true },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({ blocks: [CodeBlock({ languages: CODE_LANGUAGES, defaultLanguage: "bash" })] }),
      EXPERIMENTAL_TableFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [r2Storage({ bucket: cloudflare.env.R2, collections: { media: true } })],
});

// Adapted from @opennextjs/cloudflare's own dev helper, so the CLI and `next dev` get local bindings.
function getCloudflareContextFromWrangler(remoteBindings: boolean): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${"__wrangler".replaceAll("_", "")}`).then(({ getPlatformProxy }) =>
    getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      remoteBindings,
    } satisfies GetPlatformProxyOptions),
  );
}
