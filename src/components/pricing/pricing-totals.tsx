"use client";

import { formatEuros } from "@/domain/money/cents";
import type { PricingResult } from "@/domain/pricing/types";

export function PricingTotals({
  pricing,
  emphasizeClassName = "text-[#0000EA]",
}: {
  pricing: PricingResult;
  emphasizeClassName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Total HT
        </span>
        <div className="flex items-baseline gap-2">
          {pricing.basePriceCents > pricing.htPriceCents ? (
            <span
              className="text-muted-foreground font-mono text-sm tabular-nums line-through"
              aria-label="Total HT avant réduction"
            >
              {formatEuros(pricing.basePriceCents)}
            </span>
          ) : null}
          <span className="font-mono text-sm font-medium tabular-nums">
            {formatEuros(pricing.htPriceCents)}
          </span>
        </div>
      </div>

      {pricing.appliedTaxes.length > 0 ? (
        <div className="space-y-1">
          {pricing.appliedTaxes.map((tax) => (
            <div
              key={`${tax.ratePercent}-${tax.label}`}
              className="text-muted-foreground flex items-baseline justify-between gap-2 text-xs"
            >
              <span>
                {tax.label}
                <span className="text-muted-foreground/80 ml-1">
                  · {tax.productIds.length} article
                  {tax.productIds.length > 1 ? "s" : ""}
                </span>
              </span>
              <span className="font-mono tabular-nums">
                +{formatEuros(tax.amountCents)}
              </span>
            </div>
          ))}
          <div className="text-muted-foreground flex items-baseline justify-between gap-2 text-xs font-medium">
            <span>Total taxes</span>
            <span className="font-mono tabular-nums">
              +{formatEuros(pricing.taxCents)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Total TTC
        </span>
        <span
          className={`font-mono text-lg font-semibold tabular-nums ${emphasizeClassName}`}
        >
          {formatEuros(pricing.finalPriceCents)}
        </span>
      </div>
    </div>
  );
}
