CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`execution_mode` text DEFAULT 'remote' NOT NULL,
	`terraform_version` text DEFAULT 'latest' NOT NULL,
	`locked` integer DEFAULT false NOT NULL,
	`permissions` text DEFAULT '{"can-queue-run":true}' NOT NULL,
	CONSTRAINT `fk_workspaces_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `workspaces_organizationId_idx` ON `workspaces` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `workspaces_organizationId_name_uidx` ON `workspaces` (`organization_id`,`name`);