CREATE TABLE `configuration_versions` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`auto_queue_runs` integer DEFAULT false NOT NULL,
	`speculative` integer DEFAULT false NOT NULL,
	`provisional` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`upload_url` text,
	CONSTRAINT `fk_configuration_versions_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_configuration_versions_workspace_id_workspaces_id_fk` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `configurationVersions_organizationId_idx` ON `configuration_versions` (`organization_id`);--> statement-breakpoint
CREATE INDEX `configurationVersions_workspaceId_idx` ON `configuration_versions` (`organization_id`);