import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function ProjectsTasksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Projets · Tâches"
        title="Backlog delivery"
        description="Tâches ouvertes par projet et priorité."
      />
      <KpiGrid
        items={[
          { label: "Ouvertes", value: "47" },
          { label: "Bloquées", value: "3" },
          { label: "Done semaine", value: "19" },
          { label: "En revue", value: "6" },
        ]}
      />
      <DataTableCard
        title="Tâches"
        columns={["Titre", "Projet", "Assignee", "Priorité", "Statut"]}
        rows={[
          ["Cut-over staging", "Portail SSO", "Léa M.", "P0", "In progress"],
          ["Import comptes", "CRM Nord", "Hugo M.", "P1", "Todo"],
          ["Règles TVA", "Billing v2", "P. Costa", "P1", "In review"],
          ["Fix export PDF", "Portail SSO", "Hugo M.", "P2", "Blocked"],
        ]}
      />
    </div>
  );
}
