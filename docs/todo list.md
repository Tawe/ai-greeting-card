# AI Holiday Card Platform - Todo List

## Project Setup & Infrastructure

- [ ] Initialize Next.js project with App Router
- [ ] Set up project structure (components, lib, app directories)
- [ ] Configure environment variables (.env.local)
- [ ] Set up database (Postgres/Supabase/SQLite)
- [ ] Set up S3-compatible storage (R2/S3) for images
- [ ] Configure Redis/KV for rate limiting
- [ ] Set up cron job infrastructure for daily cleanup
- [ ] Configure TypeScript and ESLint

## Database & Data Models

- [ ] Create `occasions` table schema
  - [ ] id, name, is_active, style_guide (JSON), font_set (array), created_at
- [ ] Create `cards` table schema
  - [ ] id, slug, occasion_id, vibe, clean_message, cover_image_url, theme_version, created_at, expires_at, creator_hash, status
- [ ] Set up database migrations
- [ ] Seed initial data: Christmas occasion (is_active=true)
- [ ] Create database indexes for performance (slug, expires_at, creator_hash)

## Frontend - Homepage & Card Creation

- [ ] Create homepage layout
- [ ] Build occasion selector component (locked to Christmas in v0.1)
- [ ] Build vibe selector component (Warm, Funny, Fancy, Chaotic)
- [ ] Create message input component
- [ ] Build Generate button with loading states
- [ ] Create card preview component (outside cover + inside message)
- [ ] Add regenerate cover button
- [ ] Add regenerate message button
- [ ] Build publish card functionality
- [ ] Add error handling and user feedback messages

## Frontend - Card Viewing

- [ ] Create card viewing page route `/c/[occasion]/[slug]`
- [ ] Build card cover display (outside)
- [ ] Implement card opening animation/interaction
- [ ] Display inside message with vibe-appropriate font
- [ ] Add share buttons (LinkedIn, Twitter, Facebook, etc.)
- [ ] Handle expired cards gracefully
- [ ] Add 404 handling for non-existent cards

## API Endpoints

- [ ] Implement `POST /api/cards`
  - [ ] Validate input (occasion, vibe, message)
  - [ ] Check rate limits
  - [ ] Pre-process message (content moderation)
  - [ ] Call AI for message rewrite
  - [ ] Call AI for cover image generation
  - [ ] Upload image to S3/R2
  - [ ] Generate slug
  - [ ] Save card to database
  - [ ] Return card data
- [ ] Implement `POST /api/cards/{id}/regenerate-cover`
  - [ ] Validate card exists and is not published
  - [ ] Generate new cover image
  - [ ] Upload new image
  - [ ] Update database
- [ ] Implement `POST /api/cards/{id}/regenerate-message`
  - [ ] Validate card exists and is not published
  - [ ] Regenerate message rewrite
  - [ ] Update database
- [ ] Implement `POST /api/cards/{id}/publish`
  - [ ] Mark card as published
  - [ ] Return deep link URL
- [ ] Implement `GET /c/{occasion}/{slug}` (SSR)
  - [ ] Fetch card from database
  - [ ] Check expiration
  - [ ] Generate Open Graph metadata
  - [ ] Render card view page

## AI Integration (Google Gemini)

- [ ] Set up Google Gemini API client
- [ ] Implement message rewrite function
  - [ ] Preserve user intent
  - [ ] Improve clarity and grammar
  - [ ] Match vibe and occasion tone
  - [ ] Filter unsafe content
  - [ ] Return plain text only
- [ ] Implement cover image generation function
  - [ ] Generate imagery aligned with occasion + vibe
  - [ ] Use clean composition and negative space
  - [ ] Avoid embedded text
- [ ] Create prompt templates for different vibes
- [ ] Add error handling for AI API failures
- [ ] Implement retry logic for transient failures

## Font Selection & Styling

- [ ] Define font set for each vibe
  - [ ] Warm vibe font
  - [ ] Funny vibe font
  - [ ] Fancy vibe font
  - [ ] Chaotic vibe font
- [ ] Create deterministic font mapping function
- [ ] Implement font loading and fallbacks
- [ ] Style card inside message with selected font

## Rate Limiting

- [ ] Implement IP-based rate limiting (10 cards per IP per 24 hours)
- [ ] Implement device identifier tracking (cookie/localStorage)
- [ ] Implement device-based rate limiting (3 cards per device per 24 hours)
- [ ] Create rate limit middleware for API routes
- [ ] Add CAPTCHA integration after threshold
- [ ] Return appropriate error messages when limits exceeded

## Content Moderation

- [ ] Implement pre-processing function
  - [ ] Remove emails, phone numbers, addresses
  - [ ] Block hate speech, harassment, threats
  - [ ] Block defamatory statements about private individuals
- [ ] Add content moderation checks to AI prompts
- [ ] Create user-friendly error messages for blocked content
- [ ] Handle public figure mentions appropriately
- [ ] Block criminal accusations and personal data

## Social Sharing & Deep Links

- [ ] Generate unique slugs for cards
- [ ] Create deep link format: `/c/{occasion}/{slug}`
- [ ] Implement share button components
- [ ] Generate platform-specific share URLs
- [ ] Add query params for attribution (e.g., `?src=linkedin`)
- [ ] Generate Open Graph metadata
  - [ ] og:image (cover image)
  - [ ] og:title ("A {vibe} holiday card")
  - [ ] og:description
- [ ] Generate Twitter Card metadata
- [ ] Test social preview rendering

## Data Retention & Cleanup

- [ ] Set expires_at timestamp on card creation (30 days)
- [ ] Create scheduled cleanup job (daily cron)
- [ ] Implement cleanup logic:
  - [ ] Find expired cards
  - [ ] Delete database records
  - [ ] Delete stored images from S3/R2
  - [ ] Delete any derived assets
- [ ] Add logging for cleanup operations
- [ ] Handle cleanup failures gracefully

## Testing

- [ ] Write unit tests for API endpoints
- [ ] Write unit tests for AI integration functions
- [ ] Write unit tests for content moderation
- [ ] Write unit tests for rate limiting
- [ ] Write integration tests for card creation flow
- [ ] Write integration tests for card viewing flow
- [ ] Test social preview rendering
- [ ] Test expiration and cleanup logic
- [ ] Test rate limiting edge cases

## Deployment & Production

- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Set up production storage (S3/R2)
- [ ] Configure production rate limiting (Redis/KV)
- [ ] Set up production cron jobs
- [ ] Configure domain and SSL
- [ ] Set up monitoring and error tracking
- [ ] Create deployment documentation
- [ ] Set up CI/CD pipeline

## Acceptance Criteria Verification

- [ ] Verify user can create and share card without login
- [ ] Verify each card has stable deep link
- [ ] Verify social previews render correctly
- [ ] Verify rate limits prevent abuse
- [ ] Verify cards are automatically deleted after 30 days
- [ ] Verify architecture supports adding new holidays without refactor

## Documentation

- [ ] Write API documentation
- [ ] Document environment variables
- [ ] Create deployment guide
- [ ] Document how to add new holidays
- [ ] Document how to add new vibes
- [ ] Create README with setup instructions
