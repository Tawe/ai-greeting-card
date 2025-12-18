'use client';

import { Vibe } from '@/lib/types';
import { getOccasionPrimary, getOccasionBorder } from '@/lib/occasions';

interface VibeSelectorProps {
  selectedVibe: Vibe | null;
  onVibeSelect: (vibe: Vibe) => void;
  occasion?: string;
}

const vibes: { value: Vibe; label: string; description: string }[] = [
  { value: 'warm', label: 'Warm', description: 'Cozy and heartfelt' },
  { value: 'funny', label: 'Funny', description: 'Lighthearted and playful' },
  { value: 'fancy', label: 'Fancy', description: 'Elegant and sophisticated' },
  { value: 'chaotic', label: 'Chaotic', description: 'Wild and energetic' },
];

export default function VibeSelector({ selectedVibe, onVibeSelect, occasion = 'christmas' }: VibeSelectorProps) {
  const primaryColor = getOccasionPrimary(occasion);
  const borderColor = getOccasionBorder(occasion);
  
  // Convert hex to rgba for opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const lightPrimary = hexToRgba(primaryColor, 0.08);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {vibes.map((vibe) => {
        const isSelected = selectedVibe === vibe.value;
        return (
          <button
            key={vibe.value}
            type="button"
            onClick={() => onVibeSelect(vibe.value)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              isSelected
                ? 'shadow-md'
                : 'bg-white hover:shadow-sm'
            }`}
            style={isSelected ? {
              borderColor: borderColor,
              backgroundColor: lightPrimary,
            } : {
              borderColor: '#e5e7eb',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = borderColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            <div className="font-semibold text-gray-900">{vibe.label}</div>
            <div className="mt-1 text-sm text-gray-600">{vibe.description}</div>
          </button>
        );
      })}
    </div>
  );
}
