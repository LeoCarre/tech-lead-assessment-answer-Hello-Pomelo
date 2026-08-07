import type { Cents } from "@/domain/money/cents";

export type AnomalyResult = {
  isAnomaly: boolean;
  direction: "high" | "low" | null;
};

/**
 * Flag amounts that differ by more than 50% from the customer's average.
 * lower: amount < average * 0.5
 * upper: amount > average * 1.5
 */
export function detectAmountAnomaly(
  amountCents: Cents,
  averageCents: Cents
): AnomalyResult {
  if (averageCents <= 0) {
    return { isAnomaly: false, direction: null };
  }

  const lower = averageCents * 0.5;
  const upper = averageCents * 1.5;

  if (amountCents < lower) {
    return { isAnomaly: true, direction: "low" };
  }
  if (amountCents > upper) {
    return { isAnomaly: true, direction: "high" };
  }
  return { isAnomaly: false, direction: null };
}
