import { isSupabaseConfigured } from "./config";

/**
 * Centralised env access. Keys are never hardcoded elsewhere and never
 * exposed to the browser unless prefixed with NEXT_PUBLIC_.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Add it to .env (see .env.example).`,
    );
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};

export const serverEnv = {
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  llmApiKey: () => process.env.LLM_API_KEY ?? "",
  llmBaseUrl: () => process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
  llmModel: () => process.env.LLM_MODEL ?? "gpt-4o-mini",
  resendApiKey: () => process.env.RESEND_API_KEY ?? "",
  emailFrom: () => process.env.EMAIL_FROM ?? "Rozgar Radar <alerts@example.com>",
  cronSecret: () => process.env.CRON_SECRET ?? "",
};

export { isSupabaseConfigured };
