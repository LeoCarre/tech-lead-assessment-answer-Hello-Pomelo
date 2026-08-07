import {
  Building2,
  Calculator,
  CalendarDays,
  ClipboardList,
  Contact,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Timer,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type PortalEnvironmentId =
  | "dashboard"
  | "hr"
  | "crm"
  | "finance"
  | "projects";

export type PortalNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type PortalEnvironment = {
  id: PortalEnvironmentId;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  icon: LucideIcon;
  nav: PortalNavItem[];
};

export const PORTAL_ENVIRONMENTS: PortalEnvironment[] = [
  {
    id: "dashboard",
    label: "Espace partagé",
    shortLabel: "Dashboard",
    description: "Vue unifiée cross-métiers",
    href: "/dashboard",
    icon: LayoutDashboard,
    nav: [
      {
        title: "Vue unifiée",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Activité récente",
        href: "/dashboard/activity",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "hr",
    label: "App RH",
    shortLabel: "RH",
    description: "Employés, congés, paies",
    href: "/dashboard/hr",
    icon: Users,
    nav: [
      { title: "Vue RH", href: "/dashboard/hr", icon: Users, exact: true },
      {
        title: "Employés",
        href: "/dashboard/hr/employees",
        icon: Contact,
      },
      {
        title: "Congés",
        href: "/dashboard/hr/leave",
        icon: CalendarDays,
      },
      {
        title: "Paie",
        href: "/dashboard/hr/payroll",
        icon: Wallet,
      },
    ],
  },
  {
    id: "crm",
    label: "App CRM",
    shortLabel: "CRM",
    description: "Clients, opportunités, devis",
    href: "/dashboard/crm",
    icon: Building2,
    nav: [
      {
        title: "Vue CRM",
        href: "/dashboard/crm",
        icon: Building2,
        exact: true,
      },
      {
        title: "Clients",
        href: "/dashboard/crm/clients",
        icon: Contact,
      },
      {
        title: "Opportunités",
        href: "/dashboard/crm/opportunities",
        icon: ClipboardList,
      },
      {
        title: "Devis",
        href: "/dashboard/crm/quotes",
        icon: FileText,
      },
    ],
  },
  {
    id: "finance",
    label: "App Finance",
    shortLabel: "Finance",
    description: "Comptabilité, factures, reporting",
    href: "/dashboard/finance",
    icon: Calculator,
    nav: [
      {
        title: "Vue Finance",
        href: "/dashboard/finance",
        icon: Calculator,
        exact: true,
      },
      {
        title: "Comptabilité",
        href: "/dashboard/finance/ledger",
        icon: FileSpreadsheet,
      },
      {
        title: "Factures",
        href: "/dashboard/finance/invoices",
        icon: Receipt,
      },
      {
        title: "Reporting",
        href: "/dashboard/finance/reporting",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "projects",
    label: "App Projets",
    shortLabel: "Projets",
    description: "Tâches, planning, timetracking",
    href: "/dashboard/projects",
    icon: FolderKanban,
    nav: [
      {
        title: "Vue Projets",
        href: "/dashboard/projects",
        icon: FolderKanban,
        exact: true,
      },
      {
        title: "Tâches",
        href: "/dashboard/projects/tasks",
        icon: ClipboardList,
      },
      {
        title: "Planning",
        href: "/dashboard/projects/planning",
        icon: CalendarDays,
      },
      {
        title: "Temps",
        href: "/dashboard/projects/time",
        icon: Timer,
      },
    ],
  },
];

export function resolveEnvironment(pathname: string): PortalEnvironment {
  const match = PORTAL_ENVIRONMENTS.filter((env) => env.id !== "dashboard")
    .filter(
      (env) => pathname === env.href || pathname.startsWith(`${env.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return match ?? PORTAL_ENVIRONMENTS[0]!;
}
