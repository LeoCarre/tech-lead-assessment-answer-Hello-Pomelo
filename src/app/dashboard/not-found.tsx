import { NotFoundContent } from "@/components/layout/not-found-content";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
      <NotFoundContent description="Cette route n’existe pas dans le portail. Reviens en arrière, ou retourne à l’accueil de l’assessment." />
    </div>
  );
}
