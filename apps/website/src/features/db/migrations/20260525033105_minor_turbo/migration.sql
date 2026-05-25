CREATE TABLE `entitlement_sets` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`operations` integer DEFAULT true NOT NULL,
	CONSTRAINT `fk_entitlement_sets_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `entitlementSets_organizationId_idx` ON `entitlement_sets` (`organization_id`);