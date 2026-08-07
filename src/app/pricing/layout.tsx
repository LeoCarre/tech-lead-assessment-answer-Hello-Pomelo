import SimpleAppLayout from "@/components/layout/simple-app-layout";

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SimpleAppLayout
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Question 2" },
      ]}
    >
      {children}
    </SimpleAppLayout>
  );
}
