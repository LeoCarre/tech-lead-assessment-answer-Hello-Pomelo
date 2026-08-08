<p align="center">
  <img src="public/brand/LeoCarre-TechLead-Assessment.png" alt="Hello Pomelo — Tech Lead Assessment" width="100%" />
</p>

<h1 align="center">Hello Pomelo — Tech Lead Assessment</h1>

<p align="center">
  Rendu du case Tech Lead&nbsp;: historique client, moteur de pricing, portail unifié avec SSO.
</p>

<p align="center">
  <a href="#démarrage-rapide">Démarrage</a> ·
  <a href="#livrables">Livrables</a> ·
  <a href="ARCHITECTURE.md">Architecture</a> ·
  <a href="consignes.pdf">Consignes</a> ·
  <a href="AI_USAGE.md">Usage IA</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_v4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

## Livrables

### Question 1 — Historique client

Vue consolidée pour un gestionnaire relation client : patterns d’achat, granularité dynamique (semaine / mois), anomalies, montants en **cents entiers**.

- Domaine : `src/domain` · application : `src/application/customer-history`
- UI : [`/customer-history`](http://localhost:3000/customer-history)
- API : `GET /api/customers/:id/history`
- Assumptions : [`docs/assumptions-q1.md`](docs/assumptions-q1.md)

### Question 2 — Moteur de pricing

Engine par phases (base → conditionnel → catégorie → cumulatif / réévaluation → final), boutique e-commerce et workbench synchronisés.

- Domaine : `src/domain/pricing`
- UI : [`/pricing`](http://localhost:3000/pricing) (boutique + workbench)
- Assumptions : [`docs/assumptions-q2.md`](docs/assumptions-q2.md)
- Tests : `tests/unit/pricing-engine.test.ts`

### Question 3 — Portail unifié & SSO

Portail Next.js avec environnements RH / CRM / Finance / Projets, dashboard unifié et authentification Clerk (OIDC).

- Landing : [`/portal`](http://localhost:3000/portal)
- Shell : [`/dashboard`](http://localhost:3000/dashboard) (auth obligatoire)
- Doc : [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## Démarrage rapide

**Prérequis :** Node.js 22 LTS

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

| Route | Contenu |
| --- | --- |
| `/` | Accueil assessment |
| `/customer-history` | Q1 — historique client |
| `/pricing` | Q2 — boutique + workbench |
| `/portal` | Q3 — architecture & SSO |
| `/dashboard` | Q3 — shell portail (Clerk) |
| `/sign-in` · `/sign-up` | Auth Clerk |

---

## SSO Clerk

Renseigner les clés (voir [`.env.example`](.env.example)) :

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…   # pk_live_… en production
CLERK_SECRET_KEY=sk_test_…                   # sk_live_… en production
```

- Session : `src/proxy.ts` (`clerkMiddleware`)
- Protection resource-based : `auth.protect()` dans `src/app/dashboard/layout.tsx`
- En production (`pk_live_`), la Frontend API est proxifiée via `/__clerk` (voir `Dockerfile` pour les `NEXT_PUBLIC_*` au build)

---

## Stack & architecture

| Couche | Choix |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind v4, shadcn / Base UI |
| Tests | Vitest |
| Auth | `@clerk/nextjs` (démo SSO) |
| Deploy | Docker multi-stage (`output: "standalone"`) |

Documents utiles :

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — portail, BFF, authn vs authz
- [`DESIGN.md`](DESIGN.md) — tokens Hello Pomelo
- [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) — Conventional Commits
- [`docs/assumptions-q1.md`](docs/assumptions-q1.md) / [`docs/assumptions-q2.md`](docs/assumptions-q2.md)

---

## Qualité

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build & prod |
| `npm test` | Tests unitaires |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |

Avant chaque commit logique : tests + typecheck + lint (voir [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)).

---

## Déploiement

Image Docker multi-stage (`Dockerfile`).

```bash
docker build -t hello-pomelo-assessment \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_… \
  .
docker run -p 3000:3000 \
  -e CLERK_SECRET_KEY=sk_live_… \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_… \
  hello-pomelo-assessment
```

Healthcheck : `GET /api/health`.

---

## Usage de l’IA

Documenté dans [`AI_USAGE.md`](AI_USAGE.md) (outils, apports, revue humaine, suggestions rejetées).

---

## Sécurité

- Ne jamais committer `.env`, clés Clerk ou secrets
- `.env.example` décrit uniquement les noms de variables
- Le dashboard exige une session Clerk lorsque les clés sont configurées

Source fonctionnelle du case : [`consignes.pdf`](consignes.pdf).
