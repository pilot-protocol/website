import { describe, it, expect } from 'vitest';
import {
  validatePayload,
  generateAstroFile,
  generateBlogPostEntry,
  insertIntoBlogPosts,
  type PublishPayload,
} from '../src/template';

const validPayload: PublishPayload = {
  slug: 'my-test-post',
  title: 'My Test Post',
  description: 'A short description.',
  date: 'Mar 26',
  date_full: 'March 26, 2026',
  category: 'Tutorial',
  tags: ['test', 'demo'],
  body_html: '<h2 id="intro">Introduction</h2><p>Hello world.</p>',
};

describe('validatePayload', () => {
  it('accepts a valid payload', () => {
    const result = validatePayload(validPayload);
    expect(result.valid).toBe(true);
  });

  it('rejects null', () => {
    const result = validatePayload(null);
    expect(result.valid).toBe(false);
  });

  it('rejects non-object', () => {
    const result = validatePayload('string');
    expect(result.valid).toBe(false);
  });

  it('rejects missing slug', () => {
    const { slug, ...rest } = validPayload;
    const result = validatePayload(rest);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('slug');
  });

  it('rejects empty title', () => {
    const result = validatePayload({ ...validPayload, title: '' });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('title');
  });

  it('rejects slug with uppercase', () => {
    const result = validatePayload({ ...validPayload, slug: 'My-Post' });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('Slug');
  });

  it('rejects slug too short', () => {
    const result = validatePayload({ ...validPayload, slug: 'ab' });
    expect(result.valid).toBe(false);
  });

  it('rejects slug starting with hyphen', () => {
    const result = validatePayload({ ...validPayload, slug: '-bad-slug' });
    expect(result.valid).toBe(false);
  });

  it('rejects empty tags array', () => {
    const result = validatePayload({ ...validPayload, tags: [] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('Tags');
  });

  it('rejects tags with empty string', () => {
    const result = validatePayload({ ...validPayload, tags: ['valid', ''] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('tag');
  });

  it('accepts payload without banner', () => {
    const result = validatePayload(validPayload);
    expect(result.valid).toBe(true);
  });

  it('accepts payload with banner', () => {
    const result = validatePayload({ ...validPayload, banner_base64: 'UklGR...' });
    expect(result.valid).toBe(true);
  });

  it('rejects empty banner_base64', () => {
    const result = validatePayload({ ...validPayload, banner_base64: '' });
    expect(result.valid).toBe(false);
  });
});

describe('generateAstroFile', () => {
  it('contains BlogLayout import', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('import BlogLayout from "../../layouts/BlogLayout.astro"');
  });

  it('contains the title', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('title="My Test Post"');
  });

  it('contains the description', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('description="A short description."');
  });

  it('contains the body HTML', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('<h2 id="intro">Introduction</h2>');
  });

  it('contains the tags', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('tags={["test","demo"]}');
  });

  it('contains canonical path', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('canonicalPath="/blog/my-test-post"');
  });

  it('contains banner image path', () => {
    const output = generateAstroFile(validPayload);
    expect(output).toContain('bannerImage="/blog/banners/my-test-post.webp"');
  });

  it('escapes backticks in body', () => {
    const post = { ...validPayload, body_html: 'code: `hello`' };
    const output = generateAstroFile(post);
    expect(output).toContain('code: \\`hello\\`');
    // Should not have unescaped backticks inside the template literal
    const bodyStart = output.indexOf('const bodyContent = `') + 'const bodyContent = `'.length;
    const bodyEnd = output.indexOf('`;', bodyStart);
    const body = output.slice(bodyStart, bodyEnd);
    // All backticks should be escaped
    expect(body).not.toMatch(/(?<!\\)`/);
  });

  it('escapes template expressions in body', () => {
    const post = { ...validPayload, body_html: 'value: ${injected}' };
    const output = generateAstroFile(post);
    expect(output).toContain('value: \\${injected}');
  });

  it('escapes double quotes in title as character references', () => {
    const post = { ...validPayload, title: 'Post "With Quotes"' };
    const output = generateAstroFile(post);
    expect(output).toContain('title="Post &quot;With Quotes&quot;"');
    // No backslash escaping, which an HTML attribute would not decode
    expect(output).not.toContain('\\"With Quotes');
  });

  it('escapes markup characters in title and description', () => {
    const post = {
      ...validPayload,
      title: 'A & B <script> "q" \'a\'',
      description: '5 > 3 & 2 < 4',
    };
    const output = generateAstroFile(post);
    expect(output).toContain('title="A &amp; B &lt;script&gt; &quot;q&quot; &#39;a&#39;"');
    expect(output).toContain('description="5 &gt; 3 &amp; 2 &lt; 4"');
  });

  it('leaves the attribute delimiters balanced for a quoted title', () => {
    const post = { ...validPayload, title: 'Quote " then more' };
    const output = generateAstroFile(post);
    const line = output.split('\n').find((l) => l.trim().startsWith('title='))!;
    // Exactly the opening and closing delimiter, no stray quote in between
    expect(line.match(/"/g)).toHaveLength(2);
  });

  it('escapes the ampersand of an existing character reference', () => {
    // Plain text in, so the value round-trips through the Astro parser
    const post = { ...validPayload, title: 'AT&amp;T' };
    const output = generateAstroFile(post);
    expect(output).toContain('title="AT&amp;amp;T"');
  });
});

describe('generateBlogPostEntry', () => {
  it('generates valid TypeScript object literal', () => {
    const entry = generateBlogPostEntry(validPayload);
    expect(entry).toContain('slug: "my-test-post"');
    expect(entry).toContain('title: "My Test Post"');
    expect(entry).toContain('date: "Mar 26"');
    expect(entry).toContain('category: "Tutorial"');
    expect(entry).toContain('tags: ["test","demo"]');
    expect(entry).toContain('banner: "banners/my-test-post.webp"');
  });

  it('escapes double quotes for the JS string context', () => {
    const post = { ...validPayload, title: 'Post "With Quotes"' };
    const entry = generateBlogPostEntry(post);
    expect(entry).toContain('title: "Post \\"With Quotes\\""');
  });

  it('escapes newlines so the literal stays on one line', () => {
    const post = { ...validPayload, description: 'line one\nline two' };
    const entry = generateBlogPostEntry(post);
    expect(entry).toContain('description: "line one\\nline two"');
  });

  it('produces a literal that parses back to the original text', () => {
    const post = { ...validPayload, title: 'Back\\slash and "quote"' };
    const entry = generateBlogPostEntry(post);
    const literal = entry.match(/title: (".*?[^\\]"),/)![1];
    expect(JSON.parse(literal)).toBe(post.title);
  });
});

describe('insertIntoBlogPosts', () => {
  const existingFile = `export interface BlogPost {
  slug: string;
  title: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "existing-post",
    title: "Existing Post",
  },
];
`;

  it('inserts entry at top of array', () => {
    const entry = '  { slug: "new-post", title: "New" },';
    const result = insertIntoBlogPosts(existingFile, entry);
    // New entry should appear before existing
    const newIdx = result.indexOf('new-post');
    const existIdx = result.indexOf('existing-post');
    expect(newIdx).toBeLessThan(existIdx);
    expect(newIdx).toBeGreaterThan(0);
  });

  it('preserves the rest of the file', () => {
    const entry = '  { slug: "new-post", title: "New" },';
    const result = insertIntoBlogPosts(existingFile, entry);
    expect(result).toContain('export interface BlogPost');
    expect(result).toContain('slug: "existing-post"');
  });

  it('throws if array marker is missing', () => {
    expect(() => insertIntoBlogPosts('const x = 1;', 'entry')).toThrow(
      'Could not find blogPosts array',
    );
  });
});
