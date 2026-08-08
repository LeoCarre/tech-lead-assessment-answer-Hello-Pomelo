import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Eye,
  KeyRound,
  Layers3,
  Network,
  Shield,
  Smartphone,
  Workflow,
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
    text: "Employés, congés, paie - system of record existant, non réécrit.",
  },
  {
    title: "App CRM",
    text: "Clients, opportunités, devis - intégrée via BFF / adaptateurs.",
  },
  {
    title: "App Finance",
    text: "Comptabilité, factures, reporting - isolation d’erreurs par domaine.",
  },
  {
    title: "App Projets",
    text: "Tâches, planning, time tracking - même shell, même SSO.",
  },
];

const pillars = [
  {
    icon: Network,
    title: "Stack dashboard",
    text: "Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/Base UI, shell multi-environnements.",
  },
  {
    icon: KeyRound,
    title: "SSO OIDC (Clerk)",
    text: "IdP managé en démo ; session via proxy ; auth.protect() sur le layout /dashboard.",
  },
  {
    icon: Shield,
    title: "Authn ≠ Authz",
    text: "Clerk authentifie ; le BFF et les apps métier autorisent (RBAC progressif).",
  },
  {
    icon: Workflow,
    title: "BFF d’intégration",
    text: "Agrégation, normalisation DTO, secrets côté serveur - pas d’accès direct browser → apps.",
  },
  {
    icon: Eye,
    title: "Observabilité & isolation",
    text: "Timeouts / dégradation locale par domaine, logs structurés, tracing BFF → apps.",
  },
  {
    icon: Smartphone,
    title: "Évolutions",
    text: "Scaling horizontal, bascule IdP enterprise, clients mobiles sur le même OIDC + BFF.",
  },
];

const docSections = [
  "Posture (system of engagement vs systems of record)",
  "Stack complète & justification",
  "SSO Clerk + alternatives (Entra, Okta, Keycloak)",
  "Sessions / tokens & resource-based protect",
  "RBAC progressif (portail → BFF → apps)",
  "BFF, anti-corruption, isolation d’erreurs",
  "Sécurité, déploiement Coolify, scaling, mobile",
  "Trade-offs, roadmap V0→V3, mapping dépôt",
];

export default function PortalArchitecturePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
          Question 3
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Architecture d’un portail unifié
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
          Dashboard unifié pour accéder aux services métiers existants. On ne
          part pas d’un greenfield microservices : on compose un{" "}
          <strong className="text-foreground font-medium">
            portail d’intégration
          </strong>{" "}
          avec SSO, au-dessus des apps déjà en place. Le détail complet est dans{" "}
          <code className="text-foreground">ARCHITECTURE.md</code> (~20
          sections).
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Infrastructure existante</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Quatre <em>systems of record</em> indépendants - le portail est le{" "}
          <em>system of engagement</em>, pas un ERP de remplacement.
        </p>
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
        <h2 className="text-base font-semibold">Piliers de la proposition</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {pillars.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="text-secondary mb-1 size-4" />
                <CardTitle className="text-sm">{item.title}</CardTitle>
                <CardDescription>{item.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Vue logique</h2>
        <pre className="bg-muted/60 overflow-x-auto rounded-lg border p-4 font-mono text-[11px] leading-relaxed">
{`Identity Provider (Clerk - OIDC démo)
              |
             SSO
              |
   Unified Dashboard (Next.js shell)
   Espace partagé · RH · CRM · Finance · Projets
              |
         BFF / Route Handlers
      /     |      |      \\
    RH     CRM  Finance  Projets
   (apps métier existantes)`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Layers3 className="text-secondary size-4" />
          Contenu de ARCHITECTURE.md
        </h2>
        <ul className="text-muted-foreground grid list-disc gap-2 pl-5 text-sm leading-relaxed sm:grid-cols-2">
          {docSections.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Démo dans ce dépôt</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            Shell <code className="text-foreground">/dashboard</code> avec
            switcher d’environnements et pages métier illustratives.
          </li>
          <li>
            SSO Clerk :{" "}
            <code className="text-foreground">auth.protect()</code> sur le
            layout dashboard (resource-based, plus de{" "}
            <code className="text-foreground">createRouteMatcher</code>).
          </li>
          <li>
            En production, les variables{" "}
            <code className="text-foreground">NEXT_PUBLIC_CLERK_*</code> doivent
            être présentes <strong className="text-foreground font-medium">au
            build</strong> Docker (voir README).
          </li>
        </ul>
      </section>

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
    </div>
  );
}
