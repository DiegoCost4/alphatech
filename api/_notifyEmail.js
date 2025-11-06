// api/_notifyEmail.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Dispara e-mail para o admin com os dados do orçamento.
 * items: [{ service_name?: string, service?: {name}, quantity }]
 */
export async function notifyAdminEmail({ quote, items }) {
  const to = (process.env.ADMIN_EMAIL || '').trim();
  if (!to) {
    console.log('❌ ADMIN_EMAIL não configurado');
    return;
  }

  console.log('📧 Enviando e-mail para', to);
  console.log('🧾 Dados do orçamento:', quote?.name, quote?.phone);

  const itemLines = (items || []).map(
    it => `<li>${it.service_name || it.service?.name || 'Serviço'} x${it.quantity}</li>`
  ).join('');

  const html = `
    <h2>Novo orçamento recebido</h2>
    <p><b>Cliente:</b> ${quote.name || '-'}<br>
    <b>WhatsApp:</b> ${quote.phone || '-'}<br>
    <b>E-mail:</b> ${quote.email || '-'}</p>
    <p><b>Itens:</b></p>
    <ul>${itemLines}</ul>
    <p><b>Observações:</b><br>${quote.notes || '-'}</p>
    <p>Veja todos em: <a href="https://alphatech-plum.vercel.app/admin/">Painel Admin</a></p>
  `;

  try {
    const resend = new (await import('resend')).Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const response = await resend.emails.send({
      from,
      to,
      subject: 'Novo orçamento recebido',
      html,
    });
    console.log('✅ E-mail enviado com sucesso:', response?.id || response);
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail:', err);
  }
}
