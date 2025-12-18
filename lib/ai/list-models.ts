/**
 * Utility script to list available Gemini models
 * Run with: npx tsx lib/ai/list-models.ts
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

async function listModels() {
  if (!config.gemini.apiKey) {
    console.error('GEMINI_API_KEY not set');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

  try {
    // List models using the REST API directly
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + config.gemini.apiKey
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('\n=== Available Gemini Models ===\n');
    
    if (data.models && Array.isArray(data.models)) {
      const textModels = data.models.filter((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      textModels.forEach((model: any) => {
        console.log(`Name: ${model.name}`);
        console.log(`  Display Name: ${model.displayName || 'N/A'}`);
        console.log(`  Description: ${model.description || 'N/A'}`);
        console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
      
      console.log('\n=== Recommended Models for Text Generation ===\n');
      textModels
        .filter((m: any) => m.name.includes('gemini') && !m.name.includes('embed'))
        .slice(0, 5)
        .forEach((model: any) => {
          console.log(`✓ ${model.name}`);
        });
    } else {
      console.log('No models found or unexpected response format');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error listing models:', error);
    process.exit(1);
  }
}

listModels();
