#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { loadConfig } from './config.js';
import { lintDirectory } from './linter.js';
import { formatTerminal } from './formatters/terminal.js';
import { formatGithub } from './formatters/github.js';
import { formatJson } from './formatters/json.js';
import type { OutputFormat } from './types.js';
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    format: { type: 'string', short: 'f', default: 'terminal' },
    config: { type: 'string', short: 'c' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
});
if (values.help || positionals.length === 0) {
  process.stdout.write(
    'Usage: stellar-sep-lint check <dir> [--format terminal|github|json] [-c config]\n',
  );
  process.exit(0);
}
const dir = resolve(positionals[1] ?? positionals[0] ?? process.cwd());
const config = loadConfig(values.config);
const results = lintDirectory(dir, config);
const fmt = (values.format ?? 'terminal') as OutputFormat;
const output =
  fmt === 'github'
    ? formatGithub(results)
    : fmt === 'json'
      ? formatJson(results)
      : formatTerminal(results);
process.stdout.write(output + '\n');
const hasErrors = results.some((r) => r.violations.some((v) => v.severity === 'error'));
process.exit(hasErrors ? 1 : 0);
