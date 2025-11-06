// api/_email_test.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.ADMIN_EMAIL;
    if (!to) return res.status(400).json({ error: 'ADMIN_EMAIL não configurado' });

    const from = process.env.RESEND_FROM || 'onboarding@resend.dev'; // use onboarding para testar
    const r = await resend.emails.send({
      from,
      to,
      subject: 'Teste Resend - AlphaTech',
      html: '<p>Teste OK ✅ — se chegou, a parte de e-mail está funcionando.</p>'
    });

    return res.status(200).json({ ok: true, id: r?.id || null });
  } catch (e) {
    console.error('EMAIL_TEST_ERROR', e);
    return res.status(500).json({ error: e?.message || 'Falha ao enviar' });
  }
}
