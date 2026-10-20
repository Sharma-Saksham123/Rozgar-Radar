import { isLocalMode } from "./config";
import { getLocalUserId } from "./session";

/**
 * fetch() wrapper that attaches the local session header when running in
 * local mode. With Supabase configured the auth cookie is sent automatically.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (isLocalMode()) {
    const userId = getLocalUserId();
    if (userId) headers.set("x-local-user-id", userId);
  } else if (typeof window !== "undefined") {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }
    } catch {
      // Proceed with cookies if session retrieval fails
    }
  }

  return fetch(input, { ...init, headers });
}
