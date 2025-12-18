/**
 * Content moderation utilities
 * Pre-processes user messages to remove PII and block unsafe content
 */

export interface ModerationResult {
  allowed: boolean;
  cleaned: string;
  reason?: string;
  blockedPatterns?: string[];
}

/**
 * Remove emails, phone numbers, and addresses from text
 */
function removePII(text: string): { cleaned: string; removed: string[] } {
  const removed: string[] = [];
  let cleaned = text;

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = cleaned.match(emailPattern) || [];
  if (emails.length > 0) {
    removed.push(...emails);
    cleaned = cleaned.replace(emailPattern, '[email removed]');
  }

  // Phone number patterns (US and international formats)
  const phonePatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US: 123-456-7890
    /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // US: (123) 456-7890
    /\b\+?\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, // International
  ];
  
  phonePatterns.forEach(pattern => {
    const phones = cleaned.match(pattern) || [];
    if (phones.length > 0) {
      removed.push(...phones);
      cleaned = cleaned.replace(pattern, '[phone removed]');
    }
  });

  // Address patterns (basic - looks for street numbers and common address words)
  const addressPattern = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Place|Pl)\b/gi;
  const addresses = cleaned.match(addressPattern) || [];
  if (addresses.length > 0) {
    removed.push(...addresses);
    cleaned = cleaned.replace(addressPattern, '[address removed]');
  }

  return { cleaned, removed };
}

/**
 * Check for hate speech, harassment, and threats
 * Uses keyword-based detection (basic implementation)
 * In production, consider using a dedicated moderation API
 */
function checkUnsafeContent(text: string): { blocked: boolean; patterns: string[] } {
  const lowerText = text.toLowerCase();
  const blockedPatterns: string[] = [];

  // Hate speech keywords (basic list - expand as needed)
  const hateSpeechPatterns = [
    /\b(kill|murder|death\s+threat|die|harm)\s+(yourself|your\s+self|you|them|him|her)\b/i,
    /\b(racist|racism|nazi|kkk|white\s+supremacy)\b/i,
  ];

  // Harassment patterns
  const harassmentPatterns = [
    /\b(f\*\*k\s+you|f\s+u\s+c\s+k|go\s+to\s+hell|damn\s+you)\b/i,
    /\b(threat|threatening|harass|harassing)\b/i,
  ];

  // Check patterns
  [...hateSpeechPatterns, ...harassmentPatterns].forEach(pattern => {
    if (pattern.test(lowerText)) {
      blockedPatterns.push(pattern.source);
    }
  });

  return {
    blocked: blockedPatterns.length > 0,
    patterns: blockedPatterns,
  };
}

/**
 * Common public figures (politicians, celebrities, etc.)
 * This is a basic list - in production, consider using a more comprehensive database
 */
const PUBLIC_FIGURES = [
  // US Presidents
  'biden', 'trump', 'obama', 'bush', 'clinton',
  // Other politicians
  'harris', 'pence', 'pelosi', 'mcconnell', 'schumer',
  // Celebrities (common mentions)
  'taylor swift', 'beyonce', 'oprah', 'elon musk', 'bill gates',
];

/**
 * Check if text mentions a public figure
 */
