import { describe, expect, it } from "vitest";

import {
  detectPortfolioPatterns,
  type PortfolioPatternCustomer,
  type PortfolioPatternOrder,
} from "@/domain/customers/multi-client-patterns";

function customer(
  partial: Partial<PortfolioPatternCustomer> &
    Pick<PortfolioPatternCustomer, "customerId" | "name">
): PortfolioPatternCustomer {
  return {
    type: "Standard",
    granularity: "month",
    ordersPerMonth: 1,
    averageOrderAmountEuros: 100,
    anomalyRate: 0,
    orderCount: 2,
    totalAmountEuros: 200,
    ...partial,
  };
}

function order(
  partial: Partial<PortfolioPatternOrder> &
    Pick<PortfolioPatternOrder, "customerId" | "monthKey">
): PortfolioPatternOrder {
  return {
    amountEuros: 100,
    isAnomaly: false,
    categories: ["Tech"],
    ...partial,
  };
}

describe("detectPortfolioPatterns", () => {
  it("returns no patterns with fewer than 2 active customers", () => {
    const patterns = detectPortfolioPatterns({
      customers: [customer({ customerId: "C1", name: "A", orderCount: 1 })],
      orders: [order({ customerId: "C1", monthKey: "2024-06" })],
    });
    expect(patterns).toEqual([]);
  });

  it("detects weekly rhythm cohort majority", () => {
    const patterns = detectPortfolioPatterns({
      customers: [
        customer({
          customerId: "C1",
          name: "A",
          granularity: "week",
          ordersPerMonth: 3,
        }),
        customer({
          customerId: "C2",
          name: "B",
          granularity: "week",
          ordersPerMonth: 2.5,
        }),
        customer({
          customerId: "C3",
          name: "C",
          granularity: "month",
          ordersPerMonth: 1,
        }),
      ],
      orders: [
        order({ customerId: "C1", monthKey: "2024-06" }),
        order({ customerId: "C2", monthKey: "2024-06" }),
        order({ customerId: "C3", monthKey: "2024-06" }),
      ],
    });

    const rhythm = patterns.find((pattern) => pattern.id === "rhythm-cohort");
    expect(rhythm?.title).toContain("hebdomadaire");
    expect(rhythm?.customerIds).toEqual(["C1", "C2"]);
  });

  it("flags shared categories covering at least half of customers", () => {
    const patterns = detectPortfolioPatterns({
      customers: [
        customer({ customerId: "C1", name: "A" }),
        customer({ customerId: "C2", name: "B" }),
        customer({ customerId: "C3", name: "C" }),
      ],
      orders: [
        order({
          customerId: "C1",
          monthKey: "2024-06",
          categories: ["Maison", "Tech"],
        }),
        order({
          customerId: "C2",
          monthKey: "2024-06",
          categories: ["Maison"],
        }),
        order({
          customerId: "C3",
          monthKey: "2024-07",
          categories: ["Sport"],
        }),
      ],
    });

    const shared = patterns.find((pattern) => pattern.id === "shared-categories");
    expect(shared?.summary).toContain("Maison");
    expect(shared?.customerIds).toEqual(["C1", "C2"]);
  });

  it("detects anomaly-prone customers at 25% threshold", () => {
    const patterns = detectPortfolioPatterns({
      customers: [
        customer({
          customerId: "C1",
          name: "Risqué",
          anomalyRate: 0.4,
        }),
        customer({
          customerId: "C2",
          name: "Stable",
          anomalyRate: 0.1,
        }),
      ],
      orders: [
        order({ customerId: "C1", monthKey: "2024-06", isAnomaly: true }),
        order({ customerId: "C2", monthKey: "2024-06" }),
      ],
    });

    const watch = patterns.find((pattern) => pattern.id === "anomaly-watch");
    expect(watch?.customerIds).toEqual(["C1"]);
    expect(watch?.severity).toBe("watch");
  });
});
