/**
 * Extracts a human-readable message from anything thrown by Supabase
 * (AuthError, PostgrestError, StorageError) or plain JS errors.
 * Supabase error objects are not always `Error` instances, so `instanceof`
 * checks alone lose the message.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string") return err || fallback;

  if (typeof err === "object") {
    const record = err as Record<string, unknown>;
    const message = typeof record.message === "string" ? record.message : "";
    const details = typeof record.details === "string" ? record.details : "";
    const hint = typeof record.hint === "string" ? record.hint : "";
    const code = typeof record.code === "string" ? record.code : "";

    const parts = [message, details, hint].filter(Boolean);
    if (parts.length > 0) {
      return code ? `${parts.join(" — ")} (${code})` : parts.join(" — ");
    }
  }

  return fallback;
}

/** Friendlier wording for the most common RLS / auth failures. */
export function humaniseSupabaseError(err: unknown, fallback: string): string {
  const raw = getErrorMessage(err, fallback);
  if (/row-level security/i.test(raw)) {
    return "You don't have permission to perform this action. If you just signed up, confirm your email and sign in first.";
  }
  if (/User already registered|already been registered/i.test(raw)) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (/rate limit/i.test(raw)) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return raw;
}
