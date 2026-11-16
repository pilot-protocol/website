import { withPayload } from "@payloadcms/next/withPayload";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  // Runs on Cloudflare Workers through OpenNext (see wrangler.jsonc). Marketing pages are
  // still prerendered; the blog reads Payload (D1) at request time and /admin is Payload.
  reactCompiler: true,
  images: {
    localPatterns: [{ pathname: "/api/media/file/**" }],
  },
  // Packages with Cloudflare Workers (workerd) specific code: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ["jose", "pg-cloudflare"],
  // Any docs page as Markdown, for agents and "copy page" (append .mdx to the URL).
  async rewrites() {
    return [{ source: "/docs/:path*.mdx", destination: "/llms.mdx/docs/:path*" }];
  },
  // workers.dev hosts (the green Worker, and the production Worker's fallback URL) stay out of search results, so
  // they never compete with pilotprotocol.network. Keyed on the host, so the production domain is unaffected.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "(.+\\.)?workers\\.dev" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  experimental: {
    // Each build worker opens the local D1 through Wrangler's platform proxy (payload.config.ts). With more than
    // one, workerd fails on the shared SQLite file (SQLITE_BUSY) and the build stops, so the build runs one worker.
    cpus: 1,
    // Two root layouts (site and Payload admin) need a routing-level 404.
    globalNotFound: true,
    // Turbopack's persistent cache kept serving stale compiled CSS (the Tailwind loader's output) across the
    // green and sky builds, so a deploy could ship last build's globals.css. Every build and dev start compiles fresh.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    // Self-contained repo: don't let Turbopack adopt a lockfile from a parent folder.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(withMDX(nextConfig), { devBundleServerPackages: false });
