import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import * as TOML from '@iarna/toml';
import { validateSep1 } from './rules/sep1.js';
import {
  validateSep24Info,
  validateSep24Transaction,
  validateSep24Transactions,
} from './rules/sep24.js';
import { validateSep31Info, validateSep31Transaction } from './rules/sep31.js';
import type { LintResult, RuleContext, SepLintConfig } from './types.js';
function makeCtx(file: string, config: SepLintConfig): RuleContext {
  return { file, config };
}
export function lintFile(filePath: string, config: SepLintConfig): LintResult {
  const ctx = makeCtx(filePath, config);
  const name = basename(filePath).toLowerCase();
  const ext = extname(filePath).toLowerCase();
  try {
    const raw = readFileSync(filePath, 'utf8');
    if (name === 'stellar.toml') {
      const doc = TOML.parse(raw) as Record<string, unknown>;
      return { file: filePath, violations: validateSep1(doc, ctx) };
    }
    if (ext === '.json') {
      const parsed: unknown = JSON.parse(raw);
      if (name.includes('sep24') && name.includes('info'))
        return { file: filePath, violations: validateSep24Info(parsed, ctx) };
      if (name.includes('sep24') && name.includes('transactions'))
        return { file: filePath, violations: validateSep24Transactions(parsed, ctx) };
      if (name.includes('sep24') && name.includes('transaction'))
        return { file: filePath, violations: validateSep24Transaction(parsed, ctx) };
      if (name.includes('sep31') && name.includes('info'))
        return { file: filePath, violations: validateSep31Info(parsed, ctx) };
      if (name.includes('sep31') && name.includes('transaction'))
        return { file: filePath, violations: validateSep31Transaction(parsed, ctx) };
    }
  } catch (err) {
    return {
      file: filePath,
      violations: [
        {
          ruleId: 'parse-error',
          severity: 'error',
          message: 'Failed to parse: ' + (err instanceof Error ? err.message : String(err)),
          file: filePath,
        },
      ],
    };
  }
  return { file: filePath, violations: [] };
}
export function lintDirectory(dir: string, config: SepLintConfig): LintResult[] {
  const results: LintResult[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...lintDirectory(full, config));
    } else {
      const n = entry.toLowerCase();
      const e = extname(entry).toLowerCase();
      if (n === 'stellar.toml' || e === '.json') results.push(lintFile(full, config));
    }
  }
  return results;
}
