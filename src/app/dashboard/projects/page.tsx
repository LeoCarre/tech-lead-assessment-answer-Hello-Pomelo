import Link from "next/link";

import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";
import { buttonVariants } from "@/components/ui/button";

export default function ProjectsHomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Projets"
        title="Delivery & planning"
        description="Tâches, planning et time tracking — portail vers l’app projets."
      />
      <KpiGrid
        items={[
          { label: "Projets actifs", value: "12" },
          { label: "Tâches ouvertes", value: "47" },
          { label: "Charge semaine", value: "86 %" },
          { label: "Heures non fact.", value: "14 h" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/projects/tasks" className={buttonVariants({ variant: "secondary", className: "cursor-pointer" })}>
          Tâches
        </Link>
        <Link href="/dashboard/projects/planning" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Planning
        </Link>
        <Link href="/dashboard/projects/time" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Time tracking
        </Link>
      </div>
      <DataTableCard
        title="Priorités delivery"
        columns={["Projet", "Livrable", "Owner", "Échéance"]}
        rows={[
          ["Portail SSO", "Cut-over staging", "Léa M.", "8 août"],
          ["CRM Nord", "Import comptes", "Hugo M.", "12 août"],
          ["Billing v2", "Règles TVA", "P. Costa", "18 août"],
        ]}
      />
    </div>
  );
}
