// api/admin/services.js
import { getAdminClient, assertAdminToken } from '../_supabase.js';

export default async function handler(req, res) {
  try {
    assertAdminToken(req);
  } catch (e) {
    return res.status(e.statusCode || 401).json({ error: e.message });
  }

  const supa = getAdminClient();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supa
        .from('services')
        .select('id, created_at, name, description, unit_label, base_price, active')
        .order('name', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ services: data });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, unit_label, base_price, active } = req.body || {};
      if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
      const { error } = await supa.from('services').insert([{
        name, description: description || null,
        unit_label: unit_label || 'un',
        base_price: base_price ?? null,
        active: active ?? true
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
      const allow = ['name','description','unit_label','base_price','active'];
      const patch = {};
      for (const k of allow) if (k in fields) patch[k] = fields[k];
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nada para atualizar' });
      const { error } = await supa.from('services').update(patch).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
