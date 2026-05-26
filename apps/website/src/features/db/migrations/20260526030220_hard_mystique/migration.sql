CREATE TABLE `plans` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`run_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`log_read_url` text NOT NULL,
	`has_changes` integer DEFAULT false NOT NULL,
	`resource_additions` integer,
	`resource_changes` integer,
	`resource_destructions` integer,
	CONSTRAINT `fk_plans_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_plans_workspace_id_workspaces_id_fk` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_plans_run_id_runs_id_fk` FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `plans_organizationId_idx` ON `plans` (`organization_id`);--> statement-breakpoint
CREATE INDEX `plans_workspaceId_idx` ON `plans` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `plans_runId_idx` ON `plans` (`run_id`);