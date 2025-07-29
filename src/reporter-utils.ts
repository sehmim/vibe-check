import chalk from 'chalk';
import { AnalysisResult } from './types';

export interface FileScore {
  file: string;
  score: number;
  issues: number;
  suggestions: number;
  errorCount: number;
  warningCount: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// Score and color utilities
export function getScoreColor(score: number) {
  if (score >= 80) return chalk.green;
  if (score >= 60) return chalk.yellow;
  return chalk.red;
}

export function getVibeEmoji(score: number): string {
  if (score >= 90) return '🚀';
  if (score >= 80) return '🌟';
  if (score >= 70) return '😊';
  if (score >= 60) return '👍';
  if (score >= 50) return '😐';
  if (score >= 40) return '😕';
  return '😱';
}

export function getVibeDescription(score: number): string {
  if (score >= 90) return 'Excellent vibes!';
  if (score >= 80) return 'Great vibes!';
  if (score >= 70) return 'Good vibes!';
  if (score >= 60) return 'Decent vibes';
  if (score >= 50) return 'Mixed vibes';
  if (score >= 40) return 'Concerning vibes';
  return 'Needs attention';
}

export function getScoreDescription(score: number): string {
  if (score >= 80) return 'Looking good!';
  if (score >= 60) return 'Room for improvement';
  return 'Needs attention';
}

// Category utilities
export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'state-management': return '🎯';
    case 'component-quality': return '🏗️';
    case 'performance': return '⚡';
    default: return '📋';
  }
}

export function getCategoryName(category: string): string {
  switch (category) {
    case 'state-management': return 'State Management';
    case 'component-quality': return 'Component Quality';
    case 'performance': return 'Performance';
    default: return 'Other';
  }
}

// Severity utilities
export function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return chalk.red.bold;
    case 'high': return chalk.red;
    case 'medium': return chalk.yellow;
    default: return chalk.blue;
  }
}

export function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical': return '🔥';
    case 'high': return '⚠️';
    case 'medium': return '📋';
    default: return '📄';
  }
}

// Progress bar utility
export function createProgressBar(score: number, width: number = 10): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  return chalk.gray('[') + getScoreColor(score)(filledBar) + chalk.gray(emptyBar + ']');
}

// File analysis utilities
export function identifyProblematicFiles(results: AnalysisResult[]): FileScore[] {
  const fileScores: FileScore[] = results.map(result => {
    const errorCount = result.issues.filter(i => i.severity === 'error').length;
    const warningCount = result.issues.filter(i => i.severity === 'warning').length;
    const suggestionCount = result.suggestions.length;
    
    // Calculate file score (0-100)
    const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 8) - (suggestionCount * 2));
    
    // Determine severity level
    let severity: 'critical' | 'high' | 'medium' | 'low';
    if (errorCount >= 3 || score <= 30) severity = 'critical';
    else if (errorCount >= 1 || score <= 50) severity = 'high';
    else if (warningCount >= 2 || score <= 70) severity = 'medium';
    else severity = 'low';
    
    return {
      file: result.file.replace(process.cwd(), '').replace(/^\//, ''),
      score,
      issues: result.issues.length,
      suggestions: suggestionCount,
      errorCount,
      warningCount,
      severity
    };
  });

  // Only return files that need significant attention (score <= 70 or have errors)
  return fileScores
    .filter(fs => fs.score <= 70 || fs.errorCount > 0)
    .sort((a, b) => a.score - b.score) // Worst scores first
    .slice(0, 10); // Top 10 worst files
}

// Encouragement messages
export function getEncouragementMessage(score: number, issues: number, suggestions: number): string {
  if (score >= 90) {
    return chalk.green('🎉 Outstanding! Your code has excellent vibes. Keep up the great work!');
  }
  
  if (score >= 80) {
    return chalk.green('✨ Great job! Your code has solid fundamentals with just minor improvements needed.');
  }
  
  if (score >= 70) {
    return chalk.yellow('👍 Good work! Your code is on the right track. Focus on the suggestions to level up.');
  }
  
  if (score >= 60) {
    return chalk.yellow('💪 You\'re getting there! Address the main issues and you\'ll see significant improvement.');
  }
  
  if (score >= 50) {
    return chalk.red('🔧 Your code needs some attention, but don\'t worry - every issue is fixable!');
  }
  
  return chalk.red('🚨 Time for a refactor! Start with the critical issues and work your way through.');
}