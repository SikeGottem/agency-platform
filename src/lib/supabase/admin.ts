import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Admin Supabase client with service role key.
 * ONLY use this in server-side contexts (API routes, Edge Functions).
 * This bypasses RLS — use with extreme caution.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
