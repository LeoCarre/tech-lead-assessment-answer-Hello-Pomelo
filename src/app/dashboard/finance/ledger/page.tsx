import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function FinanceLedgerPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Finance · Grand livre"
        title="Écritures comptables"
        description="Dernières écritures synchronisées depuis l’app compta."
      />
      <KpiGrid
        items={[
          { label: "Écritures M", value: "1 842" },
          { label: "Journaux", value: "6" },
          { label: "Non lettrées", value: "23" },
          { label: "Clôture", value: "Ouverte" },
        ]}
      />
      <DataTableCard
        title="Écritures récentes"
        columns={["Date", "Journal", "Compte", "Libellé", "Montant"]}
        rows={[
          ["6 août", "VE", "411000", "Facture ACME FAC-1092", "+18 400 €"],
          ["6 août", "ACH", "401000", "Fournisseur FF-441", "-6 200 €"],
          ["5 août", "BQ", "512000", "Virement client Nord", "+12 000 €"],
          ["5 août", "OD", "628000", "Régularisation charges", "-890 €"],
        ]}
      />
    </div>
  );
}
