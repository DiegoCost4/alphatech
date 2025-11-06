// api/_notifyEmail.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Dispara e-mail para o admin com os dados do orçamento.
 * items: [{ service_name?: string, service?: {name}, quantity }]
 */
export async function notifyAdminEmail({ quote, items }) {
  const to = (process.env.ADMIN_EMAIL || '').trim();
  if (!to) return;

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

  await resend.emails.send({
    from: process.env.RESEND_FROM || 'AlphaTech <notificacoes@alphatech.com.br>',
    to,
    subject: 'Novo orçamento recebido',
    html
  });
}
