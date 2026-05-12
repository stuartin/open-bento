import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
export const StateVersionAttributesSchema = z.object({
  "created-at": z.string(),
  serial: z.number(),
  status: z.enum(["pending", "finalized", "discarded"]),
  "hosted-state-download-url": z.string(),
});

// Type
export type StateVersion = z.infer<typeof StateVersionAttributesSchema> & {
  id: string;
  outputIds?: string[];
};

// Serializer
export const serializeStateVersion: EntitySerializer<StateVersion> = {
  getId: (sv) => sv.id,
  serialize: (sv) => ({
    attributes: {
      "created-at": sv["created-at"],
      serial: sv.serial,
      status: sv.status,
      "hosted-state-download-url": sv["hosted-state-download-url"],
    },
    relationships: {
      ...(sv.outputIds && {
        outputs: {
          data: sv.outputIds.map((id) => ({
            type: "state-version-outputs",
            id,
          })),
        },
      }),
    },
  }),
};

// Deserializer
export const deserializeStateVersion = createDeserializer({
  type: "state-versions",
  cardinality: "one",
  attributesSchema: StateVersionAttributesSchema,
  relationships: {
    outputs: {
      type: "state-version-outputs",
      cardinality: "many",
    },
  },
});

export const deserializeStateVersions = createDeserializer({
  type: "state-versions",
  cardinality: "many",
  attributesSchema: StateVersionAttributesSchema,
});
