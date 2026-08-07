import { describe, expect, it } from "vitest";

import {
  eurosToCents,
  percentageEvolution,
  averageCents,
} from "@/domain/money/cents";
import { detectAmountAnomaly } from "@/domain/orders/anomalies";
import {
  chooseGranularity,
  startOfAnalysisWindow,
  DEFAULT_REFERENCE_DATE,
} from "@/domain/orders/periods";
import {
  normalizeCustomer,
  normalizeProduct,
  parsePriceToEuros,
} from "@/infrastructure/data/normalize";
import { buildCustomerHistory } from "@/application/customer-history/build-customer-history";
import {
  aggregatePortfolioKpis,
  buildCustomerPortfolio,
} from "@/application/customer-history/build-customer-portfolio";
import type { Customer, Order, Product } from "@/domain/customers/types";

describe("money", () => {
  it("converts euros to integer cents without float drift for common prices", () => {
    expect(eurosToCents(69.99)).toBe(6999);
    expect(eurosToCents(12.5)).toBe(1250);
    expect(eurosToCents(0.1 + 0.2)).toBe(30);
  });

  it("returns null evolution for missing previous or zero previous", () => {
    expect(percentageEvolution(1000, null)).toBeNull();
    expect(percentageEvolution(1000, 0)).toBeNull();
    expect(percentageEvolution(1500, 1000)).toBe(50);
  });

  it("averages with rounding to nearest cent", () => {
    expect(averageCents([100, 200, 300])).toBe(200);
    expect(averageCents([100, 101])).toBe(101);
  });
});

describe("normalization boundary", () => {
  it("parses string product prices", () => {
    expect(parsePriceToEuros("69.99")).toBe(69.99);
    expect(normalizeProduct({
      id: "P018",
      name: "Enceinte",
      price: "69.99",
      categories: ["Électronique"],
    }).priceCents).toBe(6999);
  });

  it("maps missing or empty customer type to Unknown", () => {
    expect(
      normalizeCustomer({
        id: "C009",
        name: "A",
        email: "a@test.com",
        registration_date: "2024-01-01",
      }).type
    ).toBe("Unknown");

    expect(
      normalizeCustomer({
        id: "C012",
        name: "B",
        email: "b@test.com",
        type: "",
        registration_date: "2024-01-01",
      }).type
    ).toBe("Unknown");
  });
});

describe("granularity", () => {
  it("groups by week when orders per month exceed 2", () => {
    // 13 / 6 > 2
    expect(chooseGranularity(13, 6)).toBe("week");
    // 12 / 6 == 2 → month (strictly greater than 2)
    expect(chooseGranularity(12, 6)).toBe("month");
    expect(chooseGranularity(5, 6)).toBe("month");
  });

  it("computes a deterministic six-month window", () => {
    const start = startOfAnalysisWindow(DEFAULT_REFERENCE_DATE, 6);
    expect(start.toISOString()).toBe("2024-05-15T00:00:00.000Z");
  });
});

describe("anomalies", () => {
  it("flags amounts outside ±50% of customer average", () => {
    expect(detectAmountAnomaly(40, 100)).toEqual({
      isAnomaly: true,
      direction: "low",
    });
    expect(detectAmountAnomaly(50, 100)).toEqual({
      isAnomaly: false,
      direction: null,
    });
    expect(detectAmountAnomaly(151, 100)).toEqual({
      isAnomaly: true,
      direction: "high",
    });
  });
});

