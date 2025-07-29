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
# Install
npm install -g vibe-check

# Analyze your React project
vibe-check ./src

# Show detailed insights
vibe-check ./src --fix
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
- **State placement analysis** - Suggests when state should be lifted up
- **Context opportunities** - Identifies when React Context could help

### 🏗️ Component Quality  
- **Large components** - Flags components over 150 lines (configurable)
- **Unused props** - Detects props that are defined but never used
- **Component complexity** - Identifies overly complex components

### ⚡ Performance
- **Missing React.memo** - Suggests memo for complex components with props
- **Optimization opportunities** - Identifies missing useMemo/useCallback patterns

## ⚙️ Configuration

Create `.vibecheck.json`:

```json
{
  "rules": {
    "max-component-lines": 150,
    "require-memo": true
  },
  "ignore": [
    "**/*.test.tsx",
    "**/node_modules/**"
  ],
  "severity": {
    "large-component": "error",
    "missing-memo": "warning"
  }
}
```

## 🛠️ CLI Commands

```bash
vibe-check [path]              # Analyze directory
vibe-check --fix               # Show detailed insights and guidance  
vibe-check --format json       # JSON output for CI/CD
vibe-check --score-only        # Just show the score
vibe-check init                # Create config file
vibe-check list-rules          # Show all available rules
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

---

**Keep those vibes high! ✨**