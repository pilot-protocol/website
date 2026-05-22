import { describe, it, expect } from 'vitest';
import { validateBLGPayload, transformToPublishPayload, verifyBearerToken } from '../src/webhook';
import type { BLGPayload } from '../src/webhook';

function validBLG(): Record<string, unknown> {
  return {
    id: 10,
    title: 'Test Article for Webhook Integration',
    slug: 'test-article-for-webhook-integration',
    metaDescription: 'Test article to verify webhook integration is working correctly',
    content_html: '<h1>Test Article for Webhook Integration</h1><p>Body content here.</p>',
    heroImageUrl: 'https://cdn.example.com/hero-image.jpg',
    content_markdown: '# Test Article for Webhook Integration\n\nBody content here.',
    languageCode: 'en',
    publicUrl: 'https://example.com/test-article-webhook',
    createdAt: '2025-03-20T03:41:18.570Z',
  };
}

// --- validateBLGPayload ---

describe('validateBLGPayload', () => {
  it('accepts a valid payload', () => {
    const result = validateBLGPayload(validBLG());
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.slug).toBe('test-article-for-webhook-integration');
      expect(result.payload.title).toBe('Test Article for Webhook Integration');
      expect(result.payload.heroImageUrl).toBe('https://cdn.example.com/hero-image.jpg');
    }
  });

  it('rejects non-object', () => {
    expect(validateBLGPayload('string').valid).toBe(false);
    expect(validateBLGPayload(null).valid).toBe(false);
  });

  it('rejects missing title', () => {
    const data = validBLG();
    delete data.title;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('title');
  });

  it('rejects missing slug', () => {
    const data = validBLG();
    delete data.slug;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
  });

  it('rejects missing metaDescription', () => {
    const data = validBLG();
    delete data.metaDescription;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('metaDescription');
  });

  it('rejects missing content_html', () => {
    const data = validBLG();
    delete data.content_html;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
  });

  it('rejects missing createdAt', () => {
    const data = validBLG();
    delete data.createdAt;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
  });

  it('rejects invalid slug format', () => {
    const data = validBLG();
    data.slug = 'UPPERCASE-BAD';
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('Slug');
  });

  it('rejects invalid createdAt date', () => {
    const data = validBLG();
    data.createdAt = 'not-a-date';
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain('createdAt');
  });

  it('handles missing optional fields gracefully', () => {
    const data = validBLG();
    delete data.heroImageUrl;
    delete data.content_markdown;
    delete data.languageCode;
    delete data.publicUrl;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.heroImageUrl).toBeUndefined();
      expect(result.payload.content_markdown).toBeUndefined();
    }
  });

  it('trims string fields', () => {
    const data = validBLG();
    data.title = '  Padded Title  ';
    data.slug = 'test-article-for-webhook-integration';
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.title).toBe('Padded Title');
    }
  });

  it('defaults id to 0 if not a number', () => {
    const data = validBLG();
    delete data.id;
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.id).toBe(0);
    }
  });

  it('treats empty heroImageUrl as undefined', () => {
    const data = validBLG();
    data.heroImageUrl = '   ';
    const result = validateBLGPayload(data);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.heroImageUrl).toBeUndefined();
    }
  });
});

// --- transformToPublishPayload ---

describe('transformToPublishPayload', () => {
  const blg: BLGPayload = {
    id: 10,
    title: 'My Test Post',
    slug: 'my-test-post',
    metaDescription: 'A short description',
    content_html: '<h1>My Test Post</h1><p>Body paragraph.</p>',
    createdAt: '2025-03-20T03:41:18.570Z',
  };

  it('maps fields correctly', () => {
    const result = transformToPublishPayload(blg);
    expect(result.slug).toBe('my-test-post');
    expect(result.title).toBe('My Test Post');
    expect(result.description).toBe('A short description');
    expect(result.category).toBe('Blog');
    expect(result.tags).toEqual(['blog']);
  });

  it('formats date from createdAt', () => {
    const result = transformToPublishPayload(blg);
    expect(result.date).toBe('Mar 20');
    expect(result.date_full).toBe('March 20, 2025');
  });

  it('strips leading h1 from content_html', () => {
    const result = transformToPublishPayload(blg);
    expect(result.body_html).toBe('<p>Body paragraph.</p>');
    expect(result.body_html).not.toContain('<h1');
  });

  it('handles content without h1', () => {
    const noH1 = { ...blg, content_html: '<p>Just a paragraph.</p>' };
    const result = transformToPublishPayload(noH1);
    expect(result.body_html).toBe('<p>Just a paragraph.</p>');
  });

  it('handles h1 with attributes', () => {
    const withAttrs = { ...blg, content_html: '<h1 class="title" id="main">Title</h1><p>Body.</p>' };
    const result = transformToPublishPayload(withAttrs);
    expect(result.body_html).toBe('<p>Body.</p>');
  });

  it('formats different months correctly', () => {
    const jan = { ...blg, createdAt: '2026-01-05T12:00:00Z' };
    expect(transformToPublishPayload(jan).date).toBe('Jan 5');
    expect(transformToPublishPayload(jan).date_full).toBe('January 5, 2026');

    const dec = { ...blg, createdAt: '2026-12-25T00:00:00Z' };
    expect(transformToPublishPayload(dec).date).toBe('Dec 25');
    expect(transformToPublishPayload(dec).date_full).toBe('December 25, 2026');
  });
});

// --- verifyBearerToken ---

describe('verifyBearerToken', () => {
  it('accepts valid Bearer token', async () => {
    const result = await verifyBearerToken('Bearer my-secret-token', 'my-secret-token');
    expect(result).toBe(true);
  });

  it('rejects null header', async () => {
    const result = await verifyBearerToken(null, 'my-secret-token');
    expect(result).toBe(false);
  });

  it('rejects missing Bearer prefix', async () => {
    const result = await verifyBearerToken('my-secret-token', 'my-secret-token');
    expect(result).toBe(false);
  });

  it('rejects wrong token', async () => {
    const result = await verifyBearerToken('Bearer wrong-token', 'my-secret-token');
    expect(result).toBe(false);
  });

  it('rejects different length tokens', async () => {
    const result = await verifyBearerToken('Bearer short', 'much-longer-secret');
    expect(result).toBe(false);
  });

  it('rejects Basic auth scheme', async () => {
    const result = await verifyBearerToken('Basic my-secret-token', 'my-secret-token');
    expect(result).toBe(false);
  });
});
