import { z } from "zod";



// --- Auth Headers ---

export const AuthHeadersSchema = z.object({
  // authorization: z.string().describe("Bearer token"),
  // "content-type": z.literal("application/vnd.api+json").optional(),
});

// --- JSON:API Resource Schema ---

const JsonApiResource = <
  const TType extends string,
  TAttributes extends z.ZodType,
  TRelationships extends z.ZodType | undefined = undefined
>(
  type: TType,
  attributes: TAttributes,
  relationships?: TRelationships
): z.ZodObject<
  TRelationships extends undefined
  ? {
    type: z.ZodLiteral<TType>;
    id: z.ZodString;
    attributes: TAttributes;
  }
  : {
    type: z.ZodLiteral<TType>;
    id: z.ZodString;
    attributes: TAttributes;
    relationships: TRelationships
  }
> =>
  z.object({
    type: z.literal(type),
    id: z.string(),
    attributes,
    ...(relationships && { relationships }),
  }) as any;

const test = JsonApiResource(
  "my-type",
  z.object({
    data: z.object({
      prop: z.string()
    })
  }),
  z.object({
    plan: z.object({
      type: z.literal("plans"),
      id: z.string()
    })
  })
)

// --- JSON:API Document Wrappers ---

export const JsonApiDocument = <
  const TType extends string,
  TSchema extends z.ZodType,
  TRelationships extends z.ZodType | undefined = undefined
>(
  type: TType,
  attributesSchema: TSchema,
  relationshipsSchema?: TRelationships
) => {
  return z.object({
    data: JsonApiResource(type, attributesSchema, relationshipsSchema),
  });
};

export const JsonApiCollection = <
  const TType extends string,
  TSchema extends z.ZodType,
  TRelationships extends z.ZodType | undefined = undefined
>(
  type: TType,
  attributesSchema: TSchema,
  relationshipsSchema?: TRelationships
) => {
  return z.object({
    data: z.array(
      JsonApiResource(type, attributesSchema, relationshipsSchema)
    ),
  });
};

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
