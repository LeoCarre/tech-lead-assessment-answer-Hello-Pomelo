"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  resolveEnvironment,
  type PortalNavItem,
} from "@/lib/portal-environments";

function isActivePath(
  pathname: string,
  href: string,
  exact: boolean | undefined,
  allItems: PortalNavItem[]
) {
  if (exact) return pathname === href;

  const matches = allItems.filter((item) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  if (matches.length === 0) return false;

  const best = [...matches].sort((a, b) => b.href.length - a.href.length)[0];
  return best?.href === href;
}

export function NavMain() {
  const pathname = usePathname();
  const environment = resolveEnvironment(pathname);
  const items = environment.nav;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{environment.shortLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                className="hover:text-foreground active:text-foreground hover:bg-accent active:bg-accent cursor-pointer"
                isActive={isActivePath(
                  pathname,
                  item.href,
                  item.exact,
                  items
                )}
                tooltip={item.title}
                render={<Link href={item.href} />}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
