# Architecture — Portail unifié & SSO (Question 3)

Document d’architecture pour un **dashboard / portail d’entreprise** donnant accès aux applications métier existantes (RH, CRM, Finance, Projets), avec **SSO**, sans repartir d’un greenfield microservices.

Ce dépôt illustre la proposition : landing `/portal`, shell `/dashboard`, IdP **Clerk** (OIDC) en démo.

---

## Table des matières

1. [Contexte & objectifs](#1-contexte--objectifs)
2. [Posture architecturale](#2-posture-architecturale)
3. [Vue d’ensemble](#3-vue-densemble)
4. [Stack technique du dashboard](#4-stack-technique-du-dashboard)
5. [Cartographie des domaines dans le shell](#5-cartographie-des-domaines-dans-le-shell)
6. [SSO — choix, justification, alternatives](#6-sso--choix-justification-alternatives)
7. [Authentication vs authorization](#7-authentication-vs-authorization)
8. [Stratégie session / tokens](#8-stratégie-session--tokens)
9. [RBAC & permissions](#9-rbac--permissions)
10. [Intégration API & BFF](#10-intégration-api--bff)
11. [Isolation d’erreurs](#11-isolation-derreurs)
12. [Observabilité](#12-observabilité)
13. [Sécurité](#13-sécurité)
14. [Déploiement](#14-déploiement)
15. [Scalabilité](#15-scalabilité)
16. [Clients mobiles futurs](#16-clients-mobiles-futurs)
17. [Roadmap d’évolution](#17-roadmapdévolution)
18. [Trade-offs & alternatives](#18-trade-offs--alternatives)
19. [Ce qui est implémenté dans ce dépôt](#19-ce-qui-est-implémenté-dans-ce-dépôt)
20. [Conclusion](#20-conclusion)

---

## 1. Contexte & objectifs

### 1.1 Applications déjà en place

| Domaine | Capacités métier |
| --- | --- |
| **RH** | Employés, congés, paie |
| **CRM** | Clients, opportunités, devis |
| **Finance** | Comptabilité, factures, reporting |
| **Projets** | Tâches, planning, time tracking |

Ces apps sont **indépendantes** (équipes, cycles de release, éventuellement stacks différentes). Elles constituent le système d’enregistrement (*systems of record*).

### 1.2 Problème à résoudre

Aujourd’hui, un collaborateur jongle entre plusieurs URL, plusieurs comptes, plusieurs UX. Le besoin est un **point d’entrée unique** :

- une identité partagée (SSO) ;
- une navigation cohérente ;
- une vue transverse (dashboard unifié) ;
- un accès contextualisé aux domaines métier.

### 1.3 Objectifs non-négociables

- **Ne pas** réécrire RH / CRM / Finance / Projets.
- **Ne pas** inventer une architecture microservices « pour le principe ».
- Proposer une stack **justifiée**, un SSO **crédible**, et un chemin d’évolution réaliste.

### 1.4 Hors scope initial

- Remplacement des apps métier.
- Data warehouse / BI enterprise (peut venir plus tard).
- Authz fine métier complète (déléguée progressivement aux apps + BFF).

---

## 2. Posture architecturale

Le portail est une **couche d’intégration / présentation** (*system of engagement*), pas un ERP monolithique.

```text
Systems of engagement     →  Portail Next.js (ce dépôt)
Systems of record         →  Apps RH / CRM / Finance / Projets (existantes)
Identity                  →  IdP OIDC (Clerk en démo)
```

**Conséquences :**

- le portail **orchestre** et **agrège** ;
- la vérité métier reste dans chaque app ;
- le BFF protège les secrets et normalise les contrats ;
- une panne d’un domaine ne doit pas couler tout le portail.

---

## 3. Vue d’ensemble

```text
                         ┌─────────────────────────┐
                         │   Identity Provider      │
                         │   Clerk (OIDC) — démo    │
                         │   (Entra / Okta / …)     │
                         └────────────┬────────────┘
                                      │ SSO
                                      ▼
                         ┌─────────────────────────┐
                         │  Unified Web Dashboard  │
                         │  Next.js 16 · React 19  │
                         │  Shell + environnements │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   BFF / Route Handlers  │
                         │   auth() · DTO · cache  │
                         └───┬──────┬──────┬───┬───┘
                             │      │      │   │
                    ┌────────┘      │      │   └────────┐
                    ▼               ▼      ▼            ▼
                 App RH          App CRM  App Finance  App Projets
              (existante)      (existante) (existante) (existante)
```

Flux utilisateur typique :

1. Accès `/dashboard` → redirection sign-in si non authentifié.
2. Session IdP établie → shell portail.
3. Choix d’environnement (Espace partagé / RH / CRM / …).
4. Le BFF charge les widgets / listes via les APIs métier (ou données démo en assessment).
5. Actions profondes : deep-link ou iframe/module selon maturité d’intégration.

---

## 4. Stack technique du dashboard

| Couche | Choix | Justification |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) | SSR, Route Handlers BFF, un seul dépôt TypeScript, `output: "standalone"` |
| UI | **React 19** + **TypeScript** | Typage strict, Server / Client Components explicites |
| Design system | **Tailwind CSS v4** + **shadcn/ui (Base UI)** | Time-to-UI, a11y, tokens Hello Pomelo (`DESIGN.md`) |
| Shell | Sidebar inset + header + switcher d’environnements | Pattern portail multi-domaines |
| Auth / SSO (démo) | **Clerk** (`@clerk/nextjs`) | OIDC managé, composants Sign-in / UserButton, DX rapide |
| Données portail | **Aucune DB obligatoire** au départ | PostgreSQL seulement si favoris, layouts perso, audit local, feature flags |
| Tests | **Vitest** (logique métier Q1/Q2) | Domaine testable hors UI |
| Déploiement | **Docker** multi-stage | Aligné Coolify / PaaS |

### Pourquoi pas une SPA React + API Express séparée ?

Pour cet assessment (et pour un portail d’intégration V1), Next.js regroupe :

- rendu + routing ;
- BFF colocalisé ;
- déploiement unique ;
- partage des types TypeScript.

Une séparation front/API reste possible plus tard si les équipes ou le scaling l’exigent — ce n’est pas un prérequis.

### Pourquoi pas de microservices « portail » ?

Les apps métier **sont déjà** découpées. Ajouter des microservices uniquement pour le dashboard augmenterait :

- le coût ops ;
- la latence de coordination ;
- la surface de panne ;

sans résoudre le vrai besoin (SSO + shell + agrégation).

---

## 5. Cartographie des domaines dans le shell

Le shell démontre une navigation **par environnement métier**, plus un **espace partagé** (dashboard unifié).

| Environnement | Routes (démo) | Intent |
| --- | --- | --- |
| Espace partagé | `/dashboard`, `/dashboard/activity` | KPI cross-métiers, activité récente |
| App RH | `/dashboard/hr/*` | Employés, congés, paie |
| App CRM | `/dashboard/crm/*` | Clients, opportunités, devis |
| App Finance | `/dashboard/finance/*` | Grand livre, factures, reporting |
| App Projets | `/dashboard/projects/*` | Tâches, planning, time tracking |

**Modèle cible (hors assessment) :**

- le shell reste Next.js ;
- chaque domaine peut soit **proxyfier** des API (BFF), soit **embarquer** via module fédéré / deep-link authentifié ;
- le dashboard unifié n’est **pas** dupliqué dans chaque app : c’est la vue transverse du portail.

---

## 6. SSO — choix, justification, alternatives

### 6.1 Choix retenu pour la démo : Clerk

Clerk joue le rôle d’**Identity Provider OIDC** :

- authentification (email, social, MFA selon config) ;
- session navigateur gérée par le SDK ;
- UI prêtes (`SignIn`, `SignUp`, `UserButton`) ;
- organisations / rôles utiles pour un RBAC portail léger.

**Pourquoi Clerk ici ?**

- time-to-SSO très court pour un assessment / POC ;
- bonne DX Next.js ;
- protocole standard (OIDC) → **chemin de migration** vers Entra / Okta / Keycloak.

### 6.2 Alternatives enterprise

| Option | Quand la préférer | Contre |
| --- | --- | --- |
| **Microsoft Entra ID** | Tenant Microsoft déjà corporate, Conditional Access | Setup plus lourd |
| **Okta** | SSO multi-apps déjà Okta, SCIM | Coût / dépendance vendor |
| **Keycloak** | Self-host, souveraineté, coût licence | Ops & hardening à porter |
| **Auth0** | Proche Clerk, écosystème Auth0 | Pricing / positionnement enterprise |

Le **raisonnement** importe plus que la marque : tout IdP OIDC compatible Authorization Code + PKCE convient. Clerk est le **accélérateur de démo** ; le design d’intégration (BFF + tokens) reste le même.

---

## 7. Authentication vs authorization

| Concept | Question | Responsable |
| --- | --- | --- |
| **Authentication (authn)** | Qui est connecté ? | IdP (Clerk) |
| **Authorization (authz)** | Que peut-il faire / voir ? | Portail (visibilité domaines) + BFF + apps métier |

**Règle d’or :** l’IdP authentifie ; il ne remplace pas les règles métier (ex. « ce manager voit-il cette fiche de paie ? »).

Dans ce dépôt :

- Clerk = authn ;
- `auth.protect()` = gate d’accès au shell ;
- l’authz fine reste à construire (rôles → domaines → permissions app).

---

## 8. Stratégie session / tokens

### 8.1 Session navigateur (utilisateur → portail)

1. L’utilisateur s’authentifie auprès de Clerk (`/sign-in`).
2. Le SDK Next.js établit une **session** (cookies httpOnly gérés par Clerk).
3. `src/proxy.ts` exécute `clerkMiddleware()` pour maintenir la session sur les requêtes matched.
4. Le layout `/dashboard` appelle `await auth.protect()` : **resource-based protection** (plus de `createRouteMatcher` pour l’authz).

Sans clés Clerk configurées, le layout redirige vers `/portal` (pas de faux sentiment de sécurité).

### 8.2 Appels portail → apps métier (cible)

```text
Browser  --session-->  Next.js BFF  --access token / m2m-->  App métier
                         │
                         └── jamais de secret IdP exposé au browser
```

Options selon maturité de chaque app :

| Pattern | Usage |
| --- | --- |
| **Token exchange / OBO** | L’utilisateur agit au nom de lui-même sur l’API métier |
| **M2M (client credentials)** | Agrégations batch / jobs portail (audit, sync) |
| **Signed session cookie BFF → app** | Apps internes trust le BFF (réseau privé) |

### 8.3 Ce qu’il ne faut pas faire

- Passer le secret Clerk au client.
- Laisser le browser appeler directement les APIs métier avec des clés longues.
- Confondre « être connecté » et « avoir le droit ».

---

## 9. RBAC & permissions

### 9.1 Modèle progressif

**Phase A — Portail (rapide)**

- Rôles dans Clerk Organizations ou `publicMetadata` : `employee`, `manager`, `finance`, `admin`.
- Mapping rôle → environnements visibles dans le switcher / sidebar.

**Phase B — BFF**

- Vérifier le rôle avant d’appeler une API sensible.
- Filtrer les champs (PII, salaires) selon le rôle.

**Phase C — Apps métier**

- Authz fine inchangée / renforcée dans chaque system of record.
- Le portail ne court-circuite jamais les contrôles RH/Finance.

### 9.2 Exemple de matrice (cible)

| Rôle | Espace partagé | RH | CRM | Finance | Projets |
| --- | --- | --- | --- | --- | --- |
| employee | lecture | self-service | — | — | ses tâches |
| manager | lecture | équipe | lecture | — | équipe |
| finance | lecture | — | lecture | full | — |
| admin | full | full | full | full | full |

---

## 10. Intégration API & BFF

### 10.1 Rôle du BFF

- Authentifier la requête (session Clerk).
- Autoriser (rôle / domaine).
- Appeler les APIs métier avec le bon token.
- **Normaliser** les JSON hétérogènes (anti-corruption layer — même idée que Q1).
- Agréger pour le dashboard unifié (KPI cross-domaines).
- Appliquer timeouts, retries bornés, cache court si pertinent.

### 10.2 Contrats

- DTOs stables côté portail (`PortalEmployee`, `PortalInvoice`, …).
- Versioning des adaptateurs par app (`adapters/hr/v1`, …).
- Ne pas fuiter les modèles internes des apps dans l’UI.

### 10.3 Assessment vs production

Dans ce dépôt, les pages métier sont des **surfaces démo** (données fictives) pour illustrer la navigation. En production, elles consommeraient le BFF branché sur les vraies APIs.

---

## 11. Isolation d’erreurs

Objectif : **dégradation locale**, pas panne globale.

| Stratégie | Détail |
| --- | --- |
| Timeouts par domaine | Ex. RH 2s, Finance 3s — pas de wait infini |
| Circuit breaker léger | Couper temporairement un domaine en erreur |
| UI compartimentée | Widget Finance en erreur ≠ sidebar bloquée |
| Bulkheads | Pas de file d’attente unique pour tous les domaines |
| Messages clairs | « Finance indisponible » + retry, sans stacktrace |

Le dashboard unifié doit afficher des états partiels (3 domaines OK / 1 KO) plutôt qu’une page blanche.

---

## 12. Observabilité

| Pilier | Pratique |
| --- | --- |
| Logs | Structurés (JSON) : `requestId`, `userId` hashé, `domain`, `latencyMs`, `status` |
| Metrics | Latence BFF par domaine, taux d’erreur, taux de sign-in |
| Tracing | Propagation `traceparent` BFF → apps |
| Alerting | Spike 5xx sur un domaine, échecs auth IdP |
| Audit | Accès aux données sensibles (Finance / Paie) — stockage portail optionnel |

Le `requestId` généré au edge (proxy / layout) doit suivre tout le chemin.

---

## 13. Sécurité

| Sujet | Mesure |
| --- | --- |
| Secrets | Uniquement env (Coolify) — jamais commités (`.env` gitignoré) |
| Cookies session | Secure, HttpOnly, SameSite (géré Clerk) |
| CSRF | Patterns Next + cookies SameSite ; actions mutantes côté serveur |
| CSP | Restreindre scripts / frames (surtout si iframe apps) |
| Headers | HSTS, `X-Content-Type-Options`, `Referrer-Policy` |
| Tokens | Durée de vie courte, rotation, moindre privilège |
| Données | Minimisation PII dans logs et agrégats portail |
| Dépendances | Audit npm / image Docker |

La protection du shell repose sur **`auth.protect()`** au layout dashboard (resource-based), pas sur un matching de paths fragile.

---

## 14. Déploiement

| Élément | Choix |
| --- | --- |
| Build | Docker multi-stage, `output: "standalone"` |
| Runtime | Conteneur Next.js (Coolify / tout orchestrateur) |
| Config | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, URLs sign-in/up |
| Healthcheck | `GET /api/health` |
| Environnements | preview / staging / prod (IdP apps séparées recommandées) |

Le portail est **stateless** au niveau process : horizontal scaling simple derrière un load balancer.

---

## 15. Scalabilité

| Couche | Scaling |
| --- | --- |
| Portail / BFF | Horizontal (instances Next.js) |
| IdP | SaaS (Clerk) ou cluster IdP enterprise |
| Apps métier | Indépendant — le portail ne dicte pas leur scaling |
| Cache | Court TTL sur agrégats dashboard ; invalidation par domaine |
| Pic de login | Géré côté IdP ; le BFF reste léger |

Goulot d’étranglement typique : **agrégation synchrone** trop large. Mitigation : widgets indépendants (fetch parallèle), cache, et priorisation des KPI critiques.

---

## 16. Clients mobiles futurs

Même principe d’architecture :

```text
Mobile / PWA  →  même IdP OIDC  →  BFF portail  →  apps métier
```

- pas d’accès direct mobile → secrets apps ;
- deep links vers écrans portail ou apps (SSO déjà établi) ;
- éventuellement API « mobile BFF » dédiée (payloads plus légers) sans dupliquer la logique d’authz.

---

## 17. Roadmap d’évolution

| Étape | Contenu |
| --- | --- |
| **V0 (ce dépôt)** | Shell, environnements, SSO Clerk, pages démo, doc |
| **V1** | BFF réel vers 1–2 apps, RBAC portail, isolation d’erreurs |
| **V2** | Agrégats dashboard live, audit, observabilité complète |
| **V3** | Modules fédérés / design system partagé, mobile, bascule IdP enterprise si besoin |

---

## 18. Trade-offs & alternatives

| Décision | Pour | Contre | Alternative écartée |
| --- | --- | --- | --- |
| Portail d’intégration | Réutilise les apps, time-to-value | UX moins « native » qu’un monolithe UX | Réécrire les 4 apps |
| Next.js monolithique (front+BFF) | Simplicité assessment & V1 | Peut grossir | SPA + API séparée trop tôt |
| Clerk | DX, OIDC, vitesse | Vendor lock-in relatif | Keycloak dès le jour 1 (ops) |
| Pas de DB portail au départ | Moins de surface | Pas de préférences persistées | PostgreSQL dès le POC |
| Démo données métier | Illustre la nav | Pas d’intégration réelle | Brancher 4 APIs dans le délai assessment |
| `auth.protect()` layout | Aligné bonnes pratiques Clerk | Chaque ressource sensible doit être protégée | Middleware path matching seul |

---

## 19. Ce qui est implémenté dans ce dépôt

| Élément | Emplacement |
| --- | --- |
| Landing architecture | `/portal` |
| Document | `ARCHITECTURE.md` (+ copie `public/ARCHITECTURE.md` pour lecture navigateur) |
| Shell multi-environnements | `/dashboard/*`, `src/lib/portal-environments.ts` |
| Session Clerk | `src/proxy.ts`, `src/components/auth/auth-provider.tsx` |
| Gate dashboard | `auth.protect()` dans `src/app/dashboard/layout.tsx` |
| Sign-in / Sign-up | `/sign-in`, `/sign-up` |
| Variables | `.env.example` |
| Design tokens | `DESIGN.md` |

---

## 20. Conclusion

La bonne architecture pour ce besoin n’est **pas** de reconstruire RH, CRM, Finance et Projets.

C’est de fournir :

1. un **portail Next.js** comme system of engagement ;
2. un **SSO OIDC** (Clerk en démo, IdP enterprise en cible) ;
3. un **BFF** pour sécuriser et normaliser l’intégration ;
4. une **authz progressive** (portail → BFF → apps) ;
5. une **isolation d’erreurs** et une **observabilité** par domaine ;
6. un chemin clair de **scaling** et de **mobilité** sans remettre en cause le modèle.

Le dépôt démontre le shell, le SSO et la navigation multi-domaines ; le document ci-dessus fixe le cadre pour industrialiser l’intégration.
