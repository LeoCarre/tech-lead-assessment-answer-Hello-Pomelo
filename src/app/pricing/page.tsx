import { PricingExperience } from "@/components/pricing/pricing-experience";
import { loadCatalog } from "@/infrastructure/data/load-catalog";

export default async function PricingPage() {
  const catalog = await loadCatalog();

  return (
    <PricingExperience
      catalog={catalog.products.map((product) => ({
        id: product.id,
        name: product.name,
        unitPriceCents: product.priceCents,
        categories: product.categories,
      }))}
    />
  );
}
