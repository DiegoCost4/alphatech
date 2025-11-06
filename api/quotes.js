// api/quotes.js
import { getAdminClient } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const { name, phone, email, notes, items } = body;

    // validações simples
    if (!phone) return res.status(400).json({ error: 'Informe o WhatsApp/telefone' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Selecione ao menos um serviço' });
    }
    // cada item: { service_id, quantity, detail? }
    for (const it of items) {
      if (!it?.service_id || !Number.isInteger(it.quantity) || it.quantity <= 0) {
        return res.status(400).json({ error: 'Itens inválidos' });
      }
    }

    const supa = getAdminClient();
    // cria quote
    const { data: q, error: e1 } = await supa
      .from('quotes')
      .insert([{ name: name || null, phone, email: email || null, notes: notes || null }])
      .select('id')
      .single();
    if (e1) throw e1;

    // cria itens
    const rows = items.map(it => ({
      quote_id: q.id,
      service_id: it.service_id,
      quantity: it.quantity,
      detail: it.detail || null
    }));
    const { error: e2 } = await supa.from('quote_items').insert(rows);
    if (e2) throw e2;

    return res.status(201).json({ ok: true, id: q.id });
  } catch (e) {
    console.error(e);
    return res.status(e.statusCode || 500).json({ error: 'Internal error' });
  }
}
