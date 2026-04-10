CREATE TABLE `mcp_api_key` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`keyHash` text NOT NULL,
	`userId` text NOT NULL,
	`organizationId` text,
	`permissions` text,
	`rateLimit` integer DEFAULT 100 NOT NULL,
	`rateLimitDuration` integer DEFAULT 60000 NOT NULL,
	`lastUsedAt` integer,
	`expiresAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mcp_api_key_keyHash_unique` ON `mcp_api_key` (`keyHash`);