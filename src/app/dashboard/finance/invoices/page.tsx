import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function FinanceInvoicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Finance · Factures"
        title="Facturation"
        description="Factures clients et suivi d’encaissement."
      />
      <KpiGrid
        items={[
          { label: "Ouvertes", value: "24" },
          { label: "À encaisser", value: "86 k€" },
          { label: "En retard", value: "4" },
          { label: "Encaissé M", value: "142 k€" },
        ]}
      />
      <DataTableCard
        title="Factures"
        columns={["N°", "Client", "HT", "Échéance", "Statut"]}
        rows={[
          ["FAC-1092", "ACME Industrie", "18 400 €", "12 août", "Émise"],
          ["FAC-1090", "Nord Logistics", "7 800 €", "20 août", "Émise"],
          ["FAC-1078", "Helio Santé", "9 100 €", "28 juil.", "Retard"],
          ["FAC-1065", "Pomelo Retail", "3 200 €", "5 août", "Payée"],
        ]}
      />
    </div>
  );
}
