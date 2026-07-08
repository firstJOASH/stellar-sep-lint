# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [1.0.0] - 2026-06-19

### Added

- SEP-1 validation rules (v2.7.0): missing-version, missing-network-passphrase, invalid-signing-key, invalid-accounts, https-required, deprecated-auth-server, direct-payment-requires-kyc, currency-missing-code, currency-code-too-long, currency-invalid-issuer, currency-invalid-status, currency-invalid-anchor-asset-type, currency-invalid-display-decimals
- SEP-24 validation rules (v3.8.0): info-missing-deposit, info-missing-withdraw, info-missing-enabled, invalid-status, transaction-missing-id, transaction-missing-kind, transaction-missing-status, transaction-missing-started-at, transaction-missing-more-info-url
- SEP-31 validation rules (v3.1.0): info-missing-receive, invalid-status, transaction-missing-id, transaction-missing-status, transaction-missing-stellar-account, transaction-pending-info-update-missing-updates
- CLI with terminal, github, and json output formats
- GitHub Action (composite) via action.yml
- Per-rule on/off/warn control via .seplintrc.json
- Dual CJS + ESM build output
