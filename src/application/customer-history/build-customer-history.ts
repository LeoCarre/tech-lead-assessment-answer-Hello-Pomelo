import { averageCents, percentageEvolution } from "@/domain/money/cents";
import type {
  Customer,
  CustomerHistoryReport,
  EnrichedOrder,
  HistoryPeriod,
  Order,
  PeriodGranularity,
  Product,
} from "@/domain/customers/types";
import { detectAmountAnomaly } from "@/domain/orders/anomalies";
import {
  ANALYSIS_WINDOW_MONTHS,
  DEFAULT_REFERENCE_DATE,
  chooseGranularity,
  endOfIsoWeek,
  endOfMonth,
  isWithinWindow,
  isoWeekKey,
  monthKey,
  startOfAnalysisWindow,
  startOfIsoWeek,
  startOfMonth,
} from "@/domain/orders/periods";

export type BuildCustomerHistoryInput = {
  customerId: string;
  customers: Customer[];
  orders: Order[];
  productsById: Map<string, Product>;
  referenceDate?: Date;
  monthsInAnalysisWindow?: number;
};

export class CustomerNotFoundError extends Error {
  constructor(customerId: string) {
    super(`Customer not found: ${customerId}`);
    this.name = "CustomerNotFoundError";
  }
}

function computeOrderAmountCents(
  order: Order,
  productsById: Map<string, Product>
): number {
  let total = 0;
  for (const item of order.items) {
    const product = productsById.get(item.productId);
    // Data-quality: unknown product ids (e.g. P999) are skipped, not fatal.
    if (!product) continue;
    total += product.priceCents * item.quantity;
  }
  return total;
}

function collectCategories(
  order: Order,
  productsById: Map<string, Product>
): string[] {
  const categories = new Set<string>();
  for (const item of order.items) {
    const product = productsById.get(item.productId);
    if (!product) continue;
    for (const category of product.categories) {
      categories.add(category);
    }
  }
  return [...categories].sort((a, b) => a.localeCompare(b, "fr"));
}

function periodBucket(
  date: Date,
  granularity: PeriodGranularity
): { key: string; start: Date; end: Date; label: string } {
  if (granularity === "week") {
    const key = isoWeekKey(date);
    return {
      key,
      start: startOfIsoWeek(date),
      end: endOfIsoWeek(date),
      label: `Semaine ${key}`,
    };
  }

  const key = monthKey(date);
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return {
    key,
    start: startOfMonth(date),
    end: endOfMonth(date),
    label,
  };
}

export function buildCustomerHistory(
  input: BuildCustomerHistoryInput
): CustomerHistoryReport {
  const referenceDate = input.referenceDate ?? DEFAULT_REFERENCE_DATE;
  const monthsInAnalysisWindow =
    input.monthsInAnalysisWindow ?? ANALYSIS_WINDOW_MONTHS;
  const windowEnd = referenceDate;
  const windowStart = startOfAnalysisWindow(
    referenceDate,
    monthsInAnalysisWindow
  );

  const customer = input.customers.find((c) => c.id === input.customerId);
  if (!customer) {
    throw new CustomerNotFoundError(input.customerId);
  }

  const windowOrders = input.orders
    .filter(
      (order) =>
        order.customerId === input.customerId &&
        isWithinWindow(order.orderDate, windowStart, windowEnd)
    )
    .sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());

  const amounts = windowOrders.map((order) =>
    computeOrderAmountCents(order, input.productsById)
  );
  const averageOrderAmountCents = averageCents(amounts);

  const enrichedOrders: EnrichedOrder[] = windowOrders.map((order, index) => {
    const amountCents = amounts[index]!;
    const anomaly = detectAmountAnomaly(amountCents, averageOrderAmountCents);
    return {
      ...order,
      amountCents,
      categories: collectCategories(order, input.productsById),
      isAnomaly: anomaly.isAnomaly,
      anomalyDirection: anomaly.direction,
    };
  });

  const granularity = chooseGranularity(
    enrichedOrders.length,
    monthsInAnalysisWindow
  );

  const buckets = new Map<string, EnrichedOrder[]>();
  const bucketMeta = new Map<
    string,
    { start: Date; end: Date; label: string }
  >();

  for (const order of enrichedOrders) {
    const meta = periodBucket(order.orderDate, granularity);
    if (!buckets.has(meta.key)) {
      buckets.set(meta.key, []);
      bucketMeta.set(meta.key, {
        start: meta.start,
        end: meta.end,
        label: meta.label,
      });
    }
    buckets.get(meta.key)!.push(order);
  }

  const sortedKeys = [...buckets.keys()].sort((a, b) => {
    const startA = bucketMeta.get(a)!.start.getTime();
    const startB = bucketMeta.get(b)!.start.getTime();
    return startA - startB;
  });

  const periods: HistoryPeriod[] = [];
  for (let index = 0; index < sortedKeys.length; index++) {
    const key = sortedKeys[index]!;
    const orders = buckets.get(key)!;
    const meta = bucketMeta.get(key)!;
    const totalAmountCents = orders.reduce(
      (sum, order) => sum + order.amountCents,
      0
    );
    const averageAmountCents = averageCents(
      orders.map((order) => order.amountCents)
    );
    const previousTotal =
      index === 0 ? null : periods[index - 1]!.totalAmountCents;

    periods.push({
      key,
      label: meta.label,
      start: meta.start,
      end: meta.end,
      orderCount: orders.length,
      totalAmountCents,
      averageAmountCents,
      evolutionPercent: percentageEvolution(totalAmountCents, previousTotal),
      orders,
    });
  }

  return {
    customer,
    referenceDate,
    windowStart,
    windowEnd,
    granularity,
    orderCount: enrichedOrders.length,
    averageOrderAmountCents,
    monthsInAnalysisWindow,
    ordersPerMonth: enrichedOrders.length / monthsInAnalysisWindow,
    periods,
  };
}
