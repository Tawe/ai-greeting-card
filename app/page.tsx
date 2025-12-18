'use client';

import { useState, useEffect } from 'react';
import VibeSelector from '@/components/VibeSelector';
import MessageInput from '@/components/MessageInput';
import CardPreview from '@/components/CardPreview';
import CardCreationStep from '@/components/CardCreationStep';
import OccasionSelector from '@/components/OccasionSelector';
import GenerationLoadingScreen from '@/components/GenerationLoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';
import { Vibe } from '@/lib/types';
import { getOrCreateDeviceId } from '@/lib/utils/device-id';
import { getOccasionGradient, getOccasionPrimary, getOccasionPrimaryHover, getOccasionBorder } from '@/lib/occasions';

interface CardData {
  id: string;
  slug: string;
  occasion: string;
  vibe: Vibe;
  cleanMessage: string;
  coverImageUrl: string;
  status: string;
}

export default function Home() {
  const [occasion, setOccasion] = useState<string>('christmas');
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // Initialize device ID on mount
  useEffect(() => {
    getOrCreateDeviceId();
  }, []);

  const handleGenerate = async () => {
    if (!occasion || !vibe || !message.trim()) {
      setError('Please select an occasion, vibe, and enter a message');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    setGenerationProgress('Generating your card...');

    try {
      setGenerationProgress('Rewriting your message...');
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          occasion,
          vibe,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle different error types with user-friendly messages
        if (response.status === 429) {
          const resetAt = errorData.resetAt ? new Date(errorData.resetAt).toLocaleString() : 'later';
          throw new Error(`You've reached the rate limit. Please try again ${resetAt}`);
        }
        
        if (response.status === 400 && errorData.message) {
          // Content moderation or validation errors
          throw new Error(errorData.message);
        }
        
        if (response.status === 503) {
          throw new Error('AI service is temporarily unavailable. Please try again in a few moments.');
        }
        
        throw new Error(errorData.error || errorData.message || 'Failed to generate card. Please try again.');
      }

      setGenerationProgress('Finalizing your card...');
      const cardData = await response.json();
      setCard(cardData);
      setSuccess('Card generated successfully!');
      
      // Auto-scroll to preview
      setTimeout(() => {
        const previewElement = document.getElementById('card-preview');
        previewElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      console.error('Error generating card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate card. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const canGenerate = occasion && vibe && message.trim().length > 0;
  const occasionGradient = getOccasionGradient(occasion);
  const primaryColor = getOccasionPrimary(occasion);
  const primaryHoverColor = getOccasionPrimaryHover(occasion);
  const borderColor = getOccasionBorder(occasion);

  return (
    <div 
      className="min-h-screen occasion-background"
      style={{
        background: occasionGradient,
      }}
    >
      <main className="container mx-auto px-4 py-8 md:py-12 md:px-8">
        <div className="mx-auto" style={{ maxWidth: '840px' }}>
          {/* Loading Screen */}
          {isGenerating && (
            <div className="rounded-xl bg-white/95 p-8 shadow-xl backdrop-blur-sm">
              <GenerationLoadingScreen 
                occasion={occasion}
                onCancel={() => {
                  setIsGenerating(false);
                  setGenerationProgress('');
                }}
              />
            </div>
          )}

          {/* Creation Form */}
          {!isGenerating && !card && (
            <div className="rounded-xl bg-white/95 p-4 md:p-6 shadow-xl backdrop-blur-sm">
              <div className="space-y-4 md:space-y-6">
                {/* Step 1: Occasion */}
                <CardCreationStep
                  title="Choose Your Occasion"
                  subtitle="Select the holiday for your card"
                  stepNumber={1}
                  totalSteps={3}
                >
                  <OccasionSelector 
                    selectedOccasion={occasion} 
                    onOccasionSelect={setOccasion} 
                  />
                </CardCreationStep>

                {/* Step 2: Vibe */}
                <CardCreationStep
                  title="Choose a Vibe"
                  subtitle="Select the emotional tone for your card"
                  stepNumber={2}
                  totalSteps={3}
                >
                  <VibeSelector selectedVibe={vibe} onVibeSelect={setVibe} occasion={occasion} />
                </CardCreationStep>

                {/* Step 3: Message */}
                <CardCreationStep
                  title="Write Your Message"
                  subtitle="Share what's on your heart"
                  stepNumber={3}
                  totalSteps={3}
                >
                  <MessageInput message={message} onMessageChange={setMessage} />
                </CardCreationStep>

                {/* Generate button */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className={`w-full rounded-lg px-6 py-4 text-lg font-semibold text-white transition-all ${
                      canGenerate
                        ? 'active:scale-[0.98]'
                        : 'cursor-not-allowed bg-gray-400'
                    }`}
                    style={canGenerate ? {
                      backgroundColor: primaryColor,
                    } : {}}
                    onMouseEnter={(e) => {
                      if (canGenerate) {
                        e.currentTarget.style.backgroundColor = primaryHoverColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canGenerate) {
                        e.currentTarget.style.backgroundColor = primaryColor;
                      }
                    }}
                  >
                    Generate Card
                  </button>
                </div>

                {/* Success message */}
                {success && (
                  <SuccessMessage
                    message={success}
                    onDismiss={() => setSuccess(null)}
                  />
                )}

                {/* Error message */}
                {error && (
                  <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Card Preview */}
          {card && !isGenerating && (
            <div id="card-preview" className="mt-8">
              <CardPreview card={card} onCardChange={setCard} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
