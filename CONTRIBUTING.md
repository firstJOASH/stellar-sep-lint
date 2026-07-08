# Contributing

## Setup

```bash
git clone https://github.com/your-org/stellar-sep-lint
cd stellar-sep-lint
npm install
```

## Development

```bash
npm run typecheck   # TypeScript type check
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Vitest
```

## Adding a Rule

1. Add the rule function in `src/rules/sep1.ts`, `sep24.ts`, or `sep31.ts`
2. Use the rule ID convention: `sep<N>/<kebab-description>` e.g. `sep1/missing-version`
3. Add a comment citing the exact spec section above the function
4. Add a passing fixture and a failing fixture under `tests/fixtures/sep<N>/`
5. Add test cases in `tests/sep<N>.test.ts` — at minimum one passing and one failing assertion
6. Document the rule in the Rules table in README.md

## Spec Sources

- SEP-1: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
- SEP-24: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md
- SEP-31: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] No type errors (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] New rule documented in README.md
- [ ] CHANGELOG.md updated
