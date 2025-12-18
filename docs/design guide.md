# Design Specification — Component Layout & Usage

## 1. Global Layout System

### App Shell

**Purpose:** Provides consistent framing, spacing, and seasonal context.

**Structure:**

- Full-height viewport
    
- Centered content column (max-width: 960–1100px)
    
- Soft background gradient driven by selected Occasion
    

**Usage Rules:**

- Background changes with Occasion
    
- Content card always floats above background with subtle shadow
    
- No hard edges against viewport
    

---

## 2. Step-Based Creation Flow

### Step Container

**Component:** `CardCreationStep`

**Purpose:** Wraps each step in the creation flow.

**Layout:**

- Step title
    
- Short instructional subtitle
    
- Primary content area
    
- Footer navigation (Next / Back)
    

**Usage Rules:**

- Only one step visible at a time
    
- Animate transitions between steps (fade + slight vertical movement)
    

---

## 3. Occasion Selector

**Component:** `OccasionSelect`

**Purpose:** Selects the holiday/theme.

**Layout:**

- Dropdown or single-select card
    
- Displays occasion name and short descriptor
    

**Behavior:**

- Updates global background
    
- Updates available vibes
    
- Updates style tokens (accent color, gradients)
    

**v0.1 Constraint:**

- Only `Christmas` selectable
    

---

## 4. Vibe Selector

**Component:** `VibeGrid`

**Purpose:** Select emotional tone of the card.

**Layout:**

- Grid of selectable cards (2x2 or 4x1)
    
- Each card includes:
    
    - Vibe name
        
    - Short description
        

**Behavior:**

- Single selection only
    
- Selection updates preview styling hints
    

**Usage Rules:**

- No emojis
    
- Text-forward
    

---

## 5. Message Input

**Component:** `MessageEditor`

**Purpose:** Capture raw user message.

**Layout:**

- Large textarea
    
- Placeholder instructional text
    
- Character counter
    

**Behavior:**

- Accepts messy, informal input
    
- No formatting controls
    

**Usage Rules:**

- No live AI rewriting here
    
- Validation only on submit
    

---

## 6. Card Preview Container

**Component:** `CardPreview`

**Purpose:** Displays generated card in cover or open state.

**Layout:**

- Fixed aspect ratio card
    
- Centered in preview area
    
- Perspective applied for 3D animation
    

**States:**

- `cover`
    
- `open`
    

---

## 7. Card Cover

**Component:** `CardCover`

**Purpose:** Displays AI-generated cover image.

**Layout:**

- Full-bleed image
    
- Rounded corners
    

**Behavior:**

- Clickable to open card
    
- Hover hint: "Click to open"
    

**Usage Rules:**

- No UI elements over image
    
- No text overlays
    

---

## 8. Card Inside

**Component:** `CardInside`

**Purpose:** Displays cleaned message.

**Layout:**

- Card stock background
    
- Centered text block
    
- Generous margins
    

**Behavior:**

- Revealed via opening animation
    

**Usage Rules:**

- No buttons
    
- No links
    

---

## 9. Card Open Animation

**Component:** `CardFoldAnimation`

**Purpose:** Mimics physical card opening.

**Interaction:**

- Y-axis rotation
    
- Transform origin on left spine
    
- Duration: 600–800ms
    

**Usage Rules:**

- Triggered by click only
    
- Reversible
    

---

## 10. Typography Selector

**Component:** `TypographySelect`

**Purpose:** Choose text style category.

**Layout:**

- Horizontal selector
    
- Labeled style names (not font names)
    

**Options:**

- Classic Script
    
- Modern Serif
    
- Friendly Handwritten
    
- Clean Sans
    

**Behavior:**

- Updates CardInside typography
    

---

## 11. Action Controls

**Component:** `CardActions`

**Purpose:** Control regeneration and publishing.

**Buttons:**

- New Cover
    
- New Message
    
- Publish Card
    

**Usage Rules:**

- Never rendered inside card
    

---

## 12. Share Panel

**Component:** `SharePanel`

**Purpose:** Share published card.

**Layout:**

- Button group
    
- Positioned below or beside card
    

**Actions:**

- Copy link
    
- Share on X
    
- Share on Facebook
    
- Share on LinkedIn
    

**Usage Rules:**

- Uses cover image for previews
    
- No embeds inside card
    

---

## 13. Empty & Loading States

### Loading During AI Generation (Sims-Inspired)

**Problem:** Image generation can take several seconds; the experience must feel intentional and playful, not stalled.

**Component:** `GenerationLoadingScreen`

**When it appears:**

- Immediately after the user clicks **Generate**
    
- During cover regeneration (**New Cover**)
    
- Optionally during message regeneration (**New Message**) if it takes >400ms
    

**Layout (recommended):**

- Centered card-sized placeholder with soft shadow
    
- A playful loading indicator (three-dots bounce OR rotating “sparkle” icon)
    
- A **loading caption** line that changes every 1.5–2.5 seconds
    
- An optional “tip” line (smaller) that changes less frequently
    

**Behavior:**

- Captions rotate randomly from an **occasion-specific pool**
    
- Avoid progress bars (feels like work). Prefer “whimsical waiting”
    
- Provide a subtle, non-alarming cancel action: “Back” or “Cancel”
    
- If generation exceeds a threshold (e.g., 12–15s), show a gentle fallback message:
    
    - “Still cooking… sometimes the best cards take a moment.”
        
    - Offer “Try again” without blaming the user
        

**Occasion-specific messaging (examples):**

- **Christmas**
    
    - “Sprinkling a little snow…”
        
    - “Hanging the lights…”
        
    - “Warming up the cocoa…”
        
    - “Assembling festive magic…”
        
    - “Checking Santa’s list (twice)…”
        
    - “Polishing the card stock…”
        
    - “Making it extra cozy…”
        
- **Valentine’s (future)**
    
    - “Folding the sweetest note…”
        
    - “Adding a little sparkle…”
        
    - “Sealing it with a flourish…”
        
- **New Year’s (future)**
    
    - “Cueing the confetti…”
        
    - “Counting down…”
        
    - “Lighting the sparklers…”
        

**Tone rules for captions:**

- Short, present-tense, action-oriented
    
- No emojis (consistent with the rest of the UI)
    
- No mention of AI, models, tokens, or generation
    

**Visual rules (Sims vibe):**

- Captions feel like a playful “status feed”
    
- Motion is gentle and looping
    
- Keep the background on-theme (occasion gradient) while loading
    

### Skeleton States

**Component:** `CardLoadingState`

**Purpose:** Indicate generation is in progress in-place (when not using full-screen loading).

**Behavior:**

- Skeleton card block
    
- Subtle shimmer OR low-contrast pulse
    
- Friendly copy (e.g., “Creating something special…”) — but prefer the rotating captions above
    

---

## 14. Design Constraints

- No ads
    
- No watermarks
    
- No visible AI branding
    
- Calm motion only
    
- Respect whitespace
    

---

## 15. Component Philosophy

> The card is not a UI surface. The UI exists to help create the card — then steps aside.

This principle should guide all future design decisions.