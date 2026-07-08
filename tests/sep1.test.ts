import { describe, it, expect } from 'vitest';
import * as TOML from '@iarna/toml';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateSep1 } from '../src/rules/sep1.js';
import type { RuleContext } from '../src/types.js';

const ctx = (file: string): RuleContext => ({ file, config: { rules: {} } });

const load = (p: string): Record<string, unknown> => TOML.parse(readFileSync(resolve(p), 'utf8')) as Record<string, unknown>;

describe('SEP-1 passing fixture', () => {
  it('produces no violations for a valid stellar.toml', () => {
    const doc = load('tests/fixtures/sep1/passing/stellar.toml');
    const viols = validateSep1(doc, ctx('stellar.toml'));
    expect(viols).toHaveLength(0);
  });
});

describe('SEP-1 failing fixture', () => {
  it('flags missing VERSION and NETWORK_PASSPHRASE', () => {
    const doc = load('tests/fixtures/sep1/failing/stellar.toml');
    const viols = validateSep1(doc, ctx('stellar.toml'));
    const ids = viols.map(v => v.ruleId);
    expect(ids).toContain('sep1/missing-version');
    expect(ids).toContain('sep1/missing-network-passphrase');
  });
  it('flags invalid SIGNING_KEY', () => {
    const doc = load('tests/fixtures/sep1/failing/stellar.toml');
    const ids = validateSep1(doc, ctx('stellar.toml')).map(v => v.ruleId);
    expect(ids).toContain('sep1/invalid-signing-key');
  });
  it('flags deprecated AUTH_SERVER', () => {
    const doc = load('tests/fixtures/sep1/failing/stellar.toml');
    const ids = validateSep1(doc, ctx('stellar.toml')).map(v => v.ruleId);
    expect(ids).toContain('sep1/deprecated-auth-server');
  });
  it('flags http (non-https) server URL', () => {
    const doc = load('tests/fixtures/sep1/failing/stellar.toml');
    const ids = validateSep1(doc, ctx('stellar.toml')).map(v => v.ruleId);
    expect(ids).toContain('sep1/https-required');
  });
  it('flags invalid currency code length, issuer, status, display_decimals', () => {
    const doc = load('tests/fixtures/sep1/failing/stellar.toml');
    const ids = validateSep1(doc, ctx('stellar.toml')).map(v => v.ruleId);
    expect(ids).toContain('sep1/currency-code-too-long');
    expect(ids).toContain('sep1/currency-invalid-issuer');
    expect(ids).toContain('sep1/currency-invalid-status');
    expect(ids).toContain('sep1/currency-invalid-display-decimals');
  });
  it('respects rule being disabled in config', () => {
    const doc = load('tests/fixtures/sep1/failing/stellar.toml');
    const disabledCtx: RuleContext = { file: 'stellar.toml', config: { rules: { 'sep1/missing-version': 'off' } } };
    const ids = validateSep1(doc, disabledCtx).map(v => v.ruleId);
    expect(ids).not.toContain('sep1/missing-version');
  });
});
