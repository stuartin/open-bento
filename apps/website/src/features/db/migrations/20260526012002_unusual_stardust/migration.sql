CREATE TABLE `runs` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`configuration_version_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`has_changes` integer DEFAULT false NOT NULL,
	`auto_apply` integer DEFAULT false NOT NULL,
	`refresh` integer DEFAULT false NOT NULL,
	`is_destroy` integer DEFAULT false NOT NULL,
	`plan_only` integer DEFAULT true NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	`position_in_queue` integer DEFAULT 0 NOT NULL,
	`actions` text DEFAULT '{"is-cancelable":true,"is-confirmable":true,"is-discardable":true,"is-force-cancelable":true}' NOT NULL,
	`permissions` text DEFAULT '{"can-apply":true,"can-cancel":true,"can-comment":true,"can-discard":true,"can-force-execute":true,"can-force-cancel":true,"can-override-policy-check":true}',
	`variables` text DEFAULT '[]',
	CONSTRAINT `fk_runs_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_runs_workspace_id_workspaces_id_fk` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_runs_configuration_version_id_configuration_versions_id_fk` FOREIGN KEY (`configuration_version_id`) REFERENCES `configuration_versions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `runs_organizationId_idx` ON `runs` (`organization_id`);--> statement-breakpoint
CREATE INDEX `runs_workspaceId_idx` ON `runs` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `runs_configurationVersionId_idx` ON `runs` (`configuration_version_id`);