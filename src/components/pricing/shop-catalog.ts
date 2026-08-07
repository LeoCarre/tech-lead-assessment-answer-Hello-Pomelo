import type { Cents } from "@/domain/money/cents";
import type { CustomerType } from "@/domain/customers/types";

export type ShopProduct = {
  id: string;
  name: string;
  unitPriceCents: Cents;
  categories: string[];
  imageSrc: string;
  blurb: string;
  /** Visible only for VIP profiles when true. */
  vipExclusive?: boolean;
};

export const SHOP_PRODUCT_IMAGES: Record<string, string> = {
  P001: "/products/product-p001-smartphone.png",
  P002: "/products/product-p002-laptop.png",
  P003: "/products/product-p003-earbuds.png",
  P004: "/products/product-p004-coffee.png",
  P005: "/products/product-p005-chocolate.png",
  P006: "/products/product-p006-tablet.png",
  P007: "/products/product-p007-mouse.png",
  P008: "/products/product-p008-keyboard.png",
  P009: "/products/product-p009-olive-oil.png",
  P010: "/products/product-p010-watch.png",
  P011: "/products/product-p011-wine.png",
  P012: "/products/product-p012-headset.png",
  P013: "/products/product-p013-tea.png",
  P018: "/products/product-p018-speaker.png",
};

export const SHOP_BLURBS: Record<string, string> = {
  P001: "Flagship Hello Pomelo · édition tramée bleu électrique.",
  P002: "Puissance pro, design stipple #0000EA.",
  P003: "Audio nomade, accents magenta brand.",
  P004: "Torréfaction bio, packaging pop-art.",
  P005: "70 % cacao, fiche produit rose & bleu.",
  P006: "Tablette 10\" · catalogue e-commerce HP.",
  P007: "Précision bureau, look dithered.",
  P008: "Mécanique RGB, identité Hello Pomelo.",
  P009: "Huile premium, fond blanc catalogue.",
  P010: "Sport connecté · exclusivité VIP possible.",
  P011: "Sélection sommelier, pack 6 bouteilles.",
  P012: "Immersion gaming, tramage bleu.",
  P013: "Thé vert japonais, édition limitée.",
  P018: "Enceinte portable, rayures magenta.",
};

export const VIP_EXCLUSIVE_IDS = new Set(["P001", "P002", "P010"]);

export type CustomerProfileId = CustomerType;

export const CUSTOMER_PROFILES: Array<{
  id: CustomerProfileId;
  label: string;
  tagline: string;
  offers: string[];
}> = [
  {
    id: "VIP",
    label: "VIP",
    tagline: "Accès exclusivités + remise -15 %",
    offers: [
      "Remise VIP -15 % sur le panier",
      "Exclusivités high-tech débloquées",
      "Livraison express prioritaire disponible",
    ],
  },
  {
    id: "Premium",
    label: "Premium",
    tagline: "Remise -10 % · catalogue complet",
    offers: [
      "Remise Premium -10 %",
      "Bonus -5 % si 1re commande du mois",
      "Catalogue complet (hors exclusivités VIP)",
    ],
  },
  {
    id: "Standard",
    label: "Standard",
    tagline: "Seuils volume & panier",
    offers: [
      "-5 % dès 500 € après remises de base",
      "-8 % dès 1000 € (remplace le -5 %)",
      "Remise -10 % si > 3 unités d’une catégorie",
    ],
  },
  {
    id: "Unknown",
    label: "Invité",
    tagline: "Catalogue restreint · identifiez-vous",
    offers: [
      "Accès épicerie & petits accessoires",
      "Identifiez un profil pour débloquer le reste",
      "Frais de traitement si total < 50 €",
    ],
  },
];

export function buildShopCatalog(
  products: Array<{
    id: string;
    name: string;
    unitPriceCents: Cents;
    categories: string[];
  }>
): ShopProduct[] {
  return products
    .filter((product) => SHOP_PRODUCT_IMAGES[product.id])
    .map((product) => ({
      ...product,
      imageSrc: SHOP_PRODUCT_IMAGES[product.id],
      blurb: SHOP_BLURBS[product.id] ?? product.categories.join(" · "),
      vipExclusive: VIP_EXCLUSIVE_IDS.has(product.id),
    }));
}

export function filterCatalogForProfile(
  products: ShopProduct[],
  profile: CustomerProfileId
): ShopProduct[] {
  switch (profile) {
    case "VIP":
      return [...products].sort((a, b) => {
        const aVip = a.vipExclusive ? 0 : 1;
        const bVip = b.vipExclusive ? 0 : 1;
        return aVip - bVip || b.unitPriceCents - a.unitPriceCents;
      });
    case "Premium":
      return products.filter((product) => !product.vipExclusive);
    case "Standard":
      return products.filter((product) => !product.vipExclusive);
    case "Unknown":
      return products.filter(
        (product) =>
          !product.vipExclusive &&
          (product.categories.some((category) =>
            /alimentaire|boissons|gourmandise/i.test(category)
          ) ||
            product.unitPriceCents < 5000)
      );
    default:
      return products;
  }
}
