import { NotFoundActions } from "@/components/layout/not-found-actions";

export function NotFoundContent({
  description = "L’adresse demandée n’existe pas (ou plus). Tu peux revenir à la page précédente, ou repartir de l’accueil pour retrouver les livrables de l’assessment.",
}: {
  description?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-start justify-center py-10 sm:py-16">
      <p className="text-secondary text-xs font-semibold tracking-[0.08em] uppercase">
        Erreur 404
      </p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Cette page s’est égarée quelque part
      </h1>
      <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
        {description}
      </p>
      <NotFoundActions />
    </div>
  );
}
