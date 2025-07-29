import traverse, { NodePath } from '@babel/traverse';
import { isIdentifier, isFunctionDeclaration, isArrowFunctionExpression, FunctionDeclaration, VariableDeclarator } from '@babel/types';
import { RuleContext, Suggestion } from '../../types';

export function detectMessyStructure(context: RuleContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let componentCount = 0;
  const componentDefinitions: Array<{ name: string, line: number }> = [];

  traverse(context.ast, {
    FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
      const name = path.node.id?.name;
      if (name && isReactComponent(name)) {
        componentCount++;
        componentDefinitions.push({
          name,
          line: path.node.loc?.start.line || 0
        });
      }
    },

    VariableDeclarator(path: NodePath<VariableDeclarator>) {
      const node = path.node;
      if (isIdentifier(node.id) && isArrowFunctionExpression(node.init)) {
        const name = node.id.name;
        if (isReactComponent(name)) {
          componentCount++;
          componentDefinitions.push({
            name,
            line: node.loc?.start.line || 0
          });
        }
      }
    }
  });

  // Flag files with too many components
  if (componentCount > 3) {
    const firstComponent = componentDefinitions[0];
    suggestions.push({
      rule: 'messy-structure',
      category: 'state-management',
      message: `File contains ${componentCount} component definitions - consider splitting`,
      line: firstComponent?.line || 1,
      column: 1,
      actionable: 'Split components into separate files for better organization'
    });
  }

  return suggestions;
}

function isReactComponent(name: string): boolean {
  return name.length > 0 && name[0] === name[0].toUpperCase();
}