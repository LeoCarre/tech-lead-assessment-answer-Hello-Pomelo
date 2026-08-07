import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function CrmQuotesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App CRM · Devis"
        title="Devis commerciaux"
        description="Suivi des devis émis et de leur validité."
      />
      <KpiGrid
        items={[
          { label: "Ouverts", value: "11" },
          { label: "Expirent ≤ 7 j", value: "2" },
          { label: "Acceptés M", value: "6" },
          { label: "Taux acceptation", value: "41 %" },
        ]}
      />
      <DataTableCard
        title="Devis"
        columns={["Réf.", "Compte", "Montant HT", "Validité", "Statut"]}
        rows={[
          ["EXP-241", "ACME Industrie", "120 000 €", "10 août", "Envoyé"],
          ["EXP-238", "Nord Logistics", "48 000 €", "22 août", "Relance"],
          ["EXP-233", "Helio Santé", "22 400 €", "1 sept.", "Brouillon"],
        ]}
      />
    </div>
  );
}
