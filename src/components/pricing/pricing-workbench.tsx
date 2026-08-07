"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { formatEuros, type Cents } from "@/domain/money/cents";
import { calculatePrice } from "@/domain/pricing/engine";
import type { CustomerType } from "@/domain/customers/types";
import type {
  PricingSession,
  PricingSessionSetters,
} from "@/components/pricing/pricing-session";
import { PricingTotals } from "@/components/pricing/pricing-totals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type CatalogProduct = {
  id: string;
  name: string;
  unitPriceCents: Cents;
  categories: string[];
};

const PRESETS: Array<{
  id: string;
  label: string;
  customerType: CustomerType;
  isFirstOrderOfMonth: boolean;
  expressDelivery: boolean;
  lines: Array<{ productId: string; quantity: number }>;
}> = [
  {
    id: "vip-phone",
    label: "VIP · Smartphone",
    customerType: "VIP",
    isFirstOrderOfMonth: false,
    expressDelivery: false,
    lines: [{ productId: "P001", quantity: 1 }],
  },
  {
    id: "premium-first",
    label: "Premium · 1re cmd du mois",
    customerType: "Premium",
    isFirstOrderOfMonth: true,
    expressDelivery: true,
    lines: [
      { productId: "P003", quantity: 1 },
      { productId: "P004", quantity: 2 },
    ],
  },
  {
    id: "bulk-reeval",
    label: "Volume > 3 · réévaluation 500 €",
    customerType: "Standard",
    isFirstOrderOfMonth: false,
    expressDelivery: false,
    lines: [{ productId: "demo-bulk", quantity: 4 }],
  },
  {
    id: "threshold-1000",
    label: "Seuil > 1000 €",
    customerType: "Standard",
    isFirstOrderOfMonth: false,
    expressDelivery: false,
    lines: [{ productId: "P002", quantity: 1 }],
  },
];

export function PricingWorkbench({
  catalog,
  hideTitle = false,
  session,
  setCustomerType,
  setIsFirstOrderOfMonth,
  setExpressDelivery,
  setLines,
}: {
  catalog: CatalogProduct[];
  hideTitle?: boolean;
  session: PricingSession;
  setCustomerType: PricingSessionSetters["setCustomerType"];
  setIsFirstOrderOfMonth: PricingSessionSetters["setIsFirstOrderOfMonth"];
  setExpressDelivery: PricingSessionSetters["setExpressDelivery"];
  setLines: PricingSessionSetters["setLines"];
}) {
  const catalogById = useMemo(() => {
    const map = new Map(catalog.map((product) => [product.id, product]));
    map.set("demo-bulk", {
      id: "demo-bulk",
      name: "Lot Accessoire (démo volume)",
      unitPriceCents: 14_000,
      categories: ["Accessoires"],
    });
    return map;
  }, [catalog]);

  const {
    customerType,
    isFirstOrderOfMonth,
    expressDelivery,
    lines,
  } = session;

  const [selectedProductId, setSelectedProductId] = useState(
    catalog[0]?.id ?? "P001"
  );
  const [quantity, setQuantity] = useState(1);

  const result = useMemo(
    () =>
      calculatePrice({
        customerType,
        isFirstOrderOfMonth,
        expressDelivery,
        lines,
      }),
    [customerType, isFirstOrderOfMonth, expressDelivery, lines]
  );

  function applyPreset(presetId: string) {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setCustomerType(preset.customerType);
    setIsFirstOrderOfMonth(preset.isFirstOrderOfMonth);
    setExpressDelivery(preset.expressDelivery);
    setLines(
      preset.lines.flatMap((entry) => {
        const product = catalogById.get(entry.productId);
        if (!product) return [];
        return [
          {
            productId: product.id,
            name: product.name,
            unitPriceCents: product.unitPriceCents,
            quantity: entry.quantity,
            categories: product.categories,
          },
        ];
      })
    );
  }

  function addLine() {
    const product = catalogById.get(selectedProductId);
    if (!product || quantity < 1) return;
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          unitPriceCents: product.unitPriceCents,
          quantity,
          categories: product.categories,
        },
      ];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {hideTitle ? null : (
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            Question 2
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Moteur de pricing
          </h1>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
            Engine par phases (base → conditionnel → catégorie → cumulatif /
            réévaluation → final). Chaque règle expose son impact en cents.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => applyPreset(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commande</CardTitle>
            <CardDescription>
              Paramètres client et lignes produit (prix catalogue).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                  Type client
                </span>
                <Select
                  value={customerType}
                  onValueChange={(value) => {
                    if (value) setCustomerType(value as CustomerType);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(["Standard", "Premium", "VIP", "Unknown"] as const).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={isFirstOrderOfMonth}
                    onCheckedChange={(checked) =>
                      setIsFirstOrderOfMonth(checked === true)
                    }
                  />
                  Première commande du mois
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={expressDelivery}
                    onCheckedChange={(checked) =>
                      setExpressDelivery(checked === true)
                    }
                  />
                  Livraison express (+15 €)
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                  Produit
                </span>
                <Select
                  value={selectedProductId}
                  onValueChange={(value) => {
                    if (value) setSelectedProductId(value);
                  }}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectGroup>
                      {catalog.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} · {formatEuros(product.unitPriceCents)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                  Qté
                </span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="border-input bg-background mt-1.5 h-8 w-full rounded-lg border px-2 text-sm"
                />
              </div>
              <Button type="button" onClick={addLine}>
                Ajouter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-center text-sm"
                    >
                      Aucune ligne.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((line) => (
                    <TableRow key={line.productId}>
                      <TableCell>
                        <div className="font-medium">{line.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {line.categories.join(", ") || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {formatEuros(line.unitPriceCents * line.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            setLines((current) =>
                              current.filter(
                                (item) => item.productId !== line.productId
                              )
                            )
                          }
                        >
                          Retirer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="text-secondary size-4" />
              <CardTitle className="text-base">Résultat</CardTitle>
            </div>
            <CardDescription>
              Total HT, taxes détaillées, Total TTC, et règles appliquées.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border p-3">
              <PricingTotals
                pricing={result}
                emphasizeClassName="text-secondary"
              />
            </div>

            {result.reevaluationCount > 0 ? (
              <Badge variant="outline" className="w-fit">
                Réévaluation ×{result.reevaluationCount}
              </Badge>
            ) : null}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-[0.06em] uppercase">
                Règles appliquées
              </p>
              {result.appliedRules.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucune règle déclenchée.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {result.appliedRules.map((rule) => (
                    <li
                      key={`${rule.ruleId}-${rule.detail}`}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{rule.ruleName}</span>
                        <span
                          className={cn(
                            "font-mono text-xs tabular-nums",
                            rule.impactCents < 0
                              ? "text-secondary"
                              : rule.impactCents > 0
                                ? "text-foreground"
                                : "text-muted-foreground"
                          )}
                        >
                          {rule.impactCents > 0 ? "+" : ""}
                          {formatEuros(rule.impactCents)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        <span className="font-semibold uppercase">
                          {rule.phase}
                        </span>{" "}
                        · {rule.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
