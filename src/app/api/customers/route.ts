import { NextResponse } from "next/server";

import { loadCatalog } from "@/infrastructure/data/load-catalog";

export async function GET() {
  const catalog = await loadCatalog();
  const customers = catalog.customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    type: customer.type,
  }));

  return NextResponse.json({ customers });
}
