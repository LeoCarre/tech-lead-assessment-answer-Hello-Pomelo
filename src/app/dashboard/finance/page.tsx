import Link from "next/link";

import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";
import { buttonVariants } from "@/components/ui/button";

export default function FinanceHomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Finance"
        title="Comptabilité & reporting"
        description="Grand livre, factures et reporting — portail vers l’app finance."
      />
      <KpiGrid
        items={[
          { label: "Trésorerie", value: "1,24 M€" },
          { label: "Factures dues", value: "86 k€" },
          { label: "Retard > 30 j", value: "12 k€" },
          { label: "Marge brute M", value: "38 %" },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/finance/ledger" className={buttonVariants({ variant: "secondary", className: "cursor-pointer" })}>
          Grand livre
        </Link>
        <Link href="/dashboard/finance/invoices" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Factures
        </Link>
        <Link href="/dashboard/finance/reporting" className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
          Reporting
        </Link>
      </div>
      <DataTableCard
        title="Alertes cash"
        columns={["Type", "Référence", "Montant", "Échéance"]}
        rows={[
          ["Facture client", "FAC-1092", "18 400 €", "12 août"],
          ["Fournisseur", "FF-441", "6 200 €", "15 août"],
          ["Relance", "FAC-1078", "9 100 €", "Dépassé"],
        ]}
      />
    </div>
  );
}
