import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    redirect("/portal");
  }

  return (
    <div className="bg-muted/30 flex min-h-dvh items-center justify-center p-6">
      <SignUp />
    </div>
  );
}
