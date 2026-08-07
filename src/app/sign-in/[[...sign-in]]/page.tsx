import { redirect } from "next/navigation";

import { SignInView } from "@/components/auth/sign-in-view";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    redirect("/portal");
  }

  return <SignInView />;
}
