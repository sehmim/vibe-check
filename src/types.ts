import { Node } from '@babel/types';

export interface VibeCheckConfig {
  rules: {
    'prop-drilling-depth': number;
    'max-component-lines': number;
    'require-memo': boolean;
  };
  ignore: string[];
  severity: {
    'large-component': 'error' | 'warning' | 'info';
    'prop-drilling': 'error' | 'warning' | 'info';
    'missing-memo': 'error' | 'warning' | 'info';
    'context-overuse': 'error' | 'warning' | 'info';
    'state-chaos': 'error' | 'warning' | 'info';
    'magic-values': 'error' | 'warning' | 'info';
    'messy-structure': 'error' | 'warning' | 'info';
  };
}

export interface AnalysisResult {
  file: string;
  issues: Issue[];
  suggestions: Suggestion[];
  metrics: FileMetrics;
}

export interface Issue {
  rule: string;
  category: 'state-management' | 'component-quality' | 'performance';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  suggestion?: string;
  file?: string; // Add filename to issues
}

export interface Suggestion {
  rule: string;
  category: 'state-management' | 'component-quality' | 'performance';
  message: string;
  line: number;
  column: number;
  actionable: string;
  file?: string; // Add filename to suggestions
}

export interface FileMetrics {
  componentCount: number;
  averageComponentSize: number;
  totalLines: number;
  complexityScore: number;
  stateUsageCount?: number;
  propDrillingCount?: number;
}

export interface OverallScore {
  total: number;
  stateManagement: number;
  componentQuality: number;
  performance: number;
}

export interface RuleContext {
  config: VibeCheckConfig;
  filename: string;
  sourceCode: string;
  ast: Node;
}

export interface RuleResult {
  issues: Issue[];
  suggestions: Suggestion[];
  metrics: Partial<FileMetrics>;
}

export type RuleFunction = (context: RuleContext) => RuleResult;