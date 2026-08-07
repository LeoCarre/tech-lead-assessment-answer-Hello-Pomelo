import { centsToEuros } from "@/domain/money/cents";
import type { Customer, Order, Product } from "@/domain/customers/types";
import {
  buildCustomerHistory,
  type BuildCustomerHistoryInput,
} from "@/application/customer-history/build-customer-history";
import { monthKey } from "@/domain/orders/periods";

export type CustomerPortfolioSummary = {
  customerId: string;
  name: string;
  type: string;
  orderCount: number;
  totalAmountCents: number;
  averageOrderAmountCents: number;
  anomalyCount: number;
  anomalyRate: number;
  granularity: "week" | "month";
  ordersPerMonth: number;
};

export type PortfolioOrderFact = {
  customerId: string;
  orderId: string;
  date: Date;
  monthKey: string;
  amountCents: number;
  isAnomaly: boolean;
  anomalyDirection: "high" | "low" | null;
  status: string;
  categories: string[];
};

export type PortfolioMonthOption = {
  key: string;
  label: string;
};

export type PortfolioKpis = {
  activeCustomers: number;
  orderCount: number;
  totalAmountCents: number;
  averageOrderAmountCents: number;
  anomalyCount: number;
  anomalyRate: number;
  weeklyRhythmCustomers: number;
  monthlyRhythmCustomers: number;
};

export type CustomerPortfolioReport = {
  referenceDate: Date;
  windowStart: Date;
  windowEnd: Date;
  monthsInAnalysisWindow: number;
  customers: CustomerPortfolioSummary[];
  orders: PortfolioOrderFact[];
  availableMonths: PortfolioMonthOption[];
  kpis: PortfolioKpis;
};

function emptyKpis(): PortfolioKpis {
  return {
    activeCustomers: 0,
    orderCount: 0,
    totalAmountCents: 0,
    averageOrderAmountCents: 0,
    anomalyCount: 0,
    anomalyRate: 0,
    weeklyRhythmCustomers: 0,
    monthlyRhythmCustomers: 0,
  };
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

function listMonthsInWindow(windowStart: Date, windowEnd: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(windowEnd.getUTCFullYear(), windowEnd.getUTCMonth(), 1)
  );

  while (cursor.getTime() <= end.getTime()) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return keys;
}

export function aggregatePortfolioKpis(input: {
  customers: Array<Pick<CustomerPortfolioSummary, "customerId" | "granularity">>;
  orders: Array<
    Pick<PortfolioOrderFact, "customerId" | "amountCents" | "isAnomaly">
  >;
}): PortfolioKpis {
  const { customers, orders } = input;
  if (orders.length === 0) {
    return {
      ...emptyKpis(),
      weeklyRhythmCustomers: 0,
      monthlyRhythmCustomers: 0,
    };
  }

  const orderCount = orders.length;
  const totalAmountCents = orders.reduce(
    (sum, order) => sum + order.amountCents,
    0
  );
  const anomalyCount = orders.filter((order) => order.isAnomaly).length;
  const activeIds = new Set(orders.map((order) => order.customerId));
  const activeCustomers = customers.filter((c) => activeIds.has(c.customerId));

  return {
    activeCustomers: activeCustomers.length,
    orderCount,
    totalAmountCents,
    averageOrderAmountCents: Math.round(totalAmountCents / orderCount),
    anomalyCount,
    anomalyRate: anomalyCount / orderCount,
    weeklyRhythmCustomers: activeCustomers.filter((c) => c.granularity === "week")
      .length,
    monthlyRhythmCustomers: activeCustomers.filter(
      (c) => c.granularity === "month"
    ).length,
  };
}

export function summarizeCustomersFromOrders(input: {
  customers: CustomerPortfolioSummary[];
  orders: PortfolioOrderFact[];
}): Array<
  CustomerPortfolioSummary & {
    totalAmountEuros?: never;
  }
> {
  return input.customers
    .map((customer) => {
      const customerOrders = input.orders.filter(
        (order) => order.customerId === customer.customerId
      );
      const orderCount = customerOrders.length;
      const totalAmountCents = customerOrders.reduce(
        (sum, order) => sum + order.amountCents,
        0
      );
      const anomalyCount = customerOrders.filter((order) => order.isAnomaly)
        .length;

      return {
        ...customer,
        orderCount,
        totalAmountCents,
        averageOrderAmountCents:
          orderCount === 0 ? 0 : Math.round(totalAmountCents / orderCount),
        anomalyCount,
        anomalyRate: orderCount === 0 ? 0 : anomalyCount / orderCount,
      };
    })
    .filter((customer) => customer.orderCount > 0)
    .sort((a, b) => b.totalAmountCents - a.totalAmountCents);
}

