import Link from "next/link";

import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";
import { buttonVariants } from "@/components/ui/button";

export default function CrmHomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App CRM"
        title="Relation client"
        description="Clients, opportunités et devis - portail d’accès à l’app CRM."
      />
      <KpiGrid
        items={[
          { label: "Comptes actifs", value: "86" },
          { label: "Pipeline", value: "412 k€" },
          { label: "Devis ouverts", value: "11" },
          { label: "Win rate 90 j", value: "28 %" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/crm/clients" className={buttonVariants({ variant: "secondary", className: "cursor-pointer" })}>
          Clients
        </Link>
        <Link href="/dashboard/crm/opportunities" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Opportunités
        </Link>
        <Link href="/dashboard/crm/quotes" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Devis
        </Link>
      </div>
      <DataTableCard
        title="Hot list"
        columns={["Compte", "Sujet", "Montant", "Étape"]}
        rows={[
          ["ACME Industrie", "Licence portail + SSO", "120 k€", "Negotiation"],
          ["Nord Logistics", "Module CRM", "48 k€", "Proposal"],
          ["Helio Santé", "Renewal support", "22 k€", "Qualification"],
        ]}
      />
    </div>
  );
}
