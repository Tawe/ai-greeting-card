# Adding New Vibes

This guide explains how to add a new vibe (tone/style) to the AI Card Platform.

## Overview

Adding a new vibe involves:
1. Updating TypeScript types
2. Adding font mapping
3. Adding font to layout
4. Updating AI prompts
5. Updating UI components
6. Updating API validation

## Step 1: Update TypeScript Types

Update `lib/types.ts`:

```typescript
export type Vibe = 'warm' | 'funny' | 'fancy' | 'chaotic' | 'nostalgic';
```

## Step 2: Add Font Mapping

Update `lib/fonts.ts`:

```typescript
export const vibeFonts: Record<Vibe, string> = {
  warm: 'Playfair Display',
  funny: 'Dancing Script',
  fancy: 'Montserrat',
  chaotic: 'Pacifico',
  nostalgic: 'Georgia', // New font for nostalgic vibe
};

export const vibeFontVariables: Record<Vibe, string> = {
  warm: 'var(--font-playfair)',
  funny: 'var(--font-dancing)',
  fancy: 'var(--font-montserrat)',
  chaotic: 'var(--font-pacifico)',
  nostalgic: 'var(--font-georgia)', // New CSS variable
};
```

## Step 3: Load Font in Layout

Update `app/layout.tsx`:

```typescript
import { Playfair_Display, Dancing_Script, Montserrat, Pacifico, Georgia } from "next/font/google";

// ... existing fonts ...

const georgia = Georgia({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-georgia",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dancing.variable} ${montserrat.variable} ${pacifico.variable} ${georgia.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Note**: If using a Google Font not available in Next.js, you can use a system font or add it via CSS:

```typescript
// For system fonts, no import needed
export const vibeFontVariables: Record<Vibe, string> = {
  // ...
  nostalgic: 'Georgia, serif', // System font
};
```

## Step 4: Update AI Prompts

### Text Generation (`lib/ai/gemini.ts`)

Update the `vibeInstructions` object:

```typescript
const vibeInstructions: Record<Vibe, string> = {
  warm: 'Make it warm, heartfelt, and sincere. Use gentle, comforting language.',
  funny: 'Make it lighthearted, playful, and humorous. Add wit and charm.',
  fancy: 'Make it elegant, sophisticated, and refined. Use polished, formal language.',
  chaotic: 'Make it energetic, wild, and fun. Use bold, enthusiastic language.',
  nostalgic: 'Make it nostalgic, sentimental, and reflective. Use warm, memory-evoking language.',
};
```

### Image Generation (`lib/ai/imagen.ts`)

Update the `vibePrompts` object:

```typescript
const vibePrompts: Record<Vibe, string> = {
  warm: 'warm and cozy atmosphere, soft lighting, gentle colors',
  funny: 'playful and whimsical style, bright colors, fun composition',
  fancy: 'elegant and sophisticated design, refined aesthetics, premium feel',
  chaotic: 'energetic and dynamic composition, bold colors, exciting visuals',
  nostalgic: 'vintage-inspired aesthetic, warm sepia tones, classic composition',
};
```

## Step 5: Update UI Components

### VibeSelector (`components/VibeSelector.tsx`)

Add the new vibe to the `vibes` array:

```typescript
const vibes: { value: Vibe; label: string; description: string }[] = [
  { value: 'warm', label: 'Warm', description: 'Cozy and heartfelt' },
  { value: 'funny', label: 'Funny', description: 'Lighthearted and playful' },
  { value: 'fancy', label: 'Fancy', description: 'Elegant and sophisticated' },
  { value: 'chaotic', label: 'Chaotic', description: 'Wild and energetic' },
  { value: 'nostalgic', label: 'Nostalgic', description: 'Sentimental and reflective' },
];
```

## Step 6: Update API Validation

Update `app/api/cards/route.ts`:

```typescript
if (!['warm', 'funny', 'fancy', 'chaotic', 'nostalgic'].includes(vibe)) {
  return NextResponse.json(
    { error: 'Invalid vibe. Must be one of: warm, funny, fancy, chaotic, nostalgic' },
    { status: 400 }
  );
}
```

## Step 7: Update Database Schema (if needed)

The database schema uses `varchar(50)` for vibe, so no migration is needed. However, if you want to add constraints:

```typescript
// lib/db/schema.ts
vibe: varchar('vibe', { length: 50 }).notNull().$type<'warm' | 'funny' | 'fancy' | 'chaotic' | 'nostalgic'>(),
```

## Complete Example: Adding "Nostalgic" Vibe

### 1. Types (`lib/types.ts`)
```typescript
export type Vibe = 'warm' | 'funny' | 'fancy' | 'chaotic' | 'nostalgic';
```

### 2. Fonts (`lib/fonts.ts`)
```typescript
export const vibeFonts: Record<Vibe, string> = {
  // ... existing ...
  nostalgic: 'Georgia',
};

