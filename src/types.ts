// Core types for stellar-sep-lint

export type Severity = 'error' | 'warn';

export interface LintViolation {
  ruleId: string;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  col?: number;
}

export interface LintResult {
  file: string;
  violations: LintViolation[];
}

export interface RuleConfig {
  severity?: Severity | 'off';
}

export interface SepLintConfig {
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
}

export type OutputFormat = 'terminal' | 'github' | 'json';

export interface CliOptions {
  format: OutputFormat;
  config?: string;
  dir: string;
}

// Rule context passed to each rule checker
export interface RuleContext {
  file: string;
  config: SepLintConfig;
}

// Unknown JSON boundary type – validated immediately after parsing
export type JsonUnknown = unknown;
