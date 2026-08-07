import { ClerkProvider } from "@clerk/nextjs";

import {
  getClerkProxyUrl,
  isClerkPublishableConfigured,
} from "@/lib/clerk";

export function isClerkEnabled() {
  return isClerkPublishableConfigured();
}

/** Wraps the tree with Clerk only when publishable key is configured. */
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isClerkEnabled()) {
    return children;
  }

  const proxyUrl = getClerkProxyUrl();

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/portal"
      {...(proxyUrl ? { proxyUrl } : {})}
    >
      {children}
    </ClerkProvider>
  );
}
