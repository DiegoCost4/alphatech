import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
    const url = (process.env.SUPABASE_URL || '').trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE || '').trim();

    if (!/^https?:\/\//i.test(url)) {
        throw new Error('Env SUPABASE_URL inválida');
    }
    if (!key || key.length < 20) {
        throw new Error('Env SUPABASE_SERVICE_ROLE ausente/curta');
    }
    return createClient(url, key, { auth: { persistSession: false } });
}

export function assertAdminToken(req) {
    const token = req.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) {
        const err = new Error('Unauthorized');
        err.statusCode = 401;
        throw err;
    }
}
