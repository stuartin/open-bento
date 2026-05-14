import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Attributes Schema ---

export const StateVersionAttributesSchema = z.object({
  "created-at": z.string(),
  serial: z.number(),
  status: z.enum(["pending", "finalized", "discarded"]),
  "hosted-state-download-url": z.string(),
});

export type StateVersion = z.infer<typeof StateVersionAttributesSchema> & {
  id: string;
  outputIds?: string[];
};

// --- Get Current State Version ---

export const GetCurrentStateVersionInput = z.object({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetCurrentStateVersionOutput = z.object({
  data: z
    .object({
      type: z.literal("state-versions"),
      id: z.string(),
      attributes: StateVersionAttributesSchema,
    })
    .nullable(),
});

export const serializeGetCurrentStateVersionOutput: EntitySerializer<StateVersion> =
  {
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

export const deserializeGetCurrentStateVersionOutput = createDeserializer({
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

// --- Get State Version ---

export const GetStateVersionInput = z.object({
  params: z.object({
    stateVersionId: z.string().describe("State Version ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetStateVersionOutput = z.object({
  data: z.object({
    type: z.literal("state-versions"),
    id: z.string(),
    attributes: StateVersionAttributesSchema,
  }),
});

export const serializeGetStateVersionOutput: EntitySerializer<StateVersion> = {
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

export const deserializeGetStateVersionOutput = createDeserializer({
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

// --- List State Versions ---

export const ListStateVersionsInput = z.object({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  query: z
    .object({
      "page[number]": z.number().int().min(1).optional(),
      "page[size]": z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  headers: AuthHeadersSchema,
});

export const ListStateVersionsOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("state-versions"),
      id: z.string(),
      attributes: StateVersionAttributesSchema,
    })
  ),
});

export const serializeListStateVersionsOutput: EntitySerializer<StateVersion> =
  {
    getId: (sv) => sv.id,
    serialize: (sv) => ({
      attributes: {
        "created-at": sv["created-at"],
        serial: sv.serial,
        status: sv.status,
        "hosted-state-download-url": sv["hosted-state-download-url"],
      },
    }),
  };

export const deserializeListStateVersionsOutput = createDeserializer({
  type: "state-versions",
  cardinality: "many",
  attributesSchema: StateVersionAttributesSchema,
});
