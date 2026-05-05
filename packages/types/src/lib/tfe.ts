import z, { ZodArray, ZodObject } from "zod";

export const tfeEntitySchema =
    <
        TEntity extends ZodObject,
        TRelationships extends ZodObject,
        TIncluded extends ZodObject | ZodArray<ZodObject>
    >(
        name: string,
        entitySchema: TEntity,
        opts?: {
            relationshipsSchema?: TRelationships,
            includedSchema?: TIncluded,
            type?: "get" | "list"
        }
    ) => {

        const defaultOpts = {
            relationshipsSchema: undefined,
            includedSchema: undefined,
            type: 'get',
            ...opts
        }

        const EntitySchema = z.object({
            id: z.string(),
            type: z.literal(name),
            attributes: entitySchema,
        })

        const data = defaultOpts.relationshipsSchema
            ? EntitySchema.extend({ relationships: defaultOpts.relationshipsSchema })
            : EntitySchema


        const EntityResponseSchema = z.object({
            data: defaultOpts.type === "get"
                ? data
                : data.array()
        })

        if (defaultOpts.includedSchema) {
            return EntityResponseSchema.extend({
                included: defaultOpts.includedSchema
            })
        }

        return EntityResponseSchema
    }