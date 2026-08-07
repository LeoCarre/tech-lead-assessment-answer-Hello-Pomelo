import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function HrLeavePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App RH · Congés"
        title="Demandes de congés"
        description="Workflow de validation managers, exposé dans le portail."
      />
      <KpiGrid
        items={[
          { label: "En attente", value: "3" },
          { label: "Approuvés M", value: "18" },
          { label: "Soldes moyens", value: "11,2 j" },
          { label: "Refusés M", value: "1" },
        ]}
      />
      <DataTableCard
        title="Demandes"
        columns={["Collaborateur", "Type", "Période", "Jours", "Statut"]}
        rows={[
          ["Camille Dupont", "CP", "12–14 août", "3", "En validation"],
          ["Noah Leroy", "RTT", "22 août", "1", "Approuvé"],
          ["Léa Moreau", "CP", "1–5 sept.", "5", "En validation"],
          ["Hugo Martin", "Maladie", "4 août", "1", "Justifié"],
        ]}
      />
    </div>
  );
}
