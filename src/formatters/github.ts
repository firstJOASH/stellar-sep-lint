import type { LintResult } from '../types.js';
export function formatGithub(results: LintResult[]): string {
  const lines: string[] = [];
  for (const r of results) {
    for (const viol of r.violations) {
      const file = viol.file ?? r.file;
      const line = viol.line ? ',line=' + viol.line : '';
      const level = viol.severity === 'error' ? 'error' : 'warning';
      lines.push(
        '::' + level + ' file=' + file + line + ',title=' + viol.ruleId + '::' + viol.message,
      );
    }
  }
  return lines.join('\n');
}
