"use client";

import { useState } from "react";
import { Calculator, Store } from "lucide-react";

import type { CustomerType } from "@/domain/customers/types";
import type { Cents } from "@/domain/money/cents";
import type { PricingLineInput } from "@/domain/pricing/types";
import { PricingShop } from "@/components/pricing/pricing-shop";
import type {
  PricingSession,
  PricingSessionSetters,
} from "@/components/pricing/pricing-session";
import { PricingWorkbench } from "@/components/pricing/pricing-workbench";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type CatalogProduct = {
  id: string;
  name: string;
  unitPriceCents: Cents;
  categories: string[];
};

export type { PricingSession, PricingSessionSetters };

export function PricingExperience({
  catalog,
}: {
  catalog: CatalogProduct[];
}) {
  const [view, setView] = useState<"shop" | "workbench">("shop");
  const [customerType, setCustomerType] = useState<CustomerType>("Premium");
  const [isFirstOrderOfMonth, setIsFirstOrderOfMonth] = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [lines, setLines] = useState<PricingLineInput[]>([]);

  const session: PricingSession = {
    customerType,
    isFirstOrderOfMonth,
    expressDelivery,
    lines,
  };

  const setters: PricingSessionSetters = {
    setCustomerType,
    setIsFirstOrderOfMonth,
    setExpressDelivery,
    setLines,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            Question 2
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Moteur de pricing
          </h1>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
            {view === "shop"
              ? "Expérience boutique : catalogue, panier et checkout branchés sur l’engine."
              : "Workbench technique : presets, lignes manuelles et breakdown détaillé."}{" "}
            Panier synchronisé entre les deux vues.
          </p>
        </div>
        <ToggleGroup
          className="bg-muted/40 shrink-0 rounded-lg p-1"
          variant="outline"
          value={[view]}
          onValueChange={(value) => {
            const next = value[0] as "shop" | "workbench" | undefined;
            if (next) setView(next);
          }}
        >
          <ToggleGroupItem
            value="shop"
            className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
          >
            <Store data-icon="inline-start" />
            Boutique
          </ToggleGroupItem>
          <ToggleGroupItem
            value="workbench"
            className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
          >
            <Calculator data-icon="inline-start" />
            Workbench
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className={view === "shop" ? "contents" : "hidden"}>
        <PricingShop catalog={catalog} session={session} {...setters} />
      </div>
      <div className={view === "workbench" ? "contents" : "hidden"}>
        <PricingWorkbench
          catalog={catalog}
          hideTitle
          session={session}
          {...setters}
        />
      </div>
    </div>
  );
}
