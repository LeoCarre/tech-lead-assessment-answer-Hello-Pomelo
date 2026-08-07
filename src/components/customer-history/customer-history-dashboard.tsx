"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CircleHelp,
  ExternalLink,
  GalleryHorizontal,
  LayoutGrid,
  ListOrdered,
  Loader2,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";

import type { CustomerHistoryDto } from "@/application/customer-history/serialize";
import type { CustomerPortfolioDto } from "@/application/customer-history/build-customer-portfolio";
import {
  ColumnControl,
  compareSortValues,
  type ColumnSortState,
} from "@/components/customer-history/column-control";
import { MultiSelectDropdown } from "@/components/customer-history/multi-select-dropdown";
import { PurchasePatternCard } from "@/components/customer-history/purchase-pattern-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import {
  detectPortfolioPatterns,
  type DetectedPortfolioPattern,
} from "@/domain/customers/multi-client-patterns";
import { cn } from "@/lib/utils";

const CUSTOMER_TYPE_QUICK_FILTERS = [
  { label: "VIP", badge: "VIP" },
  { label: "Premium", badge: "Premium" },
  { label: "Standard", badge: "Standard" },
] as const;

const CUSTOMER_TYPE_OPTIONS = ["VIP", "Premium", "Standard", "Unknown"] as const;
const RHYTHM_OPTIONS = [
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
] as const;
const ANOMALY_FILTER_OPTIONS = ["Haut", "Bas", "Aucune"] as const;

type CustomerSortKey =
  | "customerId"
  | "name"
  | "type"
  | "orderCount"
  | "totalAmountEuros"
  | "averageOrderAmountEuros"
  | "granularity"
  | "anomalyCount";

type OrderSortKey =
  | "date"
  | "customerId"
  | "customer"
  | "orderId"
  | "amountEuros"
  | "status"
  | "categories"
  | "anomaly";

const CLIENT_SORT_OPTIONS = [
  { key: "customerId", dir: "asc" as const, label: "C001 → C012" },
  { key: "customerId", dir: "desc" as const, label: "C012 → C001" },
  { key: "name", dir: "asc" as const, label: "A → Z" },
  { key: "name", dir: "desc" as const, label: "Z → A" },
];

const ORDER_CLIENT_SORT_OPTIONS = [
  { key: "customerId", dir: "asc" as const, label: "C001 → C012" },
  { key: "customerId", dir: "desc" as const, label: "C012 → C001" },
  { key: "customer", dir: "asc" as const, label: "A → Z" },
  { key: "customer", dir: "desc" as const, label: "Z → A" },
];

function isFilterActive(selected: string[], allOptions: readonly string[]): boolean {
  return selected.length > 0 && selected.length < allOptions.length;
}

function passesFilter(value: string, selected: string[], allOptions: readonly string[]): boolean {
  if (!isFilterActive(selected, allOptions)) return true;
  return selected.includes(value);
}
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

