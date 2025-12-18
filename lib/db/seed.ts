import { db } from './index';
import { occasions } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  const occasionsToSeed = [
    {
      id: 'christmas',
      name: 'Christmas',
      isActive: true,
      styleGuide: {
        colorPalette: ['#C8102E', '#006B3C', '#FFFFFF', '#FFD700'],
        motifs: ['snowflakes', 'trees', 'ornaments', 'lights'],
        tone: 'festive',
      },
      fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
    },
    {
      id: 'new-year',
      name: 'New Year',
      isActive: true,
      styleGuide: {
        colorPalette: ['#FFD700', '#000000', '#FFFFFF', '#FF6B6B'],
        motifs: ['fireworks', 'clock', 'champagne', 'confetti', 'countdown'],
        tone: 'celebratory',
      },
      fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
    },
    {
      id: 'hanukkah',
      name: 'Hanukkah',
      isActive: true,
      styleGuide: {
        colorPalette: ['#0033A0', '#FFFFFF', '#FFD700', '#C8102E'],
        motifs: ['menorah', 'dreidel', 'stars', 'candles', 'latkes'],
        tone: 'joyful',
      },
      fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
    },
    {
      id: 'kwanzaa',
      name: 'Kwanzaa',
      isActive: true,
      styleGuide: {
        colorPalette: ['#000000', '#C8102E', '#006B3C', '#FFD700'],
        motifs: ['kinara', 'mkeka', 'kente', 'unity cup', 'fruits'],
        tone: 'reflective',
      },
      fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
    },
    {
      id: 'winter-solstice',
      name: 'Winter Solstice',
      isActive: true,
      styleGuide: {
        colorPalette: ['#1E3A5F', '#FFFFFF', '#FFD700', '#87CEEB'],
        motifs: ['snow', 'ice', 'stars', 'moon', 'evergreen'],
        tone: 'peaceful',
      },
      fontSet: ['Playfair Display', 'Dancing Script', 'Montserrat', 'Pacifico'],
    },
  ];

  for (const occasion of occasionsToSeed) {
    const existing = await db.select().from(occasions).where(eq(occasions.id, occasion.id)).limit(1);
    
    if (existing.length === 0) {
      await db.insert(occasions).values(occasion);
      console.log(`Seeded ${occasion.name} occasion`);
    } else {
      console.log(`${occasion.name} occasion already exists`);
    }
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding database:', error);
      process.exit(1);
    });
}
