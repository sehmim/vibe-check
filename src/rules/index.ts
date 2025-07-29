import { RuleContext, RuleResult, Issue, Suggestion } from '../types';
import { analyzeStateManagement } from './state-management';
import { analyzeComponentQuality } from './component-quality';
import { analyzePerformance } from './performance';

export function runRules(context: RuleContext): RuleResult {
  const allIssues: Issue[] = [];
  const allSuggestions: Suggestion[] = [];
  const allMetrics: any = {};

  try {
    // Run state management rules
    const stateResult = analyzeStateManagement(context);
    allIssues.push(...stateResult.issues);
    allSuggestions.push(...stateResult.suggestions);
    Object.assign(allMetrics, stateResult.metrics);
  } catch (error) {
    console.warn(`Warning: State management analysis failed for ${context.filename}:`, error);
  }

  try {
    // Run component quality rules
    const qualityResult = analyzeComponentQuality(context);
    allIssues.push(...qualityResult.issues);
    allSuggestions.push(...qualityResult.suggestions);
    Object.assign(allMetrics, qualityResult.metrics);
  } catch (error) {
    console.warn(`Warning: Component quality analysis failed for ${context.filename}:`, error);
  }

  try {
    // Run performance rules
    const performanceResult = analyzePerformance(context);
    allIssues.push(...performanceResult.issues);
    allSuggestions.push(...performanceResult.suggestions);
    Object.assign(allMetrics, performanceResult.metrics);
  } catch (error) {
    console.warn(`Warning: Performance analysis failed for ${context.filename}:`, error);
  }

  return {
    issues: allIssues,
    suggestions: allSuggestions,
    metrics: allMetrics
  };
}

// Calculate overall score based on issues and file metrics (0-100 scale)
export function calculateScore(results: RuleResult[], totalFiles: number): {
  total: number;
  stateManagement: number;
  componentQuality: number;
  performance: number;
} {
  if (results.length === 0) {
    return { total: 100, stateManagement: 100, componentQuality: 100, performance: 100 };
  }

  // Count issues by category
  const issuesByCategory = {
    'state-management': 0,
    'component-quality': 0,
    'performance': 0
  };

  const suggestionsByCategory = {
    'state-management': 0,
    'component-quality': 0,
    'performance': 0
  };

  results.forEach(result => {
    result.issues.forEach(issue => {
      issuesByCategory[issue.category]++;
    });
    
    result.suggestions.forEach(suggestion => {
      suggestionsByCategory[suggestion.category]++;
    });
  });

  // Calculate scores (100 - penalty for issues/suggestions)
  const stateManagement = Math.max(0, 100 - (issuesByCategory['state-management'] * 15) - (suggestionsByCategory['state-management'] * 3));
  const componentQuality = Math.max(0, 100 - (issuesByCategory['component-quality'] * 15) - (suggestionsByCategory['component-quality'] * 3));
  const performance = Math.max(0, 100 - (issuesByCategory['performance'] * 15) - (suggestionsByCategory['performance'] * 3));

  const total = (stateManagement + componentQuality + performance) / 3;

  return {
    total: Math.round(total),
    stateManagement: Math.round(stateManagement),
    componentQuality: Math.round(componentQuality),
    performance: Math.round(performance)
  };
}