# Adding New Holidays/Occasions

This guide explains how to add a new holiday or occasion to the AI Card Platform.

## Overview

Adding a new holiday involves:
1. Creating a database record for the occasion
2. Defining style guide (colors, motifs, tone)
3. Selecting fonts for the occasion
4. Optionally updating the frontend to allow selection

## Step 1: Create Database Record

Add the occasion to your database. You can do this via:

### Option A: Database Seed Script (Recommended)

Create or update `lib/db/seed.ts`:

```typescript
import { db } from './index';
import { occasions } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  // ... existing occasions ...

  // Check if new occasion already exists
  const existing = await db
    .select()
    .from(occasions)
    .where(eq(occasions.id, 'new-year'))
    .limit(1);
  
  if (existing.length > 0) {
    console.log('New Year occasion already exists');
    return;
  }

  // Insert new occasion
  await db.insert(occasions).values({
    id: 'new-year', // URL-friendly ID (lowercase, hyphens)
    name: 'New Year', // Display name
    isActive: true, // Set to false to hide from users
    styleGuide: {
      colorPalette: ['#FFD700', '#000000', '#FFFFFF', '#FF6B6B'],
      motifs: ['fireworks', 'clock', 'champagne', 'confetti'],
      tone: 'celebratory',
    },
    fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
  });

  console.log('Seeded New Year occasion');
}
```

Then run:
```bash
npm run db:seed
```

### Option B: Direct Database Insert

Using Drizzle Studio or SQL:

```sql
INSERT INTO occasions (id, name, is_active, style_guide, font_set)
VALUES (
  'new-year',
  'New Year',
  true,
  '{"colorPalette": ["#FFD700", "#000000", "#FFFFFF"], "motifs": ["fireworks", "clock"], "tone": "celebratory"}'::jsonb,
  ARRAY['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico']
);
```

## Step 2: Define Style Guide

The `styleGuide` JSON object should include:

- **colorPalette**: Array of hex colors representing the holiday
- **motifs**: Array of visual elements/themes (used in AI prompts)
- **tone**: Overall feeling (e.g., "festive", "celebratory", "solemn")

Example for different holidays:

```typescript
// Valentine's Day
{
  colorPalette: ['#FF1493', '#FFFFFF', '#FFB6C1'],
  motifs: ['hearts', 'roses', 'cupid', 'love letters'],
  tone: 'romantic'
}

// Halloween
{
  colorPalette: ['#000000', '#FF6600', '#8B0000'],
  motifs: ['pumpkins', 'ghosts', 'bats', 'candles'],
  tone: 'spooky'
}

// Thanksgiving
{
  colorPalette: ['#8B4513', '#FF8C00', '#FFD700'],
  motifs: ['turkey', 'leaves', 'cornucopia', 'harvest'],
  tone: 'grateful'
}
```

## Step 3: Select Fonts

The `fontSet` array should contain 4 fonts (one for each vibe):
- Index 0: Warm vibe font
- Index 1: Funny vibe font
- Index 2: Fancy vibe font
- Index 3: Chaotic vibe font

**Available fonts** (loaded in `app/layout.tsx`):
- `Playfair Display` (elegant serif)
- `Dancing Script` (playful script)
- `Montserrat` (modern sans-serif)
- `Pacifico` (casual script)

You can use the same fonts as Christmas or mix and match based on the holiday's character.

## Step 4: Update Frontend (Optional)

Currently, the homepage is locked to Christmas. To allow selection:

### Update `app/page.tsx`:

```typescript
// Add occasion selector state
const [occasion, setOccasion] = useState<string>('christmas');

// Update API call
body: JSON.stringify({
  occasion, // Use state instead of hardcoded 'christmas'
  vibe,
  message,
}),
```

### Create Occasion Selector Component:

```typescript
// components/OccasionSelector.tsx
'use client';

interface OccasionSelectorProps {
  selectedOccasion: string;
  onOccasionSelect: (occasion: string) => void;
}

const occasions = [
  { id: 'christmas', name: 'Christmas' },
  { id: 'new-year', name: 'New Year' },
  // Add more occasions
];

export default function OccasionSelector({ selectedOccasion, onOccasionSelect }: OccasionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-lg font-semibold text-gray-900">
        Occasion
      </label>
      <div className="grid grid-cols-2 gap-4">
        {occasions.map((occasion) => (
          <button
            key={occasion.id}
            onClick={() => onOccasionSelect(occasion.id)}
            className={`rounded-lg border-2 p-4 ${
              selectedOccasion === occasion.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {occasion.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Step 5: Test

1. **Verify database record**:
   ```bash
   npm run db:studio
   ```
   Check that the occasion appears in the `occasions` table.

2. **Test card creation**:
   - Create a card with the new occasion
   - Verify AI generates appropriate content
   - Check that images match the style guide

3. **Test card viewing**:
   - Visit `/c/{occasion-id}/{slug}`
   - Verify page loads correctly
   - Check Open Graph metadata

## Example: Adding New Year

Complete example for adding New Year:

```typescript
// lib/db/seed.ts
await db.insert(occasions).values({
  id: 'new-year',
  name: 'New Year',
  isActive: true,
  styleGuide: {
    colorPalette: ['#FFD700', '#000000', '#FFFFFF', '#FF6B6B'],
    motifs: ['fireworks', 'clock', 'champagne', 'confetti', 'ball drop'],
    tone: 'celebratory',
  },
  fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
});
```

## Best Practices

1. **ID Format**: Use lowercase with hyphens (e.g., `new-year`, `valentines-day`)
2. **Name Format**: Use proper capitalization (e.g., "New Year", "Valentine's Day")
3. **Color Palette**: Include 3-5 colors that represent the holiday
4. **Motifs**: Include 4-6 visual elements that AI can use in image generation
5. **Tone**: Use descriptive adjectives (festive, romantic, spooky, etc.)
6. **Testing**: Always test with multiple vibes to ensure style guide works well

## Troubleshooting

**Issue**: Occasion doesn't appear in database
- **Solution**: Check that `isActive` is set to `true`
- **Solution**: Verify seed script ran successfully

**Issue**: AI generates wrong style
- **Solution**: Review `styleGuide` - ensure motifs and tone are clear
- **Solution**: Check AI prompts in `lib/ai/imagen.ts` and `lib/ai/gemini.ts`

**Issue**: Card page returns 404
- **Solution**: Verify occasion ID matches exactly (case-sensitive)
- **Solution**: Check that card was created with correct `occasionId`

## Related Files

- `lib/db/schema.ts` - Database schema definition
- `lib/db/seed.ts` - Database seeding script
- `lib/ai/imagen.ts` - Image generation (uses style guide)
- `lib/ai/gemini.ts` - Text generation (uses occasion name)
- `app/c/[occasion]/[slug]/page.tsx` - Card viewing page
