"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export function NotFoundActions() {
  const router = useRouter();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        className="cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Page précédente
      </Button>
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "cursor-pointer",
        })}
      >
        <Home className="size-4" />
        Retour à l’accueil
      </Link>
    </div>
  );
}
