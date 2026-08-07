"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, FileSearch } from "lucide-react";

import type { CustomerHistoryDto } from "@/application/customer-history/serialize";
import type { CustomerPortfolioDto } from "@/application/customer-history/build-customer-portfolio";
import { CustomerHistoryDashboard } from "@/components/customer-history/customer-history-dashboard";
import { CustomerHistoryReportView } from "@/components/customer-history/customer-history-report-view";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "report" | "pilotage";

function parseView(value: string | null): ViewMode {
  return value === "report" ? "report" : "pilotage";
}

export function CustomerHistoryShell({
  portfolio,
  initialCustomerId,
  initialReport,
  initialView = "pilotage",
}: {
  portfolio: CustomerPortfolioDto;
  initialCustomerId: string | null;
  initialReport: CustomerHistoryDto | null;
  initialView?: ViewMode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = parseView(searchParams.get("view") ?? initialView);
  const customerFromUrl = searchParams.get("customer");
  const selectedCustomerId =
    customerFromUrl &&
    portfolio.customers.some((c) => c.customerId === customerFromUrl)
      ? customerFromUrl
      : (initialCustomerId ?? portfolio.customers[0]?.customerId ?? "");

  const replaceParams = useCallback(
    (patch: { view?: ViewMode; customer?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.view) params.set("view", patch.view);
      if (patch.customer) params.set("customer", patch.customer);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  // Keep URL in sync on first paint when params are missing.
  useEffect(() => {
    if (!searchParams.get("view") || !searchParams.get("customer")) {
      replaceParams({
        view,
        customer: selectedCustomerId || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot URL normalize
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Question 1 - Historique client
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            {view === "report"
              ? "Vue consolidée pour identifier rapidement les patterns d’achat d’un client."
              : "Vue de pilotage multi-clients : KPI, filtres et synthèse portfolio."}
          </p>
        </div>

        <ToggleGroup
          className="bg-muted/40 w-full rounded-lg p-1 sm:w-auto"
          variant="outline"
          value={[view]}
          onValueChange={(value) => {
            const next = value[0] as ViewMode | undefined;
            if (next) replaceParams({ view: next });
          }}
        >
          <ToggleGroupItem
            value="pilotage"
            className="grow cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground sm:grow-0"
          >
            <BarChart3 data-icon="inline-start" />
            Pilotage
          </ToggleGroupItem>
          <ToggleGroupItem
            value="report"
            className="grow cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground sm:grow-0"
          >
            <FileSearch data-icon="inline-start" />
            Rapport historique
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "report" ? (
        <CustomerHistoryReportView
          customers={portfolio.customers}
          customerId={selectedCustomerId}
          onCustomerIdChange={(id) =>
            replaceParams({ view: "report", customer: id })
          }
          initialCustomerId={initialCustomerId}
          initialReport={initialReport}
        />
      ) : (
        <CustomerHistoryDashboard portfolio={portfolio} />
      )}
    </div>
  );
}
