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

const PROFILES = [
  'private-agent-network',
  'agent-integration',
  'agent-capability-store',
  'secure-agent-runtime',
  'grounded-agent-search',
  'web-access-for-agents',
  'isolated-agent-compute',
  'agent-email-phone',
  'sales-agent-stack',
  'agent-commerce',
  'agent-ready-apis',
  'live-data-for-agents',
];

export const onRequest: PagesFunction<FormEnv> = async ({ request, env }) =>
  handleForm(request, env, {
    action: 'solution-lead',
    required: ['name', 'email', 'profile', 'choice', 'context'],
    limits: {
      name: 120,
      email: 254,
      organization: 160,
      profile: 80,
      offer: 180,
      choice: 240,
      context: 4_000,
    },
    validate: (values) => {
      if (!isEmail(values.email)) return 'Please enter a valid work email address.';
      if (!oneOf(values.profile, PROFILES)) return 'Please choose a valid solution profile.';
      return null;
    },
    subject: (values) => `[Solution funnel] ${cleanLine(values.profile)} — ${cleanLine(values.name)}`,
    text: (values, reference) => [
      `Pilot Protocol solution-funnel lead — ${reference}`,
      '',
      field('Name', values.name),
      field('Email', values.email),
      field('Organization', values.organization),
      field('Profile', values.profile),
      field('Offer', values.offer),
      field('Selected need', values.choice),
      '',
      'Context:',
      values.context || '',
      '',
      `Submitted from: ${values.page_url || 'Pilot solution landing page'}`,
    ].join('\n'),
    html: (values, reference) => `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:720px">
        <p style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.08em">Pilot Protocol solution lead · ${escapeHtml(reference)}</p>
        <table style="border-collapse:collapse">
          ${htmlField('Name', values.name)}
          ${htmlField('Email', values.email)}
          ${htmlField('Organization', values.organization)}
          ${htmlField('Profile', values.profile)}
          ${htmlField('Offer', values.offer)}
          ${htmlField('Selected need', values.choice)}
        </table>
        <h2 style="font-size:18px;margin-top:28px">Context</h2>
        <p>${escapeHtml(values.context)}</p>
        <p style="font-size:12px;color:#777;margin-top:32px">Submitted from ${escapeHtml(values.page_url || 'Pilot solution landing page')}</p>
      </div>`,
  });
