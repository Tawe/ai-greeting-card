import { config } from '../config';
import { Vibe } from '../types';

/**
 * Rewrite user message with AI, matching vibe and occasion
 * Includes retry logic for transient failures
 */
async function rewriteMessageInternal(
  message: string,
  vibe: Vibe,
  occasion: string
): Promise<string> {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  // Use REST API directly (same approach as image generation)
  // Using gemini-2.5-flash (same as ArcaneForge project)
  const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const vibeInstructions: Record<Vibe, string> = {
    warm: 'Make it warm, heartfelt, and sincere. Use gentle, comforting language.',
    funny: 'Make it lighthearted, playful, and humorous. Add wit and charm.',
    fancy: 'Make it elegant, sophisticated, and refined. Use polished, formal language.',
    chaotic: 'Make it energetic, wild, and fun. Use bold, enthusiastic language.',
  };

  const prompt = `You are a holiday card message writer. Rewrite the following message to be ${vibeInstructions[vibe]} The message is for ${occasion}.

Preserve the user's intent and meaning. Improve clarity and grammar. Avoid clichés and unsafe content.

IMPORTANT SAFETY RULES:
- Do not include any personal information (emails, phone numbers, addresses)
- Do not include hate speech, harassment, or threats
- Do not include defamatory statements about individuals
- If the message violates these rules, respond with only: "[CONTENT_BLOCKED]"
- Output ONLY the rewritten message as plain text, no quotes or formatting

Original message: ${message}

Rewritten message:`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.gemini.apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Extract text from response
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('No response generated. Check the request parameters and prompt.');
  }

  const candidate = candidates[0];
  const parts = candidate.content?.parts;
  
  if (!parts || parts.length === 0) {
    throw new Error('No text data found in response');
  }

  // Extract text from parts
  const textPart = parts.find((part: any) => part.text);
  if (!textPart || !textPart.text) {
    throw new Error('Text data not found in response parts');
  }

  let text = textPart.text.trim();
  
  // Check if AI blocked the content
  if (text.includes('[CONTENT_BLOCKED]') || text.toLowerCase().includes('content blocked')) {
    throw new Error('AI blocked the content as unsafe');
  }
  
  // Remove quotes if present
  text = text.replace(/^["']|["']$/g, '');
  
  return text;
}

export async function rewriteMessage(
  message: string,
  vibe: Vibe,
  occasion: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await rewriteMessageInternal(message, vibe, occasion);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors (auth, invalid params, etc.)
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        // Check for non-retryable errors
        if (
          errorMessage.includes('permission') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('api key') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('not supported') ||
          (errorMessage.includes('400') && !errorMessage.includes('503') && !errorMessage.includes('429'))
        ) {
          throw error; // Don't retry on these errors
        }
        
        // 503 (Service Unavailable) and 429 (Rate Limited) should be retried
        // These are transient errors that often resolve with retries
      }
      
      // Wait before retrying (exponential backoff)
      // For 503 errors, use longer delays
      if (attempt < maxRetries) {
        const is503 = lastError.message.includes('503') || lastError.message.includes('overloaded');
        const baseDelay = is503 ? 2000 : 1000; // Start with 2s for 503, 1s for others
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), is503 ? 30000 : 10000); // Max 30s for 503, 10s for others
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying message rewrite (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
      }
    }
  }
  
  throw new Error(`Failed to rewrite message after ${maxRetries} attempts: ${lastError?.message}`);
}

// Re-export image generation from imagen module
export { generateCoverImage } from './imagen';
