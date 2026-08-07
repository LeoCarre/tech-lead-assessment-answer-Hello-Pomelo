import { eurosToCents } from "@/domain/money/cents";
import type {
  Customer,
  CustomerType,
  Order,
  Product,
} from "@/domain/customers/types";

type RawCustomer = {
  id: string;
  name: string;
  email: string;
  type?: string | null;
  registration_date: string;
};

type RawProduct = {
  id: string;
  name: string;
  price: number | string;
  categories: string[];
};

type RawOrderItem = {
  product_id: string;
  quantity: number;
};

type RawOrder = {
  order_id: string;
  customer_id: string;
  order_date: string;
  status: string;
  express_delivery: boolean;
  items: RawOrderItem[];
};

function normalizeCustomerType(value: unknown): CustomerType {
  if (value === "Premium" || value === "VIP" || value === "Standard") {
    return value;
  }
  return "Unknown";
}

export function normalizeCustomer(raw: RawCustomer): Customer {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    type: normalizeCustomerType(raw.type),
    registrationDate: raw.registration_date,
  };
}

export function parsePriceToEuros(price: number | string): number {
  if (typeof price === "number") {
    if (!Number.isFinite(price)) {
      throw new Error(`Invalid numeric price: ${price}`);
    }
    return price;
  }

  const trimmed = price.trim();
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid string price: ${price}`);
  }
  return parsed;
}

export function normalizeProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    priceCents: eurosToCents(parsePriceToEuros(raw.price)),
    categories: [...raw.categories],
  };
}

export function normalizeOrder(raw: RawOrder): Order {
  const orderDate = new Date(raw.order_date);
  if (Number.isNaN(orderDate.getTime())) {
    throw new Error(`Invalid order_date for ${raw.order_id}: ${raw.order_date}`);
  }

  return {
    orderId: raw.order_id,
    customerId: raw.customer_id,
    orderDate,
    status: raw.status,
    expressDelivery: Boolean(raw.express_delivery),
    items: raw.items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    })),
  };
}

export function normalizeCustomers(raw: RawCustomer[]): Customer[] {
  return raw.map(normalizeCustomer);
}

export function normalizeProducts(raw: RawProduct[]): Product[] {
  return raw.map(normalizeProduct);
}

export function normalizeOrders(raw: RawOrder[]): Order[] {
  return raw.map(normalizeOrder);
}
