'use client';

import { useState, useEffect } from 'react';

interface GenerationLoadingScreenProps {
  occasion?: string;
  onCancel?: () => void;
}

// Occasion-specific loading captions
const loadingCaptions: Record<string, string[]> = {
  christmas: [
    'Sprinkling a little snow…',
    'Hanging the lights…',
    'Warming up the cocoa…',
    'Assembling festive magic…',
    'Checking Santa\'s list (twice)…',
    'Polishing the card stock…',
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

const tips = [
  'The best cards take a moment',
  'Good things come to those who wait',
  'Crafting with care…',
];

export default function GenerationLoadingScreen({ 
  occasion = 'christmas',
  onCancel 
}: GenerationLoadingScreenProps) {
  const [currentCaption, setCurrentCaption] = useState('');
  const [currentTip, setCurrentTip] = useState('');

  const captions = loadingCaptions[occasion] || loadingCaptions.default;

  useEffect(() => {
    // Set initial caption
    setCurrentCaption(captions[0] || 'Creating something special…');
    setCurrentTip(tips[0] || '');

    // Rotate captions every 1.5-2.5 seconds
    const captionInterval = setInterval(() => {
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];
      setCurrentCaption(randomCaption || 'Creating something special…');
    }, 2000);

    // Rotate tips less frequently (every 4-5 seconds)
    const tipInterval = setInterval(() => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip || '');
    }, 4500);

    return () => {
      clearInterval(captionInterval);
      clearInterval(tipInterval);
    };
  }, [occasion, captions]);

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Card-sized placeholder */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 shadow-lg">
          {/* Sparkle animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-blue-500/20"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading caption */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            {currentCaption}
          </p>
          {currentTip && (
            <p className="text-sm text-gray-500">
              {currentTip}
            </p>
          )}
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
