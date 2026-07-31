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

const TOPICS = ['enterprise', 'product', 'partnership', 'press', 'security-review', 'governance', 'roadmap', 'other'];

export const onRequest: PagesFunction<FormEnv> = async ({ request, env }) =>
  handleForm(request, env, {
    action: 'contact',
    required: ['name', 'email', 'topic', 'message'],
    limits: { name: 120, email: 254, organization: 160, role: 160, topic: 40, message: 8_000 },
    validate: (values) => {
      if (!isEmail(values.email)) return 'Please enter a valid work email address.';
      if (!oneOf(values.topic, TOPICS)) return 'Please choose a valid topic.';
      return null;
    },
    subject: (values) => `[Website contact] ${cleanLine(values.topic)} — ${cleanLine(values.name)}`,
    text: (values, reference) => [
      `Pilot Protocol website inquiry — ${reference}`,
      '',
      field('Name', values.name),
      field('Email', values.email),
      field('Organization', values.organization),
      field('Role', values.role),
      field('Topic', values.topic),
      '',
      'Message:',
      values.message || '',
      '',
      `Submitted from: ${values.page_url || 'Website contact form'}`,
    ].join('\n'),
    html: (values, reference) => `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:720px">
        <p style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.08em">Pilot Protocol website inquiry · ${escapeHtml(reference)}</p>
        <table style="border-collapse:collapse">${htmlField('Name', values.name)}${htmlField('Email', values.email)}${htmlField('Organization', values.organization)}${htmlField('Role', values.role)}${htmlField('Topic', values.topic)}</table>
        <h2 style="font-size:18px;margin-top:28px">Message</h2><p>${escapeHtml(values.message)}</p>
        <p style="font-size:12px;color:#777;margin-top:32px">Submitted from ${escapeHtml(values.page_url || 'Website contact form')}</p>
      </div>`,
  });
