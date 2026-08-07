import { Suspense } from "react";

import { CustomerHistoryShell } from "@/components/customer-history";
import { loadCatalog } from "@/infrastructure/data/load-catalog";
import {
  buildCustomerHistory,
  CustomerNotFoundError,
} from "@/application/customer-history/build-customer-history";
import {
  buildCustomerPortfolio,
  serializeCustomerPortfolio,
} from "@/application/customer-history/build-customer-portfolio";
import { serializeCustomerHistory } from "@/application/customer-history/serialize";

type SearchParams = Promise<{
  view?: string;
  customer?: string;
}>;

export default async function CustomerHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const catalog = await loadCatalog();
  const portfolio = serializeCustomerPortfolio(
    buildCustomerPortfolio({
      customers: catalog.customers,
      orders: catalog.orders,
      productsById: catalog.productsById,
    })
  );

  const requestedId = params.customer;
  const initialCustomerId =
    (requestedId &&
      portfolio.customers.find((c) => c.customerId === requestedId)
        ?.customerId) ||
    portfolio.customers[0]?.customerId ||
    null;

  const initialView = params.view === "report" ? "report" : "pilotage";
  let initialReport = null;

  if (initialCustomerId) {
    try {
      initialReport = serializeCustomerHistory(
        buildCustomerHistory({
          customerId: initialCustomerId,
          customers: catalog.customers,
          orders: catalog.orders,
          productsById: catalog.productsById,
        })
      );
    } catch (error) {
      if (!(error instanceof CustomerNotFoundError)) throw error;
    }
  }

  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Chargement du rapport…</p>
      }
    >
      <CustomerHistoryShell
        portfolio={portfolio}
        initialCustomerId={initialCustomerId}
        initialReport={initialReport}
        initialView={initialView}
      />
    </Suspense>
  );
}
