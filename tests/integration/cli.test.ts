import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve('.');

function run(args: string, expectFail = false): { code: number; out: string } {
  try {
    const out = execSync(`npx tsx src/cli.ts ${args}`, {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, NODE_NO_WARNINGS: '1' }
    });
    return { code: 0, out };
  } catch (e: unknown) {
    const err = e as { status: number; stdout: string };
    if (expectFail) return { code: err.status ?? 1, out: err.stdout ?? '' };
    throw e;
  }
}

describe('CLI integration', () => {
  it('exits 0 for passing fixtures', () => {
    expect(run('check tests/fixtures/sep1/passing').code).toBe(0);
  });
  it('exits 1 for failing fixtures', () => {
    expect(run('check tests/fixtures/sep1/failing', true).code).toBe(1);
  });
  it('outputs github annotations on --format github', () => {
    const { out } = run('check tests/fixtures/sep1/failing --format github', true);
    expect(out).toMatch(/^::error /m);
  });
  it('outputs valid JSON on --format json', () => {
    const { out } = run('check tests/fixtures/sep1/failing --format json', true);
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty('results');
    expect(parsed).toHaveProperty('summary');
  });
});
