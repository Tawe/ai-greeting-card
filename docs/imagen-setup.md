# Imagen API Setup Guide

This guide explains how to set up Google Imagen API for image generation using Google AI Studio.

## Prerequisites

- A Google account
- Access to [Google AI Studio](https://ai.google.dev/)

## Setup Steps

### 1. Get Your API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click on "Get API Key" in the left sidebar
4. Create a new API key or use an existing one
5. Copy your API key

### 2. Set Environment Variable

Add this to your `.env.local` file:

```bash
GEMINI_API_KEY=your-api-key-here
```

**That's it!** The same API key works for both:
- **Gemini** (text generation/rewriting)
- **Imagen** (image generation)

## Model Information

The implementation uses:
- **Model**: `imagen-3.0-generate-001` (or `imagen-4.0-generate-preview-06-06` for newer models)
- **Aspect Ratio**: 4:3 (optimized for card covers)
- **API**: Google Generative AI SDK (same as Gemini)

## Testing

Once configured, test the image generation:

```typescript
import { generateCoverImage } from '@/lib/ai/imagen';

const imageBuffer = await generateCoverImage('warm', 'christmas');
// Image buffer is ready to upload to S3/R2
```

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable is required"
- Make sure `GEMINI_API_KEY` is set in your `.env.local`
- Restart your development server after adding the key

### Error: "API key not valid" or "Permission denied"
- Verify your API key is correct
- Check that the API key hasn't been revoked in Google AI Studio
- Ensure you have access to Imagen models (may require enabling in Google AI Studio)

### Error: "No image was generated"
- Check that your prompt doesn't violate content policies
- Verify your API key has access to Imagen models
- Some models may be in preview and require special access

### Model Not Found
If `imagen-3.0-generate-001` is not available, try:
- `imagen-4.0-generate-preview-06-06` (newer preview model)
- Check [Google AI Studio](https://ai.google.dev/) for available models

## Cost Considerations

Imagen API pricing (via Google AI Studio):
- Imagen 3.0: ~$0.02-0.04 per image
- Imagen 4.0: ~$0.04-0.06 per image
- Consider implementing caching for similar prompts
- Monitor usage in Google AI Studio dashboard

## Benefits of Using Google AI Studio API

✅ **Simpler Setup**: Just one API key, no Google Cloud project needed  
✅ **Same SDK**: Uses `@google/generative-ai` (already installed)  
✅ **Unified Authentication**: Same key for text and images  
✅ **Easy Testing**: Test directly in Google AI Studio web interface  

## Fallback Options

If Imagen API is not available, you can:
1. Use a different image generation service (DALL-E, Stable Diffusion)
2. Use pre-generated template images
3. Generate images programmatically using libraries like `canvas` or `sharp`
