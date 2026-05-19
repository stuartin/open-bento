import { z } from "zod";



// --- Auth Headers ---

export const AuthHeadersSchema = z.object({
  authorization: z.string().describe("Bearer token"),
  "content-type": z.literal("application/vnd.api+json").optional(),
});

// --- JSON:API Resource Schema ---

const JsonApiResource = <const TType extends string, TSchema extends z.ZodTypeAny>(
  type: TType,
  attributesSchema: TSchema
) =>
  z.object({
    type: z.literal(type),
    id: z.string(),
    attributes: attributesSchema,
    relationships: z.record(z.string(), z.any()).optional(),
  });

// --- JSON:API Document Wrappers ---

export const JsonApiDocument = <const TType extends string, TSchema extends z.ZodTypeAny>(
  type: TType,
  attributesSchema: TSchema
) =>
  z.object({
    data: JsonApiResource(type, attributesSchema),
  });

export const JsonApiCollection = <const TType extends string, TSchema extends z.ZodTypeAny>(
  type: TType,
  attributesSchema: TSchema
) =>
  z.object({
    data: z.array(JsonApiResource(type, attributesSchema)),
  });

// --- oRPC Input/Output Helpers ---

type InputType = {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  headers?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
};

export const ORPCInput = <T extends InputType>(options: T) => {
  const shape = Object.fromEntries(
    Object.entries(options).filter(([, v]) => v !== undefined)
  ) as {
      [K in keyof T as T[K] extends z.ZodTypeAny ? K : never]: Exclude<T[K], undefined>;
    };

  return z.object(shape);
};

type OutputType = {
  body: z.ZodTypeAny;
  status?: z.ZodTypeAny;
  headers?: z.ZodTypeAny;
};

export const ORPCOutput = <T extends OutputType>(options: T) => {
  const shape = Object.fromEntries(
    Object.entries(options).filter(([, v]) => v !== undefined)
  ) as {
      [K in keyof T as T[K] extends z.ZodTypeAny ? K : never]: Exclude<T[K], undefined>;
    };

  return z.object(shape);
};
