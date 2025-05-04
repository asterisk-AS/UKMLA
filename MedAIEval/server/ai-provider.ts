/**
 * AI Provider Selection Module
 * 
 * This module manages the selection between different AI providers (Mistral and OpenAI)
 * based on availability and functionality.
 */

// Import provider implementations
import * as mistralProvider from './ai-mistral';
import * as openaiProvider from './ai-openai';

// Define AI provider types
type AIProvider = 'mistral' | 'openai';

// Default provider order (try Mistral first, then OpenAI)
const providerOrder: AIProvider[] = ['mistral', 'openai'];

// Track failed providers to avoid retrying them
const failedProviders = new Set<AIProvider>();

// Track which provider is currently being used
let currentProvider: AIProvider | null = null;

/**
 * Tries to execute a function with each provider in order until one succeeds
 */
async function executeWithFallback<T>(func: (provider: typeof mistralProvider | typeof openaiProvider) => Promise<T>): Promise<T> {
  // Reset current provider tracking
  currentProvider = null;
  
  // Try each provider in the preferred order
  for (const provider of providerOrder) {
    // Skip providers that have previously failed
    if (failedProviders.has(provider)) {
      console.log(`Skipping previously failed provider: ${provider}`);
      continue;
    }
    
    try {
      console.log(`Attempting to use ${provider} provider...`);
      currentProvider = provider;
      
      // Execute the function with the selected provider
      const result = await func(provider === 'mistral' ? mistralProvider : openaiProvider);
      
      console.log(`Successfully used ${provider} provider`);
      return result;
    } catch (error) {
      console.error(`Error with ${provider} provider:`, error);
      failedProviders.add(provider);
      currentProvider = null;
    }
  }
  
  // If all providers failed, throw an error
  throw new Error('All AI providers failed. Please check your API credentials.');
}

/**
 * Generate questions with automatic provider fallback
 */
export async function generateQuestions(specialty: string, difficulty: string, count: number, topics?: string) {
  return executeWithFallback(provider => provider.generateQuestions(specialty, difficulty, count, topics));
}

/**
 * Evaluate answer with automatic provider fallback
 */
export async function evaluateAnswer(questionData: any, userAnswer: string) {
  return executeWithFallback(provider => provider.evaluateAnswer(questionData, userAnswer));
}

/**
 * Get the currently active provider name
 */
export function getCurrentProvider(): string | null {
  return currentProvider;
}

/**
 * Reset the failed providers list to try all providers again
 */
export function resetProviders(): void {
  failedProviders.clear();
  currentProvider = null;
  console.log('Reset AI providers - will try all providers on next request');
}
