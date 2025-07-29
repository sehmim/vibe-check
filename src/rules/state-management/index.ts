import { RuleContext, RuleResult } from '../../types';
import { detectPropDrilling } from './prop-drilling';
import { detectContextOveruse } from './context-overuse';
import { detectStateChaos } from './state-chaos';
import { detectMagicValues } from './magic-values';
import { detectMessyStructure } from './messy-structure';

export function analyzeStateManagement(context: RuleContext): RuleResult {
  const issues = [];
  const suggestions = [];

  try {
    // Enhanced state management analysis
    const propDrillingIssues = detectPropDrilling(context);
    issues.push(...propDrillingIssues);

    const contextOveruseIssues = detectContextOveruse(context);
    suggestions.push(...contextOveruseIssues);

    const stateChaosIssues = detectStateChaos(context);
    suggestions.push(...stateChaosIssues);

    const magicValueIssues = detectMagicValues(context);
    suggestions.push(...magicValueIssues);

    const messyStructureIssues = detectMessyStructure(context);
    suggestions.push(...messyStructureIssues);
  } catch (error) {
    // Graceful error handling - don't let one rule break the whole analysis
    console.warn(`Warning: State management analysis encountered an error: ${error}`);
  }

  return {
    issues,
    suggestions,
    metrics: {
      propDrillingCount: issues.filter(i => i.rule === 'prop-drilling').length,
      stateUsageCount: suggestions.filter(s => s.rule === 'state-chaos').length
    }
  };
}

// Export individual rule functions for testing or selective usage
export {
  detectPropDrilling,
  detectContextOveruse,
  detectStateChaos,
  detectMagicValues,
  detectMessyStructure
};