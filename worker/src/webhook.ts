import type { PublishPayload } from './template';

export interface BLGPayload {
  id: number;
  title: string;
  slug: string;
  metaDescription: string;
  content_html: string;
  heroImageUrl?: string;
  content_markdown?: string;
  languageCode?: string;
  publicUrl?: string;
  createdAt: string;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/;

export function validateBLGPayload(
  data: unknown,
): { valid: true; payload: BLGPayload } | { valid: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Payload must be a JSON object' };
  }

  const obj = data as Record<string, unknown>;

  for (const field of ['title', 'slug', 'metaDescription', 'content_html', 'createdAt'] as const) {
    if (typeof obj[field] !== 'string' || (obj[field] as string).trim() === '') {
      return { valid: false, error: `Missing or empty required field: ${field}` };
    }
  }

  if (!SLUG_RE.test(obj.slug as string)) {
    return { valid: false, error: 'Slug must be 3-100 chars, lowercase alphanumeric + hyphens' };
  }

  if (isNaN(Date.parse(obj.createdAt as string))) {
    return { valid: false, error: 'createdAt must be a valid ISO date' };
  }

  return {
    valid: true,
    payload: {
      id: typeof obj.id === 'number' ? obj.id : 0,
      title: (obj.title as string).trim(),
      slug: (obj.slug as string).trim(),
      metaDescription: (obj.metaDescription as string).trim(),
      content_html: obj.content_html as string,
      heroImageUrl: typeof obj.heroImageUrl === 'string' && obj.heroImageUrl.trim() ? obj.heroImageUrl.trim() : undefined,
      content_markdown: typeof obj.content_markdown === 'string' ? obj.content_markdown : undefined,
      languageCode: typeof obj.languageCode === 'string' ? obj.languageCode : undefined,
      publicUrl: typeof obj.publicUrl === 'string' ? obj.publicUrl : undefined,
      createdAt: (obj.createdAt as string).trim(),
    },
  };
}

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function stripLeadingH1(html: string): string {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '').trim();
}

export function transformToPublishPayload(blg: BLGPayload): PublishPayload {
  const d = new Date(blg.createdAt);
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();

  return {
    slug: blg.slug,
    title: blg.title,
    description: blg.metaDescription,
    date: `${MONTHS_SHORT[month]} ${day}`,
    date_full: `${MONTHS_FULL[month]} ${day}, ${year}`,
    category: 'Blog',
    tags: ['blog'],
    body_html: stripLeadingH1(blg.content_html),
  };
}

export async function verifyBearerToken(authHeader: string | null, secret: string): Promise<boolean> {
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  const token = parts[1];
  const encoder = new TextEncoder();
  const a = encoder.encode(token);
  const b = encoder.encode(secret);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

export async function fetchHeroImage(url: string): Promise<{ base64: string; ext: string } | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch hero image: ${res.status}`);
      return undefined;
    }
    const contentType = res.headers.get('Content-Type') || '';
    let ext = 'webp';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('webp')) ext = 'webp';

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { base64: btoa(binary), ext };
  } catch (err) {
    console.error('Failed to fetch hero image:', err);
    return undefined;
  }
}
