"use client";

import type { CustomerHistoryDto } from "@/application/customer-history/serialize";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RHYTHM_THRESHOLD = 2;

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} → ${formatDate(endIso)}`;
}

export type PurchasePatternReport = Pick<
  CustomerHistoryDto,
  | "customer"
  | "referenceDate"
  | "windowStart"
  | "windowEnd"
  | "granularity"
  | "orderCount"
  | "averageOrderAmountEuros"
  | "monthsInAnalysisWindow"
  | "ordersPerMonth"
  | "periods"
>;

/** Bloc « Pattern d’achat détecté » - partagé rapport + détail pilotage. */
export function PurchasePatternCard({
  report,
}: {
  report: PurchasePatternReport;
}) {
  const isWeekly = report.granularity === "week";
  const anomalyCount = report.periods.reduce(
    (sum, period) =>
      sum + period.orders.filter((order) => order.isAnomaly).length,
    0
  );

  return (
    <Card className="border-secondary/30 bg-secondary/5">
      <CardHeader className="gap-3">
        <CardTitle className="text-base">Pattern d’achat détecté</CardTitle>
        <CardDescription className="text-foreground/80 text-sm leading-relaxed">
          Sur la fenêtre{" "}
          <span className="font-medium">
            {formatDateRange(report.windowStart, report.windowEnd)}
          </span>{" "}
          (réf. {formatDate(report.referenceDate)}), le client{" "}
          <span className="font-medium">{report.customer.name}</span> (
          {report.customer.id}) a passé{" "}
          <span className="font-medium">{report.orderCount}</span> commande
          {report.orderCount > 1 ? "s" : ""} soit{" "}
          <span className="font-medium">
            {report.ordersPerMonth.toFixed(2)} cmd/mois
          </span>{" "}
          sur {report.monthsInAnalysisWindow} mois.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Insight
            label="Rythme identifié"
            value={isWeekly ? "Régulier" : "Occasionnel"}
            hint={
              isWeekly
                ? `> ${RHYTHM_THRESHOLD} cmd/mois → groupement par semaine`
                : `≤ ${RHYTHM_THRESHOLD} cmd/mois → groupement par mois`
            }
          />
          <Insight
            label="Granularité"
            value={isWeekly ? "Semaine (ISO)" : "Mois"}
            hint="Choix automatique selon le rythme"
          />
          <Insight
            label="Panier moyen client"
            value={formatEuro(report.averageOrderAmountEuros)}
            hint="Baseline des anomalies"
          />
          <Insight
            label="Anomalies"
            value={String(anomalyCount)}
            hint="Écart > 50 % vs panier moyen"
          />
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Justification : règle documentée{" "}
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-[11px]">
            orderCount / {report.monthsInAnalysisWindow}{" "}
            {isWeekly ? ">" : "≤"} {RHYTHM_THRESHOLD}
          </code>{" "}
          → granularité{" "}
          <strong>{isWeekly ? "hebdomadaire" : "mensuelle"}</strong>. Pour
          chaque période : volume, CA, panier moyen, évolution vs période
          précédente. Les commandes hors ±50&nbsp;% du panier moyen client sont
          marquées anomalie.
        </p>
      </CardContent>
    </Card>
  );
}

function Insight({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-background/80 rounded-lg border px-3 py-2">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.06em] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      {hint ? (
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
