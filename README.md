# AI Holiday Card Platform

An AI-powered digital holiday card platform that allows users to create shareable cards based on a chosen occasion, vibe, and user-written message.

## Features

- 🎨 AI-generated cover images using Google Imagen
- ✍️ AI-rewritten messages matching selected vibe
- 🎯 Multiple vibes: Warm, Funny, Fancy, Chaotic
- 🔗 Shareable deep links
- 📱 Social media preview support
- ⏰ Automatic expiration (30 days)
- 🚫 Rate limiting (no login required)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **AI**: Google Gemini (text), Google Imagen (images)
- **Database**: Supabase (Postgres via Drizzle ORM)
- **Storage**: S3-compatible (R2/S3) for images
- **ORM**: Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Google AI Studio API key (for both text and image generation)
- S3-compatible storage (R2/S3) account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-card
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Database (Supabase Postgres)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Google AI Studio API (works for both Gemini text and Imagen images)
GEMINI_API_KEY=your-api-key-from-google-ai-studio

# S3-Compatible Storage
STORAGE_ENDPOINT=https://your-r2-endpoint.com
STORAGE_ACCESS_KEY_ID=your-access-key
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_BUCKET_NAME=your-bucket-name
STORAGE_REGION=us-east-1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting your API key:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in and click "Get API Key"
3. Create a new API key or use an existing one
4. Copy it to `GEMINI_API_KEY` in your `.env.local`

4. Set up the database:
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
npm run db:seed      # Seed initial data (Christmas occasion)
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Setup Guides

- [Supabase Setup](./docs/supabase-setup.md) - Configure Supabase database
- [Storage Setup](./docs/storage-setup.md) - Configure S3/R2 for images
- [Imagen API Setup](./docs/imagen-setup.md) - Configure Google AI Studio for image generation
- [Cleanup Job Setup](./docs/cleanup-setup.md) - Configure automated cleanup for expired cards
- [Social Preview Testing](./docs/social-preview-testing.md) - Test social media previews
- [Deployment Guide](./docs/deployment-guide.md) - Deploy to production

## Developer Guides

- [Adding New Holidays](./docs/adding-holidays.md) - How to add new occasions/holidays
- [Adding New Vibes](./docs/adding-vibes.md) - How to add new card vibes/styles
- [RLS Policies](./docs/rls-policies.md) - Row Level Security configuration

## Documentation

- [API Documentation](./docs/api-documentation.md) - Complete API reference
- [Environment Variables](./docs/environment-variables.md) - Environment variable reference
- [Specification](./docs/spec.md) - Full project specification
- [Todo List](./docs/todo%20list.md) - Development progress

## Database Commands

```bash
npm run db:generate  # Generate migration files
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed initial data
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Project Structure

```
ai-card/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── cards/        # Card endpoints
│   ├── c/                # Card viewing pages
│   └── page.tsx          # Homepage
├── components/           # React components
├── lib/                  # Utility libraries
│   ├── ai/              # AI integration (Gemini, Imagen)
│   ├── db/              # Database schema and client
│   ├── storage/         # S3 storage utilities
│   └── utils/           # Helper functions
└── docs/                # Documentation
```

## API Endpoints

- `POST /api/cards` - Create a new card
- `POST /api/cards/[id]/regenerate-cover` - Regenerate cover image
- `POST /api/cards/[id]/regenerate-message` - Regenerate message
- `POST /api/cards/[id]/publish` - Publish card
- `GET /c/[occasion]/[slug]` - View published card

## Development Status

See [todo list.md](./docs/todo%20list.md) for current progress.

**Completed:**
- ✅ Project setup and infrastructure
- ✅ Database schema and migrations
- ✅ Frontend components (homepage, card creation, card viewing)
- ✅ API endpoints
- ✅ AI integration (Gemini for text, Imagen for images)
- ✅ S3 storage integration
- ✅ Retry logic and error handling

**In Progress:**
- ⏳ Rate limiting
- ⏳ Content moderation
- ⏳ Cleanup job for expired cards

## License

[Add your license here]
