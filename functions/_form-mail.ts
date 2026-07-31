export interface FormEnv {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  FORM_FROM_EMAIL?: string;
  FORM_TO_EMAIL?: string;
}

type FormValue = string | undefined;
type Submission = Record<string, FormValue>;

interface TurnstileResult {
  success: boolean;
  action?: string;
  hostname?: string;
  'error-codes'?: string[];
}

interface FormDefinition {
  action: string;
  required: string[];
  limits: Record<string, number>;
  validate: (values: Submission) => string | null;
  subject: (values: Submission) => string;
  text: (values: Submission, reference: string) => string;
  html: (values: Submission, reference: string) => string;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function cleanLine(value: FormValue): string {
  return textValue(value).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function escapeHtml(value: FormValue): string {
  return textValue(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br>');
}

export function field(label: string, value: FormValue): string {
  return `${label}: ${textValue(value) || 'Not provided'}`;
}

export function htmlField(label: string, value: FormValue): string {
  return `<tr><th align="left" valign="top" style="padding:8px 16px 8px 0;color:#666;font-weight:600;white-space:nowrap">${escapeHtml(label)}</th><td style="padding:8px 0;color:#111">${escapeHtml(value) || '<em>Not provided</em>'}</td></tr>`;
}

export function isEmail(value: FormValue): boolean {
  const email = textValue(value);
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function oneOf(value: FormValue, allowed: string[]): boolean {
  return allowed.includes(textValue(value));
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function verifyTurnstile(request: Request, env: FormEnv, token: string, expectedAction: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!response.ok) return false;
    const result = await response.json() as TurnstileResult;
    return result.success && (!result.action || result.action === expectedAction);
  } catch {
    return false;
  }
}

function normalize(raw: unknown): Submission | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const values: Submission = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') values[key] = value.trim();
  }
  return values;
}

function validateShape(values: Submission, definition: FormDefinition): string | null {
  for (const name of definition.required) {
    if (!textValue(values[name])) return `Please complete the ${name.replaceAll('_', ' ')} field.`;
  }
  for (const [name, limit] of Object.entries(definition.limits)) {
    if (textValue(values[name]).length > limit) return `${name.replaceAll('_', ' ')} is too long.`;
  }
  return definition.validate(values);
}

export async function handleForm(request: Request, env: FormEnv, definition: FormDefinition): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { ...JSON_HEADERS, Allow: 'POST' } });
  }
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Cross-origin submissions are not accepted.' });

  const type = request.headers.get('Content-Type') || '';
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (!type.toLowerCase().includes('application/json')) return json(415, { ok: false, error: 'Send the form as JSON.' });
  if (declaredLength > 65_536) return json(413, { ok: false, error: 'Submission is too large.' });

  let rawText = '';
  try {
    rawText = await request.text();
  } catch {
    return json(400, { ok: false, error: 'The submission could not be read.' });
  }
  if (rawText.length > 65_536) return json(413, { ok: false, error: 'Submission is too large.' });

  let raw: unknown;
  try {
    raw = JSON.parse(rawText);
  } catch {
    return json(400, { ok: false, error: 'The submission is not valid JSON.' });
  }
  const values = normalize(raw);
  if (!values) return json(400, { ok: false, error: 'The submission has an invalid shape.' });

  // A filled honeypot receives a neutral success response so automated clients
  // do not learn which anti-abuse check they tripped.
  if (textValue(values.company_website)) return json(200, { ok: true, reference: 'received' });

  const validationError = validateShape(values, definition);
  if (validationError) return json(422, { ok: false, error: validationError });

  const turnstileOk = await verifyTurnstile(request, env, textValue(values.turnstile_token), definition.action);
  if (!turnstileOk) return json(422, { ok: false, error: 'Please complete the verification and try again.' });

  if (!env.RESEND_API_KEY) {
    return json(503, { ok: false, error: 'Email delivery is not configured in this environment.' });
  }

  const reference = crypto.randomUUID().split('-')[0].toUpperCase();
  const to = env.FORM_TO_EMAIL || 'founders@pilotprotocol.network';
  const from = env.FORM_FROM_EMAIL || 'Pilot Protocol Website <forms@newsletter.pilotprotocol.network>';
  const replyTo = cleanLine(values.email);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${definition.action}-${reference}-${crypto.randomUUID()}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: cleanLine(definition.subject(values)).slice(0, 180),
      text: definition.text(values, reference),
      html: definition.html(values, reference),
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    return json(502, { ok: false, error: 'Email delivery failed. Please email the team directly.' });
  }

  return json(200, { ok: true, reference });
}
