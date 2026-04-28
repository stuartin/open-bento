import z, { ZodAny, ZodObject } from "zod";
import { IdSchema } from "./shared";

export const toEntityResponseSchema = <T extends ZodObject>(type: string, entitySchema: T) => {
    const EntitySchema = z.object({
        id: IdSchema,
        type: z.literal(type),
        attributes: entitySchema,
    })

    const EntityResponseSchema = z.object({
        data: EntitySchema,
    })

    return EntityResponseSchema
}