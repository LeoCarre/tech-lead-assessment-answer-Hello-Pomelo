import Link from "next/link";

import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";
import { buttonVariants } from "@/components/ui/button";

export default function HrHomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App RH"
        title="Gestion des ressources humaines"
        description="Employés, congés et paie — surface portail branchée sur l’app RH existante."
      />
      <KpiGrid
        items={[
          { label: "Collaborateurs", value: "128" },
          { label: "Congés en attente", value: "3" },
          { label: "Absents aujourd’hui", value: "5" },
          { label: "Masse salariale M-1", value: "412 k€" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/hr/employees" className={buttonVariants({ variant: "secondary", className: "cursor-pointer" })}>
          Employés
        </Link>
        <Link href="/dashboard/hr/leave" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Congés
        </Link>
        <Link href="/dashboard/hr/payroll" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Paie
        </Link>
      </div>
      <DataTableCard
        title="À traiter"
        columns={["Type", "Collaborateur", "Détail", "Statut"]}
        rows={[
          ["Congé", "Camille Dupont", "12–14 août · CP", "En validation"],
          ["Onboarding", "Hugo Martin", "Contrat CDI · poste Design", "Checklist 4/7"],
          ["Paie", "Équipe Delivery", "Variables juin", "À saisir"],
        ]}
      />
    </div>
  );
}
