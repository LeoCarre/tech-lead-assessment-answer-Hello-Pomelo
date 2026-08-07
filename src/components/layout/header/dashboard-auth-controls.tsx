"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function DashboardAuthControls() {
  if (!clerkEnabled) {
    return (
      <span className="text-muted-foreground hidden text-xs sm:inline">
        SSO inactif (clés Clerk absentes)
      </span>
    );
  }

  return <ClerkAuthButtons />;
}

function ClerkAuthButtons() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <SignInButton mode="redirect">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="cursor-pointer"
        >
          Connexion SSO
        </Button>
      </SignInButton>
    );
  }

  return <UserButton />;
}
