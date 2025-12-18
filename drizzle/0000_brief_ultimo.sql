CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`occasion_id` text NOT NULL,
	`vibe` text NOT NULL,
	`clean_message` text NOT NULL,
	`cover_image_url` text NOT NULL,
	`theme_version` text DEFAULT '1.0' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	`creator_hash` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	FOREIGN KEY (`occasion_id`) REFERENCES `occasions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cards_slug_unique` ON `cards` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `cards` (`slug`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `cards` (`expires_at`);--> statement-breakpoint
CREATE INDEX `creator_hash_idx` ON `cards` (`creator_hash`);--> statement-breakpoint
CREATE TABLE `occasions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`style_guide` text NOT NULL,
	`font_set` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
