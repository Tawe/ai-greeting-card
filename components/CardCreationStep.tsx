'use client';

import { ReactNode } from 'react';

interface CardCreationStepProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  stepNumber?: number;
  totalSteps?: number;
}

export default function CardCreationStep({ 
  title, 
  subtitle, 
  children,
  stepNumber,
  totalSteps 
}: CardCreationStepProps) {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step header */}
      <div className="space-y-1">
        {stepNumber && totalSteps && (
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Step {stepNumber} of {totalSteps}
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* Primary content area */}
      <div>
        {children}
      </div>
    </div>
  );
}
