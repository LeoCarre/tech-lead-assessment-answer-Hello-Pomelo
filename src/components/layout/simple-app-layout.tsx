import Link from "next/link";

import {
  AppBreadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/app-breadcrumbs";
import Logo from "@/components/layout/logo";

export type { BreadcrumbItem };

export default function SimpleAppLayout({
  children,
  breadcrumbs,
}: Readonly<{
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
}>) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="border-border/80 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Accueil Hello Pomelo"
          >
            <Logo />
          </Link>

          <AppBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </header>
      <main className="bg-muted/30 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
