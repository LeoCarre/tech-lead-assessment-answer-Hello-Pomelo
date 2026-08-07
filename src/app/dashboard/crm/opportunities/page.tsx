import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function CrmOpportunitiesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App CRM · Opportunités"
        title="Pipeline commercial"
        description="Opportunités ouvertes et prochaines actions."
      />
      <KpiGrid
        items={[
          { label: "Ouvertes", value: "14" },
          { label: "Montant", value: "412 k€" },
          { label: "Close date ≤ 30 j", value: "4" },
          { label: "Prob. moy.", value: "46 %" },
        ]}
      />
      <DataTableCard
        title="Opportunités"
        columns={["Nom", "Compte", "Montant", "Étape", "Close"]}
        rows={[
          ["Portail SSO", "ACME Industrie", "120 k€", "Negotiation", "28 août"],
          ["Module CRM", "Nord Logistics", "48 k€", "Proposal", "10 sept."],
          ["Renewal", "Helio Santé", "22 k€", "Qualification", "30 sept."],
          ["Upsell analytics", "Pomelo Retail", "15 k€", "Discovery", "15 oct."],
        ]}
      />
    </div>
  );
}
