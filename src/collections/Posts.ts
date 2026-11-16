import type { CollectionConfig } from "payload";

/**
 * Everything editorial: the blog, the learning center and the newsroom are one
 * collection, split by `section`, so they share one editor and one template.
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "section", "publishedAt", "_status"],
    listSearchableFields: ["title", "slug", "description"],
    preview: (doc) => `/${doc.section}/${doc.slug}`,
  },
  access: {
    // Visitors only ever see published posts; signed-in editors see drafts too.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: "published" } }),
  },
  versions: { drafts: true, maxPerDoc: 25 },
  defaultSort: "-publishedAt",
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.content) data.minutes = Math.max(1, Math.round(countWords(data.content) / 230));
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: { description: "One or two sentences. Used as the lede, in listings and for search engines." },
    },
    { name: "content", type: "richText", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar", description: "The URL: /blog/<slug>" },
    },
    {
      name: "section",
      type: "select",
      required: true,
      defaultValue: "blog",
      options: [
        { label: "Blog", value: "blog" },
        { label: "Learning center", value: "learn" },
        { label: "Newsroom", value: "news" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "publishedAt", type: "date", required: true, index: true, admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } } },
    { name: "author", type: "text", defaultValue: "Pilot Protocol editorial team", admin: { position: "sidebar" } },
    { name: "tags", type: "text", hasMany: true, admin: { position: "sidebar" } },
    {
      name: "minutes",
      type: "number",
      admin: { position: "sidebar", readOnly: true, description: "Reading time, worked out on save." },
    },
    {
      name: "seoTitle",
      type: "text",
      admin: { position: "sidebar", description: "Optional <title> override for search results." },
    },
  ],
};

function countWords(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const n = node as { text?: string; children?: unknown[]; root?: unknown; fields?: { code?: string } };
  if (n.root) return countWords(n.root);
  let words = n.text ? n.text.split(/\s+/).filter(Boolean).length : 0;
  if (n.fields?.code) words += n.fields.code.split(/\s+/).length / 3;
  for (const c of n.children ?? []) words += countWords(c);
  return words;
}
