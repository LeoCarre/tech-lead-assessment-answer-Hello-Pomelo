import type { Cents } from "@/domain/money/cents";
import type { CustomerType } from "@/domain/customers/types";

export type PricingPhase =
  | "base"
  | "conditional"
  | "category"
  | "cumulative"
  | "final";

export type PricingLineInput = {
  productId: string;
  name: string;
  unitPriceCents: Cents;
  quantity: number;
  categories: string[];
};

export type PricingOrderInput = {
  customerType: CustomerType;
  isFirstOrderOfMonth: boolean;
  expressDelivery: boolean;
  lines: PricingLineInput[];
};

export type AppliedTax = {
  ratePercent: number;
  label: string;
  amountCents: Cents;
  productIds: string[];
};

export type AppliedRuleImpact = {
  ruleId: string;
  ruleName: string;
  phase: PricingPhase;
  /** Signed impact in cents (negative = discount, positive = surcharge/tax/fee). */
  impactCents: Cents;
  detail: string;
  /** Present on category-tax. */
  taxes?: AppliedTax[];
};

export type PricingLineState = {
  productId: string;
  name: string;
  quantity: number;
  categories: string[];
  unitPriceCents: Cents;
  /** Current line total after rules applied so far. */
  amountCents: Cents;
};

export type PricingWorkingState = {
  lines: PricingLineState[];
  appliedRules: AppliedRuleImpact[];
  /** Explicit flags for conditional rules that may be cancelled later. */
  activeConditionalRuleId: "conditional-1000" | "conditional-500" | null;
  /** Guard against unbounded re-evaluation loops. */
  reevaluationCount: number;
};

export type PricingResult = {
  basePriceCents: Cents;
  /**
   * Montant HT produits (TTC − taxes catégorie − frais finaux express/traitement).
   * Les frais de livraison / traitement restent dans le TTC uniquement.
   */
  htPriceCents: Cents;
  /** Impact cumulé de la règle taxes par catégorie. */
  taxCents: Cents;
  /** Détail des taxes appliquées (taux + libellé). */
  appliedTaxes: AppliedTax[];
  finalPriceCents: Cents;
  appliedRules: AppliedRuleImpact[];
  lines: PricingLineState[];
  reevaluationCount: number;
};

export type PricingRule = {
  id: string;
  name: string;
  phase: PricingPhase;
  /** Lower runs first within a phase. */
  priority: number;
  /** Rule ids that must have been considered before this one (documentation + soft check). */
  dependencies: string[];
  applies: (state: PricingWorkingState, input: PricingOrderInput) => boolean;
  apply: (
    state: PricingWorkingState,
    input: PricingOrderInput
  ) => PricingWorkingState;
};

export function sumLineAmounts(lines: PricingLineState[]): Cents {
  return lines.reduce((sum, line) => sum + line.amountCents, 0);
}

export function applyPercentToAllLines(
  lines: PricingLineState[],
  percent: number
): { lines: PricingLineState[]; impactCents: Cents } {
  let impactCents = 0;
  const next = lines.map((line) => {
    const delta = Math.round(line.amountCents * (percent / 100));
    impactCents += delta;
    return { ...line, amountCents: line.amountCents + delta };
  });
  return { lines: next, impactCents };
}

export function cloneState(state: PricingWorkingState): PricingWorkingState {
  return {
    lines: state.lines.map((line) => ({ ...line })),
    appliedRules: [...state.appliedRules],
    activeConditionalRuleId: state.activeConditionalRuleId,
    reevaluationCount: state.reevaluationCount,
  };
}
