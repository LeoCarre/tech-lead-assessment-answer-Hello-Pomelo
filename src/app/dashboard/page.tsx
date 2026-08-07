import Link from "next/link";
import {
  Building2,
  Calculator,
  FolderKanban,
  Users,
} from "lucide-react";

import {
  DataTableCard,
  KpiGrid,
  PortalPageHeader,
} from "@/components/portal/portal-ui";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const domains = [
  {
    href: "/dashboard/hr",
    title: "RH",
    text: "3 demandes de congés · paie M-1 clôturée",
    icon: Users,
  },
  {
    href: "/dashboard/crm",
    title: "CRM",
    text: "2 opportunités hot · 1 devis à relancer",
    icon: Building2,
  },
  {
    href: "/dashboard/finance",
    title: "Finance",
    text: "4 factures en attente · cash positif",
    icon: Calculator,
  },
  {
    href: "/dashboard/projects",
    title: "Projets",
    text: "12 tâches ouvertes · 86 h trackées",
    icon: FolderKanban,
  },
];

export default function UnifiedDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PortalPageHeader
        eyebrow="Espace partagé"
        title="Dashboard unifié"
        description="Point d’entrée cross-métiers du portail : synthèse RH, CRM, Finance et Projets, sans dupliquer les apps existantes."
      />

      <KpiGrid
        items={[
          { label: "Effectif actif", value: "128", hint: "RH" },
          { label: "Pipeline CRM", value: "412 k€", hint: "Opportunités ouvertes" },
          { label: "Encours clients", value: "68 k€", hint: "Finance" },
          { label: "Charge projets", value: "86 %", hint: "Capacité planifiée" },
        ]}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {domains.map((domain) => (
          <Link key={domain.href} href={domain.href} className="group">
            <Card className="h-full transition-colors group-hover:border-secondary/40">
              <CardHeader>
                <domain.icon className="text-secondary mb-1 size-4" />
                <CardTitle className="text-sm">{domain.title}</CardTitle>
                <CardDescription>{domain.text}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <DataTableCard
        title="Alertes transverses"
        description="Signaux issus des apps métier, agrégés par le BFF du portail."
        columns={["Domaine", "Signal", "Priorité", "Owner"]}
        rows={[
          ["RH", "Congé en attente validation manager", "Moyenne", "Camille D."],
          ["CRM", "Devis EXP-241 expire dans 3 jours", "Haute", "Noah L."],
          ["Finance", "Facture FAC-1091 en retard J+12", "Haute", "Trésorerie"],
          ["Projets", "Sprint Portal : 2 tâches bloquées", "Moyenne", "Léa M."],
        ]}
      />
    </div>
  );
}
