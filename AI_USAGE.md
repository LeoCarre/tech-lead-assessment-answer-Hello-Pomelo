# AI Usage

Ce document décrit l’usage réel de l’IA pendant le rendu du Tech Lead Assessment Hello Pomelo. L’IA a accéléré l’implémentation ; les règles métier, les arbitrages UX et la validation finale restent sous revue humaine.

## Outils

- **Cursor** (agent Composer / Auto) pour exploration, implémentation et itérations UI
- Contexte projet local sous `.cursor/` (gitignoré) : `context.md`, skills, règles de commits
- Structure `DESIGN.md` inspirée de [google-labs-code/design.md](https://github.com/google-labs-code/design.md)
- Tokens / identité visuelle dérivés de [hello-pomelo.com](https://hello-pomelo.com/)
- Shell UI (sidebar inset, header sticky) adapté d’un layout Shadcn / dashboard existant, sans stack auth tierce au démarrage

## Rôle de l’IA par livrable

### Socle

- Scaffold Next.js 16 + React 19 + TypeScript + Tailwind v4 + Vitest + Docker (Coolify / standalone)
- Landing assessment, fil d’Ariane, page 404, assets brand sous `public/brand`

### Q1 - Historique client

- Domaine : cents entiers, fenêtre 6 mois, granularité semaine/mois, anomalies, normalisation JSON à la frontière infra
- Application + API `GET /api/customers/:id/history`
- Dashboard pilotage (KPI, filtres clients, badges, tris colonnes, patterns multi-clients) et vue rapport
- Tests Vitest (périodes, évolution, anomalies, cas limites)

### Q2 - Pricing

- Engine par phases (base → conditionnel → catégorie → cumulatif / réévaluation bornée → final)
- Boutique e-commerce + workbench technique avec **session partagée** (panier / profil / options synchronisés)
- Totaux HT / taxes détaillées / TTC, règles appliquées repliables, options panier (1ʳᵉ commande, express)
- Tests Vitest du moteur

### Q3 - Portail & SSO

- `ARCHITECTURE.md` (portail, BFF, authn ≠ authz, Clerk en démo OIDC)
- Shell `/dashboard` multi-environnements (Espace partagé, RH, CRM, Finance, Projets) + pages métier démo
- SSO Clerk : `ClerkProvider`, `/sign-in` · `/sign-up`, `proxy.ts` pour la session, **`auth.protect()`** sur le layout dashboard (plus de gate via `createRouteMatcher`)

### Packaging

- README type produit (hero, badges, livrables, démarrage, SSO, Docker)
- Reconstruction d’un historique Conventional Commits (1 commit logique par étape tooling / docs / Q1 / Q2 / Q3)

## Revue humaine (obligatoire)

- Interprétation des consignes et assumptions (`docs/assumptions-q1.md`, `docs/assumptions-q2.md`)
- Seuil de rythme strict `>` (ex. 12 commandes / 6 mois → granularité mensuelle)
- Dates déterministes (pas de `Date.now()` pour la fenêtre d’analyse)
- Ordre des phases pricing et borne de réévaluation
- Auth dashboard : obligatoire dès que les clés Clerk sont présentes
- Polish UX validé en revue (filtres Q1, HT barré vs frais express, sync boutique/workbench, switcher d’environnements)
- `npm test`, `npm run typecheck`, builds avant commits

## Suggestions IA rejetées ou corrigées

| Suggestion initiale | Décision |
| --- | --- |
| Protéger `/dashboard` uniquement via middleware + `createRouteMatcher` | Remplacé par `auth.protect()` dans le layout (resource-based) |
| SSO « soft » (dashboard ouvert sans login) | Conservé un temps pour la DX, puis auth hard exigée |
| Inclure frais express / traitement dans le HT | HT = TTC − taxes − frais finaux (sinon le prix barré disparaissait) |
| Crash si `customer.type` manquant | Normalisation en `Unknown` à la frontière données |
| Fenêtre d’analyse basée sur l’horloge système | Date de référence injectable / fixe en tests |
| Microservices pour le portail | Écarté (contrainte assessment + monolithe Next.js) |

## Workflow suivi

1. Lire consignes + clarifier assumptions  
2. Implémenter un changement logique borné  
3. Itérer avec revue humaine (surtout UX et règles métier)  
4. Tests / typecheck  
5. Commit Conventional Commits : `type(scope): description`  

L’output IA est traité comme **proposition** jusqu’à validation humaine.
