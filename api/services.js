// api/services.js
import { getAdminClient } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supa = getAdminClient();
    const { data, error } = await supa
      .from('services')
      .select('id, name, description, unit_label')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ services: data });
  } catch (e) {
    console.error(e);
    return res.status(e.statusCode || 500).json({ error: 'Internal error' });
  }
}
