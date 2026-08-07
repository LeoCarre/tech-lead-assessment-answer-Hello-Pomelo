# Git Workflow

The assessment requires at least one commit per question. We use one logical change per commit.

## Format

`type(scope): imperative description`

Examples:

- `feat(q1): implement customer history aggregation`
- `test(q1): cover dynamic period grouping`
- `feat(q2): introduce pricing rule engine`
- `test(q2): cover dependency ordering`
- `docs(q3): document unified portal architecture`

## Before every commit

```bash
git status
git diff --check
npm test
npm run lint
npm run typecheck
git diff --staged
```

Only stage files belonging to the same logical change.

## Important

The rule is not "one commit for every file". It is "one coherent, reviewable logical modification per commit".

The final history must clearly contain work for Q1, Q2 and Q3.
