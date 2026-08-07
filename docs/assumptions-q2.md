# Assumptions - Question 2 (Pricing engine)

## Money

- All calculations use **integer cents**.
- Percentage impacts are rounded **per line** with `Math.round`.

## Base rules

- Applied on the gross line amounts (`unitPrice × quantity`).
- **VIP (-15 %)** and **Premium (-10 %)** are exclusive: a VIP customer never receives Premium.
- **First order of the month (-5 %)** stacks after the type discount when both apply.

## Conditional rules

- Evaluated on the total **after base rules**.
- Thresholds are **strict**: `> 500 €` and `> 1000 €` (exact 500 / 1000 do not trigger).
- `> 1000 €` applies **-8 %** and replaces `-5 %` (dependencies + priority, not accidental source order).

## Category taxes

- Applied **per line** after conditional discounts.
- Mapped categories (case-insensitive, FR/EN):
  - Électronique / Electronics → **+20 %**
  - Alimentaire / Food → **+5,5 %**
- Multi-category products use the **highest** applicable tax.

## Cumulative / re-evaluation

- If the **sum of quantities** sharing a normalized category is **> 3**, those lines get **-10 %**.
- If after this discount the **pre-final** total is **< 500 €** while `conditional-500` was active, that rule is **cancelled** and pre-final phases are **replayed**.
- Replays are capped (`MAX_REEVALUATIONS = 2`) to guarantee termination.

## Final rules

- Express delivery: **+15 €** (added to the first line for accounting).
- If the total **after** express is **< 50 €**: **+5 €** processing fee.
- Final fees do not participate in earlier threshold checks.

## Extensibility

- Rules are data + functions (`id`, `phase`, `priority`, `dependencies`, `applies`, `apply`).
- Adding a rule normally means registering it in the catalog, not rewriting orchestration.
