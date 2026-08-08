# Cahier de tests - Question 2 (moteur de pricing)

Ce document décrit la **logique de calcul** et des **scénarios de vérification**
manuelle (boutique `/pricing` ou workbench) alignés sur le moteur
`src/domain/pricing`.

Référence assumptions : [`assumptions-q2.md`](./assumptions-q2.md).  
Tests automatisés : `tests/unit/pricing-engine.test.ts`.

---

## Ordre d'application (phases)

```text
Prix brut (Σ unitPrice × qty)
        │
        ▼
1. Base          VIP -15 % XOR Premium -10 %, puis 1re commande du mois -5 %
        │
        ▼
2. Conditionnel  après base : > 1000 € → -8 % (sinon > 500 € → -5 %)
        │
        ▼
3. Catégorie     par ligne : max(taxe Électronique 20 %, Alimentaire 5,5 %)
        │
        ▼
4. Cumulatif     > 3 unités même catégorie → -10 % sur ces lignes
        │         si total pre-final < 500 € et conditional-500 active
        │         → annuler conditional-500 et rejouer phases 1-4
        ▼
5. Final         express +15 € ; si total < 50 € → +5 € traitement
        │
        ▼
Prix final + détail des règles (impact en cents)
```

Une commande peut cumuler plusieurs règles. Les montants sont en **cents entiers**
(`Math.round` par impact de ligne).

---

## Règles métier

### 1. Base (sur prix brut)

| Règle | Condition | Impact |
| --- | --- | --- |
| VIP | `customerType = VIP` | -15 % |
| Premium | `customerType = Premium` | -10 % |
| Exclusivité | VIP et Premium | VIP gagne, Premium ignoré |
| 1re commande du mois | flag activé | -5 % (se cumule après type) |

### 2. Conditionnelles (sur total après base)

| Règle | Condition | Impact |
| --- | --- | --- |
| Seuil 500 | total après base **>** 500 € | -5 % |
| Seuil 1000 | total après base **>** 1000 € | -8 % (remplace le -5 %) |

Seuils **stricts** : 500,00 € et 1000,00 € exacts ne déclenchent pas.

### 3. Catégorie (par produit / ligne)

| Catégorie (FR/EN) | Taxe |
| --- | --- |
| Électronique / Electronics | +20 % |
| Alimentaire / Food | +5,5 % |
| Multi-catégories | taxe **la plus élevée** |

### 4. Cumulatif (récursif / réévaluation)

| Règle | Condition | Impact |
| --- | --- | --- |
| Volume catégorie | somme des quantités d'une catégorie normalisée **> 3** (strict) | -10 % sur les lignes touchées |
| Annulation 500 | après volume, total pre-final **<** 500 € alors que `conditional-500` était active | annuler `-5 %` 500 € et **rejouer** base → cumulatif |

**Comptage** : 4 tablettes `P006` (catégorie Électronique) → volume OK.  
3 tablettes → **pas** de -10 %.

### 5. Finales

| Règle | Condition | Impact |
| --- | --- | --- |
| Express | option cochée | +15 € |
| Traitement | total après express **<** 50 € | +5 € |

Les frais finaux **ne** participent **pas** aux seuils 500 / 1000.

---

## Scénarios de test manuel

Profil conseillé sauf mention : **Standard**, express **off**, 1re commande **off**.

| # | Panier | Attendu (vérifier le détail des règles) |
| --- | --- | --- |
| T1 | 1 × produit 100 € sans catégorie, VIP | Final 85 € ; règle VIP ; pas Premium |
| T2 | 1 × 100 €, Premium + 1re commande mois | 100 → 90 → 85,50 € |
| T3 | 1 × 600 € sans catégorie, Standard | conditional-500 ; final 570 € |
| T4 | 1 × 500 € exact | **pas** de seuil 500 ; final 500 € |
| T5 | 1 × 1200 € | conditional-1000 (-8 %) ; **pas** de -5 % |
| T6 | 1 × 100 € Électronique + Alimentaire | taxe 20 % ; final 120 € |
| T7 | 1 × 100 € Alimentaire | taxe 5,5 % ; final 105,50 € |
| T8 | **4 × Tablette 10" (P006)** | volume > 3 ; règle `-10 %` présente |
| T9 | 3 × P006 | **pas** de volume (seuil strict) |
| T10 | 4 × 140 € catégorie Accessoires | réévaluation : annulation seuil 500 ; final 504 € |
| T11 | 1 × 100 € + express | final 115 € |
| T12 | 1 × 40 € | frais traitement ; final 45 € |

### Calcul détaillé T8 (4 × tablette 349 €)

1. Brut : 4 × 349 = **1396 €**
2. Base : aucune (Standard)
3. Conditionnel : 1396 > 1000 → **-8 %**
4. Taxe Électronique +20 %
5. Volume > 3 → **-10 %** sur la ligne taxée
6. Final : pas d'express / pas de frais < 50 €

Contrôler dans l'UI que `Remise volume catégorie (> 3)` apparaît avec un impact négatif.

### Calcul détaillé T10 (réévaluation)

1. Brut : 4 × 140 = **560 €**
2. Conditionnel -5 % → 532 €
3. Pas de taxe Accessoires
4. Volume -10 % → 478,80 € **< 500 €**
5. Annulation `conditional-500`, replay : 560 → volume -10 % → **504 €**

---

## Extensibilité

Les règles sont déclaratives (`id`, `phase`, `priority`, `dependencies`, `applies`, `apply`) dans `src/domain/pricing/rules.ts`. Ajouter un seuil ou une promo = enregistrer une règle dans le catalogue, sans réécrire l'orchestrateur (`engine.ts`).
