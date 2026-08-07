import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Customer, Order, Product } from "@/domain/customers/types";
import {
  normalizeCustomers,
  normalizeOrders,
  normalizeProducts,
} from "@/infrastructure/data/normalize";

export type Catalog = {
  customers: Customer[];
  orders: Order[];
  products: Product[];
  productsById: Map<string, Product>;
};

function dataPath(filename: string): string {
  return path.join(process.cwd(), "data", filename);
}

async function readJsonFile<T>(filename: string): Promise<T> {
  const content = await readFile(dataPath(filename), "utf8");
  return JSON.parse(content) as T;
}

export async function loadCatalog(): Promise<Catalog> {
  const [customersFile, ordersFile, productsFile] = await Promise.all([
    readJsonFile<{ customers: Parameters<typeof normalizeCustomers>[0] }>(
      "customers.json"
    ),
    readJsonFile<{ orders: Parameters<typeof normalizeOrders>[0] }>(
      "orders.json"
    ),
    readJsonFile<{ products: Parameters<typeof normalizeProducts>[0] }>(
      "products.json"
    ),
  ]);

  const customers = normalizeCustomers(customersFile.customers);
  const orders = normalizeOrders(ordersFile.orders);
  const products = normalizeProducts(productsFile.products);
  const productsById = new Map(products.map((product) => [product.id, product]));

  return { customers, orders, products, productsById };
}
