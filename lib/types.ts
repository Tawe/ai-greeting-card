// Database types
export interface Occasion {
  id: string;
  name: string;
  is_active: boolean;
  style_guide: Record<string, unknown>;
  font_set: string[];
  created_at: Date;
}

export interface Card {
  id: string;
  slug: string;
  occasion_id: string;
  vibe: string;
  clean_message: string;
  cover_image_url: string;
  theme_version: string;
  created_at: Date;
  expires_at: Date;
  creator_hash: string;
  status: 'draft' | 'published';
}

export type Vibe = 'warm' | 'funny' | 'fancy' | 'chaotic';

export interface CreateCardRequest {
  occasion: string;
  vibe: Vibe;
  message: string;
}
