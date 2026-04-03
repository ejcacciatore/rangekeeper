/**
 * OpenAI Client Singleton
 *
 * Exports a single configured OpenAI client instance and helper utilities
 * for common AI operations used throughout RangeKeeper.
 *
 * Usage:
 *   import { ai, chatCompletion, MODEL } from '@/lib/ai';
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const globalForAI = globalThis as unknown as { openai: OpenAI | undefined };

export const ai =
  globalForAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 60_000, // 60 second timeout for complex completions
  });

if (process.env.NODE_ENV !== 'production') {
  globalForAI.openai = ai;
}

// ---------------------------------------------------------------------------
// Model constants
// ---------------------------------------------------------------------------

/** Primary model — GPT-4o for complex reasoning (task decomposition, daily planning) */
export const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o';

/** Fast model — GPT-4o-mini for simple/frequent tasks (nudge generation, urgency scoring) */
export const MODEL_FAST = 'gpt-4o-mini';

// ---------------------------------------------------------------------------
// Core completion helper
// ---------------------------------------------------------------------------

export interface ChatCompletionOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Parse the response as JSON */
  json?: boolean;
}

/**
 * Sends a single-turn chat completion and returns the message content.
 * Throws on API errors (retries are handled by the client).
 */
export async function chatCompletion(options: ChatCompletionOptions): Promise<string> {
  const { system, user, model = MODEL, temperature = 0.3, maxTokens = 2048, json = false } = options;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const response = await ai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    response_format: json ? { type: 'json_object' } : { type: 'text' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }

  return content;
}

/**
 * Convenience wrapper that calls chatCompletion and parses the result as JSON.
 * Use for prompts that explicitly request structured output.
 */
export async function chatCompletionJSON<T = unknown>(
  options: Omit<ChatCompletionOptions, 'json'>
): Promise<T> {
  const raw = await chatCompletion({ ...options, json: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${raw.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Token estimation (rough heuristic: ~4 chars per token)
// ---------------------------------------------------------------------------

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Returns true if the combined prompt fits within the model's context window
 * with room for a response of maxResponseTokens.
 */
export function promptFitsContext(
  systemPrompt: string,
  userPrompt: string,
  maxResponseTokens = 2048,
  contextWindow = 128_000
): boolean {
  const inputTokens = estimateTokens(systemPrompt) + estimateTokens(userPrompt);
  return inputTokens + maxResponseTokens < contextWindow;
}
