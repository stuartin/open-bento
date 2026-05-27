import type { User } from "better-auth"
import { auth } from "../auth"
import type { Organization } from "better-auth/plugins"

export const initOrganizationWithAdmin = async () => {
    const organization = await initOrganization()
    const admin = await initAdmin([organization.id])
    await initAdminToOrganization(admin, organization)
}


const initOrganization = async () => {
    const context = await auth.$context
    const adapter = context.adapter

    const organizations = await adapter.findMany<Organization>({
        model: "organization"
    })

    if (organizations.length > 0 && organizations[0]) return organizations[0]

    // biome-ignore lint/suspicious/noExplicitAny: required
    const organization = await adapter.create<any, Organization>({
        model: "organization",
        data: {
            name: "customer name",
            slug: "organization",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    })

    return organization
}

const initAdmin = async (organizationIds: string[]) => {
    const context = await auth.$context
    const internalAdapter = context.internalAdapter
    const passwordUtil = context.password
    const ADMIN_EMAIL = "admin@local.com"

    // if (dev) {
    //     const existingAdmin = await internalAdapter.findUserByEmail(ADMIN_EMAIL)
    //     if (existingAdmin) await internalAdapter.deleteUser(existingAdmin.user.id)
    // }

    const existingAdmin = await internalAdapter.findUserByEmail(ADMIN_EMAIL)
    if (existingAdmin) return existingAdmin.user

    const admin = await internalAdapter.createUser({
        email: ADMIN_EMAIL,
        emailVerified: true,
        name: "admin",
        organizationIds,
        createdAt: new Date(),
        updatedAt: new Date(),
    })

    const hashedPassword = await passwordUtil.hash("Password12#")
    await internalAdapter.linkAccount({
        accountId: admin.email,
        providerId: "credential",
        password: hashedPassword,
        userId: admin.id,
    })

    return admin
}

const initAdminToOrganization = async (admin: User, organization: Organization) => {
    const context = await auth.$context
    const adapter = context.adapter

    const existingMember = await adapter.findOne<{ id: string }>({
        model: "member",
        where: [
            { field: "userId", value: admin.id },
            { field: "organizationId", value: organization.id },
        ],
    })

    if (existingMember) return

    await adapter.create({
        model: "member",
        data: {
            organizationId: organization.id,
            userId: admin.id,
            role: "owner",
            createdAt: new Date(),
        },
    })
}