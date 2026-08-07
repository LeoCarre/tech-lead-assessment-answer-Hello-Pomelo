"use client";

import { usePathname } from "next/navigation";

import {
  AppBreadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/app-breadcrumbs";
import { DashboardAuthControls } from "@/components/layout/header/dashboard-auth-controls";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { resolveEnvironment } from "@/lib/portal-environments";

/** Fil d’Ariane local à l’app (ex. RH › Congés), sans Accueil / Q3. */
function localAppBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const environment = resolveEnvironment(pathname);
  const crumbs: BreadcrumbItem[] = [
    { label: environment.shortLabel, href: environment.href },
  ];

  const matchingNav = [...environment.nav]
    .filter((item) => {
      if (item.exact) return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (matchingNav && matchingNav.href !== environment.href) {
    crumbs.push({ label: matchingNav.title });
  } else if (environment.id === "dashboard") {
    const root = environment.nav.find((item) => item.exact);
    if (root && pathname === root.href) {
      crumbs[0] = { label: root.title };
    }
  }

  return crumbs;
}

export function SiteHeader() {
  const pathname = usePathname();
  const breadcrumbs = localAppBreadcrumbs(pathname);

  return (
    <header className="bg-background/70 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex h-full w-full items-center gap-1 px-4 lg:gap-2">
        <SidebarTrigger className="shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4! w-px! shrink-0 self-center! data-vertical:h-4! data-vertical:self-center!"
        />
        <div className="min-w-0 flex-1">
          <AppBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <DashboardAuthControls />
        </div>
      </div>
    </header>
  );
}
