import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { VibeCheckConfig } from './types';

export const DEFAULT_CONFIG: VibeCheckConfig = {
  rules: {
    'prop-drilling-depth': 3,
    'max-component-lines': 150,
    'require-memo': true,
  },
  ignore: [
    '**/*.test.tsx',
    '**/*.test.ts', 
    '**/*.stories.tsx',
    '**/node_modules/**'
  ],
  severity: {
    'large-component': 'error',
    'prop-drilling': 'error',
    'missing-memo': 'warning',
    'context-overuse': 'warning',
    'state-chaos': 'warning',
    'magic-values': 'warning',
    'messy-structure': 'warning'
  }
};

export function loadConfig(configPath?: string): VibeCheckConfig {
  const possiblePaths = [
    configPath,
    '.vibecheck.json',
    '.vibecheck.js',
    'vibecheck.config.json'
  ].filter(Boolean) as string[];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, 'utf-8');
        const userConfig = JSON.parse(content);
        
        // Merge with defaults
        return {
          ...DEFAULT_CONFIG,
          ...userConfig,
          rules: { ...DEFAULT_CONFIG.rules, ...userConfig.rules },
          severity: { ...DEFAULT_CONFIG.severity, ...userConfig.severity }
        };
      } catch (error) {
        console.warn(`Warning: Could not parse config file ${path}`);
      }
    }
  }

  return DEFAULT_CONFIG;
}

export function shouldIgnoreFile(filePath: string, ignorePatterns: string[]): boolean {
  return ignorePatterns.some(pattern => {
    // Simple glob matching - for MVP, just check if path includes pattern
    const cleanPattern = pattern.replace(/\*\*/g, '').replace(/\*/g, '');
    return filePath.includes(cleanPattern);
  });
}