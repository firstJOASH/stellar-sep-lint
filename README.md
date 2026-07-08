# stellar-sep-lint

Static analysis linter for [Stellar](https://stellar.org) anchor implementations. Validates **SEP-1**, **SEP-24**, and **SEP-31** compliance against local files — no live server required.

## Why?

Existing tools like the [Anchor Validation Suite](https://anchor-tests.stellar.org/) and the SDF demo wallet require a **live, deployed server** to run checks. `stellar-sep-lint` runs **statically in CI** against:

- A local `stellar.toml` file
- Captured/mocked JSON responses from SEP-24 and SEP-31 endpoints

This means you can catch compliance issues **before deployment**, on every PR.

## Installation

```bash
npm install -g stellar-sep-lint
# or use without installing:
npx stellar-sep-lint check ./fixtures
```

## CLI Usage

```bash
stellar-sep-lint check <directory> [options]

Options:
  -f, --format   Output format: terminal (default), github, json
  -c, --config   Path to config file (default: .seplintrc.json)
  -h, --help     Show help
```

### Examples

```bash
# Lint all files in ./fixtures, human-readable output
stellar-sep-lint check ./fixtures

# GitHub Actions inline annotations
stellar-sep-lint check ./fixtures --format github

# JSON output for tooling
stellar-sep-lint check ./fixtures --format json
```

Exit code is `1` if any `error`-severity violations are found, `0` otherwise.

## GitHub Action Usage

**Why composite action?** A composite action requires no Docker build, starts instantly, and runs on any GitHub-hosted runner. It installs the package from npm and runs the CLI — simpler to maintain than a Docker image.

```yaml
# .github/workflows/sep-lint.yml
name: SEP Compliance Lint
on: [push, pull_request]

jobs:
  sep-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Option A: use the action directly
      - uses: your-org/stellar-sep-lint@v1
        with:
          directory: ./fixtures
          format: github

      # Option B: run via npx (no action needed)
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx stellar-sep-lint check ./fixtures --format github
```

Violations appear as **inline PR annotations** when using `--format github`.

## File Detection

The linter auto-detects file type by name:

| Filename pattern         | Validated as        |
|--------------------------|---------------------|
| `stellar.toml`           | SEP-1               |
| `*sep24*info*.json`      | SEP-24 /info        |
| `*sep24*transactions*.json` | SEP-24 /transactions list |
| `*sep24*transaction*.json`  | SEP-24 single transaction |
| `*sep31*info*.json`      | SEP-31 /info        |
| `*sep31*transaction*.json`  | SEP-31 transaction  |

## Config File

Create `.seplintrc.json` in your project root to toggle rules:

```json
{
  "rules": {
    "sep1/missing-version": "warn",
    "sep1/deprecated-auth-server": "off",
    "sep24/invalid-status": "error"
  }
}
```

Each rule accepts: `"error"` (default), `"warn"`, or `"off"`.

## Rules Reference

### SEP-1 Rules

| Rule ID | Description | Spec Section |
|---------|-------------|--------------|
| `sep1/missing-version` | Missing VERSION field | §General Information |
| `sep1/missing-network-passphrase` | Missing NETWORK_PASSPHRASE | §General Information |
| `sep1/invalid-signing-key` | SIGNING_KEY is not a valid G... public key | §General Information |
| `sep1/invalid-accounts` | ACCOUNTS contains invalid Stellar keys | §General Information |
| `sep1/https-required` | Server URL fields must use https:// | §General Information |
| `sep1/deprecated-auth-server` | AUTH_SERVER is deprecated | §General Information |
| `sep1/direct-payment-requires-kyc` | DIRECT_PAYMENT_SERVER requires KYC_SERVER | SEP-31 §Prerequisites |
| `sep1/currency-missing-code` | CURRENCIES entry missing required `code` field | §Currency Documentation |
| `sep1/currency-code-too-long` | CURRENCIES code exceeds 12 characters | §Currency Documentation |
| `sep1/currency-invalid-issuer` | CURRENCIES issuer is not a valid Stellar key | §Currency Documentation |
| `sep1/currency-invalid-status` | CURRENCIES status is not a valid enum value | §Currency Documentation |
| `sep1/currency-invalid-anchor-asset-type` | anchor_asset_type is not a valid enum value | §Currency Documentation |
| `sep1/currency-invalid-display-decimals` | display_decimals must be integer 0-7 | §Currency Documentation |

### SEP-24 Rules

| Rule ID | Description | Spec Section |
|---------|-------------|--------------|
| `sep24/info-not-object` | /info response is not a JSON object | §Info |
| `sep24/info-missing-deposit` | /info missing required `deposit` object | §Info |
| `sep24/info-missing-withdraw` | /info missing required `withdraw` object | §Info |
| `sep24/info-missing-enabled` | Asset entry missing `enabled` field | §Info |
| `sep24/info-invalid-enabled` | Asset `enabled` field is not a boolean | §Info |
| `sep24/invalid-status` | transaction.status is not a valid SEP-24 status | §Transaction History |
| `sep24/transaction-missing-id` | transaction missing required `id` field | §Transaction History |
| `sep24/transaction-missing-kind` | transaction missing required `kind` field | §Transaction History |
| `sep24/transaction-invalid-kind` | transaction.kind must be deposit or withdrawal | §Transaction History |
| `sep24/transaction-missing-status` | transaction missing required `status` field | §Transaction History |
| `sep24/transaction-missing-started-at` | transaction missing required `started_at` field | §Transaction History |
| `sep24/transaction-missing-more-info-url` | transaction missing required `more_info_url` field | §Transaction History |

### SEP-31 Rules

| Rule ID | Description | Spec Section |
|---------|-------------|--------------|
| `sep31/info-not-object` | /info response is not a JSON object | §GET Info |
| `sep31/info-missing-receive` | /info missing required `receive` object | §GET Info |
| `sep31/info-invalid-receive` | /info `receive` is not an object | §GET Info |
| `sep31/info-invalid-asset-entry` | Asset entry in receive is not an object | §Asset Object Schema |
| `sep31/info-asset-invalid-min-amount` | min_amount must be a number | §Asset Object Schema |
| `sep31/info-asset-invalid-max-amount` | max_amount must be a number | §Asset Object Schema |
| `sep31/info-asset-invalid-fee-fixed` | fee_fixed must be a number | §Asset Object Schema |
| `sep31/info-asset-invalid-fee-percent` | fee_percent must be a number | §Asset Object Schema |
| `sep31/invalid-status` | transaction.status is not a valid SEP-31 status | §GET Transaction |
| `sep31/transaction-missing-id` | transaction missing required `id` field | §GET Transaction |
| `sep31/transaction-missing-status` | transaction missing required `status` field | §GET Transaction |
| `sep31/transaction-missing-stellar-account` | pending_sender transaction missing stellar_account_id | §GET Transaction |
| `sep31/transaction-pending-info-update-missing-updates` | pending_transaction_info_update missing required_info_updates | §GET Transaction |

## License

MIT
