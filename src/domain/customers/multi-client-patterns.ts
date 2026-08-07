/**
 * Multi-client purchase patterns for the Q1 pilotage view.
 * Rules are explicit and deterministic - see docs/assumptions-q1.md.
 */

export type PortfolioPatternCustomer = {
  customerId: string;
  name: string;
  type: string;
  granularity: "week" | "month";
  ordersPerMonth: number;
  averageOrderAmountEuros: number;
  anomalyRate: number;
  orderCount: number;
  totalAmountEuros: number;
};

export type PortfolioPatternOrder = {
  customerId: string;
  monthKey: string;
  amountEuros: number;
  isAnomaly: boolean;
  categories: string[];
};

export type DetectedPortfolioPattern = {
  id: string;
  title: string;
  summary: string;
  justification: string;
  severity: "info" | "watch" | "alert";
  customerIds: string[];
  metrics: Array<{ label: string; value: string }>;
};

const ANOMALY_WATCH_RATE = 0.25;
const SHARED_CATEGORY_CUSTOMER_SHARE = 0.5;
const MIN_CUSTOMERS_FOR_PATTERN = 2;

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatRate(value: number): string {
  return `${(value * 100).toFixed(0)} %`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, 1));
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Detects cross-customer patterns on the current filtered selection.
 * Returns an empty list when fewer than 2 active customers are present.
 */
