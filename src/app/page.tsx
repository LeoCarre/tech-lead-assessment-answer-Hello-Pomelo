import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  FolderGit2,
  History,
  Mail,
  Network,
  type LucideIcon,
} from "lucide-react";

import { ConsignesButton } from "@/components/landing/consignes-button";
import Logo from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuestionCard = {
  href: string;
  title: string;
  status: string;
  summary: string;
  points: string[];
  cta: string;
  icon: LucideIcon;
};

const questions: QuestionCard[] = [
  {
    href: "/customer-history",
    title: "Question 1 - Historique client",
    status: "Livré",
    summary:
      "Vue consolidée pour un gestionnaire relation client : patterns d’achat lisibles, sans logique métier collée à l’UI.",
    points: [
      "Vue pilotage (défaut) : KPI, filtres, patterns multi-clients, détail.",
      "Rapport historique : client, périodes dynamiques, évolution, anomalies.",
      "Justification du rythme (> 2 cmd/mois → semaine, sinon mois).",
      "Fenêtre 6 mois, cents entiers, normalisation des données sales.",
    ],
    cta: "Voir l’historique",
    icon: History,
  },
  {
    href: "/pricing",
    title: "Question 2 - Moteur de pricing",
    status: "Livré",
    summary:
      "Moteur de règles extensible : dépendances, priorités et impact de chaque règle sur le prix final.",
    points: [
      "Boutique e-commerce simulée (catalogue, panier, checkout).",
      "Workbench technique + 4 profils client (VIP / Premium / Standard / Invité).",
      "Règles de base, seuils, taxes, cumulatif avec réévaluation, frais finaux.",
      "Engine par phases + breakdown d’impact en cents.",
    ],
    cta: "Voir le pricing",
    icon: Calculator,
  },
  {
    href: "/portal",
    title: "Question 3 - Portail & SSO",
    status: "Livré",
    summary:
      "Proposition d’architecture pour un portail unifié (RH, CRM, Finance, Projets) avec SSO et shell produit.",
    points: [
      "Landing architecture `/portal` + document `ARCHITECTURE.md`.",
      "Shell dashboard (sidebar inset) en démo du portail.",
      "SSO Clerk (OIDC) branché sur `/dashboard` lorsque les clés sont configurées.",
      "Focus intégration plutôt que microservices.",
    ],
    cta: "Voir l’architecture",
    icon: Network,
  },
];

const GITHUB_REPO_URL =
  "https://github.com/LeoCarre/tech-lead-assessment-answer-Hello-Pomelo";
const CONTACT_EMAIL = "leomax.carre@yahoo.fr";

export default function HomePage() {
  return (
    <div className="bg-background relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,48,107,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(17,16,59,0.08),_transparent_50%)]"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-between gap-10 px-6 py-10 sm:py-12 lg:py-14">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <Logo frameClassName="size-[7.625rem] shadow-sm ring-1 ring-black/5" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
                Hello Pomelo
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Tech Lead Assessment
              </h1>
              <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
                Réponse au case Tech Lead Hello Pomelo, structurée en trois
                livrables : agrégation d’historique client, moteur de pricing,
                et architecture du portail unifié avec SSO.
              </p>
            </div>
          </div>

          <ConsignesButton />
        </header>

        <section className="grid flex-1 content-center gap-4 md:grid-cols-3 md:gap-5">
          {questions.map((item) => (
            <Card
              key={item.href}
              className="h-full transition-colors hover:ring-secondary/30"
            >
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-2">
                  <item.icon className="text-secondary size-5" />
                  <span className="text-muted-foreground rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                    {item.status}
                  </span>
                </div>
                <CardTitle className="text-base leading-snug">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {item.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="text-muted-foreground list-disc space-y-2 pl-4 text-xs leading-relaxed">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto border-t-0 bg-transparent">
                <Link
                  href={item.href}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full",
                  })}
                >
                  {item.cta}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </section>

        <footer className="border-border/60 text-muted-foreground flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-wide uppercase">Léo Carré</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-2 underline-offset-4 hover:underline"
            >
              <FolderGit2 className="size-4 shrink-0" />
              GitHub
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-2 underline-offset-4 hover:underline"
            >
              <Mail className="size-4 shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
