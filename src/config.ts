import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SepLintConfig, RuleConfig, Severity } from './types.js';
const DEFAULT_CONFIG: SepLintConfig = { rules: {} };
export function loadConfig(configPath?: string): SepLintConfig {
  const c = configPath ? [resolve(configPath)] : [resolve('.seplintrc.json')];
  for (const p of c) {
    if (existsSync(p)) {
      const r: unknown = JSON.parse(readFileSync(p, 'utf8'));
      if (typeof r === 'object' && r !== null) return r as SepLintConfig;
    }
  }
  return DEFAULT_CONFIG;
}
export function getRuleSeverity(ruleId: string, config: SepLintConfig): Severity | 'off' {
  const e = config.rules?.[ruleId];
  if (e === undefined) return 'error';
  if (typeof e === 'string') return e;
  return (e as RuleConfig).severity ?? 'error';
}
export function isRuleEnabled(ruleId: string, config: SepLintConfig): boolean {
  return getRuleSeverity(ruleId, config) !== 'off';
}
