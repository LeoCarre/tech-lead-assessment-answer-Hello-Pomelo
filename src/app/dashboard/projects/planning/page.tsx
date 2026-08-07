import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function ProjectsPlanningPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App Projets · Planning"
        title="Charge & jalons"
        description="Vue planning semaine et jalons projets."
      />
      <KpiGrid
        items={[
          { label: "Charge équipe", value: "86 %" },
          { label: "Surbookés", value: "2" },
          { label: "Jalons ≤ 14 j", value: "5" },
          { label: "Disponible", value: "18 h" },
        ]}
      />
      <DataTableCard
        title="Semaine en cours"
        columns={["Personne", "Lun", "Mar", "Mer", "Jeu", "Ven"]}
        rows={[
          ["Léa Moreau", "SSO", "SSO", "Nord", "SSO", "Buffer"],
          ["Hugo Martin", "Nord", "Nord", "Billing", "SSO", "Design"],
          ["P. Costa", "Billing", "Billing", "1:1", "Billing", "Revue"],
        ]}
      />
    </div>
  );
}
