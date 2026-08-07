import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";

export default function DashboardActivityPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="Espace partagé"
        title="Activité récente"
        description="Fil unifié des événements publiés par les apps RH, CRM, Finance et Projets."
      />
      <KpiGrid
        items={[
          { label: "Événements 24 h", value: "37" },
          { label: "Domaines actifs", value: "4 / 4" },
          { label: "Incidents", value: "0" },
          { label: "Sync BFF", value: "OK" },
        ]}
      />
      <DataTableCard
        title="Journal"
        columns={["Heure", "Domaine", "Événement", "Acteur"]}
        rows={[
          ["09:12", "CRM", "Opportunité ACME mise à jour (stage Negotiation)", "Noah L."],
          ["09:40", "RH", "Demande de congé soumise (3 jours)", "Camille D."],
          ["10:05", "Finance", "Facture FAC-1102 émise", "Système"],
          ["11:22", "Projets", "Temps saisi · Portal SSO (2,5 h)", "Léa M."],
          ["14:01", "CRM", "Nouveau client « Nord Logistics »", "Inès B."],
        ]}
      />
    </div>
  );
}
