import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateSep31Info, validateSep31Transaction } from '../src/rules/sep31.js';
import type { RuleContext } from '../src/types.js';

const ctx = (file: string): RuleContext => ({ file, config: { rules: {} } });
const loadJson = (p: string): unknown => JSON.parse(readFileSync(resolve(p), 'utf8'));

describe('SEP-31 /info passing', () => {
  it('produces no violations for valid info', () => {
    const raw = loadJson('tests/fixtures/sep31/passing/sep31-info.json');
    expect(validateSep31Info(raw, ctx('sep31-info.json'))).toHaveLength(0);
  });
});

describe('SEP-31 /info failing', () => {
  it('flags missing receive object', () => {
    const raw = loadJson('tests/fixtures/sep31/failing/sep31-info.json');
    const ids = validateSep31Info(raw, ctx('sep31-info.json')).map(v => v.ruleId);
    expect(ids).toContain('sep31/info-missing-receive');
  });
});

describe('SEP-31 transaction passing', () => {
  it('produces no violations for valid transaction', () => {
    const raw = loadJson('tests/fixtures/sep31/passing/sep31-transaction.json');
    expect(validateSep31Transaction(raw, ctx('sep31-transaction.json'))).toHaveLength(0);
  });
});

describe('SEP-31 transaction failing', () => {
  it('flags invalid status', () => {
    const raw = loadJson('tests/fixtures/sep31/failing/sep31-transaction.json');
    const ids = validateSep31Transaction(raw, ctx('sep31-transaction.json')).map(v => v.ruleId);
    expect(ids).toContain('sep31/invalid-status');
  });
  it('respects rule disabled in config', () => {
    const raw = loadJson('tests/fixtures/sep31/failing/sep31-transaction.json');
    const disabledCtx: RuleContext = { file: 'f', config: { rules: { 'sep31/invalid-status': 'off' } } };
    const ids = validateSep31Transaction(raw, disabledCtx).map(v => v.ruleId);
    expect(ids).not.toContain('sep31/invalid-status');
  });
});
