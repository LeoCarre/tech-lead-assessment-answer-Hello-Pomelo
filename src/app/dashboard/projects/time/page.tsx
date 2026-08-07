import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function ProjectsTimePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Projets · Time tracking"
        title="Saisie de temps"
        description="Heures facturables vs internes — sync app projets."
      />
      <KpiGrid
        items={[
          { label: "Saisies semaine", value: "162 h" },
          { label: "Facturables", value: "128 h" },
          { label: "Internes", value: "20 h" },
          { label: "Manquantes", value: "14 h" },
        ]}
      />
      <DataTableCard
        title="Dernières saisies"
        columns={["Date", "Personne", "Projet", "Activité", "Heures"]}
        rows={[
          ["6 août", "Léa Moreau", "Portail SSO", "Cut-over", "6,5"],
          ["6 août", "Hugo Martin", "CRM Nord", "Import", "5,0"],
          ["5 août", "P. Costa", "Billing v2", "TVA", "4,0"],
          ["5 août", "Léa Moreau", "Interne", "Rituel équipe", "1,5"],
        ]}
      />
    </div>
  );
}
