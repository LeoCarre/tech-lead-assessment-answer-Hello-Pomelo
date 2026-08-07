import SimpleAppLayout from "@/components/layout/simple-app-layout";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SimpleAppLayout
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Question 3" },
      ]}
    >
      {children}
    </SimpleAppLayout>
  );
}
