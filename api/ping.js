// /api/ping.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  try {
    // 1) ping “pong”
    const pong = { ok: true, msg: 'pong' };

    // 2) tenta enviar um e-mail de teste
    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = (process.env.ADMIN_EMAIL || '').trim();
    if (!to) {
      return res.status(200).json({ ...pong, email: 'ADMIN_EMAIL não configurado' });
    }

    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const r = await resend.emails.send({
      from,
      to,
      subject: 'Teste Resend via /api/ping',
      html: '<p>Teste OK ✅ — se chegou, Resend/ENVs estão certos.</p>'
    });

    return res.status(200).json({ ...pong, email: 'sent', id: r?.id || null });
  } catch (e) {
    return res.status(200).json({ ok: true, msg: 'pong', email: `erro: ${e?.message || 'falha'}` });
  }
}
