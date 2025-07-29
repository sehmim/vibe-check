import traverse from '@babel/traverse';
import { Node, isIdentifier, isFunctionDeclaration, isArrowFunctionExpression, isVariableDeclarator, isBlockStatement, isReturnStatement, isJSXElement } from '@babel/types';
import { RuleContext, RuleResult, Issue, Suggestion } from '../types';

export function analyzeComponentQuality(context: RuleContext): RuleResult {
  const issues: Issue[] = [];
  const suggestions: Suggestion[] = [];
  const metrics: any = {};

  const components = findComponents(context);
  
  // Analyze each component
  components.forEach(component => {
    // Check component size
    const sizeIssues = checkComponentSize(component, context);
    issues.push(...sizeIssues);

    // Check for unused props
    const unusedPropIssues = checkUnusedProps(component, context);
    issues.push(...unusedPropIssues);

    // Check component complexity
    const complexityIssues = checkComplexity(component, context);
    suggestions.push(...complexityIssues);
  });

  metrics.componentCount = components.length;
  metrics.averageComponentSize = components.length > 0 
    ? components.reduce((sum, comp) => sum + comp.lineCount, 0) / components.length 
    : 0;

  return {
    issues,
    suggestions,
    metrics
  };
}

interface ComponentInfo {
  name: string;
  node: Node;
  lineStart: number;
  lineEnd: number;
  lineCount: number;
  props: string[];
  usedIdentifiers: Set<string>;
}

function findComponents(context: RuleContext): ComponentInfo[] {
  const components: ComponentInfo[] = [];

  traverse(context.ast, {
    // Function declarations
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name && isReactComponent(name)) {
        const component = createComponentInfo(name, path.node, path);
        if (component) components.push(component);
      }
    },

    // Arrow function components
    VariableDeclarator(path) {
      if (isIdentifier(path.node.id) && isArrowFunctionExpression(path.node.init)) {
        const name = path.node.id.name;
        if (isReactComponent(name)) {
          const component = createComponentInfo(name, path.node.init, path);
          if (component) components.push(component);
        }
      }
    }
  });

  return components;
}

function createComponentInfo(name: string, node: Node, path: any): ComponentInfo | null {
  const loc = node.loc;
  if (!loc) return null;

  const lineStart = loc.start.line;
  const lineEnd = loc.end.line;
  const lineCount = lineEnd - lineStart + 1;

  // Extract props from function parameters
  const props: string[] = [];
  const usedIdentifiers = new Set<string>();

  // Get props from first parameter
  if ((isFunctionDeclaration(node) || isArrowFunctionExpression(node)) && node.params.length > 0) {
    const firstParam = node.params[0];
    if (firstParam.type === 'ObjectPattern') {
      firstParam.properties.forEach(prop => {
        if (prop.type === 'ObjectProperty' && isIdentifier(prop.key)) {
          props.push(prop.key.name);
        }
      });
    } else if (isIdentifier(firstParam)) {
      props.push('props'); // Generic props object
    }
  }

  // Track used identifiers in component body
  path.traverse({
    Identifier(innerPath: any) {
      usedIdentifiers.add(innerPath.node.name);
    }
  });

  return {
    name,
    node,
    lineStart,
    lineEnd,
    lineCount,
    props,
    usedIdentifiers
  };
}

function checkComponentSize(component: ComponentInfo, context: RuleContext): Issue[] {
  const issues: Issue[] = [];
  const maxLines = context.config.rules['max-component-lines'];

  if (component.lineCount > maxLines) {
    issues.push({
      rule: 'large-component',
      category: 'component-quality',
      severity: context.config.severity['large-component'],
      message: `Large component detected (${component.lineCount} lines, max: ${maxLines})`,
      line: component.lineStart,
      column: 1,
      suggestion: 'Consider breaking this component into smaller, more focused components'
    });
  }

  return issues;
}

function checkUnusedProps(component: ComponentInfo, context: RuleContext): Issue[] {
  const issues: Issue[] = [];

  component.props.forEach(prop => {
    if (prop !== 'props' && !component.usedIdentifiers.has(prop)) {
      issues.push({
        rule: 'unused-props',
        category: 'component-quality',
        severity: 'warning',
        message: `Unused prop detected: "${prop}"`,
        line: component.lineStart,
        column: 1,
        suggestion: `Remove unused prop "${prop}" or use it in the component`
      });
    }
  });

  return issues;
}

function checkComplexity(component: ComponentInfo, context: RuleContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let complexity = 0;
  let jsxElementCount = 0;
  let hookCount = 0;

  // We can't traverse individual nodes safely, so we'll use simpler heuristics
  // based on the component's line count and basic pattern matching
  const lineCount = component.lineCount;
  
  // Estimate complexity based on component size and patterns
  if (lineCount > 100) {
    complexity += Math.floor(lineCount / 20);
  }

  // High complexity warning based on size
  if (lineCount > 200) {
    suggestions.push({
      rule: 'high-complexity',
      category: 'component-quality',
      message: `Large component detected (${lineCount} lines) - likely high complexity`,
      line: component.lineStart,
      column: 1,
      actionable: 'Consider extracting logic into custom hooks or smaller components'
    });
  }

  return suggestions;
}

function isReactComponent(name: string): boolean {
  return name.length > 0 && name[0] === name[0].toUpperCase();
}