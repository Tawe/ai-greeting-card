'use client';

import { useState } from 'react';
import CardImage from './CardImage';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import { getFontFamilyCSS } from '@/lib/fonts';
import { getOccasionPrimary, getOccasionPrimaryHover, getOccasionBorder } from '@/lib/occasions';
import { Vibe } from '@/lib/types';

interface CardPreviewProps {
  card: {
    id: string;
    slug: string;
    occasion: string;
    vibe: Vibe;
    cleanMessage: string;
    coverImageUrl: string;
    status: string;
  };
  onCardChange: (card: CardPreviewProps['card']) => void;
}

export default function CardPreview({ card, onCardChange }: CardPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegeneratingCover, setIsRegeneratingCover] = useState(false);
  const [isRegeneratingMessage, setIsRegeneratingMessage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fontFamily = getFontFamilyCSS(card.vibe);
  const occasionId = card.occasion?.toLowerCase() || 'christmas';
  const primaryColor = getOccasionPrimary(occasionId);
  const primaryHoverColor = getOccasionPrimaryHover(occasionId);
  const borderColor = getOccasionBorder(occasionId);

  const handleRegenerateCover = async () => {
    setIsRegeneratingCover(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/cards/${card.id}/regenerate-cover`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to regenerate cover');
      }

      const data = await response.json();
      onCardChange({ ...card, coverImageUrl: data.coverImageUrl });
      setSuccess('Cover regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating cover:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate cover. Please try again.');
    } finally {
      setIsRegeneratingCover(false);
    }
  };

  const handleRegenerateMessage = async () => {
    setIsRegeneratingMessage(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/cards/${card.id}/regenerate-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalMessage: '' }), // TODO: Store original message
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to regenerate message');
      }

      const data = await response.json();
      onCardChange({ ...card, cleanMessage: data.cleanMessage });
      setSuccess('Message regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating message:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate message. Please try again.');
    } finally {
      setIsRegeneratingMessage(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/cards/${card.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to publish card');
      }

      const data = await response.json();
      onCardChange({ ...card, status: 'published' });
      setSuccess('Card published! Redirecting...');
      
      // Redirect to card view after a brief delay
      setTimeout(() => {
        window.location.href = data.deepLink;
      }, 1000);
    } catch (error) {
      console.error('Error publishing card:', error);
      setError(error instanceof Error ? error.message : 'Failed to publish card. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error messages */}
      {success && (
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      )}
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {/* Card Preview Container - centered with perspective */}
      <div className="card-container">
        <div className="card-stage">
          <div
            className={`card-inner ${isOpen ? 'opened' : ''}`}
            style={{ 
              position: 'relative',
            }}
          >
            {/* Cover container - holds the outside cover */}
            <div 
              className="card-cover-container"
              onClick={() => setIsOpen(!isOpen)}
              style={{ cursor: 'pointer' }}
            >
            {/* Outside cover - front with image, rotates open */}
            <div className="card-cover-outside">
              <div className="relative w-full h-full overflow-hidden">
                {card.coverImageUrl && (
                  <CardImage
                    src={card.coverImageUrl}
                    alt={`${card.occasion} card cover`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Back side (Inside message) - revealed when card opens */}
          <div 
            className="card-back"
            onClick={() => setIsOpen(false)}
            style={{ cursor: 'pointer' }}
          >
            <div className="relative w-full h-full overflow-hidden bg-white">
              <div
                className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 whitespace-pre-wrap text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed"
                style={{ 
                  fontFamily,
                  textAlign: 'center',
                  color: '#1f2937', // Darker for better contrast
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.03)', // Subtle text shadow for readability
                  opacity: 0.85, // Slightly reduced but still readable
                }}
              >
                {card.cleanMessage}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Action Controls - Never rendered inside card (Design Guide) */}
      <div className="flex flex-wrap justify-center gap-4">
        {!isOpen ? (
          <>
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-lg px-6 py-2 text-white transition-colors"
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            >
              View Inside
            </button>
            <button
              onClick={handleRegenerateCover}
              disabled={isRegeneratingCover || card.status === 'published'}
              className="rounded-lg border bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              style={{ borderColor: borderColor }}
            >
              {isRegeneratingCover ? 'Regenerating...' : 'New Cover'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg border bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ borderColor: borderColor }}
            >
              View Cover
            </button>
            <button
              onClick={handleRegenerateMessage}
              disabled={isRegeneratingMessage || card.status === 'published'}
              className="rounded-lg border bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              style={{ borderColor: borderColor }}
            >
              {isRegeneratingMessage ? 'Regenerating...' : 'New Message'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || card.status === 'published'}
              className="rounded-lg px-6 py-2 text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e) => {
                if (!isPublishing && card.status !== 'published') {
                  e.currentTarget.style.backgroundColor = primaryHoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isPublishing && card.status !== 'published') {
                  e.currentTarget.style.backgroundColor = primaryColor;
                }
              }}
            >
              {isPublishing ? 'Publishing...' : card.status === 'published' ? 'Published' : 'Publish Card'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
