import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function FinanceReportingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Finance · Reporting"
        title="Indicateurs financiers"
        description="Synthèse P&L et cash pour le pilotage transverse."
      />
      <KpiGrid
        items={[
          { label: "CA M", value: "186 k€" },
          { label: "Charges M", value: "114 k€" },
          { label: "EBITDA M", value: "41 k€" },
          { label: "Burn 30 j", value: "−18 k€" },
        ]}
      />
      <DataTableCard
        title="P&L synthétique (mois)"
        columns={["Poste", "Budget", "Réel", "Écart"]}
        rows={[
          ["Chiffre d’affaires", "190 k€", "186 k€", "−4 k€"],
          ["Coût des ventes", "72 k€", "68 k€", "+4 k€"],
          ["Charges opex", "95 k€", "114 k€", "−19 k€"],
          ["Résultat net", "18 k€", "12 k€", "−6 k€"],
        ]}
      />
    </div>
  );
}