describe("buildCustomerHistory", () => {
  const customer: Customer = {
    id: "C001",
    name: "Sophie Martin",
    email: "sophie@test.com",
    type: "Premium",
    registrationDate: "2023-01-15",
  };

  const productsById = new Map<string, Product>([
    [
      "P1",
      {
        id: "P1",
        name: "Item",
        priceCents: 10000,
        categories: ["Électronique", "Audio"],
      },
    ],
    [
      "P2",
      {
        id: "P2",
        name: "Food",
        priceCents: 500,
        categories: ["Alimentaire"],
      },
    ],
  ]);

  function order(
    orderId: string,
    date: string,
    productId: string,
    quantity = 1
  ): Order {
    return {
      orderId,
      customerId: "C001",
      orderDate: new Date(date),
      status: "Delivered",
      expressDelivery: false,
      items: [{ productId, quantity }],
    };
  }

  it("groups weekly for frequent buyers and sets first evolution to null", () => {
    // 13 orders in window → weekly
    const orders: Order[] = [];
    for (let i = 0; i < 13; i++) {
      const day = 15 + (i % 10);
      const month = 5 + Math.floor(i / 3);
      orders.push(
        order(
          `O-${i}`,
          `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T10:00:00Z`,
          "P1"
        )
      );
    }

    const report = buildCustomerHistory({
      customerId: "C001",
      customers: [customer],
      orders,
      productsById,
      referenceDate: new Date("2024-11-15T23:59:59.999Z"),
    });

    expect(report.granularity).toBe("week");
    expect(report.periods.length).toBeGreaterThan(0);
    expect(report.periods[0]!.evolutionPercent).toBeNull();
    expect(report.periods[0]!.orders[0]!.categories).toEqual([
      "Audio",
      "Électronique",
    ]);
  });

  it("groups monthly for occasional buyers and detects anomalies vs customer average", () => {
    const orders = [
      order("O1", "2024-06-01T10:00:00Z", "P1"), // 100€
      order("O2", "2024-07-01T10:00:00Z", "P1"), // 100€
      order("O3", "2024-08-01T10:00:00Z", "P1"), // 100€
      order("O4", "2024-09-01T10:00:00Z", "P2", 1), // 5€ anomaly low
      order("O5", "2024-10-01T10:00:00Z", "P1", 3), // 300€ anomaly high
    ];

    const report = buildCustomerHistory({
      customerId: "C001",
      customers: [customer],
      orders,
      productsById,
      referenceDate: new Date("2024-11-15T23:59:59.999Z"),
    });

    expect(report.granularity).toBe("month");
    expect(report.orderCount).toBe(5);

    const low = report.periods.flatMap((p) => p.orders).find((o) => o.orderId === "O4");
    const high = report.periods.flatMap((p) => p.orders).find((o) => o.orderId === "O5");

    expect(low?.isAnomaly).toBe(true);
    expect(low?.anomalyDirection).toBe("low");
    expect(high?.isAnomaly).toBe(true);
    expect(high?.anomalyDirection).toBe("high");

    // Second month vs first: same total → 0%
    expect(report.periods[1]!.evolutionPercent).toBe(0);
  });

  it("excludes orders outside the six-month window", () => {
    const orders = [
      order("OLD", "2024-04-01T10:00:00Z", "P1"),
      order("IN", "2024-06-01T10:00:00Z", "P1"),
    ];

    const report = buildCustomerHistory({
      customerId: "C001",
      customers: [customer],
      orders,
      productsById,
    });

    expect(report.orderCount).toBe(1);
    expect(report.periods[0]!.orders[0]!.orderId).toBe("IN");
  });

  it("skips unknown product lines without crashing", () => {
    const orders = [
      {
        orderId: "O-MIX",
        customerId: "C001",
        orderDate: new Date("2024-06-01T10:00:00Z"),
        status: "Processing",
        expressDelivery: false,
        items: [
          { productId: "P999", quantity: 1 },
          { productId: "P1", quantity: 1 },
        ],
      } satisfies Order,
    ];

    const report = buildCustomerHistory({
      customerId: "C001",
      customers: [customer],
      orders,
      productsById,
      referenceDate: new Date("2024-11-15T23:59:59.999Z"),
    });

    expect(report.orderCount).toBe(1);
    expect(report.periods[0]!.orders[0]!.amountCents).toBe(10000);
    expect(report.periods[0]!.orders[0]!.categories).toEqual([
      "Audio",
      "Électronique",
    ]);
  });
});

describe("buildCustomerPortfolio", () => {
  const customers: Customer[] = [
    {
      id: "C001",
      name: "Sophie Martin",
      email: "sophie@test.com",
      type: "Premium",
      registrationDate: "2023-01-15",
    },
    {
      id: "C002",
      name: "Lucas Dubois",
      email: "lucas@test.com",
      type: "VIP",
      registrationDate: "2022-06-20",
    },
  ];

  const productsById = new Map<string, Product>([
    [
      "P1",
      {
        id: "P1",
        name: "Item",
        priceCents: 10000,
        categories: ["Électronique"],
      },
    ],
  ]);

  it("aggregates KPIs across selected customers", () => {
    const orders: Order[] = [
      {
        orderId: "A1",
        customerId: "C001",
        orderDate: new Date("2024-06-01T10:00:00Z"),
        status: "Delivered",
        expressDelivery: false,
        items: [{ productId: "P1", quantity: 1 }],
      },
      {
        orderId: "A2",
        customerId: "C001",
        orderDate: new Date("2024-07-01T10:00:00Z"),
        status: "Delivered",
        expressDelivery: false,
        items: [{ productId: "P1", quantity: 1 }],
      },
      {
        orderId: "B1",
        customerId: "C002",
        orderDate: new Date("2024-08-01T10:00:00Z"),
        status: "Delivered",
        expressDelivery: false,
        items: [{ productId: "P1", quantity: 2 }],
      },
    ];

    const portfolio = buildCustomerPortfolio({
      customers,
      orders,
      productsById,
      referenceDate: new Date("2024-11-15T23:59:59.999Z"),
    });

    expect(portfolio.kpis.activeCustomers).toBe(2);
    expect(portfolio.kpis.orderCount).toBe(3);
    expect(portfolio.kpis.totalAmountCents).toBe(40000);
    expect(portfolio.kpis.averageOrderAmountCents).toBe(
      Math.round(40000 / 3)
    );
    expect(portfolio.availableMonths.length).toBeGreaterThan(0);
    expect(portfolio.orders).toHaveLength(3);

    const filteredOrders = portfolio.orders.filter(
      (order) => order.monthKey === "2024-08"
    );
    const filtered = aggregatePortfolioKpis({
      customers: portfolio.customers,
      orders: filteredOrders,
    });
    expect(filtered.activeCustomers).toBe(1);
    expect(filtered.orderCount).toBe(1);
    expect(filtered.totalAmountCents).toBe(20000);
  });
});
