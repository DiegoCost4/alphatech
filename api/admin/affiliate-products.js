// api/admin/affiliate-products.js
import { getAdminClient, assertAdminToken } from '../_supabase.js';

export default async function handler(req, res) {
    // Proteção com x-admin-token, igual outras rotas admin
    try {
        assertAdminToken(req);
    } catch (e) {
        return res.status(e.statusCode || 401).json({ error: e.message });
    }

    const supa = getAdminClient();

    if (req.method === 'GET') {
        try {
            const { data, error } = await supa
                .from('affiliate_products')
                .select('id, created_at, name, description, price_display, image_url, affiliate_url, active, sort_order')
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            return res.status(200).json({ products: data });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, description, price_display, image_url, affiliate_url, active, sort_order } = req.body || {};

            if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
            if (!affiliate_url) return res.status(400).json({ error: 'Link de afiliado é obrigatório' });

            const { error } = await supa.from('affiliate_products').insert([{
                name,
                description: description || null,
                price_display: price_display || null,
                image_url: image_url || null,
                affiliate_url,
                active: active ?? true,
                sort_order: Number.isFinite(sort_order) ? sort_order : 0
            }]);

            if (error) throw error;
            return res.status(201).json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const { id, ...fields } = req.body || {};
            if (!id) return res.status(400).json({ error: 'id é obrigatório' });

            const allow = [
                'name',
                'description',
                'price_display',
                'image_url',
                'affiliate_url',
                'active',
                'sort_order'
            ];

            const patch = {};
            for (const k of allow) {
                if (k in fields) patch[k] = fields[k];
            }

            if (!Object.keys(patch).length) {
                return res.status(400).json({ error: 'Nada para atualizar' });
            }

            const { error } = await supa
                .from('affiliate_products')
                .update(patch)
                .eq('id', id);

            if (error) throw error;
            return res.status(200).json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal error' });
        }
    }
    if (req.method === 'DELETE') {
        try {
            const { id } = req.body || {};
            if (!id) {
                return res.status(400).json({ error: 'id é obrigatório' });
            }

            const { error } = await supa
                .from('affiliate_products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ ok: true });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
