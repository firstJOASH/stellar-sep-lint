import type { LintResult } from '../types.js';
export function formatJson(results: LintResult[]): string {
  const totalErrors = results.reduce(
    (n, r) => n + r.violations.filter((v) => v.severity === 'error').length,
    0,
  );
  const totalWarnings = results.reduce(
    (n, r) => n + r.violations.filter((v) => v.severity === 'warn').length,
    0,
  );
  return JSON.stringify({ results, summary: { totalErrors, totalWarnings } }, null, 2);
}
