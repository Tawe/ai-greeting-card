import { pgTable, varchar, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const occasions = pgTable('occasions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(false),
  styleGuide: jsonb('style_guide').notNull().$type<Record<string, unknown>>(),
  fontSet: jsonb('font_set').notNull().$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cards = pgTable('cards', {
  id: varchar('id', { length: 255 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  occasionId: varchar('occasion_id', { length: 255 }).notNull().references(() => occasions.id),
  vibe: varchar('vibe', { length: 50 }).notNull(),
  cleanMessage: varchar('clean_message', { length: 5000 }).notNull(),
  coverImageUrl: varchar('cover_image_url', { length: 1000 }).notNull(),
  themeVersion: varchar('theme_version', { length: 50 }).notNull().default('1.0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  creatorHash: varchar('creator_hash', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft').$type<'draft' | 'published'>(),
}, (table) => ({
  slugIdx: index('slug_idx').on(table.slug),
  expiresAtIdx: index('expires_at_idx').on(table.expiresAt),
  creatorHashIdx: index('creator_hash_idx').on(table.creatorHash),
}));
