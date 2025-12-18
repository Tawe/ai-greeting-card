'use client';

import { useState, useEffect } from 'react';
import { getOccasionPrimary, getOccasionBorder } from '@/lib/occasions';

interface Occasion {
  id: string;
  name: string;
}

interface OccasionSelectorProps {
  selectedOccasion: string;
  onOccasionSelect: (occasion: string) => void;
}

export default function OccasionSelector({ selectedOccasion, onOccasionSelect }: OccasionSelectorProps) {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOccasions() {
      try {
        const response = await fetch('/api/occasions');
        if (response.ok) {
          const data = await response.json();
          setOccasions(data);
        }
      } catch (error) {
        console.error('Error fetching occasions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOccasions();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  const primaryColor = getOccasionPrimary(selectedOccasion);
  const borderColor = getOccasionBorder(selectedOccasion);
  const lightPrimary = (() => {
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.08)`;
  })();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {occasions.map((occasion) => {
        const isSelected = selectedOccasion === occasion.id;
        return (
          <button
            key={occasion.id}
            type="button"
            onClick={() => onOccasionSelect(occasion.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              isSelected ? 'shadow-md' : 'bg-white hover:shadow-sm'
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
            <div className="font-semibold text-gray-900">{occasion.name}</div>
          </button>
        );
      })}
    </div>
  );
}
