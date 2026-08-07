import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function HrEmployeesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App RH · Employés"
        title="Annuaire collaborateurs"
        description="Liste synchronisée depuis l’app RH (lecture portail)."
      />
      <KpiGrid
        items={[
          { label: "Actifs", value: "121" },
          { label: "En essai", value: "4" },
          { label: "Contractuels", value: "3" },
          { label: "Nouveaux M", value: "2" },
        ]}
      />
      <DataTableCard
        title="Collaborateurs"
        columns={["Nom", "Équipe", "Contrat", "Manager", "Site"]}
        rows={[
          ["Camille Dupont", "People", "CDI", "A. Bernard", "Paris"],
          ["Noah Leroy", "Sales", "CDI", "I. Benali", "Lyon"],
          ["Léa Moreau", "Delivery", "CDI", "P. Costa", "Remote"],
          ["Hugo Martin", "Design", "CDI", "P. Costa", "Paris"],
          ["Inès Benali", "Sales", "CDI", "Dir. Com.", "Lyon"],
        ]}
      />
    </div>
  );
}