export function buildCustomerPortfolio(input: {
  customers: Customer[];
  orders: Order[];
  productsById: Map<string, Product>;
  referenceDate?: Date;
  monthsInAnalysisWindow?: number;
  customerIds?: string[];
}): CustomerPortfolioReport {
  const selected =
    input.customerIds === undefined
      ? input.customers
      : input.customers.filter((c) => input.customerIds!.includes(c.id));

  const summaries: CustomerPortfolioSummary[] = [];
  const orderFacts: PortfolioOrderFact[] = [];
  let windowStart = new Date(0);
  let windowEnd = new Date(0);
  let referenceDate = new Date(0);
  let monthsInAnalysisWindow = 6;

  for (const customer of selected) {
    const historyInput: BuildCustomerHistoryInput = {
      customerId: customer.id,
      customers: input.customers,
      orders: input.orders,
      productsById: input.productsById,
      referenceDate: input.referenceDate,
      monthsInAnalysisWindow: input.monthsInAnalysisWindow,
    };

    const report = buildCustomerHistory(historyInput);
    referenceDate = report.referenceDate;
    windowStart = report.windowStart;
    windowEnd = report.windowEnd;
    monthsInAnalysisWindow = report.monthsInAnalysisWindow;

    const flatOrders = report.periods.flatMap((period) => period.orders);
    const totalAmountCents = flatOrders.reduce(
      (sum, order) => sum + order.amountCents,
      0
    );
    const anomalyCount = flatOrders.filter((order) => order.isAnomaly).length;

    for (const order of flatOrders) {
      orderFacts.push({
        customerId: customer.id,
        orderId: order.orderId,
        date: order.orderDate,
        monthKey: monthKey(order.orderDate),
        amountCents: order.amountCents,
        isAnomaly: order.isAnomaly,
        anomalyDirection: order.anomalyDirection,
        status: order.status,
        categories: order.categories,
      });
    }

    summaries.push({
      customerId: customer.id,
      name: customer.name,
      type: customer.type,
      orderCount: report.orderCount,
      totalAmountCents,
      averageOrderAmountCents: report.averageOrderAmountCents,
      anomalyCount,
      anomalyRate:
        report.orderCount === 0 ? 0 : anomalyCount / report.orderCount,
      granularity: report.granularity,
      ordersPerMonth: report.ordersPerMonth,
    });
  }

  summaries.sort((a, b) => b.totalAmountCents - a.totalAmountCents);
  orderFacts.sort((a, b) => a.date.getTime() - b.date.getTime());

  const availableMonths = listMonthsInWindow(windowStart, windowEnd).map(
    (key) => ({
      key,
      label: monthLabel(key),
    })
  );

  return {
    referenceDate,
    windowStart,
    windowEnd,
    monthsInAnalysisWindow,
    customers: summaries,
    orders: orderFacts,
    availableMonths,
    kpis: aggregatePortfolioKpis({
      customers: summaries,
      orders: orderFacts,
    }),
  };
}

export function serializeCustomerPortfolio(report: CustomerPortfolioReport) {
  return {
    referenceDate: report.referenceDate.toISOString(),
    windowStart: report.windowStart.toISOString(),
    windowEnd: report.windowEnd.toISOString(),
    monthsInAnalysisWindow: report.monthsInAnalysisWindow,
    availableMonths: report.availableMonths,
    kpis: {
      activeCustomers: report.kpis.activeCustomers,
      orderCount: report.kpis.orderCount,
      totalAmountEuros: centsToEuros(report.kpis.totalAmountCents),
      averageOrderAmountEuros: centsToEuros(
        report.kpis.averageOrderAmountCents
      ),
      anomalyCount: report.kpis.anomalyCount,
      anomalyRate: report.kpis.anomalyRate,
      weeklyRhythmCustomers: report.kpis.weeklyRhythmCustomers,
      monthlyRhythmCustomers: report.kpis.monthlyRhythmCustomers,
    },
    customers: report.customers.map((customer) => ({
      customerId: customer.customerId,
      name: customer.name,
      type: customer.type,
      orderCount: customer.orderCount,
      totalAmountEuros: centsToEuros(customer.totalAmountCents),
      averageOrderAmountEuros: centsToEuros(customer.averageOrderAmountCents),
      anomalyCount: customer.anomalyCount,
      anomalyRate: customer.anomalyRate,
      granularity: customer.granularity,
      ordersPerMonth: customer.ordersPerMonth,
    })),
    orders: report.orders.map((order) => ({
      customerId: order.customerId,
      orderId: order.orderId,
      date: order.date.toISOString(),
      monthKey: order.monthKey,
      amountEuros: centsToEuros(order.amountCents),
      isAnomaly: order.isAnomaly,
      anomalyDirection: order.anomalyDirection,
      status: order.status,
      categories: order.categories,
    })),
  };
}

export type CustomerPortfolioDto = ReturnType<
  typeof serializeCustomerPortfolio
>;
