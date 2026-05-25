DROP INDEX IF EXISTS `entitlementSets_organizationId_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `entitlementSets_organizationId_uidx` ON `entitlement_sets` (`organization_id`);