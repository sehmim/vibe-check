import traverse, { NodePath } from '@babel/traverse';
import { isJSXElement, isJSXAttribute, isIdentifier, isFunctionDeclaration, isArrowFunctionExpression, isVariableDeclarator } from '@babel/types';
import { RuleContext, Issue } from '../../types';

interface PropDrillingChain {
  propName: string;
  depth: number;
  components: Array<{
    name: string;
    line: number;
    isPassthrough: boolean;
  }>;
}

export function detectPropDrilling(context: RuleContext): Issue[] {
  const issues: Issue[] = [];
  const propChains = new Map<string, PropDrillingChain>();
  const components = new Map<string, { usesProps: Set<string>, line: number }>();

  // First pass: identify all components and their prop usage
  traverse(context.ast, {
    // Function components
    FunctionDeclaration(path: NodePath) {
      const node = path.node;
      if (isFunctionDeclaration(node)) {
        const name = node.id?.name;
        if (name && isReactComponent(name)) {
          const usedProps = getUsedPropsInComponent(path);
          components.set(name, {
            usesProps: usedProps,
            line: node.loc?.start.line || 0
          });
        }
      }
    },

    // Arrow function components
    VariableDeclarator(path: NodePath) {
      const node = path.node;
      if (isIdentifier((node as any).id) && isArrowFunctionExpression((node as any).init)) {
        const name = (node as any).id.name;
        if (isReactComponent(name)) {
          const usedProps = getUsedPropsInComponent(path);
          components.set(name, {
            usesProps: usedProps,
            line: node.loc?.start.line || 0
          });
        }
      }
    }
  });

  // Second pass: track prop flows through JSX
  traverse(context.ast, {
    JSXElement(path: NodePath) {
      if (!isJSXElement(path.node)) return;
      
      const openingElement = path.node.openingElement;
      if (!isIdentifier(openingElement.name)) return;

      const componentName = (openingElement.name as any).name;
      if (!isReactComponent(componentName)) return;

      const component = components.get(componentName);
      if (!component) return;

      // Check each prop being passed
      openingElement.attributes.forEach(attr => {
        if (isJSXAttribute(attr) && isIdentifier(attr.name)) {
          const propName = (attr.name as any).name;
          
          // Check if this is a passthrough (prop not used by this component)
          const isPassthrough = !component.usesProps.has(propName);
          
          if (!propChains.has(propName)) {
            propChains.set(propName, {
              propName,
              depth: 0,
              components: []
            });
          }

          const chain = propChains.get(propName)!;
          chain.components.push({
            name: componentName,
            line: attr.loc?.start.line || 0,
            isPassthrough
          });

          if (isPassthrough) {
            chain.depth++;
          }
        }
      });
    }
  });

  // Report prop drilling violations
  const maxDepth = context.config.rules['prop-drilling-depth'] || 3;
  propChains.forEach(chain => {
    if (chain.depth >= maxDepth) {
      const lastComponent = chain.components[chain.components.length - 1];
      issues.push({
        rule: 'prop-drilling',
        category: 'state-management',
        severity: context.config.severity['prop-drilling'] || 'error',
        message: `Prop "${chain.propName}" drilled through ${chain.depth} components without usage`,
        line: lastComponent.line,
        column: 1,
        suggestion: 'Use React Context or lift state to reduce prop drilling'
      });
    }
  });

  return issues;
}

function isReactComponent(name: string): boolean {
  return name.length > 0 && name[0] === name[0].toUpperCase();
}

function getUsedPropsInComponent(path: NodePath): Set<string> {
  const usedProps = new Set<string>();
  
  path.traverse({
    Identifier(innerPath: NodePath) {
      // Track identifiers that might be props
      const name = (innerPath.node as any).name;
      if (name && name !== 'React' && name !== 'useState' && name !== 'useEffect') {
        usedProps.add(name);
      }
    }
  });

  return usedProps;
}