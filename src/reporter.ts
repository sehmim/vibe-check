import chalk from 'chalk';
import { AnalysisResult, Issue, Suggestion, OverallScore } from './types';
import {
  FileScore,
  getScoreColor,
  getVibeEmoji,
  getVibeDescription,
  getScoreDescription,
  getCategoryIcon,
  getCategoryName,
  getSeverityColor,
  getSeverityIcon,
  createProgressBar,
  identifyProblematicFiles,
  getEncouragementMessage
} from './reporter-utils';

interface ReportData {
  results: AnalysisResult[];
  scores: OverallScore;
  config: any;
  analysisTime: number;
  totalFiles: number;
  options: any;
}

export function generateReport(data: ReportData) {
  console.log(''); // Start with a blank line
  
  // Header
  printHeader(data);
  
  // Overall Score
  printOverallScore(data.scores);
  
  // Issues and Suggestions
  const allIssues = data.results.flatMap(r => r.issues);
  const allSuggestions = data.results.flatMap(r => r.suggestions);
  
  if (allIssues.length > 0) {
    printIssues(allIssues);
  }
  
  if (allSuggestions.length > 0) {
    printSuggestions(allSuggestions, data.options.fix);
  }
  
  // Files that need refactoring
  const problematicFiles = identifyProblematicFiles(data.results);
  if (problematicFiles.length > 0) {
    printFilesToRefactor(problematicFiles);
  }
  
  // Score Breakdown
  printScoreBreakdown(data.scores);
  
  // Summary and encouragement
  printSummary(data);
  
  console.log(''); // End with a blank line
}

function printHeader(data: ReportData) {
  const title = chalk.bold.cyan('🎯 Vibe Check Results');
  const subtitle = chalk.gray(`Analyzed ${data.totalFiles} files in ${data.analysisTime}ms`);
  
  console.log(title);
  console.log(subtitle);
  console.log('');
}

function printOverallScore(scores: OverallScore) {
  const scoreColor = getScoreColor(scores.total);
  const vibeEmoji = getVibeEmoji(scores.total);
  
  const scoreText = chalk.bold(scoreColor(`📊 Overall Score: ${scores.total}/100`));
  const vibeText = chalk.gray(`(${getVibeDescription(scores.total)} ${vibeEmoji})`);
  
  console.log(`${scoreText} ${vibeText}`);
  console.log(chalk.gray('━'.repeat(50)));
  console.log('');
}

function printIssues(issues: Issue[]) {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  if (errors.length > 0) {
    console.log(chalk.red.bold(`🔴 Issues Found (${errors.length})`));
    printIssueTable(errors);
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`🟡 Warnings (${warnings.length})`));
    printIssueTable(warnings);
    console.log('');
  }
}

function printIssueTable(issues: Issue[]) {
  // Table headers
  const headers = ['File', 'Line', 'Category', 'Message'];
  const colWidths = [40, 8, 18, 60];
  
  // Print header
  console.log(chalk.gray('─'.repeat(colWidths.reduce((a, b) => a + b + 3, 0))));
  console.log(
    chalk.bold(padString(headers[0], colWidths[0])) + ' │ ' +
    chalk.bold(padString(headers[1], colWidths[1])) + ' │ ' +
    chalk.bold(padString(headers[2], colWidths[2])) + ' │ ' +
    chalk.bold(headers[3])
  );
  console.log(chalk.gray('─'.repeat(colWidths.reduce((a, b) => a + b + 3, 0))));
  
  // Print rows
  issues.forEach(issue => {
    const severityColor = issue.severity === 'error' ? chalk.red : chalk.yellow;
    const categoryIcon = getCategoryIcon(issue.category);
    const fileName = (issue.file || 'Unknown').replace(/^.*\//, ''); // Show just filename
    const location = `${issue.line}:${issue.column}`;
    const category = `${categoryIcon} ${getCategoryName(issue.category)}`;
    
    console.log(
      padString(fileName, colWidths[0]) + ' │ ' +
      chalk.gray(padString(location, colWidths[1])) + ' │ ' +
      padString(category, colWidths[2]) + ' │ ' +
      severityColor(truncateString(issue.message, colWidths[3]))
    );
    
    // Show suggestion on next line if exists
    if (issue.suggestion) {
      console.log(
        padString('', colWidths[0]) + ' │ ' +
        padString('', colWidths[1]) + ' │ ' +
        padString('', colWidths[2]) + ' │ ' +
        chalk.green('💡 ' + truncateString(issue.suggestion, colWidths[3] - 3))
      );
    }
  });
}

function printSuggestions(suggestions: Suggestion[], showFix: boolean) {
  console.log(chalk.blue.bold(`💡 Suggestions (${suggestions.length})`));
  
  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);
  
  Object.entries(groupedSuggestions).forEach(([category, categorySuggestions]) => {
    console.log(`\n${getCategoryIcon(category as any)} ${chalk.bold(getCategoryName(category as any))}`);
    printSuggestionTable(categorySuggestions, showFix);
  });
  
  console.log('');
}

