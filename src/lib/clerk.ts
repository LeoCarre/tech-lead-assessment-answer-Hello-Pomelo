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

function isProductionPublishableKey() {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_") ??
    false
  );
}

/**
 * Frontend API proxy URL.
 *
 * - Explicit `NEXT_PUBLIC_CLERK_PROXY_URL` wins when set.
 * - Production keys (`pk_live_`) default to `/__clerk` so Coolify does not
 *   need a separate build-arg (DuckDNS cannot CNAME Clerk FAPI).
 * - Development keys (`pk_test_`) leave this unset → `*.clerk.accounts.dev`.
 */
export function getClerkProxyUrl() {
  const explicit = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  if (explicit) {
    return explicit;
  }
  if (isProductionPublishableKey()) {
    return "/__clerk";
  }
  return undefined;
}

export function isClerkProxyEnabled() {
  return Boolean(getClerkProxyUrl());
}
