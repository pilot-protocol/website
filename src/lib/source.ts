import { loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import { pilotDark, pilotLight } from "@/lib/shiki-themes";

/* Fumadocs: the docs are MDX in content/docs, ordered and grouped by content/docs/meta.json. */

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
    // Fumadocs' defaults, with code highlighted in the site's palette.
    mdxOptions: applyMdxPreset({ rehypeCodeOptions: { themes: { light: pilotLight, dark: pilotDark } } }),
  },
  meta: { schema: metaSchema },
});

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
