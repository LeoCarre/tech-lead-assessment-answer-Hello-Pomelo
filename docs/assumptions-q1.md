# Assumptions - Question 1

These assumptions make ambiguous PDF requirements explicit and testable.

## Reference date

- Default reference date: **`2024-11-15T23:59:59.999Z`**
- Rationale: matches the latest timestamp in `data/orders.json` and keeps reports deterministic (no reliance on the machine clock).
- The date is injectable in `buildCustomerHistory({ referenceDate })` for tests.

## “Last six months”

- Window: **`[referenceDate − 6 calendar months at 00:00:00.000Z, referenceDate]`** (inclusive).
- Calendar months use UTC (`setUTCMonth`) with day overflow clamped; window start is normalized to UTC midnight so morning orders on the first day are included.
- Example: reference `2024-11-15T23:59:59.999Z` → window starts `2024-05-15T00:00:00.000Z`.

## Rhythm / granularity

- `monthsInAnalysisWindow = 6` (fixed length of the analysis window, not the count of months with activity).
- Rule (unchanged from project context):

  `orderCount / monthsInAnalysisWindow > 2` → group by **week**; otherwise by **month**.

- Weeks use **ISO week** keys (`YYYY-Www`), Monday start, UTC.
- Months use `YYYY-MM` keys, UTC.

## Period evolution (%)

- Formula: `((current - previous) / previous) * 100` on period **total amounts** (cents).
- First period: `evolutionPercent = null` (not `0`).
- Previous total `0`: `evolutionPercent = null` (division by zero is undefined for reporting).

## Order amount

- Computed from line items: `sum(product.priceCents * quantity)`.
- Product prices converted to integer cents at the infrastructure boundary.

## Anomalies

- Baseline: **customer average order amount** over the six-month window (not period average).
- Low: `amount < average * 0.5`
- High: `amount > average * 1.5`
- If average is `0` (no meaningful baseline), no anomaly is flagged.

## Data quality at the boundary

- `products.P018.price` string `"69.99"` → parsed then converted to cents.
- Missing / empty customer `type` (`C009`, `C012`) → normalized to `"Unknown"`.
- Unknown `product_id` in an order line (e.g. `P999` on `ORD-2024-079`) → line skipped for amount/categories (does not crash the report); known lines still count.
- Invalid dates / prices throw at normalization time rather than producing silent NaNs.

## Portfolio KPIs (vue Pilotage)

KPI choisis pour un gestionnaire relation client - lisibles, actionnables, alignés Q1 :

1. **Clients actifs** - clients avec ≥ 1 commande dans la fenêtre.
2. **Commandes** - volume d’activité.
3. **CA (GMV)** - chiffre d’affaires généré sur la fenêtre.
4. **Panier moyen (AOV)** - montant moyen par commande (portfolio).
5. **Taux d’anomalies** - part des commandes hors ±50 % de la moyenne **du client**.
6. **Rythme hebdo / mensuel** - répartition des clients selon la règle `> 2 cmd/mois`.

La sélection multi-clients (cases à cocher) **et multi-mois** recalcule ces KPI, la synthèse client et la liste des commandes. Le détail périodique par client respecte aussi le filtre mois. Le profil de rythme (hebdo/mensuel) reste celui calculé sur la fenêtre complète (identité d’achat du client).

La page Q1 expose deux modes :

- **Pilotage** (défaut) - vue portfolio multi-clients : KPI, filtres, patterns transverses, détail client.
- **Rapport historique** - livrable consignes : un client, périodes dynamiques, évolution, anomalies, justifications de pattern.

## Patterns multi-clients (vue Pilotage)

Détection déterministe sur la sélection filtrée (≥ 2 clients actifs) :

1. **Cohorte de rythme** - majorité hebdo vs mensuel (`orderCount / 6 > 2`).
2. **Segment type** - part du CA par `customer.type`.
3. **Catégories partagées** - catégories présentes chez ≥ 50 % des clients actifs.
4. **Anomalies fréquentes** - clients avec taux d’anomalies ≥ 25 % sur la sélection.
5. **Pic d’activité** - mois UTC au GMV maximal.
6. **Dispersion AOV** - paniers < 75 % ou > 125 % de la médiane des paniers moyens.

## Money

- All monetary arithmetic uses **integer cents**.
- Euros appear only for presentation / JSON API formatting.
