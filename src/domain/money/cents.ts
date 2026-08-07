/** Monetary amounts are stored and computed as integer cents. */

export type Cents = number;

export function eurosToCents(euros: number): Cents {
  if (!Number.isFinite(euros)) {
    throw new Error(`Invalid euro amount: ${euros}`);
  }
  return Math.round(euros * 100);
}

export function centsToEuros(cents: Cents): number {
  return cents / 100;
}

export function formatEuros(cents: Cents, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(centsToEuros(cents));
}

export function averageCents(amounts: Cents[]): Cents {
  if (amounts.length === 0) return 0;
  const sum = amounts.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / amounts.length);
}

/**
 * Percentage evolution of current vs previous.
 * Returns null when there is no previous period, or previous amount is 0
 * (division by zero is undefined for business reporting).
 */
export function percentageEvolution(
  current: Cents,
  previous: Cents | null
): number | null {
  if (previous === null) return null;
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
