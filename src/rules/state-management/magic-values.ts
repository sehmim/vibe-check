import traverse, { NodePath } from '@babel/traverse';
import { StringLiteral, NumericLiteral } from '@babel/types';
import { RuleContext, Suggestion } from '../../types';

export function detectMagicValues(context: RuleContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const literalCounts = new Map<string, Array<{ line: number, value: any }>>();

  traverse(context.ast, {
    StringLiteral(path: NodePath<StringLiteral>) {
      // Skip JSX attribute values and imports
      if (path.parent.type === 'JSXAttribute' || 
          path.parent.type === 'ImportDeclaration') return;
      
      const value = path.node.value;
      // Only flag meaningful strings (not single chars, not obvious values)
      if (value.length > 2 && !['', ' ', 'true', 'false'].includes(value)) {
        if (!literalCounts.has(value)) {
          literalCounts.set(value, []);
        }
        literalCounts.get(value)!.push({
          line: path.node.loc?.start.line || 0,
          value
        });
      }
    },

    NumericLiteral(path: NodePath<NumericLiteral>) {
      // Skip obvious values like 0, 1, 2, etc.
      const value = path.node.value;
      if (value > 2 && value !== 10 && value !== 100) {
        const key = `number:${value}`;
        if (!literalCounts.has(key)) {
          literalCounts.set(key, []);
        }
        literalCounts.get(key)!.push({
          line: path.node.loc?.start.line || 0,
          value
        });
      }
    }
  });

  // Flag repeated literals
  literalCounts.forEach((occurrences, value) => {
    if (occurrences.length >= 3) {
      const firstOccurrence = occurrences[0];
      suggestions.push({
        rule: 'magic-values',
        category: 'state-management',
        message: `Magic value "${firstOccurrence.value}" repeated ${occurrences.length} times`,
        line: firstOccurrence.line,
        column: 1,
        actionable: 'Extract to a named constant or enum for better maintainability'
      });
    }
  });

  return suggestions;
}