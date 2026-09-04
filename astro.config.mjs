import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pilotprotocol.network',
  build: {
    format: 'preserve',
  },
  trailingSlash: 'ignore',
  redirects: {
    '/blog/connect-continue-to-pilot-protocol': '/docs/mcp-setup',
  },
});
