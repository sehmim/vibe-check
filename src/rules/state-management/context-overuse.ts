import traverse, { NodePath } from '@babel/traverse';
import { isJSXElement, isMemberExpression, isIdentifier, JSXElement } from '@babel/types';
import { RuleContext, Suggestion } from '../../types';

export function detectContextOveruse(context: RuleContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let nestedProviderDepth = 0;
  let maxNestedDepth = 0;
  const providerLocations: Array<{ line: number, depth: number }> = [];

  traverse(context.ast, {
    JSXElement: {
      enter(path: NodePath<JSXElement>) {
        const openingElement = path.node.openingElement;
        
        if (isMemberExpression(openingElement.name) && 
            isIdentifier((openingElement.name as any).property) &&
            (openingElement.name as any).property.name === 'Provider') {
          
          nestedProviderDepth++;
          maxNestedDepth = Math.max(maxNestedDepth, nestedProviderDepth);
          providerLocations.push({
            line: openingElement.loc?.start.line || 0,
            depth: nestedProviderDepth
          });
        }
      },
      exit(path: NodePath<JSXElement>) {
        const openingElement = path.node.openingElement;
        
        if (isMemberExpression(openingElement.name) && 
            isIdentifier((openingElement.name as any).property) &&
            (openingElement.name as any).property.name === 'Provider') {
          nestedProviderDepth--;
        }
      }
    }
  });

  // Flag excessive context nesting
  if (maxNestedDepth > 3) {
    const deepestProvider = providerLocations.find(p => p.depth === maxNestedDepth);
    suggestions.push({
      rule: 'context-overuse',
      category: 'state-management',
      message: `Excessive Context nesting detected (${maxNestedDepth} levels deep)`,
      line: deepestProvider?.line || 1,
      column: 1,
      actionable: 'Consider modularizing contexts or flattening the provider structure'
    });
  }

  return suggestions;
}