import { ClerkProvider } from "@clerk/nextjs";

import { isClerkPublishableConfigured } from "@/lib/clerk";

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

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/portal"
    >
      {children}
    </ClerkProvider>
  );
}