export const vibeFontVariables: Record<Vibe, string> = {
  // ... existing ...
  nostalgic: 'Georgia, serif', // System font
};
```

### 3. Layout (`app/layout.tsx`)
No changes needed if using system font, or add Google Font import if needed.

### 4. AI Prompts (`lib/ai/gemini.ts`)
```typescript
const vibeInstructions: Record<Vibe, string> = {
  // ... existing ...
  nostalgic: 'Make it nostalgic, sentimental, and reflective. Use warm, memory-evoking language that brings back fond memories.',
};
```

### 5. Image Prompts (`lib/ai/imagen.ts`)
```typescript
const vibePrompts: Record<Vibe, string> = {
  // ... existing ...
  nostalgic: 'vintage-inspired aesthetic, warm sepia tones, classic composition, timeless feel',
};
```

### 6. UI (`components/VibeSelector.tsx`)
```typescript
const vibes = [
  // ... existing ...
  { value: 'nostalgic', label: 'Nostalgic', description: 'Sentimental and reflective' },
];
```

### 7. API (`app/api/cards/route.ts`)
```typescript
if (!['warm', 'funny', 'fancy', 'chaotic', 'nostalgic'].includes(vibe)) {
  // ...
}
```

## Testing

After adding a new vibe:

1. **Test card creation**: Create a card with the new vibe
2. **Verify font**: Check that the correct font displays in the card message
3. **Test AI output**: Verify text and image generation match the vibe
4. **Test all occasions**: Ensure the vibe works with all holidays

## Best Practices

1. **Font Selection**: Choose fonts that match the vibe's personality
2. **Prompt Clarity**: Write clear, specific instructions for AI
3. **Consistency**: Ensure text and image prompts align
4. **Testing**: Test with multiple occasions and messages
5. **Documentation**: Update this guide if adding new patterns

## Available Fonts

**Google Fonts** (loaded in layout):
- Playfair Display (elegant serif)
- Dancing Script (playful script)
- Montserrat (modern sans-serif)
- Pacifico (casual script)

**System Fonts** (no import needed):
- Georgia (serif)
- Times New Roman (serif)
- Arial (sans-serif)
- Helvetica (sans-serif)
- Courier New (monospace)

## Troubleshooting

**Issue**: Font doesn't display
- **Solution**: Verify CSS variable is added to layout className
- **Solution**: Check font name matches exactly

**Issue**: AI doesn't match vibe
- **Solution**: Review and refine prompt instructions
- **Solution**: Test with different messages

**Issue**: TypeScript errors
- **Solution**: Ensure all Record types include the new vibe
- **Solution**: Update all type definitions consistently

## Related Files

- `lib/types.ts` - Type definitions
- `lib/fonts.ts` - Font mappings
- `app/layout.tsx` - Font loading
- `lib/ai/gemini.ts` - Text generation prompts
- `lib/ai/imagen.ts` - Image generation prompts
- `components/VibeSelector.tsx` - UI component
- `app/api/cards/route.ts` - API validation
