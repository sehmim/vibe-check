# 🎯 Vibe Check

> **Code quality analyzer for React applications with gamified scoring**

Analyze your React codebase and get a 0-100 score with actionable feedback on state management, component quality, and performance.

## ✨ Features

- **🎮 0-100 scoring system** - Gamified code quality measurement
- **📋 Table-based output** - Clean, scannable results like Istanbul coverage
- **🚨 Critical file identification** - See which files need refactoring most
- **🎯 Actionable insights** - Every issue includes guidance on what to improve
- **📚 Educational feedback** - Learn React best practices through detailed analysis
- **⚡ Fast analysis** - TypeScript/JavaScript React file analysis

## 🚀 Quick Start

```bash
# Install as dev dependency in your project (recommended)
npm install --save-dev vibe-check-code

# Or install globally
npm install -g vibe-check-code

# Add to your package.json scripts
{
  "scripts": {
    "vibe-check": "vibe-check ./src",
    "vibe-check:score": "vibe-check ./src --score-only",
    "vibe-check:json": "vibe-check ./src --format json"
  }
}

# Run analysis
npm run vibe-check

# Or run directly
npx vibe-check ./src
```

## 📊 Example Output

```
🎯 Vibe Check Results
Analyzed 45 files in 234ms

📊 Overall Score: 73/100 (Good vibes! 😊)

🔴 Issues Found (3)
────────────────────────────────────────────────────────────────────────────────
File                    │ Line     │ Category           │ Message
────────────────────────────────────────────────────────────────────────────────
Dashboard.tsx           │ 15:1     │ 🏗️ Component Quality │ Large component detected (300 lines)
UserProfile.tsx         │ 23:5     │ 🎯 State Management  │ State usage detected in component with props
ExpensiveList.tsx       │ 45:12    │ ⚡ Performance       │ Complex component - consider optimizations

🚨 Files That Need Refactoring (2)

1. 🔥 Dashboard.tsx
   Score: 23/100 | 2 errors | 1 warning | 5 suggestions
   🔥 CRITICAL: Immediate attention required!

📈 Score Breakdown:
  🎯 State Management: 85/100 [████████░░] Looking good!
  🏗️ Component Quality: 67/100 [██████░░░░] Room for improvement  
  ⚡ Performance: 78/100 [███████░░░] Looking good!
```

## 📋 Rules

### 🎯 State Management
- **Prop drilling detection** - Tracks props passed through 3+ components without usage
- **Context overuse analysis** - Identifies excessive Context Provider nesting (3+ levels)
- **State chaos detection** - Flags components with 5+ useState/useReducer hooks
- **Magic values identification** - Finds repeated string/number literals that should be constants
- **Messy structure analysis** - Detects files with 3+ component definitions

### 🏗️ Component Quality  
- **Large components** - Flags components over 150 lines (configurable)
- **Unused props** - Detects props that are defined but never used
- **High complexity** - Identifies components with too many decision points
- **Complex JSX** - Flags JSX structures with too many elements  
- **Many hooks** - Suggests extracting logic when components have too many hooks

### ⚡ Performance
- **Missing React.memo** - Suggests memo for complex components with props
- **Missing useMemo** - Identifies expensive operations without memoization
- **Missing useCallback** - Finds callback props that should be optimized

## ⚙️ Configuration

Create `.vibecheck.json` in your project root:

```json
{
  "rules": {
    "prop-drilling-depth": 3,
    "max-component-lines": 150,
    "require-memo": true
  },
  "ignore": [
    "**/*.test.tsx",
    "**/*.test.ts",
    "**/*.stories.tsx",
    "**/node_modules/**"
  ],
  "severity": {
    "large-component": "error",
    "unused-props": "warning",
    "high-complexity": "warning",
    "complex-jsx": "warning",
    "many-hooks": "warning",
    "prop-drilling": "error",
    "context-overuse": "warning",
    "state-chaos": "warning",
    "magic-values": "warning",
    "messy-structure": "warning",
    "missing-memo": "warning",
    "missing-usememo": "warning",
    "missing-usecallback": "warning"
  }
}
```

### Project Setup

```bash
# Initialize config in your React project
npx vibe-check init

# Add to package.json scripts
{
  "scripts": {
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "vibe-check": "vibe-check src/",
    "quality": "npm run lint && npm run type-check && npm run vibe-check"
  }
}
```

## 🛠️ CLI Commands

```bash
# Via npm scripts (recommended)
npm run vibe-check              # Run your configured analysis
npm run vibe-check:score        # Just show the score
npm run vibe-check:json         # JSON output for CI/CD

# Direct usage
npx vibe-check [path]           # Analyze directory
npx vibe-check --format json    # JSON output for CI/CD
npx vibe-check --score-only     # Just show the score
npx vibe-check --verbose        # Show detailed analysis information
npx vibe-check init             # Create config file
npx vibe-check list-rules       # Show all available rules
```

