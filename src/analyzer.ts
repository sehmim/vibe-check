import { parse } from '@babel/parser';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { AnalysisResult, VibeCheckConfig, RuleContext } from './types';
import { shouldIgnoreFile } from './config';
import { runRules } from './rules';

export class VibeCheckAnalyzer {
  constructor(private config: VibeCheckConfig) {}

  analyzeDirectory(dirPath: string): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const files = this.getReactFiles(dirPath);

    for (const file of files) {
      if (shouldIgnoreFile(file, this.config.ignore)) {
        continue;
      }

      try {
        const result = this.analyzeFile(file);
        results.push(result);
      } catch (error) {
        console.warn(`Warning: Could not analyze ${file}: ${error}`);
      }
    }

    return results;
  }

  analyzeFile(filePath: string): AnalysisResult {
    const sourceCode = readFileSync(filePath, 'utf-8');
    const ast = this.parseFile(sourceCode, filePath);

    const context: RuleContext = {
      config: this.config,
      filename: filePath,
      sourceCode,
      ast
    };

    const ruleResult = runRules(context);

    // Add filename to all issues and suggestions
    const issuesWithFile = ruleResult.issues.map(issue => ({
      ...issue,
      file: filePath.replace(process.cwd(), '').replace(/^\//, '')
    }));

    const suggestionsWithFile = ruleResult.suggestions.map(suggestion => ({
      ...suggestion,
      file: filePath.replace(process.cwd(), '').replace(/^\//, '')
    }));

    return {
      file: filePath,
      issues: issuesWithFile,
      suggestions: suggestionsWithFile,
      metrics: {
        componentCount: ruleResult.metrics.componentCount || 0,
        averageComponentSize: ruleResult.metrics.averageComponentSize || 0,
        totalLines: sourceCode.split('\n').length,
        complexityScore: ruleResult.metrics.complexityScore || 0,
        stateUsageCount: ruleResult.metrics.stateUsageCount || 0,
        propDrillingCount: ruleResult.metrics.propDrillingCount || 0
      }
    };
  }

  private parseFile(sourceCode: string, filename: string) {
    const isTypeScript = filename.endsWith('.tsx') || filename.endsWith('.ts');
    
    const plugins: any[] = [
      'jsx',
      'decorators-legacy',
      'classProperties',
      'objectRestSpread',
      'functionBind',
      'exportDefaultFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining',
      'importMeta'
    ];

    if (isTypeScript) {
      plugins.push('typescript');
    }
    
    try {
      return parse(sourceCode, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        allowUndeclaredExports: true,
        strictMode: false,
        plugins
      });
    } catch (error) {
      // Try with different source type if module parsing fails
      try {
        return parse(sourceCode, {
          sourceType: 'script',
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          allowUndeclaredExports: true,
          strictMode: false,
          plugins
        });
      } catch (secondError) {
        throw new Error(`Failed to parse ${filename}: ${error}`);
      }
    }
  }

  private getReactFiles(dirPath: string): string[] {
    const files: string[] = [];
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    const excludePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '__tests__',
      '.test.',
      '.spec.',
      'test.',
      'spec.',
      '.config.',
      'config.'
    ];

    const scanDirectory = (currentPath: string) => {
      const items = readdirSync(currentPath);

      for (const item of items) {
        const fullPath = join(currentPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip common non-source directories
          if (!excludePatterns.some(pattern => item.includes(pattern))) {
            scanDirectory(fullPath);
          }
        } else if (extensions.includes(extname(item))) {
          // Skip test files and config files
          if (!excludePatterns.some(pattern => item.includes(pattern))) {
            files.push(fullPath);
          }
        }
      }
    };

    scanDirectory(dirPath);
    return files;
  }
}