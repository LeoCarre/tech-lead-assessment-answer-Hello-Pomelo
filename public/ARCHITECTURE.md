# Architecture — Portail unifié & SSO (Question 3)

## 1. Contexte métier

L’entreprise dispose déjà de quatre applications indépendantes :

| Domaine | Capacités |
| --- | --- |
| **RH** | Employés, congés, paie |
| **CRM** | Clients, opportunités, devis |
| **Finance** | Comptabilité, factures, reporting |
| **Projets** | Tâches, planning, time tracking |

**Objectif** : un **dashboard / portail unifié** qui offre un point d’entrée unique, une identité partagée (SSO) et une navigation cohérente — **sans** réécrire ces apps en microservices.

Posture retenue : le portail est une **couche d’intégration / présentation**, pas une plateforme métier monolithique.

---

## 2. Vue d’ensemble

```text
                    Identity Provider (Clerk — OIDC)
                              |
                             SSO
                              |
                  +-----------+-----------+
                  | Unified Web Dashboard |
                  |  Next.js + React 19   |
                  +-----------+-----------+
                              |
                    BFF / Route Handlers
                    /       |       |       \
                   /        |       |        \
                 RH        CRM    Finance   Projects
                 App       App      App        App
```

---

## 3. Stack technique du dashboard (celle du dépôt)

| Couche | Choix | Justification |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) | SSR/SSG, Route Handlers BFF, déploiement Coolify standalone |
| UI | **React 19** + **TypeScript** | Typage strict, composants serveur/client explicites |
| Design system | **Tailwind CSS v4** + **shadcn/ui (Base UI)** | Rapidité UI, accessibilité, tokens Hello Pomelo |
| Shell produit | Sidebar inset + header | Pattern portail (navigation multi-domaines) |
| Auth / SSO (démo) | **Clerk** (`@clerk/nextjs`) | OIDC managé, UI sign-in/up, Organisations = mapping RBAC léger |
| Données portail | Aucune DB obligatoire au départ | Le portail agrège ; PostgreSQL seulement si on stocke favoris, layouts, audit local |
| Déploiement | Docker multi-stage, `output: "standalone"` | Aligné Coolify / PaaS |

### Ce que le shell actuel démontre

- Navigation par domaine métier (placeholder RH / CRM / Finance / Projets).
- Identité visuelle Hello Pomelo (navy, magenta, radius `sm`).
- Séparation claire : **landing d’architecture** (`/portal`) vs **démo shell** (`/dashboard`).

---

## 4. SSO — pourquoi Clerk convient (et ses limites)

### 4.1 Oui, Clerk peut fonctionner

Clerk agit comme **Identity Provider OIDC** :

- authentification (sign-in / sign-up, MFA, social, etc.) ;
- sessions sécurisées (cookies httpOnly gérés par le SDK) ;
- composants React (`SignIn`, `UserButton`, `OrganizationSwitcher`) ;
- middleware / proxy Next.js pour la session ; protection resource-based (`auth.protect()` sur le layout `/dashboard`).

Pour un **assessment / POC / mid-market**, Clerk accélère fortement le time-to-SSO sans opérer Keycloak.

### 4.2 Authn vs Authz

| Concept | Responsable | Exemple |
| --- | --- | --- |
| **Authentication** | Clerk (IdP) | « Qui est connecté ? » |
| **Authorization** | Portail + apps métier | « Peut-il voir la paie RH ? » |

Clerk fournit l’identité (et optionnellement des **Organizations / Roles**). Les permissions fines restent côté BFF et/ou apps (RBAC métier).

### 4.3 Alternatives enterprise

| Option | Quand la préférer |
| --- | --- |
| **Microsoft Entra ID / Okta** | SSO corporate déjà en place, SCIM, conformité stricte |
| **Keycloak** | Self-host, contrôle total, coût licence faible, ops plus lourde |
| **Auth0** | Proche de Clerk, souvent plus « enterprise sales » |

**Trade-off retenu pour ce rendu** : Clerk pour la démo et la justification produit ; documenter la bascule OIDC vers Entra/Keycloak si le client l’exige (mêmes flux Authorization Code + PKCE côté BFF).

---

## 5. Stratégie session / tokens

1. L’utilisateur s’authentifie auprès de Clerk.
2. Le SDK Next.js maintient une **session** navigateur.
3. Le **BFF** (Route Handlers / Server Components) appelle `auth()` côté serveur.
4. Pour appeler une app métier, le BFF échange / propage un **token d’accès** (OAuth token exchange ou API keys machine-to-machine selon l’app) — **jamais** exposer le secret Clerk au client.
5. Les apps métier valident le token / l’identité et appliquent leur propre authz.

---

## 6. RBAC / permissions

Proposition progressive :

1. **Rôles portail** (Clerk Organizations ou `publicMetadata`) : `employee`, `manager`, `finance`, `admin`.
2. **Mapping** rôle → domaines visibles dans la sidebar.
3. **Authz fine** dans chaque app (ex. un manager RH ne voit pas toutes les fiches paie).

Isolation : si Finance est down, le portail affiche un état d’erreur localisé ; les autres domaines restent utilisables.

---

## 7. Intégration API

- **BFF Next.js** : agrège, filtre, adapte les DTOs, masque les secrets.
- **Anti-corruption** : normaliser les JSON hétérogènes des 4 apps (comme Q1 sur les sales data).
- **Timeouts / circuit breaker** légers par domaine.
- **Pas de microservices nouveaux** pour le portail lui-même.

---

## 8. Observabilité & sécurité

- Logs structurés (request id, user id hashé, domaine).
- Tracing des appels BFF → apps.
- CSP, cookies Secure/SameSite, rotation des clés Clerk.
- Secrets uniquement en variables d’environnement (Coolify).
- Principe du moindre privilège sur les tokens machine.

---

## 9. Déploiement & scalabilité

- Image Docker standalone Next.js.
- Horizontal scaling du front/BFF stateless.
- L’IdP (Clerk) scale côté SaaS.
- Les apps métier scalent indépendamment.

### Mobile futur

- Même IdP OIDC.
- Clients natifs / PWA consommant le BFF (pas d’accès direct aux secrets des apps).

---

## 10. Trade-offs résumés

| Décision | Pour | Contre |
| --- | --- | --- |
| Portail d’intégration | Réutilise les apps, délai court | Moins de UX « native » unifiée |
| Clerk | Time-to-market SSO, DX | Vendor lock-in, moins « on-prem » |
| Pas de microservices portail | Complexité maîtrisée | Limite si le portail devient un ERP |
| BFF | Sécurité, agrégation | Couche à maintenir |

---

## 11. Fichiers utiles dans ce dépôt

- Landing architecture : `/portal`
- Démo shell : `/dashboard` (auth obligatoire via `auth.protect()` dans le layout)
- SSO : `@clerk/nextjs`, `src/proxy.ts` (session), routes `/sign-in`, `/sign-up`
- Variables : `.env.example` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)

---

## 12. Conclusion

La bonne architecture ici n’est **pas** de reconstruire RH/CRM/Finance/Projets. C’est de fournir un **portail Next.js**, un **SSO OIDC (Clerk en démo)**, un **BFF** et une **authz progressive**, avec un chemin clair vers un IdP enterprise si besoin.
