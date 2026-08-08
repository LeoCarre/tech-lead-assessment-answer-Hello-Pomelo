import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

import { isClerkConfigured, isClerkProxyEnabled } from "@/lib/clerk";

/**
 * Clerk middleware keeps the session alive.
 * Auth gates live on resources (see dashboard/layout), not path matchers -
 * `createRouteMatcher` is deprecated.
 *
 * When `NEXT_PUBLIC_CLERK_PROXY_URL` is set (production Coolify), Frontend API
 * traffic (including clerk.browser.js) goes through `/__clerk` on our domain
 * instead of the broken custom FAPI host. Local/dev leaves the env unset.
 */
export default isClerkConfigured()
  ? clerkMiddleware(
      isClerkProxyEnabled()
        ? {
            frontendApiProxy: {
              enabled: true,
            },
          }
        : undefined
    )
  : function proxy() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|md)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
