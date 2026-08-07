"use client";

import { SignIn } from "@clerk/nextjs";

/**
 * Client Sign-in surface. Keep this page minimal: a permanent troubleshooting
 * banner looked like a Clerk failure even when local auth worked.
 */
export function SignInView() {
  return (
    <div className="bg-muted/30 flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <SignIn />
      <noscript>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          Active JavaScript pour te connecter via Clerk.
        </p>
      </noscript>
    </div>
  );
}
