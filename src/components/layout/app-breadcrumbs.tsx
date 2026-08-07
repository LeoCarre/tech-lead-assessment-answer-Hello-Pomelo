"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const QUESTION_NAV = [
  {
    label: "Question 1",
    href: "/customer-history",
    description: "Historique client",
  },
  {
    label: "Question 2",
    href: "/pricing",
    description: "Moteur de pricing",
  },
  {
    label: "Question 3",
    href: "/portal",
    description: "Portail & SSO",
  },
] as const;

function isQuestionLabel(label: string): boolean {
  return /^Question\s+\d+/i.test(label);
}

function QuestionBreadcrumbMenu({
  label,
  isCurrent,
}: {
  label: string;
  isCurrent: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 200);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          scheduleClose();
          return;
        }
        openMenu();
      }}
    >
      <DropdownMenuTrigger
        className={cn(
          "hover:text-foreground cursor-pointer truncate underline-offset-4 outline-none hover:underline",
          isCurrent && "text-foreground font-medium"
        )}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        aria-current={isCurrent ? "page" : undefined}
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={0}
        className="min-w-52 pt-1"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        {QUESTION_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <DropdownMenuItem
              key={item.href}
              className={cn(
                "cursor-pointer items-start",
                active && "bg-muted font-medium"
              )}
              onClick={() => {
                clearCloseTimer();
                setOpen(false);
                router.push(item.href);
              }}
            >
              <span className="flex flex-col gap-0.5">
                <span>{item.label}</span>
                <span className="text-muted-foreground text-xs font-normal">
                  {item.description}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppBreadcrumbs({
  breadcrumbs,
  className,
}: {
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Fil d’Ariane"
      className={cn(
        "text-muted-foreground flex min-w-0 items-center gap-1 text-sm",
        className
      )}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-1"
          >
            {index > 0 ? (
              <ChevronRight className="size-3.5 shrink-0 opacity-60" />
            ) : null}
            {isQuestionLabel(item.label) ? (
              <QuestionBreadcrumbMenu label={item.label} isCurrent={isLast} />
            ) : item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground truncate underline-offset-4 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast && "text-foreground font-medium"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
