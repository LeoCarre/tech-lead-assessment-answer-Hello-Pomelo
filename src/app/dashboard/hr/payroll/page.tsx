import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function HrPayrollPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="App RH · Paie"
        title="Cycles de paie"
        description="Suivi des cycles et variables — données en lecture depuis l’app paie."
      />
      <KpiGrid
        items={[
          { label: "Cycle courant", value: "Août 2026" },
          { label: "Statut", value: "Ouvert" },
          { label: "Bulletins", value: "128" },
          { label: "Variables à saisir", value: "7" },
        ]}
      />
      <DataTableCard
        title="Éléments variables"
        columns={["Collaborateur", "Type", "Montant", "Période", "Statut"]}
        rows={[
          ["Noah Leroy", "Prime objectif", "1 200 €", "Juillet", "Validé"],
          ["Léa Moreau", "Heures supp.", "340 €", "Juillet", "À contrôler"],
          ["Équipe Support", "Astreinte", "890 €", "Juillet", "À saisir"],
        ]}
      />
    </div>
  );
}
