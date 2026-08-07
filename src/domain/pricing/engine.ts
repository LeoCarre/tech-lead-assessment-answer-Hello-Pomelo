import { defaultPricingRules } from "@/domain/pricing/rules";
import {
  sumLineAmounts,
  type PricingOrderInput,
  type PricingPhase,
  type PricingResult,
  type PricingRule,
  type PricingWorkingState,
} from "@/domain/pricing/types";

const PRE_FINAL_PHASES: PricingPhase[] = [
  "base",
  "conditional",
  "category",
  "cumulative",
];

const MAX_REEVALUATIONS = 2;

function initialState(input: PricingOrderInput): PricingWorkingState {
  return {
    lines: input.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      categories: [...line.categories],
      unitPriceCents: line.unitPriceCents,
      amountCents: line.unitPriceCents * line.quantity,
    })),
    appliedRules: [],
    activeConditionalRuleId: null,
    reevaluationCount: 0,
  };
}

function rulesForPhase(
  rules: PricingRule[],
  phase: PricingPhase
): PricingRule[] {
  return rules
    .filter((rule) => rule.phase === phase)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}

function runPhases(
  state: PricingWorkingState,
  input: PricingOrderInput,
  rules: PricingRule[],
  phases: PricingPhase[],
  cancelledRuleIds: ReadonlySet<string>
): PricingWorkingState {
  let next = state;
  for (const phase of phases) {
    for (const rule of rulesForPhase(rules, phase)) {
      if (cancelledRuleIds.has(rule.id)) continue;
      if (!rule.applies(next, input)) continue;
      next = rule.apply(next, input);
    }
  }
  return next;
}

/**
 * Deterministic pricing engine with explicit phases and bounded re-evaluation.
 *
 * If the cumulative bulk discount drives the pre-final total below €500 while
 * the conditional > €500 rule was active, that conditional rule is cancelled
 * and pre-final phases are replayed (at most MAX_REEVALUATIONS times).
 */
export function calculatePrice(
  input: PricingOrderInput,
  rules: PricingRule[] = defaultPricingRules
): PricingResult {
  if (input.lines.length === 0) {
    return {
      basePriceCents: 0,
      htPriceCents: 0,
      taxCents: 0,
      appliedTaxes: [],
      finalPriceCents: 0,
      appliedRules: [],
      lines: [],
      reevaluationCount: 0,
    };
  }

  const basePriceCents = input.lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0
  );

  const cancelled = new Set<string>();
  let reevaluationCount = 0;
  let state = runPhases(
    initialState(input),
    input,
    rules,
    PRE_FINAL_PHASES,
    cancelled
  );

  while (
    state.activeConditionalRuleId === "conditional-500" &&
    sumLineAmounts(state.lines) < 50_000 &&
    state.appliedRules.some(
      (rule) => rule.ruleId === "cumulative-bulk-category"
    ) &&
    reevaluationCount < MAX_REEVALUATIONS
  ) {
    cancelled.add("conditional-500");
    reevaluationCount += 1;
    state = runPhases(
      initialState(input),
      input,
      rules,
      PRE_FINAL_PHASES,
      cancelled
    );
  }

  state = runPhases(state, input, rules, ["final"], cancelled);
  state = { ...state, reevaluationCount };

  const appliedRules =
    reevaluationCount > 0
      ? [
          ...state.appliedRules,
          {
            ruleId: "reeval-cancel-conditional-500",
            ruleName: "Réévaluation - annulation seuil 500 €",
            phase: "cumulative" as const,
            impactCents: 0,
            detail: `La remise volume a fait passer le total sous 500 € avant frais finaux : conditional-500 annulée, pipeline rejoué (${reevaluationCount}).`,
          },
        ]
      : state.appliedRules;

  const finalPriceCents = sumLineAmounts(state.lines);
  const taxRule = appliedRules.find((rule) => rule.ruleId === "category-tax");
  const appliedTaxes = taxRule?.taxes ?? [];
  const taxCents = appliedTaxes.reduce(
    (sum, tax) => sum + tax.amountCents,
    0
  );
  const finalFeeCents = appliedRules
    .filter(
      (rule) =>
        rule.ruleId === "final-express" || rule.ruleId === "final-processing"
    )
    .reduce((sum, rule) => sum + rule.impactCents, 0);

  return {
    basePriceCents,
    htPriceCents: finalPriceCents - taxCents - finalFeeCents,
    taxCents,
    appliedTaxes,
    finalPriceCents,
    appliedRules,
    lines: state.lines,
    reevaluationCount,
  };
}

export { defaultPricingRules };
