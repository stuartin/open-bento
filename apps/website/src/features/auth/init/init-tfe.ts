import { db } from "$features/db"
import { entitlementSets, workspaces } from "$features/db/schema"

export const initTFE = async () => {
    const organization = await db.query.organizations.findFirst()
    if (!organization) return

    // entitlement sets
    await db
        .insert(entitlementSets)
        .values({ organizationId: organization.id })
        .onConflictDoNothing()

    // workspace
    await db
        .insert(workspaces)
        .values({
            organizationId: organization.id,
            name: "workspace"
        })
        .onConflictDoNothing()
}