export function detectPortfolioPatterns(input: {
  customers: PortfolioPatternCustomer[];
  orders: PortfolioPatternOrder[];
}): DetectedPortfolioPattern[] {
  const activeCustomers = input.customers.filter((c) => c.orderCount > 0);
  if (activeCustomers.length < MIN_CUSTOMERS_FOR_PATTERN) {
    return [];
  }

  const patterns: DetectedPortfolioPattern[] = [];
  const customerById = new Map(
    activeCustomers.map((customer) => [customer.customerId, customer])
  );

  // 1) Rhythm majority
  const weekly = activeCustomers.filter((c) => c.granularity === "week");
  const monthly = activeCustomers.filter((c) => c.granularity === "month");
  const rhythmMajority = weekly.length >= monthly.length ? weekly : monthly;
  const rhythmLabel =
    weekly.length >= monthly.length ? "hebdomadaire" : "mensuel";
  patterns.push({
    id: "rhythm-cohort",
    title: `Cohorte rythme ${rhythmLabel}`,
    summary: `${rhythmMajority.length}/${activeCustomers.length} clients partagent un rythme ${rhythmLabel}.`,
    justification:
      weekly.length >= monthly.length
        ? `Profil calculé via orderCount / 6 > 2 → granularité semaine pour ${weekly.length} client(s).`
        : `Profil calculé via orderCount / 6 ≤ 2 → granularité mois pour ${monthly.length} client(s).`,
    severity: "info",
    customerIds: rhythmMajority.map((c) => c.customerId),
    metrics: [
      { label: "Hebdo", value: String(weekly.length) },
      { label: "Mensuel", value: String(monthly.length) },
    ],
  });

  // 2) Customer type concentration on GMV
  const gmvByType = new Map<string, { euros: number; customerIds: string[] }>();
  for (const customer of activeCustomers) {
    const bucket = gmvByType.get(customer.type) ?? {
      euros: 0,
      customerIds: [],
    };
    bucket.euros += customer.totalAmountEuros;
    bucket.customerIds.push(customer.customerId);
    gmvByType.set(customer.type, bucket);
  }
  const totalGmv = activeCustomers.reduce(
    (sum, customer) => sum + customer.totalAmountEuros,
    0
  );
  if (totalGmv > 0) {
    const topType = [...gmvByType.entries()].sort(
      (a, b) => b[1].euros - a[1].euros
    )[0];
    if (topType) {
      const [type, bucket] = topType;
      const share = bucket.euros / totalGmv;
      patterns.push({
        id: "type-gmv",
        title: `Segment type « ${type} »`,
        summary: `${formatRate(share)} du CA filtré est porté par le type ${type} (${bucket.customerIds.length} client${bucket.customerIds.length > 1 ? "s" : ""}).`,
        justification:
          "Concentration du GMV agrégé par customer.type sur la sélection courante.",
        severity: share >= 0.6 ? "watch" : "info",
        customerIds: bucket.customerIds,
        metrics: [
          { label: "Part CA", value: formatRate(share) },
          { label: "CA segment", value: formatEuro(bucket.euros) },
        ],
      });
    }
  }

  // 3) Shared product categories across customers
  const customersByCategory = new Map<string, Set<string>>();
  for (const order of input.orders) {
    if (!customerById.has(order.customerId)) continue;
    for (const category of order.categories) {
      const set = customersByCategory.get(category) ?? new Set<string>();
      set.add(order.customerId);
      customersByCategory.set(category, set);
    }
  }
  const sharedCategories = [...customersByCategory.entries()]
    .map(([category, ids]) => ({
      category,
      customerIds: [...ids],
      share: ids.size / activeCustomers.length,
    }))
    .filter(
      (item) =>
        item.customerIds.length >= MIN_CUSTOMERS_FOR_PATTERN &&
        item.share >= SHARED_CATEGORY_CUSTOMER_SHARE
    )
    .sort((a, b) => b.share - a.share || b.customerIds.length - a.customerIds.length);

  if (sharedCategories.length > 0) {
    const top = sharedCategories.slice(0, 3);
    const lead = top[0]!;
    patterns.push({
      id: "shared-categories",
      title: "Catégories partagées",
      summary: `« ${lead.category} » touche ${lead.customerIds.length}/${activeCustomers.length} clients (≥ ${formatRate(SHARED_CATEGORY_CUSTOMER_SHARE)}).`,
      justification: `Catégories présentes chez au moins ${formatRate(SHARED_CATEGORY_CUSTOMER_SHARE)} des clients actifs de la sélection : ${top
        .map((item) => `${item.category} (${item.customerIds.length})`)
        .join(", ")}.`,
      severity: "info",
      customerIds: lead.customerIds,
      metrics: top.map((item) => ({
        label: item.category,
        value: `${item.customerIds.length} clients`,
      })),
    });
  }

  // 4) Anomaly-prone customers
  const anomalyHeavy = activeCustomers.filter(
    (customer) => customer.anomalyRate >= ANOMALY_WATCH_RATE
  );
  if (anomalyHeavy.length >= 1) {
    patterns.push({
      id: "anomaly-watch",
      title: "Clients à anomalies fréquentes",
      summary: `${anomalyHeavy.length} client${anomalyHeavy.length > 1 ? "s" : ""} avec ≥ ${formatRate(ANOMALY_WATCH_RATE)} de commandes hors ±50 % de leur panier moyen.`,
      justification:
        "Taux d’anomalies par client = commandes anomaliques / commandes du client sur la sélection filtrée.",
      severity: anomalyHeavy.length >= 2 ? "alert" : "watch",
      customerIds: anomalyHeavy.map((c) => c.customerId),
      metrics: anomalyHeavy.slice(0, 4).map((customer) => ({
        label: customer.name,
        value: formatRate(customer.anomalyRate),
      })),
    });
  }

  // 5) Peak month across selection
  const gmvByMonth = new Map<string, number>();
  for (const order of input.orders) {
    if (!customerById.has(order.customerId)) continue;
    gmvByMonth.set(
      order.monthKey,
      (gmvByMonth.get(order.monthKey) ?? 0) + order.amountEuros
    );
  }
  const peakMonth = [...gmvByMonth.entries()].sort((a, b) => b[1] - a[1])[0];
  if (peakMonth && totalGmv > 0) {
    const [key, euros] = peakMonth;
    const customersInPeak = [
      ...new Set(
        input.orders
          .filter((order) => order.monthKey === key)
          .map((order) => order.customerId)
          .filter((id) => customerById.has(id))
      ),
    ];
    patterns.push({
      id: "peak-month",
      title: "Pic d’activité commun",
      summary: `${monthLabel(key)} concentre ${formatRate(euros / totalGmv)} du CA filtré (${formatEuro(euros)}).`,
      justification:
        "Mois UTC avec le GMV maximal sur les commandes de la sélection courante.",
      severity: euros / totalGmv >= 0.35 ? "watch" : "info",
      customerIds: customersInPeak,
      metrics: [
        { label: "Mois", value: monthLabel(key) },
        { label: "CA", value: formatEuro(euros) },
        { label: "Clients", value: String(customersInPeak.length) },
      ],
    });
  }

  // 6) AOV bands vs median
  const aovs = activeCustomers
    .map((c) => c.averageOrderAmountEuros)
    .filter((value) => value > 0);
  const aovMedian = median(aovs);
  if (aovMedian !== null && aovMedian > 0) {
    const low = activeCustomers.filter(
      (c) => c.averageOrderAmountEuros > 0 && c.averageOrderAmountEuros < aovMedian * 0.75
    );
    const high = activeCustomers.filter(
      (c) => c.averageOrderAmountEuros > aovMedian * 1.25
    );
    if (low.length + high.length >= MIN_CUSTOMERS_FOR_PATTERN) {
      patterns.push({
        id: "aov-spread",
        title: "Dispersion des paniers moyens",
        summary: `${low.length} panier(s) bas (< 75 % médiane) et ${high.length} panier(s) hauts (> 125 % médiane). Médiane ${formatEuro(aovMedian)}.`,
        justification:
          "Bandes relatives à la médiane des paniers moyens clients de la sélection (seuils 0,75× et 1,25×).",
        severity: high.length >= 2 || low.length >= 2 ? "watch" : "info",
        customerIds: [...low, ...high].map((c) => c.customerId),
        metrics: [
          { label: "Médiane", value: formatEuro(aovMedian) },
          { label: "Bas", value: String(low.length) },
          { label: "Hauts", value: String(high.length) },
        ],
      });
    }
  }

  return patterns;
}
