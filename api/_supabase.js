// api/_supabase.js
import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configurados');
  }
  // SERVICE_ROLE só no server (aqui é serverless)
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
