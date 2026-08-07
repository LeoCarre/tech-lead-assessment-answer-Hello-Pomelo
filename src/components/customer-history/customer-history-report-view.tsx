"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import type { CustomerHistoryDto } from "@/application/customer-history/serialize";
import type { CustomerPortfolioDto } from "@/application/customer-history/build-customer-portfolio";
import { PurchasePatternCard } from "@/components/customer-history/purchase-pattern-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} %`;
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

export function CustomerHistoryReportView({
  customers,
  customerId,
  onCustomerIdChange,
  initialReport,
}: {
  customers: CustomerPortfolioDto["customers"];
  customerId: string;
  onCustomerIdChange: (customerId: string) => void;
  initialCustomerId?: string | null;
  initialReport: CustomerHistoryDto | null;
}) {
  const ssrReport =
    initialReport?.customer.id === customerId ? initialReport : null;
  const [remote, setRemote] = useState<{
    customerId: string;
    report: CustomerHistoryDto;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const report =
    ssrReport ??
    (remote?.customerId === customerId ? remote.report : null);

  useEffect(() => {
    if (!customerId || ssrReport) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/customers/${customerId}/history`);
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? `Erreur ${res.status}`);
        }
        const next = (await res.json()) as CustomerHistoryDto;
        if (!cancelled) {
          setRemote({ customerId, report: next });
        }
      } catch (err) {
        if (!cancelled) {
          setRemote(null);
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger le rapport."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [customerId, ssrReport]);

  const selectedLabel =
    customers.find((c) => c.customerId === customerId)?.name ?? customerId;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">
              Rapport d’historique structuré
            </CardTitle>
            <CardDescription>
              Identifiant client en entrée · 6 derniers mois · granularité
              dynamique · anomalies ±50&nbsp;% vs panier moyen client.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
              Client
            </span>
            <Select
              value={customerId}
              onValueChange={(value) => {
                if (value) onCustomerIdChange(value);
              }}
            >
              <SelectTrigger className="w-auto min-w-56 max-w-full">
                <SelectValue placeholder="Choisir un client">
                  {customerId
                    ? `${selectedLabel} (${customerId})`
                    : "Choisir un client"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" className="w-80">
                <SelectGroup>
                  {[...customers]
                    .sort((a, b) =>
                      a.customerId.localeCompare(b.customerId, "en", {
                        numeric: true,
                      })
                    )
                    .map((customer) => (
                      <SelectItem
                        key={customer.customerId}
                        value={customer.customerId}
                      >
                        {customer.name} · {customer.customerId}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Calcul du rapport…
        </div>
      ) : null}

      {error ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {report && !loading ? <PatternReport report={report} /> : null}
    </div>
  );
}

function PatternReport({ report }: { report: CustomerHistoryDto }) {
  const isWeekly = report.granularity === "week";

  return (
    <div className="flex flex-col gap-6">
      <PurchasePatternCard report={report} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Client"
          value={report.customer.name}
          hint={`${report.customer.id} · ${report.customer.type}`}
        />
        <Metric label="Commandes (fenêtre)" value={String(report.orderCount)} />
        <Metric
          label="Panier moyen"
          value={formatEuro(report.averageOrderAmountEuros)}
        />
        <Metric
          label="Périodes"
          value={String(report.periods.length)}
          hint={isWeekly ? "Semaines ISO" : "Mois civils UTC"}
        />
      </div>

      {report.periods.map((period) => (
        <Card key={period.key}>
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base capitalize">
                {period.label}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  period.evolutionPercent !== null &&
                    period.evolutionPercent > 0 &&
                    "border-success/40 text-success",
                  period.evolutionPercent !== null &&
                    period.evolutionPercent < 0 &&
                    "border-anomaly/40 text-anomaly"
                )}
              >
                Évolution {formatPercent(period.evolutionPercent)}
              </Badge>
            </div>
            <CardDescription>
              {period.orderCount} commande
              {period.orderCount > 1 ? "s" : ""} · total{" "}
              {formatEuro(period.totalAmountEuros)} · moyenne{" "}
              {formatEuro(period.averageAmountEuros)} ·{" "}
              {formatDateRange(period.start, period.end)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Catégories</TableHead>
                  <TableHead>Anomalie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {period.orders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    className={cn(order.isAnomaly && "bg-anomaly-soft/40")}
                  >
                    <TableCell className="font-mono text-xs">
                      {order.orderId}
                    </TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatEuro(order.amountEuros)}
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="max-w-50 text-xs">
                      {order.categories.join(", ")}
                    </TableCell>
                    <TableCell>
                      {order.isAnomaly ? (
                        <Badge className="bg-anomaly-soft text-anomaly border-transparent">
                          <AlertTriangle className="size-3" />
                          {order.anomalyDirection === "high" ? "Haut" : "Bas"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {report.periods.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Aucune commande sur les 6 derniers mois pour ce client.
        </p>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-semibold tracking-[0.06em] uppercase">
          {label}
        </CardDescription>
        <CardTitle className="text-lg leading-snug sm:text-xl">
          {value}
        </CardTitle>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
