import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
  type SerializedLexicalNodeWithParent,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedLinkNode } from "@payloadcms/richtext-lexical";
import { ProseShell } from "@/components/page/prose";
import { headingId, type LexicalNode } from "@/lib/posts";

type CodeBlockNode = { fields: { code?: string; language?: string } };

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const value = linkNode.fields.doc?.value as { section?: string; slug?: string } | undefined;
  return value?.slug ? `/${value.section ?? "blog"}/${value.slug}` : "#";
};

/** Renders a post's Lexical content with the site's prose styles. */
export function PostBody({ content, className = "" }: { content: { root: LexicalNode }; className?: string }) {
  const seen = new Map<string, number>();

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    heading: ({ node, nodesToJSX }) => {
      const Tag = node.tag;
      const base = headingId(node as unknown as LexicalNode);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = node.tag === "h2" || node.tag === "h3" ? (count ? `${base}-${count}` : base) : undefined;
      return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>;
    },
    blocks: {
      Code: ({ node }: { node: CodeBlockNode & SerializedLexicalNodeWithParent }) => (
        <pre data-lang={node.fields.language}>
          <code>{node.fields.code}</code>
        </pre>
      ),
    },
  });

  return (
    <ProseShell className={className}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RichText data={content as any} converters={converters} disableContainer />
    </ProseShell>
  );
}
