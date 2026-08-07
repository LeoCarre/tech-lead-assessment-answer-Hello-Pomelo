import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function CrmClientsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App CRM · Clients"
        title="Comptes clients"
        description="Annuaire comptes synchronisé depuis le CRM."
      />
      <KpiGrid
        items={[
          { label: "Comptes", value: "86" },
          { label: "Nouveaux 30 j", value: "5" },
          { label: "VIP", value: "9" },
          { label: "À risque", value: "2" },
        ]}
      />
      <DataTableCard
        title="Clients"
        columns={["Compte", "Segment", "Owner", "CA 12 mois", "Santé"]}
        rows={[
          ["ACME Industrie", "Enterprise", "Noah L.", "210 k€", "Bonne"],
          ["Nord Logistics", "Mid-market", "Inès B.", "64 k€", "Bonne"],
          ["Helio Santé", "Mid-market", "Noah L.", "41 k€", "À surveiller"],
          ["Pomelo Retail", "SMB", "Inès B.", "18 k€", "Bonne"],
        ]}
      />
    </div>
  );
}
