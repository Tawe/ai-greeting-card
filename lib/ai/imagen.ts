import { config } from '../config';
import { Vibe } from '../types';

/**
 * Generate cover image with retry logic for transient failures
 */
async function generateCoverImageWithRetry(
  vibe: Vibe,
  occasion: string,
  maxRetries: number = 3
): Promise<Buffer> {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateCoverImageInternal(vibe, occasion);
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
          errorMessage.includes('not found') ||
          (errorMessage.includes('400') && !errorMessage.includes('503') && !errorMessage.includes('429'))
        ) {
          throw error; // Don't retry on these errors
        }
        
        // 503 (Service Unavailable) and 429 (Rate Limited) should be retried
      }
      
      // Wait before retrying (exponential backoff)
      // For 503 errors, use longer delays
      if (attempt < maxRetries) {
        const is503 = lastError.message.includes('503') || lastError.message.includes('overloaded');
        const baseDelay = is503 ? 2000 : 1000; // Start with 2s for 503, 1s for others
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), is503 ? 30000 : 10000); // Max 30s for 503, 10s for others
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying image generation (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
      }
    }
  }
  
  throw new Error(`Failed to generate image after ${maxRetries} attempts: ${lastError?.message}`);
}

async function generateCoverImageInternal(
  vibe: Vibe,
  occasion: string
): Promise<Buffer> {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  const vibeDescriptions: Record<Vibe, string> = {
    warm: 'warm, cozy, inviting atmosphere with soft lighting',
    funny: 'playful, whimsical, lighthearted scene',
    fancy: 'elegant, sophisticated, refined composition',
    chaotic: 'energetic, vibrant, dynamic scene',
  };

  const prompt = `Create a ${vibeDescriptions[vibe]} holiday card cover image for ${occasion}. 

Requirements:
- Clean composition with good use of negative space
- Festive imagery aligned with ${occasion} theme
- NO TEXT OR WORDS in the image
- High quality, suitable for social sharing
- Professional illustration style`;

  try {
    // Use REST API directly - more reliable for Imagen
    // Try gemini-2.5-flash-image first (same as ArcaneForge), fallback to Imagen models
    const model = process.env.IMAGEN_MODEL_NAME || 'gemini-2.5-flash-image';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    // Format payload for REST API
    // Note: gemini-2.5-flash-image uses the same REST API format
    const payload: any = {
      contents: [
        {
          parts: [
            { text: prompt },
          ],
        },
      ],
    };

    // Add image config for aspect ratio (if using gemini-2.5-flash-image)
    if (model.includes('flash-image')) {
      payload.generationConfig = {
        imageConfig: {
          aspectRatio: '4:3', // Good for card covers
        },
      };
    }

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
    
    // Extract image from response
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No image was generated. Check the request parameters and prompt.');
    }

    const candidate = candidates[0];
    const parts = candidate.content?.parts;
    
    if (!parts || parts.length === 0) {
      throw new Error('No image data found in response');
    }

    // Find the image part - gemini-2.5-flash-image returns in parts[].inlineData
    // Imagen models may return in different format
    const imagePart = parts.find((part: any) => part.inlineData || part.image);
    
    if (!imagePart) {
      throw new Error('Image data not found in response parts');
    }

    // Extract base64 image data
    let imageBase64: string;
    
    if (imagePart.inlineData?.data) {
      // gemini-2.5-flash-image format (same as ArcaneForge)
      imageBase64 = imagePart.inlineData.data;
    } else if (imagePart.image) {
      // Handle different response formats
      imageBase64 = typeof imagePart.image === 'string' 
        ? imagePart.image 
        : imagePart.image.data || imagePart.image.base64;
    } else {
      throw new Error('Could not extract image data from response');
    }

    // Convert base64 to Buffer
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('Error generating cover image with Imagen:', error);
    throw new Error(`Failed to generate cover image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Public function with retry logic
 */
export async function generateCoverImage(
  vibe: Vibe,
  occasion: string
): Promise<Buffer> {
  return generateCoverImageWithRetry(vibe, occasion);
}
