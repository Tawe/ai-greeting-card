# AI Holiday Card Platform - Todo List

## Project Setup & Infrastructure

- [x] Initialize Next.js project with App Router
- [x] Set up project structure (components, lib, app directories)
- [x] Configure environment variables (.env.local)
- [x] Set up database (Postgres/Supabase/SQLite)
- [ ] Set up S3-compatible storage (R2/S3) for images
- [ ] Configure Redis/KV for rate limiting
- [ ] Set up cron job infrastructure for daily cleanup
- [x] Configure TypeScript and ESLint

## Database & Data Models

- [x] Create `occasions` table schema
  - [x] id, name, is_active, style_guide (JSON), font_set (array), created_at
- [x] Create `cards` table schema
  - [x] id, slug, occasion_id, vibe, clean_message, cover_image_url, theme_version, created_at, expires_at, creator_hash, status
- [x] Set up database migrations
- [x] Seed initial data: Christmas occasion (is_active=true)
- [x] Create database indexes for performance (slug, expires_at, creator_hash)

## Frontend - Homepage & Card Creation

- [x] Create homepage layout
- [x] Build occasion selector component (locked to Christmas in v0.1)
- [x] Build vibe selector component (Warm, Funny, Fancy, Chaotic)
- [x] Create message input component
- [x] Build Generate button with loading states
- [x] Create card preview component (outside cover + inside message)
- [x] Add regenerate cover button
- [x] Add regenerate message button
- [x] Build publish card functionality
- [x] Add error handling and user feedback messages

## Frontend - Card Viewing

- [x] Create card viewing page route `/c/[occasion]/[slug]`
- [x] Build card cover display (outside)
- [x] Implement card opening animation/interaction
- [x] Display inside message with vibe-appropriate font
- [x] Add share buttons (LinkedIn, Twitter, Facebook, etc.)
- [x] Handle expired cards gracefully
- [x] Add 404 handling for non-existent cards

## API Endpoints

- [x] Implement `POST /api/cards`
  - [x] Validate input (occasion, vibe, message)
  - [x] Check rate limits
  - [x] Pre-process message (content moderation)
  - [x] Call AI for message rewrite
  - [x] Call AI for cover image generation
  - [x] Upload image to S3/R2
  - [x] Generate slug
  - [x] Save card to database
  - [x] Return card data
- [x] Implement `POST /api/cards/{id}/regenerate-cover`
  - [x] Validate card exists and is not published
  - [x] Generate new cover image
  - [x] Upload new image
  - [x] Update database
- [x] Implement `POST /api/cards/{id}/regenerate-message`
  - [x] Validate card exists and is not published
  - [x] Regenerate message rewrite
  - [x] Update database
- [x] Implement `POST /api/cards/{id}/publish`
  - [x] Mark card as published
  - [x] Return deep link URL
- [x] Implement `GET /c/{occasion}/{slug}` (SSR)
  - [x] Fetch card from database
  - [x] Check expiration
  - [x] Generate Open Graph metadata
  - [x] Render card view page

## AI Integration (Google Gemini)

- [x] Set up Google Gemini API client
- [x] Implement message rewrite function
  - [x] Preserve user intent
  - [x] Improve clarity and grammar
  - [x] Match vibe and occasion tone
  - [x] Filter unsafe content
  - [x] Return plain text only
- [x] Implement cover image generation function
  - [x] Generate imagery aligned with occasion + vibe
  - [x] Use clean composition and negative space
  - [x] Avoid embedded text
- [x] Create prompt templates for different vibes
- [x] Add error handling for AI API failures
- [x] Implement retry logic for transient failures

## Font Selection & Styling

- [x] Define font set for each vibe
  - [x] Warm vibe font
  - [x] Funny vibe font
  - [x] Fancy vibe font
  - [x] Chaotic vibe font
- [x] Create deterministic font mapping function
- [x] Implement font loading and fallbacks
- [x] Style card inside message with selected font

## Rate Limiting

- [x] Implement IP-based rate limiting (10 cards per IP per 24 hours)
- [x] Implement device identifier tracking (cookie/localStorage)
- [x] Implement device-based rate limiting (3 cards per device per 24 hours)
- [x] Create rate limit middleware for API routes
- [ ] Add CAPTCHA integration after threshold
- [x] Return appropriate error messages when limits exceeded

## Content Moderation

- [x] Implement pre-processing function
  - [x] Remove emails, phone numbers, addresses
  - [x] Block hate speech, harassment, threats
  - [x] Block defamatory statements about private individuals
- [x] Add content moderation checks to AI prompts
- [x] Create user-friendly error messages for blocked content
- [x] Handle public figure mentions appropriately
- [x] Block criminal accusations and personal data

## Social Sharing & Deep Links

- [x] Generate unique slugs for cards
- [x] Create deep link format: `/c/{occasion}/{slug}`
- [x] Implement share button components
- [x] Generate platform-specific share URLs
- [x] Add query params for attribution (e.g., `?src=linkedin`)
- [x] Generate Open Graph metadata
  - [x] og:image (cover image)
  - [x] og:title ("A {vibe} holiday card")
  - [x] og:description
- [x] Generate Twitter Card metadata
- [x] Test social preview rendering

## Data Retention & Cleanup

- [x] Set expires_at timestamp on card creation (30 days)
- [x] Create scheduled cleanup job (daily cron)
- [x] Implement cleanup logic:
  - [x] Find expired cards
  - [x] Delete database records
  - [x] Delete stored images from S3/R2
  - [x] Delete any derived assets
- [x] Add logging for cleanup operations
- [x] Handle cleanup failures gracefully

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

- [x] Write API documentation
- [x] Document environment variables
- [x] Create deployment guide
- [x] Document how to add new holidays
- [x] Document how to add new vibes
- [x] Create README with setup instructions
