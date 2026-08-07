import { describe, expect, it } from "vitest";

import { eurosToCents } from "@/domain/money/cents";
import { calculatePrice } from "@/domain/pricing/engine";
import type { PricingOrderInput } from "@/domain/pricing/types";

function line(input: {
  productId?: string;
  name?: string;
  euros: number;
  quantity?: number;
  categories: string[];
}) {
  return {
    productId: input.productId ?? "P",
    name: input.name ?? "Produit",
    unitPriceCents: eurosToCents(input.euros),
    quantity: input.quantity ?? 1,
    categories: input.categories,
  };
}

describe("pricing engine - base rules", () => {
  it("should_apply_vip_15_percent_and_exclude_premium", () => {
    const result = calculatePrice({
      customerType: "VIP",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 100, categories: [] })],
    });

    expect(result.basePriceCents).toBe(10_000);
    expect(result.appliedRules.some((r) => r.ruleId === "base-vip")).toBe(true);
    expect(result.appliedRules.some((r) => r.ruleId === "base-premium")).toBe(
      false
    );
    // 100€ -15% = 85€, no category tax
    expect(result.finalPriceCents).toBe(8500);
  });

  it("should_apply_premium_10_percent", () => {
    const result = calculatePrice({
      customerType: "Premium",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 100, categories: [] })],
    });
    expect(result.finalPriceCents).toBe(9000);
  });

  it("should_stack_first_order_of_month_after_type_discount", () => {
    const result = calculatePrice({
      customerType: "Premium",
      isFirstOrderOfMonth: true,
      expressDelivery: false,
      lines: [line({ euros: 100, categories: [] })],
    });
    // 100 -> 90 (-10%) -> 85.5 (-5%) = 8550
    expect(result.finalPriceCents).toBe(8550);
  });
});

describe("pricing engine - conditional thresholds", () => {
  it("should_apply_5_percent_discount_above_500", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 600, categories: [] })],
    });
    expect(
      result.appliedRules.some((r) => r.ruleId === "conditional-500")
    ).toBe(true);
    expect(result.finalPriceCents).toBe(eurosToCents(570));
  });

  it("should_apply_8_percent_discount_above_1000_replacing_5", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 1200, categories: [] })],
    });
    expect(
      result.appliedRules.some((r) => r.ruleId === "conditional-1000")
    ).toBe(true);
    expect(
      result.appliedRules.some((r) => r.ruleId === "conditional-500")
    ).toBe(false);
    expect(result.finalPriceCents).toBe(eurosToCents(1104));
  });

  it("should_not_apply_500_threshold_at_exactly_500", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 500, categories: [] })],
    });
    expect(
      result.appliedRules.some((r) => r.ruleId === "conditional-500")
    ).toBe(false);
    expect(result.finalPriceCents).toBe(eurosToCents(500));
  });
});

describe("pricing engine - category tax", () => {
  it("should_apply_highest_tax_when_multiple_categories", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [
        line({
          euros: 100,
          categories: ["Électronique", "Alimentaire"],
        }),
      ],
    });
    // Electronics 20% wins over Food 5.5%
    expect(result.finalPriceCents).toBe(eurosToCents(120));
  });

  it("should_apply_food_tax_5_5_percent", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 100, categories: ["Alimentaire"] })],
    });
    expect(result.finalPriceCents).toBe(eurosToCents(105.5));
  });
});

describe("pricing engine - cumulative reevaluation", () => {
  it("should_cancel_500_threshold_when_recursive_discount_crosses_below_500", () => {
    // After base: 520. Conditional -5% => 494. But wait we need >500 after base.
    // Base 520 → conditional 494. Then bulk? Need qty >3 same category.
    // Better: 4 units of 140 = 560 after base. Conditional -5% = 532. Tax 0.
    // Bulk -10% on all = 478.8 < 500 → cancel conditional, replay:
    // 560, no conditional, bulk -10% = 504.
    const input: PricingOrderInput = {
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [
        line({
          productId: "P-FOOD",
          euros: 140,
          quantity: 4,
          categories: ["Accessoires"],
        }),
      ],
    };

    const result = calculatePrice(input);
    expect(result.reevaluationCount).toBeGreaterThan(0);
    expect(
      result.appliedRules.some((r) => r.ruleId === "conditional-500")
    ).toBe(false);
    expect(
      result.appliedRules.some(
        (r) => r.ruleId === "reeval-cancel-conditional-500"
      )
    ).toBe(true);
    // 4×140 = 560 → pas de seuil 500 → bulk -10 % = 504
    expect(result.finalPriceCents).toBe(eurosToCents(504));
  });
});

describe("pricing engine - final rules", () => {
  it("should_add_express_delivery_fee", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: true,
      lines: [line({ euros: 100, categories: [] })],
    });
    expect(result.finalPriceCents).toBe(eurosToCents(115));
  });

  it("should_add_processing_fee_when_final_below_50", () => {
    const result = calculatePrice({
      customerType: "Standard",
      isFirstOrderOfMonth: false,
      expressDelivery: false,
      lines: [line({ euros: 40, categories: [] })],
    });
    expect(result.finalPriceCents).toBe(eurosToCents(45));
  });
});
