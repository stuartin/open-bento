import z, { ZodAny, ZodObject } from "zod";
import { IdSchema } from "./shared";

export const tfeEntitySchema = <TEntity extends ZodObject, TRelationships extends ZodObject>(type: string, entitySchema: TEntity, relationshipsSchema?: TRelationships) => {
    const EntitySchema = z.object({
        id: IdSchema,
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