export type CustomerType = "Premium" | "VIP" | "Standard" | "Unknown";

export type Customer = {
  id: string;
  name: string;
  email: string;
  type: CustomerType;
  registrationDate: string;
};

export type Product = {
  id: string;
  name: string;
  /** Price in integer cents. */
  priceCents: number;
  categories: string[];
};

export type OrderItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus = string;

export type Order = {
  orderId: string;
  customerId: string;
  /** Normalized UTC Date. */
  orderDate: Date;
  status: OrderStatus;
  expressDelivery: boolean;
  items: OrderItem[];
};

export type EnrichedOrder = Order & {
  amountCents: number;
  categories: string[];
  isAnomaly: boolean;
  anomalyDirection: "high" | "low" | null;
};

export type PeriodGranularity = "week" | "month";

export type HistoryPeriod = {
  key: string;
  label: string;
  start: Date;
  end: Date;
  orderCount: number;
  totalAmountCents: number;
  averageAmountCents: number;
  /** null for the first period, or when previous total is 0. */
  evolutionPercent: number | null;
  orders: EnrichedOrder[];
};

export type CustomerHistoryReport = {
  customer: Customer;
  referenceDate: Date;
  windowStart: Date;
  windowEnd: Date;
  granularity: PeriodGranularity;
  orderCount: number;
  averageOrderAmountCents: number;
  monthsInAnalysisWindow: number;
  ordersPerMonth: number;
  periods: HistoryPeriod[];
};
