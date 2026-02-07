import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client (for client-side operations if needed, using RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (for server-side operations, bypassing RLS)
// Only available if key is present (server-side)
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    })
    : null;
