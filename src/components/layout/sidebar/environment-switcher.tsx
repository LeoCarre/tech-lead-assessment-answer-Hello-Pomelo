"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";

import Logo from "@/components/layout/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  PORTAL_ENVIRONMENTS,
  resolveEnvironment,
} from "@/lib/portal-environments";
import { cn } from "@/lib/utils";

export function EnvironmentSwitcher() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const current = resolveEnvironment(pathname);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="hover:text-foreground data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground h-12 cursor-pointer group-data-[collapsible=icon]:px-0!"
              />
            }
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Logo variant="app" />
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold">Hello Pomelo</p>
                <p className="text-muted-foreground truncate text-xs">
                  {current.label}
                </p>
              </div>
              <ChevronsUpDown className="text-muted-foreground ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Environnement
              </DropdownMenuLabel>
              {PORTAL_ENVIRONMENTS.map((env) => {
                const active = env.id === current.id;
                const Icon = env.icon;
                return (
                  <DropdownMenuItem
                    key={env.id}
                    className={cn(
                      "cursor-pointer items-start gap-3 py-2",
                      active && "bg-muted"
                    )}
                    render={<Link href={env.href} />}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <Icon className="text-secondary mt-0.5 size-4 shrink-0" />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-medium">{env.label}</span>
                      <span className="text-muted-foreground text-xs font-normal">
                        {env.description}
                      </span>
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
