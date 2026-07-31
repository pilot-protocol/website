import {
  cleanLine,
  escapeHtml,
  field,
  handleForm,
  htmlField,
  isEmail,
  oneOf,
  type FormEnv,
} from '../_form-mail';

const TYPES = ['security', 'privacy', 'reliability', 'product-bug', 'other'];
const SEVERITIES = ['critical', 'high', 'medium', 'low', 'unsure'];

export const onRequest: PagesFunction<FormEnv> = async ({ request, env }) =>
  handleForm(request, env, {
    action: 'security-disclosure',
    required: ['email', 'issue_type', 'severity', 'affected_surface', 'summary', 'details', 'safe_testing'],
    limits: {
      name: 120,
      email: 254,
      organization: 160,
      issue_type: 40,
      severity: 20,
      affected_surface: 500,
      summary: 240,
      details: 12_000,
      reproduction: 12_000,
      impact: 6_000,
      disclosure_timeline: 2_000,
    },
    validate: (values) => {
      if (!isEmail(values.email)) return 'Please enter a valid email address.';
      if (!oneOf(values.issue_type, TYPES)) return 'Please choose a valid issue type.';
      if (!oneOf(values.severity, SEVERITIES)) return 'Please choose a valid severity.';
      if (values.safe_testing !== 'accepted') return 'Please confirm the safe-testing statement.';
      return null;
    },
    subject: (values) => `[Disclosure][${cleanLine(values.severity).toUpperCase()}][${cleanLine(values.issue_type)}] ${cleanLine(values.summary)}`,
    text: (values, reference) => [
      `Pilot Protocol disclosure — ${reference}`,
      '',
      field('Reporter', values.name),
      field('Email', values.email),
      field('Organization', values.organization),
      field('Issue type', values.issue_type),
      field('Reporter severity', values.severity),
      field('Affected surface', values.affected_surface),
      field('Summary', values.summary),
      '',
      'Details:', values.details || '',
      '',
      'Reproduction:', values.reproduction || 'Not provided',
      '',
      'Potential impact:', values.impact || 'Not provided',
      '',
      'Disclosure timeline / coordination:', values.disclosure_timeline || 'Not provided',
      '',
      'Reporter confirmed the safe-testing statement.',
    ].join('\n'),
    html: (values, reference) => `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:760px">
        <p style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.08em">Pilot Protocol disclosure · ${escapeHtml(reference)}</p>
        <table style="border-collapse:collapse">${htmlField('Reporter', values.name)}${htmlField('Email', values.email)}${htmlField('Organization', values.organization)}${htmlField('Issue type', values.issue_type)}${htmlField('Reporter severity', values.severity)}${htmlField('Affected surface', values.affected_surface)}${htmlField('Summary', values.summary)}</table>
        <h2 style="font-size:18px;margin-top:28px">Details</h2><p>${escapeHtml(values.details)}</p>
        <h2 style="font-size:18px;margin-top:28px">Reproduction</h2><p>${escapeHtml(values.reproduction) || '<em>Not provided</em>'}</p>
        <h2 style="font-size:18px;margin-top:28px">Potential impact</h2><p>${escapeHtml(values.impact) || '<em>Not provided</em>'}</p>
        <h2 style="font-size:18px;margin-top:28px">Disclosure timeline / coordination</h2><p>${escapeHtml(values.disclosure_timeline) || '<em>Not provided</em>'}</p>
        <p style="font-size:12px;color:#777;margin-top:32px">Reporter confirmed the safe-testing statement.</p>
      </div>`,
  });
