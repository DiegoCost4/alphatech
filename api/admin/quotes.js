// api/admin/quotes.js
import { getAdminClient, assertAdminToken } from '../_supabase.js';

export default async function handler(req, res) {
    try {
        assertAdminToken(req);
    } catch (e) {
        return res.status(e.statusCode || 401).json({ error: e.message });
    }

    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page || '1', 10);
            const size = 20;
            const from = (page - 1) * size;
            const to = from + size - 1;

            const supa = getAdminClient();
            const { data: quotes, error: e1 } = await supa
                .from('quotes')
                .select('id, created_at, name, phone, email, notes, status')
                .order('created_at', { ascending: false })
                .range(from, to);
            if (e1) throw e1;

            // carrega itens por orçamento (agora com base_price) + total por orçamento
            const ids = quotes.map(q => q.id);
            let itemsByQuote = {};
            let totalsByQuote = {};

            if (ids.length) {
                const { data: items, error: e2 } = await supa
                    .from('quote_items')
                    .select('quote_id, quantity, detail, service:service_id(id, name, unit_label, base_price)')
                    .in('quote_id', ids);

                if (e2) throw e2;

                itemsByQuote = items.reduce((acc, it) => {
                    (acc[it.quote_id] ||= []).push(it);
                    return acc;
                }, {});

                totalsByQuote = items.reduce((acc, it) => {
                    const price = Number(it.service?.base_price ?? 0);
                    const sub = price * Number(it.quantity || 0);
                    acc[it.quote_id] = (acc[it.quote_id] || 0) + sub;
                    return acc;
                }, {});
            }

            return res.status(200).json({ quotes, itemsByQuote, totalsByQuote, page });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    // (Opcional) PATCH para atualizar status do orçamento
    if (req.method === 'PATCH') {
        try {
            const { id, status } = req.body || {};
            if (!id || !status) return res.status(400).json({ error: 'id/status obrigatórios' });
            const supa = getAdminClient();
            const { error } = await supa.from('quotes').update({ status }).eq('id', id);
            if (error) throw error;
            return res.status(200).json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
