"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/**
 * Client Sign-in surface with a visible fallback if Clerk JS fails to load
 * (wrong build-time publishable key, blocked CDN, domain not allowed, etc.).
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
      <p className="text-muted-foreground max-w-lg text-center text-xs leading-relaxed">
        Écran blanc / erreur{" "}
        <code className="text-foreground">failed_to_load_clerk_js</code> ? Vérifie
        que la clé{" "}
        <code className="text-foreground">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
        (pk_live_…) est passée en <strong>build-arg</strong> Docker, que le
        domaine est autorisé dans Clerk, et que le CDN Clerk n’est pas bloqué.
        Puis{" "}
        <Link
          href="/portal"
          className={buttonVariants({
            variant: "link",
            className: "h-auto p-0 text-xs",
          })}
        >
          retour architecture
        </Link>
        .
      </p>
    </div>
  );
}
