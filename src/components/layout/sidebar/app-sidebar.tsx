"use client";

import { EnvironmentSwitcher } from "@/components/layout/sidebar/environment-switcher";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsTablet } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close sheet on navigate only
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to breakpoint changes
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-1">
        <div className="px-2 pt-1 group-data-[collapsible=icon]:hidden">
          <AppBreadcrumbs
            className="text-[11px] leading-none"
            breadcrumbs={[
              { label: "Accueil", href: "/" },
              { label: "Question 3", href: "/portal" },
            ]}
          />
        </div>
        <EnvironmentSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-muted-foreground px-2 py-2 text-xs group-data-[collapsible=icon]:hidden">
          Portail unifié · SSO
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
