import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateSep24Info, validateSep24Transaction } from '../src/rules/sep24.js';
import type { RuleContext } from '../src/types.js';

const ctx = (file: string): RuleContext => ({ file, config: { rules: {} } });
const loadJson = (p: string): unknown => JSON.parse(readFileSync(resolve(p), 'utf8'));

describe('SEP-24 /info passing', () => {
  it('produces no violations for valid info', () => {
    const raw = loadJson('tests/fixtures/sep24/passing/sep24-info.json');
    expect(validateSep24Info(raw, ctx('sep24-info.json'))).toHaveLength(0);
  });
});

describe('SEP-24 /info failing', () => {
  it('flags missing withdraw object', () => {
    const raw = loadJson('tests/fixtures/sep24/failing/sep24-info.json');
    const ids = validateSep24Info(raw, ctx('sep24-info.json')).map(v => v.ruleId);
    expect(ids).toContain('sep24/info-missing-withdraw');
  });
  it('flags missing enabled field', () => {
    const raw = loadJson('tests/fixtures/sep24/failing/sep24-info.json');
    const ids = validateSep24Info(raw, ctx('sep24-info.json')).map(v => v.ruleId);
    expect(ids).toContain('sep24/info-missing-enabled');
  });
});

describe('SEP-24 transaction passing', () => {
  it('produces no violations for valid transaction', () => {
    const raw = loadJson('tests/fixtures/sep24/passing/sep24-transaction.json');
    expect(validateSep24Transaction(raw, ctx('sep24-transaction.json'))).toHaveLength(0);
  });
});

describe('SEP-24 transaction failing', () => {
  it('flags invalid status', () => {
    const raw = loadJson('tests/fixtures/sep24/failing/sep24-transaction.json');
    const ids = validateSep24Transaction(raw, ctx('sep24-transaction.json')).map(v => v.ruleId);
    expect(ids).toContain('sep24/invalid-status');
  });
  it('flags missing started_at', () => {
    const raw = loadJson('tests/fixtures/sep24/failing/sep24-transaction.json');
    const ids = validateSep24Transaction(raw, ctx('sep24-transaction.json')).map(v => v.ruleId);
    expect(ids).toContain('sep24/transaction-missing-started-at');
  });
  it('respects rule disabled in config', () => {
    const raw = loadJson('tests/fixtures/sep24/failing/sep24-transaction.json');
    const disabledCtx: RuleContext = { file: 'f', config: { rules: { 'sep24/invalid-status': 'off' } } };
    const ids = validateSep24Transaction(raw, disabledCtx).map(v => v.ruleId);
    expect(ids).not.toContain('sep24/invalid-status');
  });
});
