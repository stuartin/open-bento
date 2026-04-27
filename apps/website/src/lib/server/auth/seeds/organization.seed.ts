import type { User } from "better-auth"
import { auth } from ".."
import type { Organization } from "better-auth/plugins"
import { dev } from "$app/environment"

export const seedOrganizationAdmin = async () => {
    const organization = await seedOrganization()
    const admin = await seedAdmin()
    await seedAdminToOrganization(admin, organization)
}


const seedOrganization = async () => {
    const context = await auth.$context
    const adapter = context.adapter

    const organizations = await adapter.findMany<Organization>({
        model: "organization"
    })

    if (organizations.length > 0) return organizations[0]!

    const organization = await adapter.create<any, Organization>({
        model: "organization",
        data: {
            name: "org",
            slug: "org",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    })

    return organization
}

const seedAdmin = async () => {
    const context = await auth.$context
    const internalAdapter = context.internalAdapter
    const passwordUtil = context.password
    const ADMIN_EMAIL = "admin@local.com"

    if (dev) {
        const existingAdmin = await internalAdapter.findUserByEmail(ADMIN_EMAIL)
        if (existingAdmin) await internalAdapter.deleteUser(existingAdmin.user.id)
    }

    const existingAdmin = await internalAdapter.findUserByEmail(ADMIN_EMAIL)
    if (existingAdmin) return existingAdmin.user

    // const admin2 = await auth.api.signUpEmail({
    //     body: {
    //         email: "admin@local.com",
    //         name: "admin",
    //         password: "Passwor12#"
    //     }
    // })

    // console.log({ admin2 })

    const admin = await internalAdapter.createUser({
        email: ADMIN_EMAIL,
        emailVerified: true,
        name: "admin",
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

const seedAdminToOrganization = async (admin: User, organization: Organization) => {
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