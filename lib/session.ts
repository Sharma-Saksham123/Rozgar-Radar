import { isLocalMode } from "./config";

/**
 * Client-side session helpers. In local mode the signed-in user id is kept in
 * localStorage and sent with every API call. With Supabase configured, the
 * browser client holds the real session cookie instead.
 */

const LOCAL_USER_KEY = "rozgar-radar-local-user-id";

export function getLocalUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LOCAL_USER_KEY);
}

export function setLocalUserId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_USER_KEY, id);
}

export function clearLocalUserId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_USER_KEY);
}

/** Returns the current user id, or null when signed out. */
export async function getSessionUserId(): Promise<string | null> {
  if (isLocalMode()) return getLocalUserId();

  const { createClient } = await import("./supabase/client");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

/** Signs the user out from both local storage and Supabase auth. */
export async function signOutUser(): Promise<void> {
  if (isLocalMode()) {
    clearLocalUserId();
    return;
  }

  const { createClient } = await import("./supabase/client");
  const supabase = createClient();
  await supabase.auth.signOut();
}
