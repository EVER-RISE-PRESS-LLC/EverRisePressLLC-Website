CREATE TABLE `retailer_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`book_id` text NOT NULL,
	`retailer` text NOT NULL,
	`format_type` text NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`country` text,
	`partner_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`partner_id`) REFERENCES `referral_partners`(`id`) ON UPDATE no action ON DELETE no action
);
