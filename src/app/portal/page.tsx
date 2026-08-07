import Link from "next/link";
import {
  ArrowRight,
  Building2,
  KeyRound,
  Network,
  Shield,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const domains = [
  {
    title: "App RH",
    text: "Employés, congés, paie — application existante, non réécrite.",
  },
  {
    title: "App CRM",
    text: "Clients, opportunités, devis — intégrée via BFF.",
  },
  {
    title: "App Finance",
    text: "Comptabilité, factures, reporting — isolation d’erreurs par domaine.",
  },
  {
    title: "App Projets",
    text: "Tâches, planning, time tracking — même shell, même SSO.",
  },
];

export default function PortalArchitecturePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
          Question 3
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Architecture d’un portail unifié
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
          Dashboard unifié pour accéder aux services métiers existants. On ne
          part pas d’un greenfield microservices : on compose un portail
          d’intégration avec SSO, au-dessus des apps déjà en place.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Infrastructure existante</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {domains.map((domain) => (
            <Card key={domain.title}>
              <CardHeader className="gap-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="text-secondary size-4" />
                  {domain.title}
                </CardTitle>
                <CardDescription>{domain.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Ce qui est attendu</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            Proposer la <strong className="text-foreground">stack technique</strong>{" "}
            complète du dashboard (celle implémentée dans ce dépôt).
          </li>
          <li>
            Proposer une solution <strong className="text-foreground">SSO</strong>{" "}
            avec justifications (Clerk en démo OIDC ; alternatives enterprise
            documentées).
          </li>
          <li>
            Livrer un document à la racine :{" "}
            <code className="text-foreground">ARCHITECTURE.md</code>.
          </li>
        </ul>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Network className="text-secondary mb-1 size-4" />
            <CardTitle className="text-sm">Stack dashboard</CardTitle>
            <CardDescription>
              Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/Base UI,
              shell sidebar inset.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <KeyRound className="text-secondary mb-1 size-4" />
            <CardTitle className="text-sm">SSO Clerk</CardTitle>
            <CardDescription>
              IdP OIDC managé, protection de <code>/dashboard</code>, sign-in /
              sign-up, UserButton.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Shield className="text-secondary mb-1 size-4" />
            <CardTitle className="text-sm">Authn ≠ Authz</CardTitle>
            <CardDescription>
              Clerk authentifie ; le BFF et les apps métier autorisent (RBAC).
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <pre className="bg-muted/60 overflow-x-auto rounded-lg border p-4 font-mono text-[11px] leading-relaxed">
{`Identity Provider (Clerk)
          |
         SSO
          |
   Unified Dashboard (Next.js)
          |
        BFF
     /  |  |  \\
   RH  CRM Fin Projets`}
      </pre>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/dashboard"
          className={buttonVariants({
            variant: "secondary",
            className: "cursor-pointer",
          })}
        >
          Ouvrir le shell portail
          <ArrowRight data-icon="inline-end" />
        </Link>
        <a
          href="/ARCHITECTURE.md"
          className={buttonVariants({
            variant: "outline",
            className: "cursor-pointer",
          })}
        >
          Lire ARCHITECTURE.md
        </a>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Le document complet (trade-offs, observabilité, déploiement, mobile)
        est versionné à la racine du repository :{" "}
        <span className="text-foreground font-medium">ARCHITECTURE.md</span>.
      </p>
    </div>
  );
}
