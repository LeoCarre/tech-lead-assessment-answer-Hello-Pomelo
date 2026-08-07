"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";

import { formatEuros, type Cents } from "@/domain/money/cents";
import { calculatePrice } from "@/domain/pricing/engine";
import type {
  AppliedRuleImpact,
  PricingLineInput,
} from "@/domain/pricing/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  buildShopCatalog,
  CUSTOMER_PROFILES,
  filterCatalogForProfile,
  SHOP_PRODUCT_IMAGES,
  type CustomerProfileId,
  type ShopProduct,
} from "@/components/pricing/shop-catalog";
import type {
  PricingSession,
  PricingSessionSetters,
} from "@/components/pricing/pricing-session";
import { PricingTotals } from "@/components/pricing/pricing-totals";
import { cn } from "@/lib/utils";

type CatalogProduct = {
  id: string;
  name: string;
  unitPriceCents: Cents;
  categories: string[];
};

type CartLine = PricingLineInput & { imageSrc: string };

type CheckoutStep = "shop" | "checkout" | "done";

export function PricingShop({
  catalog,
  session,
  setCustomerType,
  setIsFirstOrderOfMonth,
  setExpressDelivery,
  setLines,
}: {
  catalog: CatalogProduct[];
  session: PricingSession;
  setCustomerType: PricingSessionSetters["setCustomerType"];
  setIsFirstOrderOfMonth: PricingSessionSetters["setIsFirstOrderOfMonth"];
  setExpressDelivery: PricingSessionSetters["setExpressDelivery"];
  setLines: PricingSessionSetters["setLines"];
}) {
  const shopProducts = useMemo(() => buildShopCatalog(catalog), [catalog]);
  const profile = session.customerType as CustomerProfileId;
  const { isFirstOrderOfMonth, expressDelivery, lines } = session;
  const [step, setStep] = useState<CheckoutStep>("shop");
  const [rulesOpen, setRulesOpen] = useState(false);

  const cart: CartLine[] = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        imageSrc:
          SHOP_PRODUCT_IMAGES[line.productId] ??
          "/products/product-p007-mouse.png",
      })),
    [lines]
  );

  const visibleProducts = useMemo(
    () => filterCatalogForProfile(shopProducts, profile),
    [shopProducts, profile]
  );

  const activeProfile = CUSTOMER_PROFILES.find((item) => item.id === profile)!;

  const pricing = useMemo(
    () =>
      calculatePrice({
        customerType: profile,
        isFirstOrderOfMonth,
        expressDelivery,
        lines,
      }),
    [profile, isFirstOrderOfMonth, expressDelivery, lines]
  );

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const thresholdProgress = useMemo(() => {
    const baseAfterType = estimateAfterBaseDiscount(
      pricing.basePriceCents,
      profile,
      isFirstOrderOfMonth
    );
    return {
      toward500: Math.min(100, (baseAfterType / 50_000) * 100),
      toward1000: Math.min(100, (baseAfterType / 100_000) * 100),
      baseAfterType,
    };
  }, [pricing.basePriceCents, profile, isFirstOrderOfMonth]);

  function addToCart(product: ShopProduct) {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          unitPriceCents: product.unitPriceCents,
          quantity: 1,
          categories: product.categories,
        },
      ];
    });
  }

  function updateQty(productId: string, delta: number) {
    setLines((current) =>
      current
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + delta }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  function resetOrder() {
    setLines([]);
    setExpressDelivery(false);
    setIsFirstOrderOfMonth(false);
    setStep("shop");
  }

  if (step === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="bg-secondary/10 text-secondary flex size-16 items-center justify-center rounded-full">
          <Check className="size-8" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Commande simulée
        </h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Total final {formatEuros(pricing.finalPriceCents)} pour le profil{" "}
          <span className="text-foreground font-medium">{profile}</span>. Le
          moteur a appliqué {pricing.appliedRules.length} règle
          {pricing.appliedRules.length > 1 ? "s" : ""}.
        </p>
        <Button type="button" onClick={resetOrder}>
          Nouvelle simulation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            Boutique simulée
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Catalogue Hello Pomelo
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Visuels tramés bleu #0000EA & magenta brand. Changez de profil pour
            voir le catalogue et les offres évoluer.
          </p>
        </div>
        <ToggleGroup
          className="bg-background shrink-0 rounded-lg border p-1"
          variant="outline"
          value={[profile]}
          onValueChange={(value) => {
            const next = value[0] as CustomerProfileId | undefined;
            if (next) setCustomerType(next);
          }}
        >
          {CUSTOMER_PROFILES.map((item) => (
            <ToggleGroupItem
              key={item.id}
              value={item.id}
              className="cursor-pointer data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="border-secondary/30 bg-secondary/5 flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3">
        <UserRound className="text-secondary mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Profil {activeProfile.label} · {activeProfile.tagline}
          </p>
          <ul className="text-muted-foreground mt-1 flex flex-col gap-0.5 text-xs sm:flex-row sm:flex-wrap sm:gap-x-4">
            {activeProfile.offers.map((offer) => (
              <li key={offer} className="flex items-center gap-1.5">
                <Sparkles className="text-secondary size-3 shrink-0" />
                {offer}
              </li>
            ))}
          </ul>
        </div>
        <Badge variant="outline" className="shrink-0">
          {visibleProducts.length} produit
          {visibleProducts.length > 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid min-h-[min(70dvh,52rem)] flex-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
        <div className="bg-card max-h-[min(70dvh,52rem)] min-h-0 overflow-y-auto rounded-xl border p-3 sm:p-4">
          {visibleProducts.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Aucun produit pour ce profil.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="group bg-background flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square bg-white">
                    <Image
                      src={product.imageSrc}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 240px"
                      className="object-cover"
                    />
                    {product.vipExclusive ? (
                      <Badge className="bg-[#0000EA] absolute top-2 left-2 border-0 text-white">
                        Exclu VIP
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div>
                      <h3 className="text-sm leading-snug font-semibold">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {product.blurb}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#0000EA]">
                        {formatEuros(product.unitPriceCents)}
                      </span>
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <Plus data-icon="inline-start" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-card flex max-h-[min(70dvh,52rem)] min-h-0 flex-col overflow-hidden rounded-xl border">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-secondary size-4" />
                <h3 className="text-sm font-semibold">
                  {step === "shop" ? "Panier" : "Checkout"}
                </h3>
              </div>
              <Badge variant="outline">{cartCount}</Badge>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {step === "shop" ? (
              <>
                <OffersPanel
                  profile={profile}
                  pricingRuleCount={pricing.appliedRules.length}
                  toward500={thresholdProgress.toward500}
                  toward1000={thresholdProgress.toward1000}
                />

                {cart.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    Votre panier est vide. Ajoutez des produits du catalogue.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {cart.map((line) => (
                      <li
                        key={line.productId}
                        className="flex items-center gap-3"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                          <Image
                            src={line.imageSrc}
                            alt={line.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {line.name}
                          </p>
                          <p className="text-muted-foreground font-mono text-xs tabular-nums">
                            {formatEuros(line.unitPriceCents)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => updateQty(line.productId, -1)}
                          >
                            <Minus />
                          </Button>
                          <span className="w-6 text-center text-sm tabular-nums">
                            {line.quantity}
                          </span>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => updateQty(line.productId, 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <CartOptions
                  isFirstOrderOfMonth={isFirstOrderOfMonth}
                  expressDelivery={expressDelivery}
                  onFirstOrderChange={setIsFirstOrderOfMonth}
                  onExpressChange={setExpressDelivery}
                />
              </>
            ) : (
              <CheckoutConfirm
                cart={cart}
                isFirstOrderOfMonth={isFirstOrderOfMonth}
                expressDelivery={expressDelivery}
              />
            )}
          </div>

          <div className="mt-auto space-y-3 border-t p-4">
            <AppliedRulesDisclosure
              open={rulesOpen}
              onOpenChange={setRulesOpen}
              rules={pricing.appliedRules}
            />
            <PricingTotals pricing={pricing} />
            {step === "shop" ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer"
                disabled={cart.length === 0}
                onClick={() => setStep("checkout")}
              >
                Passer au checkout
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={() => setStep("done")}
                >
                  Confirmer la commande
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => setStep("shop")}
                >
                  Retour au panier
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function OffersPanel({
  profile,
  pricingRuleCount,
  toward500,
  toward1000,
}: {
  profile: CustomerProfileId;
  pricingRuleCount: number;
  toward500: number;
  toward1000: number;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-[#0000EA]/20 bg-[#0000EA]/5 p-3">
      <p className="text-xs font-semibold tracking-wide text-[#0000EA] uppercase">
        Offres profil {profile}
      </p>
      <p className="text-muted-foreground text-xs">
        {pricingRuleCount > 0
          ? `${pricingRuleCount} règle${pricingRuleCount > 1 ? "s" : ""} active${pricingRuleCount > 1 ? "s" : ""} sur le panier courant.`
          : "Ajoutez des articles pour déclencher le moteur."}
      </p>
      {profile === "Standard" || profile === "Premium" || profile === "VIP" ? (
        <div className="space-y-1.5 pt-1">
          <ProgressRow label="Seuil 500 €" value={toward500} />
          <ProgressRow label="Seuil 1000 €" value={toward1000} />
        </div>
      ) : null}
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{Math.round(value)} %</span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CartOptions({
  isFirstOrderOfMonth,
  expressDelivery,
  onFirstOrderChange,
  onExpressChange,
}: {
  isFirstOrderOfMonth: boolean;
  expressDelivery: boolean;
  onFirstOrderChange: (value: boolean) => void;
  onExpressChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-xs font-semibold tracking-wide uppercase">Options</p>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={isFirstOrderOfMonth}
          onCheckedChange={(checked) => onFirstOrderChange(checked === true)}
        />
        Première commande du mois (-5 %)
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={expressDelivery}
          onCheckedChange={(checked) => onExpressChange(checked === true)}
        />
        <Truck className="size-3.5" />
        Livraison express (+15 €)
      </label>
    </div>
  );
}

function CheckoutConfirm({
  cart,
  isFirstOrderOfMonth,
  expressDelivery,
}: {
  cart: CartLine[];
  isFirstOrderOfMonth: boolean;
  expressDelivery: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold tracking-wide uppercase">
          Vérification
        </p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Confirmez la commande. Les règles et totaux restent dans le pied de
          panier — comme sur l’étape précédente.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {cart.map((line) => (
          <li key={line.productId} className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-white">
              <Image
                src={line.imageSrc}
                alt={line.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{line.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                ×{line.quantity} · {formatEuros(line.unitPriceCents)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {isFirstOrderOfMonth ? (
          <Badge variant="outline">1ʳᵉ commande du mois</Badge>
        ) : null}
        {expressDelivery ? (
          <Badge variant="outline">
            <Truck className="size-3" />
            Express
          </Badge>
        ) : null}
        {!isFirstOrderOfMonth && !expressDelivery ? (
          <p className="text-muted-foreground text-xs">Aucune option cochée.</p>
        ) : null}
      </div>
    </div>
  );
}

function AppliedRulesDisclosure({
  open,
  onOpenChange,
  rules,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: AppliedRuleImpact[];
}) {
  const count = rules.length;

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Règles appliquées
          <span className="text-foreground ml-1.5 font-mono tabular-nums normal-case">
            ({count})
          </span>
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <div className="border-t px-3 py-2">
          <AppliedRulesList rules={rules} />
        </div>
      ) : null}
    </div>
  );
}

function AppliedRulesList({ rules }: { rules: AppliedRuleImpact[] }) {
  if (rules.length === 0) {
    return <p className="text-muted-foreground text-xs">Aucune règle.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rules.map((rule) => (
        <li
          key={`${rule.ruleId}-${rule.detail}`}
          className="rounded-lg border px-2.5 py-2 text-xs"
        >
          <div className="flex justify-between gap-2">
            <span className="font-medium">{rule.ruleName}</span>
            <span
              className={cn(
                "shrink-0 font-mono tabular-nums",
                rule.impactCents < 0 && "text-secondary"
              )}
            >
              {rule.impactCents > 0 ? "+" : ""}
              {formatEuros(rule.impactCents)}
            </span>
          </div>
          {rule.detail ? (
            <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
              {rule.detail}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function estimateAfterBaseDiscount(
  baseCents: Cents,
  profile: CustomerProfileId,
  firstOrder: boolean
): Cents {
  let amount = baseCents;
  if (profile === "VIP") amount = Math.round(amount * 0.85);
  else if (profile === "Premium") amount = Math.round(amount * 0.9);
  if (firstOrder) amount = Math.round(amount * 0.95);
  return amount;
}
