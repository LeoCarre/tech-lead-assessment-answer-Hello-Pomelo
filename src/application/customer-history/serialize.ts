import { centsToEuros } from "@/domain/money/cents";
import type { CustomerHistoryReport } from "@/domain/customers/types";

export function serializeCustomerHistory(report: CustomerHistoryReport) {
  return {
    customer: report.customer,
    referenceDate: report.referenceDate.toISOString(),
    windowStart: report.windowStart.toISOString(),
    windowEnd: report.windowEnd.toISOString(),
    granularity: report.granularity,
    orderCount: report.orderCount,
    averageOrderAmountEuros: centsToEuros(report.averageOrderAmountCents),
    monthsInAnalysisWindow: report.monthsInAnalysisWindow,
    ordersPerMonth: report.ordersPerMonth,
    periods: report.periods.map((period) => ({
      key: period.key,
      label: period.label,
      start: period.start.toISOString(),
      end: period.end.toISOString(),
      orderCount: period.orderCount,
      totalAmountEuros: centsToEuros(period.totalAmountCents),
      averageAmountEuros: centsToEuros(period.averageAmountCents),
      evolutionPercent: period.evolutionPercent,
      orders: period.orders.map((order) => ({
        orderId: order.orderId,
        date: order.orderDate.toISOString(),
        amountEuros: centsToEuros(order.amountCents),
        status: order.status,
        categories: order.categories,
        isAnomaly: order.isAnomaly,
        anomalyDirection: order.anomalyDirection,
      })),
    })),
  };
}

export type CustomerHistoryDto = ReturnType<typeof serializeCustomerHistory>;
