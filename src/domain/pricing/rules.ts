import {
  applyPercentToAllLines,
  cloneState,
  sumLineAmounts,
  type PricingOrderInput,
  type PricingRule,
  type PricingWorkingState,
} from "@/domain/pricing/types";

/** VIP exclusive with Premium: VIP wins. */
export const vipDiscountRule: PricingRule = {
  id: "base-vip",
  name: "Remise VIP (-15 %)",
  phase: "base",
  priority: 10,
  dependencies: [],
  applies: (_state, input) => input.customerType === "VIP",
  apply: (state) => {
    const { lines, impactCents } = applyPercentToAllLines(state.lines, -15);
    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "base-vip",
          ruleName: "Remise VIP (-15 %)",
          phase: "base",
          impactCents,
          detail: "Client VIP : -15 % sur le montant brut des lignes.",
        },
      ],
    };
  },
};

export const premiumDiscountRule: PricingRule = {
  id: "base-premium",
  name: "Remise Premium (-10 %)",
  phase: "base",
  priority: 20,
  dependencies: ["base-vip"],
  applies: (_state, input) => input.customerType === "Premium",
  apply: (state) => {
    const { lines, impactCents } = applyPercentToAllLines(state.lines, -10);
    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "base-premium",
          ruleName: "Remise Premium (-10 %)",
          phase: "base",
          impactCents,
          detail:
            "Client Premium : -10 %. Non cumulable avec VIP (VIP exclusif).",
        },
      ],
    };
  },
};

export const firstOrderOfMonthRule: PricingRule = {
  id: "base-first-order-month",
  name: "Première commande du mois (-5 %)",
  phase: "base",
  priority: 30,
  dependencies: [],
  applies: (_state, input) => input.isFirstOrderOfMonth,
  apply: (state) => {
    const { lines, impactCents } = applyPercentToAllLines(state.lines, -5);
    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "base-first-order-month",
          ruleName: "Première commande du mois (-5 %)",
          phase: "base",
          impactCents,
          detail: "Première commande du mois calendaire : -5 % supplémentaire.",
        },
      ],
    };
  },
};

export const conditional1000Rule: PricingRule = {
  id: "conditional-1000",
  name: "Seuil > 1000 € (-8 %)",
  phase: "conditional",
  priority: 10,
  dependencies: ["base-vip", "base-premium", "base-first-order-month"],
  applies: (state) => sumLineAmounts(state.lines) > 100_000,
  apply: (state) => {
    const { lines, impactCents } = applyPercentToAllLines(state.lines, -8);
    return {
      ...cloneState(state),
      lines,
      activeConditionalRuleId: "conditional-1000",
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "conditional-1000",
          ruleName: "Seuil > 1000 € (-8 %)",
          phase: "conditional",
          impactCents,
          detail:
            "Montant après règles de base > 1000 € : -8 % (remplace le seuil 500 €).",
        },
      ],
    };
  },
};

export const conditional500Rule: PricingRule = {
  id: "conditional-500",
  name: "Seuil > 500 € (-5 %)",
  phase: "conditional",
  priority: 20,
  dependencies: ["conditional-1000"],
  applies: (state) =>
    state.activeConditionalRuleId === null &&
    sumLineAmounts(state.lines) > 50_000,
  apply: (state) => {
    const { lines, impactCents } = applyPercentToAllLines(state.lines, -5);
    return {
      ...cloneState(state),
      lines,
      activeConditionalRuleId: "conditional-500",
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "conditional-500",
          ruleName: "Seuil > 500 € (-5 %)",
          phase: "conditional",
          impactCents,
          detail:
            "Montant après règles de base > 500 € et ≤ 1000 € : -5 %.",
        },
      ],
    };
  },
};

const CATEGORY_TAX_RATES: Array<{
  match: string;
  ratePercent: number;
  label: string;
}> = [
  { match: "électronique", ratePercent: 20, label: "Électronique (20 %)" },
  { match: "electronics", ratePercent: 20, label: "Électronique (20 %)" },
  { match: "alimentaire", ratePercent: 5.5, label: "Alimentaire (5,5 %)" },
  { match: "food", ratePercent: 5.5, label: "Alimentaire (5,5 %)" },
];

function highestTaxRate(
  categories: string[]
): { ratePercent: number; label: string } | null {
  let best: { ratePercent: number; label: string } | null = null;
  for (const category of categories) {
    const normalized = category.trim().toLowerCase();
    for (const entry of CATEGORY_TAX_RATES) {
      if (
        normalized === entry.match ||
        normalized.includes(entry.match)
      ) {
        if (!best || entry.ratePercent > best.ratePercent) {
          best = { ratePercent: entry.ratePercent, label: entry.label };
        }
      }
    }
  }
  return best;
}

