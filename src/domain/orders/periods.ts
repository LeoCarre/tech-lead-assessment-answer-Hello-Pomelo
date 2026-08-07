/**
 * Deterministic reference date for the assessment dataset.
 * Orders in data/ span 2024-05-15 → 2024-11-15.
 */
export const DEFAULT_REFERENCE_DATE = new Date("2024-11-15T23:59:59.999Z");

export const ANALYSIS_WINDOW_MONTHS = 6;

/** Rhythm threshold: orderCount / monthsInWindow > 2 → weekly grouping. */
export const WEEKLY_ORDERS_PER_MONTH_THRESHOLD = 2;

export function addCalendarMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);

  // Clamp overflow (e.g. Jan 31 + 1 month).
  if (result.getUTCDate() < day) {
    result.setUTCDate(0);
  }
  return result;
}

export function startOfAnalysisWindow(
  referenceDate: Date,
  months = ANALYSIS_WINDOW_MONTHS
): Date {
  const start = addCalendarMonths(referenceDate, -months);
  // Inclusive first day of the window (avoid excluding same-calendar-day morning orders).
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function isWithinWindow(
  orderDate: Date,
  windowStart: Date,
  windowEnd: Date
): boolean {
  const t = orderDate.getTime();
  return t >= windowStart.getTime() && t <= windowEnd.getTime();
}

/** ISO week key: YYYY-Www (UTC, week starts Monday). */
export function isoWeekKey(date: Date): string {
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  // Thursday in current week decides the year.
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function monthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function startOfIsoWeek(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = d.getUTCDay() || 7;
  if (day !== 1) {
    d.setUTCDate(d.getUTCDate() - (day - 1));
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfIsoWeek(date: Date): Date {
  const start = startOfIsoWeek(date);
  const end = new Date(start.getTime());
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function startOfMonth(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0)
  );
}

export function endOfMonth(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );
}

export function chooseGranularity(
  orderCount: number,
  monthsInAnalysisWindow: number = ANALYSIS_WINDOW_MONTHS
): "week" | "month" {
  const ordersPerMonth = orderCount / monthsInAnalysisWindow;
  return ordersPerMonth > WEEKLY_ORDERS_PER_MONTH_THRESHOLD ? "week" : "month";
}
