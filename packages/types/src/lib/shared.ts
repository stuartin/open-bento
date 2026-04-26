import z from "zod";

export const IdSchema = z.cuid2()

export const ListSchema = <T extends z.ZodType>(schema: T) => z.object({
    results: schema.array()
})