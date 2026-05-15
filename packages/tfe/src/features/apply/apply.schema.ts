import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Get Apply ---

export const GetApplyInput = z.object({
  params: z.object({
    applyId: z.string().describe("Apply ID"),
  }),
  headers: AuthHeadersSchema,
});

export const ApplyAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "managed_queued",
    "queued",
    "agent_queued",
    "running",
    "errored",
    "canceled",
    "finished",
    "unreachable",
  ]),
  "log-read-url": z.string().optional(),
  "resource-additions": z.number().optional(),
  "resource-changes": z.number().optional(),
  "resource-destructions": z.number().optional(),
});

export type Apply = z.infer<typeof ApplyAttributesSchema> & {
  id: string;
};

export const GetApplyOutput = z.object({
  data: z.object({
    type: z.literal("applies"),
    id: z.string(),
    attributes: ApplyAttributesSchema,
  }),
});

export const serializeApply: EntitySerializer<Apply> = {
  getId: (apply) => apply.id,
  serialize: (apply) => ({
    attributes: {
      status: apply.status,
      "log-read-url": apply["log-read-url"],
      "resource-additions": apply["resource-additions"],
      "resource-changes": apply["resource-changes"],
      "resource-destructions": apply["resource-destructions"],
    },
  }),
};

export const deserializeApply = createDeserializer({
  type: "applies",
  cardinality: "one",
  attributesSchema: ApplyAttributesSchema,
});
