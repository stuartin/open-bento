import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";

// Schema
export const StateVersionOutputAttributesSchema = z.object({
  name: z.string(),
  sensitive: z.boolean(),
  value: z.any(),
  "detailed-type": z.string().nullable(),
});

// Type
export type StateVersionOutput = z.infer<
  typeof StateVersionOutputAttributesSchema
> & {
  id: string;
};

// Serializer
export const serializeStateVersionOutput: EntitySerializer<StateVersionOutput> =
{
  getId: (output) => output.id,
  serialize: (output) => ({
    attributes: {
      name: output.name,
      sensitive: output.sensitive,
      value: output.value,
      "detailed-type": output["detailed-type"],
    },
  }),
};

// Note: State version outputs are typically included in state version responses
// See deserializeStateVersion in state-version.schema.ts for included outputs
