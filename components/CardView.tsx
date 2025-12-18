'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CardImage from './CardImage';
import { getFontFamilyCSS } from '@/lib/fonts';
import { getOccasionGradient, getOccasionPrimary, getOccasionPrimaryHover } from '@/lib/occasions';
import { Vibe } from '@/lib/types';

interface CardViewProps {
  card: {
    id: string;
    slug: string;
    occasion: string;
    vibe: Vibe;
    cleanMessage: string;
    coverImageUrl: string;
  };
}

export default function CardView({ card }: CardViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const source = searchParams.get('src');

  const fontFamily = getFontFamilyCSS(card.vibe);

  // Log attribution source (optional - for analytics)
  useEffect(() => {
    if (source) {
      console.log(`Card viewed from source: ${source}`);
      // In production, you might want to send this to analytics
      // Example: analytics.track('card_viewed', { source });
    }
  }, [source]);

  const handleShare = (platform: string) => {
    // Build URL with attribution param, preserving existing query params
    const baseUrl = window.location.origin + window.location.pathname;
    const currentParams = new URLSearchParams(window.location.search);
    
    // Set or update the src param to the current platform
    currentParams.set('src', platform);
    
    const urlWithAttribution = `${baseUrl}?${currentParams.toString()}`;
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlWithAttribution)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlWithAttribution)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlWithAttribution)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const occasionId = card.occasion?.toLowerCase() || 'christmas';
  const occasionGradient = getOccasionGradient(occasionId);
  const primaryColor = getOccasionPrimary(occasionId);
  const primaryHoverColor = getOccasionPrimaryHover(occasionId);

  return (
    <div 
      className="min-h-screen occasion-background"
      style={{
        background: occasionGradient,
      }}
    >
      <div className="container mx-auto px-4 py-12 md:px-8">
        <div className="mx-auto" style={{ maxWidth: '1100px' }}>
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
                        priority
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
                <div className="relative w-full h-full overflow-hidden" style={{ background: '#fefefe' }}>
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

          {/* Share Panel - positioned below card, softer and less platformy */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 animate-in fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <button
              onClick={() => handleShare('twitter')}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
              style={{ 
                backgroundColor: 'rgba(55, 65, 81, 0.08)',
                color: '#374151',
                border: '1px solid rgba(55, 65, 81, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Share on Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
              style={{ 
                backgroundColor: 'rgba(55, 65, 81, 0.08)',
                color: '#374151',
                border: '1px solid rgba(55, 65, 81, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Share on Facebook
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
              style={{ 
                backgroundColor: 'rgba(55, 65, 81, 0.08)',
                color: '#374151',
                border: '1px solid rgba(55, 65, 81, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
