'use client';

import { useState, useEffect, useRef } from 'react';

interface GenerationLoadingScreenProps {
  occasion?: string;
  onCancel?: () => void;
}

// Occasion-specific loading captions
const loadingCaptions: Record<string, string[]> = {
  christmas: [
    'Polishing the card stock…',
    'Sprinkling a little snow…',
    'Hanging the lights…',
    'Warming up the cocoa…',
    'Wrapping it up neatly…',
    'Adding a final sparkle…',
    'Checking Santa\'s list (twice)…',
    'Making it extra cozy…',
  ],
  'new-year': [
    'Cueing the confetti…',
    'Counting down…',
    'Lighting the sparklers…',
    'Preparing the celebration…',
    'Setting the stage…',
    'Adding the sparkle…',
    'Making it memorable…',
  ],
  hanukkah: [
    'Lighting the candles…',
    'Spinning the dreidel…',
    'Adding the light…',
    'Creating the magic…',
    'Spreading the joy…',
    'Making it shine…',
    'Bringing the warmth…',
  ],
  kwanzaa: [
    'Lighting the kinara…',
    'Celebrating unity…',
    'Honoring tradition…',
    'Creating togetherness…',
    'Adding the warmth…',
    'Making it meaningful…',
    'Spreading the light…',
  ],
  'winter-solstice': [
    'Welcoming the light…',
    'Embracing the stillness…',
    'Marking the turning…',
    'Creating the peace…',
    'Adding the warmth…',
    'Making it serene…',
    'Celebrating renewal…',
  ],
  default: [
    'Creating something special…',
    'Adding the finishing touches…',
    'Making it perfect…',
  ],
};

export default function GenerationLoadingScreen({ 
  occasion = 'christmas',
  onCancel 
}: GenerationLoadingScreenProps) {
  const [currentCaption, setCurrentCaption] = useState('');
  const [subtext, setSubtext] = useState('The best cards take a moment.');
  const [showTryAgain, setShowTryAgain] = useState(false);
  const previousCaptionRef = useRef<string>('');
  const startTimeRef = useRef<number>(Date.now());
  const captionsRef = useRef<string[]>([]);
  const captionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const captions = loadingCaptions[occasion] || loadingCaptions.default;
  captionsRef.current = captions;

  // Smart caption rotation - avoid immediate repeats
  const getNextCaption = (previous: string): string => {
    const available = captionsRef.current.filter(c => c !== previous);
    if (available.length === 0) return captionsRef.current[0] || 'Creating something special…';
    return available[Math.floor(Math.random() * available.length)];
  };

  useEffect(() => {
    // Set initial caption
    const initialCaption = captions[0] || 'Creating something special…';
    setCurrentCaption(initialCaption);
    previousCaptionRef.current = initialCaption;
    startTimeRef.current = Date.now();
    setSubtext('The best cards take a moment.');
    setShowTryAgain(false);

    // Rotate captions with random intervals between 1.8-2.4 seconds
    const scheduleNext = () => {
      const delay = 1800 + Math.random() * 600; // 1800-2400ms
      captionTimeoutRef.current = setTimeout(() => {
        const nextCaption = getNextCaption(previousCaptionRef.current);
        setCurrentCaption(nextCaption);
        previousCaptionRef.current = nextCaption;
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    // Track elapsed time for subtext changes
    const timeInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      if (elapsed >= 20) {
        setSubtext('Taking longer than usual. You can keep waiting or try again.');
        setShowTryAgain(true);
      } else if (elapsed >= 12) {
        setSubtext('Still working—sometimes the best ones take a moment.');
      }
    }, 1000);

    return () => {
      if (captionTimeoutRef.current) {
        clearTimeout(captionTimeoutRef.current);
      }
      clearInterval(timeInterval);
    };
  }, [occasion]);

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Card-sized placeholder with paper-like styling */}
        <div className="loading-card-placeholder relative aspect-[4/3] w-full overflow-hidden rounded-xl">
          {/* Paper grain texture */}
          <div className="absolute inset-0 paper-grain"></div>
          
          {/* Soft inner highlight along top edge */}
          <div className="absolute inset-0 paper-highlight"></div>
          
          {/* Loader - 3-dot bounce */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loader-dots" aria-label="Loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Loading caption */}
        <div className="space-y-2" aria-live="polite" aria-atomic="true">
          <p className="text-lg font-medium text-gray-700 transition-opacity duration-300">
            {currentCaption}
          </p>
          <p className="text-sm text-gray-500 transition-opacity duration-300">
            {subtext}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {showTryAgain && onCancel && (
            <button
              onClick={onCancel}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              Try again
            </button>
          )}
          {onCancel && (
            <div className="space-y-1">
              <button
                onClick={onCancel}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Go back
              </button>
              <p className="text-xs text-gray-400">
                You won't lose your message.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
