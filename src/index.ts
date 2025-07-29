// Main library exports for programmatic usage
export { VibeCheckAnalyzer } from './analyzer';
export { loadConfig, DEFAULT_CONFIG } from './config';
export { generateReport } from './reporter';
export { runRules, calculateScore } from './rules';
export * from './types';

// Convenience function for one-shot analysis
export async function analyze(
  path: string, 
  configPath?: string
): Promise<{
  results: import('./types').AnalysisResult[];
  scores: import('./types').OverallScore;
  config: import('./types').VibeCheckConfig;
}> {
  const { loadConfig } = await import('./config');
  const { VibeCheckAnalyzer } = await import('./analyzer');
  const { runRules, calculateScore } = await import('./rules');
  
  const config = loadConfig(configPath);
  const analyzer = new VibeCheckAnalyzer(config);
  const results = analyzer.analyzeDirectory(path);
  
  const ruleResults = results.map(result => runRules({
    config,
    filename: result.file,
    sourceCode: '',
    ast: {} as any
  }));
  
  const scores = calculateScore(ruleResults, results.length);
  
  return {
    results,
    scores,
    config
  };
}