function formatRate(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function monthKeyFromIso(iso: string): string {
  const date = new Date(iso);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function reportHref(customerId: string): string {
  return `/customer-history?view=report&customer=${encodeURIComponent(customerId)}`;
}

type OrderFact = CustomerPortfolioDto["orders"][number];
type CustomerMeta = CustomerPortfolioDto["customers"][number];

function computeKpis(input: {
  customers: CustomerMeta[];
  orders: OrderFact[];
}) {
  const { customers, orders } = input;
  if (orders.length === 0) {
    return {
      activeCustomers: 0,
      orderCount: 0,
      totalAmountEuros: 0,
      averageOrderAmountEuros: 0,
      anomalyCount: 0,
      anomalyRate: 0,
      weeklyRhythmCustomers: 0,
      monthlyRhythmCustomers: 0,
    };
  }

  const orderCount = orders.length;
  const totalAmountEuros = orders.reduce(
    (sum, order) => sum + order.amountEuros,
    0
  );
  const anomalyCount = orders.filter((order) => order.isAnomaly).length;
  const activeIds = new Set(orders.map((order) => order.customerId));
  const activeCustomers = customers.filter((c) => activeIds.has(c.customerId));

  return {
    activeCustomers: activeCustomers.length,
    orderCount,
    totalAmountEuros,
    averageOrderAmountEuros: totalAmountEuros / orderCount,
    anomalyCount,
    anomalyRate: anomalyCount / orderCount,
    weeklyRhythmCustomers: activeCustomers.filter(
      (c) => c.granularity === "week"
    ).length,
    monthlyRhythmCustomers: activeCustomers.filter(
      (c) => c.granularity === "month"
    ).length,
  };
}

function summarizeCustomers(input: {
  customers: CustomerMeta[];
  orders: OrderFact[];
}) {
  return input.customers
    .map((customer) => {
      const customerOrders = input.orders.filter(
        (order) => order.customerId === customer.customerId
      );
      const orderCount = customerOrders.length;
      const totalAmountEuros = customerOrders.reduce(
        (sum, order) => sum + order.amountEuros,
        0
      );
      const anomalyCount = customerOrders.filter(
        (order) => order.isAnomaly
      ).length;

      return {
        ...customer,
        orderCount,
        totalAmountEuros,
        averageOrderAmountEuros:
          orderCount === 0 ? 0 : totalAmountEuros / orderCount,
        anomalyCount,
        anomalyRate: orderCount === 0 ? 0 : anomalyCount / orderCount,
      };
    })
    .filter((customer) => customer.orderCount > 0)
    .sort((a, b) => b.totalAmountEuros - a.totalAmountEuros);
}

export function CustomerHistoryDashboard({
  portfolio,
}: {
  portfolio: CustomerPortfolioDto;
}) {
  const allIds = portfolio.customers.map((c) => c.customerId);
  const allMonths = portfolio.availableMonths.map((m) => m.key);

  const [selectedIds, setSelectedIds] = useState<string[]>(allIds);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(allMonths);
  const [search, setSearch] = useState("");
  const [patternLayout, setPatternLayout] = useState<"carousel" | "grid">(
    "carousel"
  );
  const [tableView, setTableView] = useState<"customers" | "orders">(
    "customers"
  );
  const [customerSort, setCustomerSort] = useState<ColumnSortState>(null);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string[]>([]);
  const [customerRhythmFilter, setCustomerRhythmFilter] = useState<string[]>(
    []
  );
  const [orderSort, setOrderSort] = useState<ColumnSortState>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string[]>([]);
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string[]>([]);
  const [orderAnomalyFilter, setOrderAnomalyFilter] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerHistoryDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedIds.length !== allIds.length ||
    selectedMonths.length !== allMonths.length ||
    customerTypeFilter.length > 0 ||
    customerRhythmFilter.length > 0 ||
    orderStatusFilter.length > 0 ||
    orderCategoryFilter.length > 0 ||
    orderAnomalyFilter.length > 0 ||
    customerSort !== null ||
    orderSort !== null;

  function resetFilters() {
    setSearch("");
    setSelectedIds(allIds);
    setSelectedMonths(allMonths);
    setCustomerTypeFilter([]);
    setCustomerRhythmFilter([]);
    setOrderStatusFilter([]);
    setOrderCategoryFilter([]);
    setOrderAnomalyFilter([]);
    setCustomerSort(null);
    setOrderSort(null);
  }

  const filteredOrders = useMemo(
    () =>
      portfolio.orders.filter(
        (order) =>
          selectedIds.includes(order.customerId) &&
          selectedMonths.includes(order.monthKey)
      ),
    [portfolio.orders, selectedIds, selectedMonths]
  );

  const selectedCustomerMeta = useMemo(
    () => portfolio.customers.filter((c) => selectedIds.includes(c.customerId)),
    [portfolio.customers, selectedIds]
  );

  const kpis = useMemo(
    () =>
      computeKpis({
        customers: selectedCustomerMeta,
        orders: filteredOrders,
      }),
    [selectedCustomerMeta, filteredOrders]
  );

  const customerRows = useMemo(
    () =>
      summarizeCustomers({
        customers: selectedCustomerMeta,
        orders: filteredOrders,
      }),
    [selectedCustomerMeta, filteredOrders]
  );

  const multiClientPatterns = useMemo(
    () =>
      detectPortfolioPatterns({
        customers: customerRows.map((customer) => ({
          customerId: customer.customerId,
          name: customer.name,
          type: customer.type,
          granularity: customer.granularity,
          ordersPerMonth: customer.ordersPerMonth,
          averageOrderAmountEuros: customer.averageOrderAmountEuros,
          anomalyRate: customer.anomalyRate,
          orderCount: customer.orderCount,
          totalAmountEuros: customer.totalAmountEuros,
        })),
        orders: filteredOrders.map((order) => ({
          customerId: order.customerId,
          monthKey: order.monthKey,
          amountEuros: order.amountEuros,
          isAnomaly: order.isAnomaly,
          categories: order.categories,
        })),
      }),
    [customerRows, filteredOrders]
  );

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of portfolio.customers) {
      map.set(customer.customerId, customer.name);
    }
    return map;
  }, [portfolio.customers]);

  const searchQuery = search.trim().toLowerCase();

  const visibleOrders = useMemo(() => {
    if (!searchQuery) return filteredOrders;
    return filteredOrders.filter((order) => {
      const customerName = customerNameById.get(order.customerId) ?? "";
      const haystack = [
        customerName,
        order.customerId,
        order.orderId,
        order.status,
        order.categories.join(" "),
        order.date,
        String(order.amountEuros),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchQuery);
    });
  }, [filteredOrders, searchQuery, customerNameById]);

  const visibleCustomerRows = useMemo(() => {
    if (!searchQuery) return customerRows;

    const customerIdsFromOrders = new Set(
      visibleOrders.map((order) => order.customerId)
    );

    return customerRows.filter((customer) => {
      const haystack = [
        customer.name,
        customer.customerId,
        customer.type,
        customer.granularity,
      ]
        .join(" ")
        .toLowerCase();
      return (
        haystack.includes(searchQuery) ||
        customerIdsFromOrders.has(customer.customerId)
      );
    });
  }, [customerRows, searchQuery, visibleOrders]);

  const orderStatusOptions = useMemo(() => {
    const values = new Set(filteredOrders.map((order) => order.status));
    return [...values].sort((a, b) => a.localeCompare(b, "fr"));
  }, [filteredOrders]);

  const orderCategoryOptions = useMemo(() => {
    const values = new Set(
      filteredOrders.flatMap((order) => order.categories)
    );
    return [...values].sort((a, b) => a.localeCompare(b, "fr"));
  }, [filteredOrders]);

  const displayedCustomerRows = useMemo(() => {
    const rhythmAll = RHYTHM_OPTIONS.map((option) => option.value);
    const rows = visibleCustomerRows.filter((customer) => {
      const typeOk = passesFilter(
        customer.type,
        customerTypeFilter,
        CUSTOMER_TYPE_OPTIONS
      );
      const rhythmOk = passesFilter(
        customer.granularity,
        customerRhythmFilter,
        rhythmAll
      );
      return typeOk && rhythmOk;
    });

    if (!customerSort) return rows;

    const { key, dir } = customerSort;
    return [...rows].sort((a, b) => {
      switch (key as CustomerSortKey) {
        case "customerId":
          return compareSortValues(a.customerId, b.customerId, dir);
        case "name":
          return compareSortValues(a.name, b.name, dir);
        case "type":
          return compareSortValues(a.type, b.type, dir);
        case "orderCount":
          return compareSortValues(a.orderCount, b.orderCount, dir);
        case "totalAmountEuros":
          return compareSortValues(a.totalAmountEuros, b.totalAmountEuros, dir);
        case "averageOrderAmountEuros":
          return compareSortValues(
            a.averageOrderAmountEuros,
            b.averageOrderAmountEuros,
            dir
          );
        case "granularity":
          return compareSortValues(a.granularity, b.granularity, dir);
        case "anomalyCount":
          return compareSortValues(a.anomalyCount, b.anomalyCount, dir);
        default:
          return 0;
      }
    });
  }, [
    visibleCustomerRows,
    customerTypeFilter,
    customerRhythmFilter,
    customerSort,
  ]);

  const displayedOrders = useMemo(() => {
    const rows = visibleOrders.filter((order) => {
      const statusOk = passesFilter(
        order.status,
        orderStatusFilter,
        orderStatusOptions
      );
      const categoryOk =
        !isFilterActive(orderCategoryFilter, orderCategoryOptions) ||
        order.categories.some((category) =>
          orderCategoryFilter.includes(category)
        );
      const anomalyLabel = order.isAnomaly
        ? order.anomalyDirection === "high"
          ? "Haut"
          : "Bas"
        : "Aucune";
      const anomalyOk = passesFilter(
        anomalyLabel,
        orderAnomalyFilter,
        ANOMALY_FILTER_OPTIONS
      );
      return statusOk && categoryOk && anomalyOk;
    });

    if (!orderSort) return rows;

    const { key, dir } = orderSort;
    return [...rows].sort((a, b) => {
      switch (key as OrderSortKey) {
        case "date":
          return compareSortValues(a.date, b.date, dir);
        case "customerId":
          return compareSortValues(a.customerId, b.customerId, dir);
        case "customer": {
          const nameA = customerNameById.get(a.customerId) ?? a.customerId;
          const nameB = customerNameById.get(b.customerId) ?? b.customerId;
          return compareSortValues(nameA, nameB, dir);
        }
        case "orderId":
          return compareSortValues(a.orderId, b.orderId, dir);
        case "amountEuros":
          return compareSortValues(a.amountEuros, b.amountEuros, dir);
        case "status":
          return compareSortValues(a.status, b.status, dir);
        case "categories":
          return compareSortValues(
            a.categories.join(", "),
            b.categories.join(", "),
            dir
          );
        case "anomaly": {
          const rank = (order: (typeof rows)[number]) =>
            order.isAnomaly ? (order.anomalyDirection === "high" ? 2 : 1) : 0;
          return compareSortValues(rank(a), rank(b), dir);
        }
        default:
          return 0;
      }
    });
  }, [
    visibleOrders,
    orderStatusFilter,
    orderCategoryFilter,
    orderAnomalyFilter,
    orderStatusOptions,
    orderCategoryOptions,
    orderSort,
    customerNameById,
  ]);

  async function openDetail(customerId: string) {
    setDetailId(customerId);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/history`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Erreur ${res.status}`);
      }
      setDetail((await res.json()) as CustomerHistoryDto);
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Impossible de charger le détail."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  const filteredDetail = useMemo(() => {
    if (!detail) return null;
    const periods = detail.periods
      .map((period) => ({
        ...period,
        orders: period.orders.filter((order) =>
          selectedMonths.includes(monthKeyFromIso(order.date))
        ),
      }))
      .filter((period) => period.orders.length > 0)
      .map((period) => {
        const totalAmountEuros = period.orders.reduce(
          (sum, order) => sum + order.amountEuros,
          0
        );
        return {
          ...period,
          orderCount: period.orders.length,
          totalAmountEuros,
          averageAmountEuros:
            period.orders.length === 0
              ? 0
              : totalAmountEuros / period.orders.length,
        };
      });

    const orderCount = periods.reduce(
      (sum, period) => sum + period.orderCount,
      0
    );
    const totalAmountEuros = periods.reduce(
      (sum, period) => sum + period.totalAmountEuros,
      0
    );

    return {
      ...detail,
      orderCount,
      averageOrderAmountEuros:
        orderCount === 0 ? 0 : totalAmountEuros / orderCount,
      periods,
    };
  }, [detail, selectedMonths]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Vue pilotage multi-clients
        </h2>
        <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
          Vue globale sur 6 mois (réf. {formatDate(portfolio.referenceDate)}) :
          filtrez par client et par mois pour recalculer les KPI, les patterns
          transverses et la liste des commandes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Clients actifs" value={String(kpis.activeCustomers)} />
        <Metric label="Commandes" value={String(kpis.orderCount)} />
        <Metric label="CA (GMV)" value={formatEuro(kpis.totalAmountEuros)} />
        <Metric
          label="Panier moyen"
          value={formatEuro(kpis.averageOrderAmountEuros)}
        />
        <Metric
          label="Taux d’anomalies"
          value={formatRate(kpis.anomalyRate)}
          hint={`${kpis.anomalyCount} commande${kpis.anomalyCount > 1 ? "s" : ""}`}
        />
        <Metric
          label="Rythme hebdo"
          value={String(kpis.weeklyRhythmCustomers)}
          hint="> 2 cmd / mois (profil)"
        />
        <Metric
          label="Rythme mensuel"
          value={String(kpis.monthlyRhythmCustomers)}
          hint="≤ 2 cmd / mois (profil)"
        />
        <Metric
          label="Mois sélectionnés"
          value={`${selectedMonths.length}/${allMonths.length}`}
        />
      </div>

      <Card className="border-secondary/30 bg-secondary/5">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  Patterns multi-clients détectés (
                  {multiClientPatterns.length})
                </CardTitle>
                <SectionLegend
                  title="Légende - pastilles de sévérité"
                  description="Niveau d’attention associé à chaque pattern multi-clients."
                  items={[
                    {
                      label: "Info",
                      text: "Signal descriptif (cohorte, pic modéré, répartition) sans urgence opérationnelle.",
                    },
                    {
                      label: "À surveiller",
                      text: "Concentration ou écart notable (ex. part CA ≥ 60 %, pic ≥ 35 %, paniers dispersés, anomalies ≥ 25 % sur 1 client).",
                    },
                    {
                      label: "Alerte",
                      text: "Signal prioritaire : plusieurs clients avec anomalies fréquentes (≥ 25 %) sur la sélection.",
                    },
                  ]}
                />
              </div>
              <CardDescription className="mt-1">
                Signaux transverses recalculés sur la sélection courante (≥ 2
                clients actifs). Chaque carte expose une justification
                explicite.
              </CardDescription>
            </div>
            {multiClientPatterns.length > 0 ? (
              <ToggleGroup
                className="bg-background/80 shrink-0 rounded-lg p-1"
                variant="outline"
                value={[patternLayout]}
                onValueChange={(value) => {
                  const next = value[0] as "carousel" | "grid" | undefined;
                  if (next) setPatternLayout(next);
                }}
              >
                <ToggleGroupItem
                  value="carousel"
                  aria-label="Vue carrousel"
                  className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
                >
                  <GalleryHorizontal data-icon="inline-start" />
                  Carrousel
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grid"
                  aria-label="Vue grille"
                  className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
                >
                  <LayoutGrid data-icon="inline-start" />
                  Tout
                </ToggleGroupItem>
              </ToggleGroup>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {multiClientPatterns.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Pas assez de clients actifs dans la sélection pour croiser des
              patterns (minimum 2).
            </p>
          ) : patternLayout === "carousel" ? (
            <PatternCarousel
              patterns={multiClientPatterns}
              onOpenCustomer={openDetail}
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {multiClientPatterns.map((pattern) => (
                <PatternSignalCard
                  key={pattern.id}
                  pattern={pattern}
                  onOpenCustomer={openDetail}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  {tableView === "customers"
                    ? "Synthèse par client"
                    : "Commandes filtrées"}
                </CardTitle>
                {tableView === "customers" ? (
                  <SectionLegend
                    title="Légende - synthèse client"
                    items={[
                      {
                        label: "Anomalies (n et %)",
                        text: "Nombre de commandes du client hors ±50 % de son panier moyen, et part = n / commandes du client sur la sélection.",
                      },
                      {
                        label: "Haut",
                        text: "Montant commande > 150 % du panier moyen client (fenêtre 6 mois).",
                      },
                      {
                        label: "Bas",
                        text: "Montant commande < 50 % du panier moyen client (fenêtre 6 mois).",
                      },
                      {
                        label: "Rythme",
                        text: "Semaine si orderCount / 6 > 2, sinon Mois (profil sur la fenêtre complète).",
                      },
                    ]}
                  />
                ) : (
                  <SectionLegend
                    title="Légende - commandes"
                    items={[
                      {
                        label: "Anomalie Haut",
                        text: "Le montant dépasse de plus de 50 % le panier moyen du client (amount > average × 1,5).",
                      },
                      {
                        label: "Anomalie Bas",
                        text: "Le montant est inférieur de plus de 50 % au panier moyen du client (amount < average × 0,5).",
                      },
                      {
                        label: "Ligne surlignée",
                        text: "Commande anomalique ; la baseline reste le panier moyen client sur 6 mois, pas la moyenne de la période.",
                      },
                      {
                        label: "% d’anomalies (KPI)",
                        text: "commandes anomaliques / commandes de la sélection filtrée.",
                      },
                    ]}
                  />
                )}
              </div>
              <CardDescription className="mt-1">
                {tableView === "customers"
                  ? "Recalculée selon les filtres clients, périodes et recherche."
                  : `${displayedOrders.length} commande${displayedOrders.length > 1 ? "s" : ""} pour la sélection courante.`}
              </CardDescription>
            </div>
            <ToggleGroup
              className="bg-muted/40 shrink-0 rounded-lg p-1"
              variant="outline"
              value={[tableView]}
              onValueChange={(value) => {
                const next = value[0] as "customers" | "orders" | undefined;
                if (next) setTableView(next);
              }}
            >
              <ToggleGroupItem
                value="customers"
                aria-label="Vue synthèse clients"
                className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
              >
                <Users data-icon="inline-start" />
                Clients
              </ToggleGroupItem>
              <ToggleGroupItem
                value="orders"
                aria-label="Vue commandes filtrées"
                className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
              >
                <ListOrdered data-icon="inline-start" />
                Commandes
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <InputGroup className="min-w-0 flex-1 sm:max-w-sm">
              <InputGroupInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  tableView === "customers"
                    ? "Client, type, rythme…"
                    : "Client, commande, statut…"
                }
                aria-label="Rechercher"
              />
              <InputGroupAddon align="inline-start">
                <Search />
              </InputGroupAddon>
            </InputGroup>
            <MultiSelectDropdown
              label="Clients"
              hideLabel
              selected={selectedIds}
              onChange={setSelectedIds}
              allLabel="Tous"
              className="sm:w-44"
              triggerClassName="h-8"
              quickFilters={[...CUSTOMER_TYPE_QUICK_FILTERS]}
              options={[...portfolio.customers]
                .sort((a, b) =>
                  a.customerId.localeCompare(b.customerId, "en", {
                    numeric: true,
                  })
                )
                .map((customer) => ({
                  value: customer.customerId,
                  label: customer.name,
                  description: customer.customerId,
                  badge: customer.type,
                }))}
            />
            <MultiSelectDropdown
              label="Périodes"
              hideLabel
              selected={selectedMonths}
              onChange={setSelectedMonths}
              allLabel="Tous"
              className="sm:w-40"
              triggerClassName="h-8"
              options={portfolio.availableMonths.map((month) => ({
                value: month.key,
                label: month.label,
              }))}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
            >
              <RotateCcw data-icon="inline-start" />
              Réinitialiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tableView === "customers" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <ColumnControl
                    label="Client"
                    sortKey="customerId"
                    activeSortKey={customerSort?.key ?? null}
                    sortDir={customerSort?.dir ?? null}
                    onSort={setCustomerSort}
                    sortOptions={CLIENT_SORT_OPTIONS}
                    filterOptions={[...CUSTOMER_TYPE_OPTIONS]}
                    selectedFilters={customerTypeFilter}
                    onFilterChange={setCustomerTypeFilter}
                  />
                  <ColumnControl
                    label="Cmd"
                    sortKey="orderCount"
                    activeSortKey={customerSort?.key ?? null}
                    sortDir={customerSort?.dir ?? null}
                    onSort={setCustomerSort}
                  />
                  <ColumnControl
                    label="CA"
                    sortKey="totalAmountEuros"
                    activeSortKey={customerSort?.key ?? null}
                    sortDir={customerSort?.dir ?? null}
                    onSort={setCustomerSort}
                  />
                  <ColumnControl
                    label="Panier moy."
                    sortKey="averageOrderAmountEuros"
                    activeSortKey={customerSort?.key ?? null}
                    sortDir={customerSort?.dir ?? null}
                    onSort={setCustomerSort}
                  />
                  <ColumnControl
                    label="Rythme"
                    sortKey="granularity"
                    activeSortKey={customerSort?.key ?? null}
                    sortDir={customerSort?.dir ?? null}
                    onSort={setCustomerSort}
                    filterOptions={RHYTHM_OPTIONS.map((option) => option.label)}
                    selectedFilters={customerRhythmFilter.map(
                      (value) =>
                        RHYTHM_OPTIONS.find((option) => option.value === value)
                          ?.label ?? value
                    )}
                    onFilterChange={(labels) => {
                      const next = labels.flatMap((label) => {
                        const match = RHYTHM_OPTIONS.find(
                          (option) => option.label === label
                        );
                        return match ? [match.value] : [];
                      });
                      setCustomerRhythmFilter(next);
                    }}
                  />
                  <ColumnControl
                    label="Anomalies"
                    sortKey="anomalyCount"
                    activeSortKey={customerSort?.key ?? null}
                    sortDir={customerSort?.dir ?? null}
                    onSort={setCustomerSort}
                  />
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCustomerRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground text-center text-sm"
                    >
                      Aucune donnée pour cette sélection.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedCustomerRows.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-muted-foreground font-mono text-xs">
                            {customer.customerId}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px] font-medium"
                          >
                            {customer.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatEuro(customer.totalAmountEuros)}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatEuro(customer.averageOrderAmountEuros)}
                      </TableCell>
                      <TableCell>
                        {customer.granularity === "week" ? "Semaine" : "Mois"}
                      </TableCell>
                      <TableCell>
                        {customer.anomalyCount > 0 ? (
                          <Badge className="bg-anomaly-soft text-anomaly border-transparent">
                            {customer.anomalyCount} (
                            {formatRate(customer.anomalyRate)})
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            0
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => void openDetail(customer.customerId)}
                        >
                          Détail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <ColumnControl
                    label="Date"
                    sortKey="date"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                  />
                  <ColumnControl
                    label="Client"
                    sortKey="customerId"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                    sortOptions={ORDER_CLIENT_SORT_OPTIONS}
                  />
                  <ColumnControl
                    label="N°"
                    sortKey="orderId"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                  />
                  <ColumnControl
                    label="Montant"
                    sortKey="amountEuros"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                  />
                  <ColumnControl
                    label="Statut"
                    sortKey="status"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                    filterOptions={orderStatusOptions}
                    selectedFilters={orderStatusFilter}
                    onFilterChange={setOrderStatusFilter}
                  />
                  <ColumnControl
                    label="Catégories"
                    sortKey="categories"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                    filterOptions={orderCategoryOptions}
                    selectedFilters={orderCategoryFilter}
                    onFilterChange={setOrderCategoryFilter}
                  />
                  <ColumnControl
                    label="Anomalie"
                    sortKey="anomaly"
                    activeSortKey={orderSort?.key ?? null}
                    sortDir={orderSort?.dir ?? null}
                    onSort={setOrderSort}
                    filterOptions={[...ANOMALY_FILTER_OPTIONS]}
                    selectedFilters={orderAnomalyFilter}
                    onFilterChange={setOrderAnomalyFilter}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground text-center text-sm"
                    >
                      Aucune commande pour cette sélection.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedOrders.map((order) => (
                    <TableRow
                      key={order.orderId}
                      className={cn(order.isAnomaly && "bg-anomaly-soft/40")}
                    >
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="cursor-pointer text-left hover:underline"
                          onClick={() => void openDetail(order.customerId)}
                        >
                          {customerNameById.get(order.customerId) ??
                            order.customerId}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatEuro(order.amountEuros)}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell className="max-w-[220px] text-xs">
                        {order.categories.join(", ")}
                      </TableCell>
                      <TableCell>
                        {order.isAnomaly ? (
                          <Badge className="bg-anomaly-soft text-anomaly border-transparent">
                            <AlertTriangle className="size-3" />
                            {order.anomalyDirection === "high"
                              ? "Haut"
                              : "Bas"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailId(null);
            setDetail(null);
            setDetailError(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[min(96vw,1000px)] max-w-none flex-col gap-4 overflow-hidden p-4 sm:max-w-none">
          <DialogHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <DialogTitle>
                  {filteredDetail?.customer.name ??
                    detail?.customer.name ??
                    "Détail client"}
                </DialogTitle>
                <DialogDescription>
                  Pattern d’achat, périodes et commandes (filtrées selon les mois
                  cochés).
                </DialogDescription>
              </div>
              {detailId ? (
                <Link
                  href={reportHref(detailId)}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "shrink-0",
                  })}
                >
                  Voir le rapport
                  <ExternalLink data-icon="inline-end" />
                </Link>
              ) : null}
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {detailLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Chargement…
              </div>
            ) : null}

            {detailError ? (
              <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
                {detailError}
              </div>
            ) : null}

            {filteredDetail && detail ? (
              <CustomerDetailReport
                patternReport={detail}
                report={filteredDetail}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
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

function PatternCarousel({
  patterns,
  onOpenCustomer,
}: {
  patterns: DetectedPortfolioPattern[];
  onOpenCustomer: (customerId: string) => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const [pageCount, setPageCount] = useState(() =>
    Math.max(1, Math.ceil(patterns.length / 2))
  );

  useEffect(() => {
    if (!api) return;

    const sync = () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setPageCount(Math.max(1, api.scrollSnapList().length));
    };

    sync();
    api.on("select", sync);
    api.on("reInit", sync);

    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  return (
    <div className="space-y-3">
      <Carousel
        setApi={setApi}
        opts={{ loop: false, align: "start", slidesToScroll: 2 }}
        className="w-full"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <CarouselPrevious className="static inset-auto top-auto right-auto bottom-auto left-auto size-8 shrink-0 translate-y-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <CarouselContent className="-ml-3">
              {patterns.map((pattern) => (
                <CarouselItem
                  key={pattern.id}
                  className="basis-1/2 pl-3"
                >
                  <PatternSignalCard
                    pattern={pattern}
                    onOpenCustomer={onOpenCustomer}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          <CarouselNext className="static inset-auto top-auto right-auto bottom-auto left-auto size-8 shrink-0 translate-y-0" />
        </div>
      </Carousel>
      <p
        className="text-muted-foreground text-center text-sm tabular-nums"
        aria-live="polite"
      >
        {current}/{pageCount}
      </p>
    </div>
  );
}

function PatternSignalCard({
  pattern,
  onOpenCustomer,
}: {
  pattern: DetectedPortfolioPattern;
  onOpenCustomer: (customerId: string) => void;
}) {
  return (
    <div className="bg-background/80 flex h-full flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold">{pattern.title}</p>
        <Badge
          variant="outline"
          className={cn(
            pattern.severity === "watch" &&
              "border-secondary/40 text-secondary",
            pattern.severity === "alert" && "border-anomaly/40 text-anomaly"
          )}
        >
          {pattern.severity === "info"
            ? "Info"
            : pattern.severity === "watch"
              ? "À surveiller"
              : "Alerte"}
        </Badge>
      </div>
      <p className="text-sm leading-relaxed">{pattern.summary}</p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {pattern.justification}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {pattern.metrics.map((metric) => (
          <span
            key={`${pattern.id}-${metric.label}`}
            className="bg-muted rounded-md px-2 py-1 text-xs"
          >
            <span className="text-muted-foreground">{metric.label}: </span>
            <span className="font-medium">{metric.value}</span>
          </span>
        ))}
      </div>
      {pattern.customerIds.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {pattern.customerIds.slice(0, 6).map((id) => (
            <Button
              key={id}
              size="xs"
              variant="ghost"
              className="h-6 px-1.5 font-mono text-[11px]"
              onClick={() => onOpenCustomer(id)}
            >
              {id}
            </Button>
          ))}
          {pattern.customerIds.length > 6 ? (
            <span className="text-muted-foreground self-center text-[11px]">
              +{pattern.customerIds.length - 6}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SectionLegend({
  title,
  description = "Règles métier utilisées dans ce tableau.",
  items,
}: {
  title: string;
  description?: string;
  items: Array<{ label: string; text: string }>;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            className="text-muted-foreground"
            aria-label={title}
          />
        }
      >
        <CircleHelp />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-2">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{description}</PopoverDescription>
        </PopoverHeader>
        <Separator />
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.label} className="text-xs leading-relaxed">
              <span className="font-semibold">{item.label}</span>
              <span className="text-muted-foreground"> - {item.text}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function CustomerDetailReport({
  patternReport,
  report,
}: {
  patternReport: CustomerHistoryDto;
  report: Omit<CustomerHistoryDto, "periods"> & {
    periods: Array<
      CustomerHistoryDto["periods"][number] & {
        orderCount: number;
        totalAmountEuros: number;
        averageAmountEuros: number;
      }
    >;
  };
}) {
  return (
    <div className="flex flex-col gap-4">
      <PurchasePatternCard report={patternReport} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Granularité"
          value={report.granularity === "week" ? "Semaine" : "Mois"}
        />
        <Metric label="Commandes" value={String(report.orderCount)} />
        <Metric
          label="Panier moyen"
          value={formatEuro(report.averageOrderAmountEuros)}
        />
        <Metric
          label="Rythme"
          value={`${report.ordersPerMonth.toFixed(2)} cmd/mois`}
        />
      </div>

      <p className="text-muted-foreground text-xs">
        {report.customer.id} · {report.customer.type}
        {report.periods.length !== patternReport.periods.length
          ? " · périodes filtrées selon les mois sélectionnés"
          : null}
      </p>

      {report.periods.map((period) => (
        <Card key={period.key}>
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base capitalize">
                {period.label}
              </CardTitle>
              <Badge variant="outline">
                Évolution {formatPercent(period.evolutionPercent)}
              </Badge>
            </div>
            <CardDescription>
              {period.orderCount} commande
              {period.orderCount > 1 ? "s" : ""} · total{" "}
              {formatEuro(period.totalAmountEuros)} · moyenne{" "}
              {formatEuro(period.averageAmountEuros)}
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
                    <TableCell className="max-w-[200px] text-xs">
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
          Aucune commande dans les mois sélectionnés.
        </p>
      ) : null}
    </div>
  );
}
