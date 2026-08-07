import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

import { isClerkConfigured } from "@/lib/clerk";

/**
 * Clerk middleware keeps the session alive.
 * Auth gates live on resources (see dashboard/layout), not path matchers —
 * `createRouteMatcher` is deprecated.
 */
export default isClerkConfigured()
  ? clerkMiddleware()
  : function proxy() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|md)).*)",
    "/(api|trpc)(.*)",
  ],
};