export const categoryTaxRule: PricingRule = {
  id: "category-tax",
  name: "Taxes par catégorie produit",
  phase: "category",
  priority: 10,
  dependencies: ["conditional-500", "conditional-1000"],
  applies: (state) =>
    state.lines.some((line) => highestTaxRate(line.categories) !== null),
  apply: (state) => {
    let impactCents = 0;
    const details: string[] = [];
    const byRate = new Map<
      number,
      { label: string; amountCents: number; productIds: string[] }
    >();

    const lines = state.lines.map((line) => {
      const rate = highestTaxRate(line.categories);
      if (!rate) return line;
      const delta = Math.round(line.amountCents * (rate.ratePercent / 100));
      impactCents += delta;
      details.push(`${line.productId}: +${rate.ratePercent} %`);
      const bucket = byRate.get(rate.ratePercent) ?? {
        label: rate.label,
        amountCents: 0,
        productIds: [],
      };
      bucket.amountCents += delta;
      bucket.productIds.push(line.productId);
      byRate.set(rate.ratePercent, bucket);
      return { ...line, amountCents: line.amountCents + delta };
    });

    const taxes = [...byRate.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([ratePercent, bucket]) => ({
        ratePercent,
        label: bucket.label,
        amountCents: bucket.amountCents,
        productIds: bucket.productIds,
      }));

    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "category-tax",
          ruleName: "Taxes par catégorie produit",
          phase: "category",
          impactCents,
          detail: `Taxe la plus élevée par ligne (Électronique 20 %, Alimentaire 5,5 %). ${details.join(" · ")}`,
          taxes,
        },
      ],
    };
  },
};

/**
 * > 3 units in the same category → -10 % on those units' lines.
 * Quantity is summed across lines sharing the (normalized) category.
 * Threshold is strict: exactly 3 units do not trigger.
 */
export const bulkCategoryDiscountRule: PricingRule = {
  id: "cumulative-bulk-category",
  name: "Remise volume catégorie (> 3) (-10 %)",
  phase: "cumulative",
  priority: 10,
  dependencies: ["category-tax"],
  applies: (state) => {
    const qtyByCategory = quantityByCategory(state);
    return [...qtyByCategory.values()].some((qty) => qty > 3);
  },
  apply: (state) => {
    const qtyByCategory = quantityByCategory(state);
    const discountedCategories = new Set(
      [...qtyByCategory.entries()]
        .filter(([, qty]) => qty > 3)
        .map(([category]) => category)
    );

    let impactCents = 0;
    const lines = state.lines.map((line) => {
      const hit = line.categories.some((category) =>
        discountedCategories.has(normalizeCategory(category))
      );
      if (!hit) return line;
      const delta = Math.round(line.amountCents * -0.1);
      impactCents += delta;
      return { ...line, amountCents: line.amountCents + delta };
    });

    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "cumulative-bulk-category",
          ruleName: "Remise volume catégorie (> 3) (-10 %)",
          phase: "cumulative",
          impactCents,
          detail: `Catégories concernées : ${[...discountedCategories].join(", ") || "-"}.`,
        },
      ],
    };
  },
};

export const expressDeliveryRule: PricingRule = {
  id: "final-express",
  name: "Livraison express (+15 €)",
  phase: "final",
  priority: 10,
  dependencies: [],
  applies: (_state, input) => input.expressDelivery,
  apply: (state) => {
    const fee = 1500;
    const lines = state.lines.map((line, index) =>
      index === 0 ? { ...line, amountCents: line.amountCents + fee } : line
    );

    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "final-express",
          ruleName: "Livraison express (+15 €)",
          phase: "final",
          impactCents: fee,
          detail: "Frais de livraison express : +15,00 €.",
        },
      ],
    };
  },
};

export const processingFeeRule: PricingRule = {
  id: "final-processing",
  name: "Frais de traitement (< 50 €) (+5 €)",
  phase: "final",
  priority: 20,
  dependencies: ["final-express"],
  applies: (state) => sumLineAmounts(state.lines) < 5000,
  apply: (state) => {
    const fee = 500;
    const lines = state.lines.map((line, index) =>
      index === 0 ? { ...line, amountCents: line.amountCents + fee } : line
    );

    return {
      ...cloneState(state),
      lines,
      appliedRules: [
        ...state.appliedRules,
        {
          ruleId: "final-processing",
          ruleName: "Frais de traitement (< 50 €) (+5 €)",
          phase: "final",
          impactCents: fee,
          detail: "Montant final < 50 € : frais de traitement +5,00 €.",
        },
      ],
    };
  },
};

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

function quantityByCategory(
  state: PricingWorkingState
): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of state.lines) {
    for (const category of line.categories) {
      const key = normalizeCategory(category);
      map.set(key, (map.get(key) ?? 0) + line.quantity);
    }
  }
  return map;
}

export const defaultPricingRules: PricingRule[] = [
  vipDiscountRule,
  premiumDiscountRule,
  firstOrderOfMonthRule,
  conditional1000Rule,
  conditional500Rule,
  categoryTaxRule,
  bulkCategoryDiscountRule,
  expressDeliveryRule,
  processingFeeRule,
];

export type { PricingOrderInput };
