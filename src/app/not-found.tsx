import SimpleAppLayout from "@/components/layout/simple-app-layout";
import { NotFoundContent } from "@/components/layout/not-found-content";

export default function NotFound() {
  return (
    <SimpleAppLayout
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Page introuvable" },
      ]}
    >
      <NotFoundContent />
    </SimpleAppLayout>
  );
}