## 📊 Scoring

- **90-100**: Excellent vibes! 🚀
- **80-89**: Great vibes! 🌟  
- **70-79**: Good vibes! 😊
- **60-69**: Decent vibes 👍
- **50-59**: Mixed vibes 😐
- **0-49**: Needs attention 😱

**Penalty System:**
- Errors: -15 points
- Warnings: -8 points
- Suggestions: -2 points

## 💡 Why Use Vibe Check?

- **Learn React best practices** through detailed code analysis
- **Identify improvement opportunities** with clear guidance on what to change
- **Prioritize refactoring efforts** with critical file identification  
- **Track code quality progress** with quantified scoring
- **Understand codebase health** across team and projects
- **Educational tool** for developers to learn better React patterns
- **Table-based output** makes it easy to scan through many issues
- **Modular rule system** focuses on the most impactful React improvements
- **Integrate with existing workflows** via npm scripts and CI/CD pipelines

## 🤝 Contributing

We welcome contributions! Here's how you can help improve Vibe Check:

### 🐛 **Report Issues**
Found a bug or have a feature request?
1. Check existing [GitHub Issues](https://github.com/your-username/vibe-check/issues)
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Sample React code that demonstrates the issue

### 💡 **Suggest New Rules**
Have ideas for detecting React anti-patterns?
1. Open an issue with the `rule-suggestion` label
2. Include:
   - **Rule name** and description
   - **Detection method** - how to identify the pattern
   - **Suggestion** - what developers should do instead
   - **Code examples** showing good vs bad patterns

### 🔧 **Development Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/vibe-check.git
cd vibe-check

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# Test your changes on a project
cd /path/to/your/react/project
npm install --save-dev vibe-check-code
npm run vibe-check
```

### 📝 **Adding New Rules**

Vibe Check has a modular architecture that makes adding rules straightforward:

#### **State Management Rules**
Add to `src/rules/state-management/`:

```typescript
// src/rules/state-management/my-new-rule.ts
import traverse, { NodePath } from '@babel/traverse';
import { RuleContext, Issue } from '../../types';

export function detectMyNewRule(context: RuleContext): Issue[] {
  const issues: Issue[] = [];
  
  traverse(context.ast, {
    // Your AST traversal logic here
    CallExpression(path: NodePath) {
      // Example: detect specific patterns
      if (/* your condition */) {
        issues.push({
          rule: 'my-new-rule',
          category: 'state-management',
          severity: 'warning',
          message: 'Description of the issue',
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
          suggestion: 'How to fix this issue'
        });
      }
    }
  });
  
  return issues;
}
```

Then export it in `src/rules/state-management/index.ts`:

```typescript
import { detectMyNewRule } from './my-new-rule';

export function analyzeStateManagement(context: RuleContext): RuleResult {
  // ... existing rules
  const myNewRuleIssues = detectMyNewRule(context);
  issues.push(...myNewRuleIssues);
  // ...
}
```

#### **Component Quality & Performance Rules**
Follow the same pattern in their respective folders.

### 🧪 **Testing Your Changes**

```bash
# Build and test locally
npm run build

# Test on a real React project
vibe-check /path/to/your/react/project

# Test specific scenarios
mkdir test-cases
echo 'your test React code' > test-cases/example.tsx
vibe-check test-cases/
```

### 📋 **Pull Request Guidelines**

1. **Fork the repository** and create a feature branch
2. **Write clear commit messages** describing your changes
3. **Update documentation** if adding new rules or changing behavior
4. **Test thoroughly** on real React codebases
5. **Keep changes focused** - one feature/fix per PR

### 📚 **Documentation Improvements**

Help make Vibe Check more accessible:
- Improve rule descriptions and examples
- Add more configuration examples
- Create guides for common use cases
- Fix typos or unclear explanations

### 💬 **Community**

- **Discussions** - Share ideas and ask questions in GitHub Discussions
- **Issues** - Report bugs and request features
- **Pull Requests** - Contribute code improvements

### 📊 **Rule Quality Standards**

When contributing new rules, ensure they:
- **Minimize false positives** - avoid flagging valid React patterns
- **Provide clear guidance** - suggestions should be actionable
- **Handle edge cases** - robust error handling and graceful failures
- **Follow naming conventions** - use kebab-case for rule names
- **Include good examples** - demonstrate the pattern being detected

---

**Made with ❤️ for the React community**

*Keep those vibes high! ✨*