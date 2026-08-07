/** Clerk is usable for SSO when both keys are present. */
export function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );
}

/** Client-safe: publishable key alone enables ClerkProvider. */
export function isClerkPublishableConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

/**
 * Production-only Frontend API proxy (DuckDNS cannot CNAME to Clerk).
 * Leave unset locally so Development keys keep using `*.clerk.accounts.dev`.
 */
export function getClerkProxyUrl() {
  const value = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  return value || undefined;
}

export function isClerkProxyEnabled() {
  return Boolean(getClerkProxyUrl());
}
