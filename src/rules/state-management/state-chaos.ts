import traverse, { NodePath } from '@babel/traverse';
import { isIdentifier, isFunctionDeclaration, isArrowFunctionExpression, CallExpression } from '@babel/types';
import { RuleContext, Suggestion } from '../../types';

export function detectStateChaos(context: RuleContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const componentStates = new Map<string, { stateCount: number, line: number }>();

  // Track state usage per component
  traverse(context.ast, {
    CallExpression(path: NodePath<CallExpression>) {
      if (isIdentifier(path.node.callee) && 
          (path.node.callee.name === 'useState' || path.node.callee.name === 'useReducer')) {
        
        // Find the containing component
        const componentFunction = path.getFunctionParent();
        if (componentFunction && 
            (isFunctionDeclaration(componentFunction.node) || isArrowFunctionExpression(componentFunction.node))) {
          
          let componentName = 'Unknown';
          if (isFunctionDeclaration(componentFunction.node) && componentFunction.node.id) {
            componentName = componentFunction.node.id.name;
          } else if (componentFunction.parent && 
                     componentFunction.parent.type === 'VariableDeclarator' &&
                     isIdentifier(componentFunction.parent.id)) {
            componentName = componentFunction.parent.id.name;
          }

          if (isReactComponent(componentName)) {
            const existing = componentStates.get(componentName) || { stateCount: 0, line: 0 };
            existing.stateCount++;
            existing.line = path.node.loc?.start.line || 0;
            componentStates.set(componentName, existing);
          }
        }
      }
    }
  });

  // Flag components with excessive state
  componentStates.forEach((state, componentName) => {
    if (state.stateCount > 5) {
      suggestions.push({
        rule: 'state-chaos',
        category: 'state-management',
        message: `Component "${componentName}" has ${state.stateCount} state hooks - consider consolidation`,
        line: state.line,
        column: 1,
        actionable: 'Consolidate related state into useReducer or custom hooks'
      });
    }
  });

  return suggestions;
}

function isReactComponent(name: string): boolean {
  return name.length > 0 && name[0] === name[0].toUpperCase();
}