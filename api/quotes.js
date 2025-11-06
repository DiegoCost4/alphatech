// api/quotes.js
import { getAdminClient } from './_supabase.js';
import { notifyAdminEmail } from './_notifyEmail.js';

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
        for (const it of items) {
            if (!it?.service_id || !Number.isInteger(it.quantity) || it.quantity <= 0) {
                return res.status(400).json({ error: 'Itens inválidos' });
            }
        }

        const supa = getAdminClient();

        // 1) cria a quote
        const { data: q, error: e1 } = await supa
            .from('quotes')
            .insert([{ name: name || null, phone, email: email || null, notes: notes || null, status: 'novo' }])
            .select('*')
            .single();
        if (e1) throw e1;

        // 2) insere itens
        const rows = items.map(it => ({
            quote_id: q.id,
            service_id: it.service_id,
            quantity: it.quantity,
            detail: it.detail || null
        }));
        const { error: e2 } = await supa.from('quote_items').insert(rows);
        if (e2) throw e2;

        // 3) busca nomes dos serviços para o e-mail
        const { data: itemsWithNames, error: e3 } = await supa
            .from('quote_items')
            .select('quantity, service:service_id(name)')
            .eq('quote_id', q.id);
        if (e3) throw e3;

        // 4) dispara o e-mail ao admin (não bloqueia a resposta)
        notifyAdminEmail({
            quote: q,
            items: (itemsWithNames || []).map(it => ({
                quantity: it.quantity,
                service_name: it.service?.name
            }))
        }).catch(() => { });

        // 5) responde para o front
        return res.status(201).json({ ok: true, id: q.id });
    } catch (e) {
        console.error(e);
        return res.status(e.statusCode || 500).json({ error: 'Internal error' });
    }
}