function printSuggestionTable(suggestions: Suggestion[], showFix: boolean) {
  // Table headers
  const headers = ['File', 'Line', 'Message', showFix ? 'Action' : ''];
  const colWidths = showFix ? [40, 8, 50, 50] : [40, 8, 80];
  
  // Print header
  console.log(chalk.gray('─'.repeat(colWidths.reduce((a, b) => a + b + 3, 0))));
  const headerRow = headers.slice(0, showFix ? 4 : 3).map((header, i) => 
    chalk.bold(padString(header, colWidths[i]))
  ).join(' │ ');
  console.log(headerRow);
  console.log(chalk.gray('─'.repeat(colWidths.reduce((a, b) => a + b + 3, 0))));
  
  // Print rows
  suggestions.forEach(suggestion => {
    const fileName = (suggestion.file || 'Unknown').replace(/^.*\//, '');
    const location = `${suggestion.line}:${suggestion.column}`;
    
    const row = [
      padString(fileName, colWidths[0]),
      chalk.gray(padString(location, colWidths[1])),
      chalk.blue(truncateString(suggestion.message, colWidths[2]))
    ];
    
    if (showFix && suggestion.actionable) {
      row.push(chalk.green(truncateString(suggestion.actionable, colWidths[3])));
    }
    
    console.log(row.join(' │ '));
  });
}

// Helper functions for table formatting
function padString(str: string, width: number): string {
  // Remove ANSI color codes for length calculation
  const cleanStr = str.replace(/\u001b\[[0-9;]*m/g, '');
  const padding = Math.max(0, width - cleanStr.length);
  return str + ' '.repeat(padding);
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

function printFilesToRefactor(files: FileScore[]) {
  console.log(chalk.red.bold(`🚨 Files That Need Refactoring (${files.length})`));
  console.log('');
  
  files.forEach((file, index) => {
    const severityColor = getSeverityColor(file.severity);
    const severityIcon = getSeverityIcon(file.severity);
    const scoreColor = getScoreColor(file.score);
    
    console.log(`${index + 1}. ${severityIcon} ${chalk.bold(file.file)}`);
    console.log(`   Score: ${scoreColor(`${file.score}/100`)} | ${chalk.red(`${file.errorCount} errors`)} | ${chalk.yellow(`${file.warningCount} warnings`)} | ${chalk.blue(`${file.suggestions} suggestions`)}`);
    
    if (file.severity === 'critical') {
      console.log(`   ${chalk.red.bold('🔥 CRITICAL: Immediate attention required!')}`);
    } else if (file.severity === 'high') {
      console.log(`   ${chalk.yellow.bold('⚠️  HIGH: Should be refactored soon')}`);
    }
    
    console.log('');
  });
}

function printScoreBreakdown(scores: OverallScore) {
  console.log(chalk.bold('📈 Score Breakdown:'));
  
  const categories = [
    { name: 'State Management', score: scores.stateManagement, icon: '🎯' },
    { name: 'Component Quality', score: scores.componentQuality, icon: '🏗️' },
    { name: 'Performance', score: scores.performance, icon: '⚡' }
  ];
  
  categories.forEach(category => {
    const scoreColor = getScoreColor(category.score);
    const bar = createProgressBar(category.score);
    const description = getScoreDescription(category.score);
    
    console.log(`  ${category.icon} ${category.name}: ${scoreColor(`${category.score}/100`)} ${bar} ${chalk.gray(description)}`);
  });
  
  console.log('');
}

function printSummary(data: ReportData) {
  console.log(chalk.gray('━'.repeat(50)));
  
  const totalIssues = data.results.flatMap(r => r.issues).length;
  const totalSuggestions = data.results.flatMap(r => r.suggestions).length;
  const problematicFiles = identifyProblematicFiles(data.results);
  
  // Encouraging message based on score
  const encouragement = getEncouragementMessage(data.scores.total, totalIssues, totalSuggestions);
  console.log(encouragement);
  
  // Next steps
  if (totalIssues > 0 || totalSuggestions > 0) {
    console.log('');
    console.log(chalk.gray('Next steps:'));
    
    if (problematicFiles.length > 0) {
      const criticalFiles = problematicFiles.filter(f => f.severity === 'critical').length;
      if (criticalFiles > 0) {
        console.log(chalk.gray(`• Start with ${criticalFiles} critical file${criticalFiles > 1 ? 's' : ''} listed above`));
      }
    }
    
    if (totalIssues > 0) {
      console.log(chalk.gray('• Focus on fixing errors first (🔴)'));
    }
    console.log(chalk.gray('• Run vibe-check regularly to maintain code quality'));
  }
}