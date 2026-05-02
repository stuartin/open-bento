import z, { ZodObject } from "zod";

export const tfeEntitySchema = <TEntity extends ZodObject, TRelationships extends ZodObject>(type: string, entitySchema: TEntity, relationshipsSchema?: TRelationships) => {
    const EntitySchema = z.object({
        id: z.string(),
        type: z.literal(type),
        attributes: entitySchema,
    })

    const EntityResponseSchema = z.object({
        data: relationshipsSchema
            ? EntitySchema.extend({ relationships: relationshipsSchema })
            : EntitySchema,
    })

    return EntityResponseSchema
}