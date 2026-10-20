/**
 * Build-time configuration checks. Safe to import from client and server
 * code — only NEXT_PUBLIC_ variables are read here.
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** True when running against the built-in file store instead of Supabase. */
export function isLocalMode(): boolean {
  return !isSupabaseConfigured();
}
