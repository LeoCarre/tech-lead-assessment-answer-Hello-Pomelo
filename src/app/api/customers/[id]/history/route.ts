import { NextResponse } from "next/server";

import {
  buildCustomerHistory,
  CustomerNotFoundError,
} from "@/application/customer-history/build-customer-history";
import { serializeCustomerHistory } from "@/application/customer-history/serialize";
import { loadCatalog } from "@/infrastructure/data/load-catalog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const catalog = await loadCatalog();
    const report = buildCustomerHistory({
      customerId: id,
      customers: catalog.customers,
      orders: catalog.orders,
      productsById: catalog.productsById,
    });

    return NextResponse.json(serializeCustomerHistory(report));
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to build customer history" },
      { status: 500 }
    );
  }
}
