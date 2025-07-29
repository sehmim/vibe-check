#!/usr/bin/env node
const { Command } = require('commander');
const { existsSync } = require('fs');
const { resolve } = require('path');
const { VibeCheckAnalyzer } = require('./analyzer');
const { loadConfig } = require('./config');
const { generateReport } = require('./reporter');
const { runRules, calculateScore } = require('./rules');

const program = new Command();

program
  .name('vibe-check')
  .description('🎯 Code quality analyzer for React applications')
  .version('1.0.2');

program
  .argument('[path]', 'Path to analyze (default: current directory)', '.')
  .option('-c, --config <path>', 'Path to config file')
  .option('-f, --format <format>', 'Output format (console, json, junit)', 'console')
  .option('--rules <rules>', 'Comma-separated list of rule categories to run')
  .option('--ignore-config', 'Ignore config file and use defaults')
  .option('--score-only', 'Only show the overall score')
  .option('--verbose', 'Show detailed analysis information')
  .action(async (targetPath: string, options: {
    config?: string;
    format: string;
    rules?: string;
    ignoreConfig: boolean;
    scoreOnly: boolean;
    verbose: boolean;
  }) => {
    try {
      await runAnalysis(targetPath, options);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  });

// Add init command to create config file
program
  .command('init')
  .description('Initialize a .vibecheck.json config file')
  .action(() => {
    createConfigFile();
  });

// Add list-rules command
program
  .command('list-rules')
  .description('List all available rules and their descriptions')
  .action(() => {
    listRules();
  });

async function runAnalysis(targetPath: string, options: any) {
  // Validate target path
  const fullPath = resolve(targetPath);
  if (!existsSync(fullPath)) {
    console.error(`❌ Path does not exist: ${targetPath}`);
    process.exit(1);
  }

  if (options.verbose) {
    console.log(`🎯 Running vibe check on: ${targetPath}`);
    console.log(`📁 Full path: ${fullPath}`);
  }

  // Load configuration
  const config = options.ignoreConfig ? 
    require('./config').DEFAULT_CONFIG : 
    loadConfig(options.config);

  if (options.verbose) {
    console.log(`⚙️  Config loaded`);
  }

  // Create analyzer
  const analyzer = new VibeCheckAnalyzer(config);

  // Run analysis
  const startTime = Date.now();
  const results = analyzer.analyzeDirectory(fullPath);
  const endTime = Date.now();

  if (options.verbose) {
    console.log(`📊 Analysis completed in ${endTime - startTime}ms`);
  }

  if (results.length === 0) {
    console.log('⚠️  No React files found to analyze');
    return;
  }

  // Calculate scores
  const ruleResults = results.map((result: any) => ({
    issues: result.issues,
    suggestions: result.suggestions,
    metrics: result.metrics || {}
  }));

  const scores = calculateScore(ruleResults, results.length);

  // Handle score-only option
  if (options.scoreOnly) {
    console.log(`Overall Score: ${scores.total}/100`);
    return;
  }

  // Generate and display report
  const reportData = {
    results,
    scores,
    config,
    analysisTime: endTime - startTime,
    totalFiles: results.length,
    options
  };

  switch (options.format.toLowerCase()) {
    case 'json':
      console.log(JSON.stringify(reportData, null, 2));
      break;
    case 'junit':
      generateJUnitReport(reportData);
      break;
    case 'console':
    default:
      generateReport(reportData);
      break;
  }

  // Exit with error code if there are errors
  const hasErrors = results.some((result: any) => 
    result.issues.some((issue: any) => issue.severity === 'error')
  );
  
  if (hasErrors) {
    process.exit(1);
  }
}

function createConfigFile() {
  const fs = require('fs');
  const configContent = {
    rules: {
      'prop-drilling-depth': 3,
      'max-component-lines': 150,
      'require-memo': true
    },
    ignore: [
      '**/*.test.tsx',
      '**/*.test.ts',
      '**/*.stories.tsx',
      '**/node_modules/**'
    ],
    severity: {
      'large-component': 'error',
      'unused-props': 'warning',
      'high-complexity': 'warning',
      'complex-jsx': 'warning', 
      'many-hooks': 'warning',
      'prop-drilling': 'error',
      'context-overuse': 'warning',
      'state-chaos': 'warning',
      'magic-values': 'warning',
      'messy-structure': 'warning',
      'missing-memo': 'warning',
      'missing-usememo': 'warning',
      'missing-usecallback': 'warning'
    }
  };

  if (fs.existsSync('.vibecheck.json')) {
    console.log('⚠️  .vibecheck.json already exists');
    return;
  }

  fs.writeFileSync('.vibecheck.json', JSON.stringify(configContent, null, 2));
  console.log('✅ Created .vibecheck.json configuration file');
}

function listRules() {
  const rules = [
    {
      category: '🎯 State Management',
      rules: [
        { name: 'prop-drilling', description: 'Detects props passed through multiple components without usage' },
        { name: 'context-overuse', description: 'Identifies excessive Context Provider nesting' },
        { name: 'state-chaos', description: 'Flags components with too many state hooks' },
        { name: 'magic-values', description: 'Finds repeated string/number literals that should be constants' },
        { name: 'messy-structure', description: 'Detects files with too many component definitions' }
      ]
    },
    {
      category: '🏗️ Component Quality',
      rules: [
        { name: 'large-component', description: 'Flags components that exceed size limits' },
        { name: 'unused-props', description: 'Detects props that are defined but never used' },
        { name: 'high-complexity', description: 'Identifies overly complex components' },
        { name: 'complex-jsx', description: 'Flags JSX structures that are too nested' },
        { name: 'many-hooks', description: 'Suggests extracting logic when too many hooks are used' }
      ]
    },
    {
      category: '⚡ Performance',
      rules: [
        { name: 'missing-memo', description: 'Suggests React.memo for optimization opportunities' },
        { name: 'missing-usememo', description: 'Suggests useMemo for expensive operations' },
        { name: 'missing-usecallback', description: 'Suggests useCallback for callback optimization' }
      ]
    }
  ];

  console.log('📋 Available Vibe Check Rules:\n');
  
  rules.forEach(category => {
    console.log(category.category);
    category.rules.forEach(rule => {
      console.log(`  • ${rule.name.padEnd(20)} - ${rule.description}`);
    });
    console.log('');
  });
}

function generateJUnitReport(reportData: any) {
  const totalTests = reportData.totalFiles;
  const failures = reportData.results.reduce((sum: number, result: any) => 
    sum + result.issues.filter((issue: any) => issue.severity === 'error').length, 0);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="vibe-check" tests="${totalTests}" failures="${failures}" time="${reportData.analysisTime / 1000}">
  <testsuite name="React Code Quality" tests="${totalTests}" failures="${failures}">
    ${reportData.results.map((result: any) => {
      const errors = result.issues.filter((issue: any) => issue.severity === 'error');
      return `<testcase name="${result.file}" classname="vibecheck">
        ${errors.map((error: any) => 
          `<failure message="${error.message}" type="${error.rule}">${error.suggestion || ''}</failure>`
        ).join('')}
      </testcase>`;
    }).join('')}
  </testsuite>
</testsuites>`;

  console.log(xml);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse CLI arguments
program.parse();