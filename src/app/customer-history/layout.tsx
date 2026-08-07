import SimpleAppLayout from "@/components/layout/simple-app-layout";

export default function CustomerHistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SimpleAppLayout
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Question 1" },
      ]}
    >
      {children}
    </SimpleAppLayout>
  );
}