function mentionsPublicFigure(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PUBLIC_FIGURES.some(figure => {
    // Check for mentions of the public figure name
    const namePattern = new RegExp(`\\b${figure.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return namePattern.test(lowerText);
  });
}

/**
 * Check for defamatory statements about private individuals
 * More lenient for public figures (who are subject to public discourse)
 * Basic implementation - looks for direct accusations
 * Note: This is a simple implementation. For production, consider using a dedicated moderation API.
 */
function checkDefamation(text: string): { blocked: boolean; reason?: string; isPublicFigure?: boolean } {
  const lowerText = text.toLowerCase();
  const isPublicFigureMention = mentionsPublicFigure(text);

  // More specific patterns that suggest direct accusations
  // These are more likely to be defamatory than general mentions
  const defamationPatterns = [
    /\b(you|they|he|she|him|her)\s+(stole|stole|is\s+a\s+thief|committed\s+fraud|is\s+a\s+scammer)\b/i,
    /\b(you|they|he|she)\s+(are|is)\s+(a\s+liar|lying|deceiving)\b/i,
    /\b(you|they|he|she)\s+(abused|committed\s+violence|is\s+violent)\b/i,
    /\b(criminal|illegal|lawsuit|sue|suing)\s+(activity|act|action|behavior)\b/i,
  ];

  // Check if text contains defamatory language
  const hasDefamation = defamationPatterns.some(pattern => pattern.test(lowerText));

  if (hasDefamation) {
    // If it's about a public figure, be more lenient - allow general criticism
    // but still block direct criminal accusations
    if (isPublicFigureMention) {
      // Allow general criticism of public figures, but block specific criminal accusations
      const criminalAccusationPatterns = [
        /\b(you|they|he|she)\s+(committed\s+fraud|is\s+a\s+scammer|stole)\b/i,
        /\b(criminal|illegal)\s+(activity|act|action)\b/i,
      ];
      
      const hasCriminalAccusation = criminalAccusationPatterns.some(pattern => pattern.test(lowerText));
      
      if (hasCriminalAccusation) {
        return {
          blocked: true,
          reason: 'Content contains unsubstantiated criminal accusations',
          isPublicFigure: true,
        };
      }
      
      // Allow general criticism of public figures
      return { blocked: false, isPublicFigure: true };
    }
    
    // For private individuals, block defamatory statements
    return {
      blocked: true,
      reason: 'Content contains potentially defamatory statements about private individuals',
      isPublicFigure: false,
    };
  }

  return { blocked: false, isPublicFigure: isPublicFigureMention };
}

/**
 * Main moderation function
 * Pre-processes message and checks for unsafe content
 */
export function moderateContent(message: string): ModerationResult {
  // Step 1: Remove PII
  const { cleaned, removed } = removePII(message);

  // Step 2: Check for unsafe content
  const unsafeCheck = checkUnsafeContent(cleaned);
  if (unsafeCheck.blocked) {
    return {
      allowed: false,
      cleaned: cleaned,
      reason: 'Content contains inappropriate language or threats',
      blockedPatterns: unsafeCheck.patterns,
    };
  }

  // Step 3: Check for defamation
  const defamationCheck = checkDefamation(cleaned);
  if (defamationCheck.blocked) {
    return {
      allowed: false,
      cleaned: cleaned,
      reason: defamationCheck.reason || 'Content contains potentially defamatory statements',
    };
  }

  // Step 4: Check message length (prevent abuse)
  if (cleaned.trim().length < 3) {
    return {
      allowed: false,
      cleaned: cleaned,
      reason: 'Message is too short',
    };
  }

  if (cleaned.length > 5000) {
    return {
      allowed: false,
      cleaned: cleaned,
      reason: 'Message is too long (max 5000 characters)',
    };
  }

  // All checks passed
  return {
    allowed: true,
    cleaned: cleaned,
  };
}

/**
 * Create user-friendly error message for blocked content
 */
export function getModerationErrorMessage(result: ModerationResult): string {
  if (!result.reason) {
    return 'Your message could not be processed. Please revise and try again.';
  }

  if (result.reason.includes('inappropriate')) {
    return 'Your message contains inappropriate language. Please revise and try again.';
  }

  if (result.reason.includes('defamatory')) {
    return 'Your message contains content that cannot be published. Please revise and try again.';
  }

  if (result.reason.includes('unsubstantiated criminal accusations')) {
    return 'Your message contains unsubstantiated criminal accusations. Please revise and try again.';
  }

  if (result.reason.includes('too short')) {
    return 'Your message is too short. Please write a longer message.';
  }

  if (result.reason.includes('too long')) {
    return 'Your message is too long. Please keep it under 5000 characters.';
  }

  return result.reason;
}
