import type { LintResult } from '../types.js';
export function formatTerminal(results: LintResult[]): string {
  const lines: string[] = [];
  let e = 0,
    w = 0;
  for (const r of results) {
    if (!r.violations.length) continue;
    lines.push('\n' + r.file);
    for (const viol of r.violations) {
      const loc = viol.line ? ':' + viol.line : '';
      const icon = viol.severity === 'error' ? '✖' : '⚠';
      lines.push('  ' + icon + ' ' + viol.ruleId + loc + '  ' + viol.message);
      if (viol.severity === 'error') e++;
      else w++;
    }
  }
  if (e === 0 && w === 0) lines.push('\n✔ No violations found.');
  else lines.push('\n' + e + ' error(s), ' + w + ' warning(s)');
  return lines.join('\n');
}
