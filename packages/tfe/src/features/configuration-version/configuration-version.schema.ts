import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
export const ConfigurationVersionAttributesSchema = z.object({
  "auto-queue-runs": z.boolean(),
  speculative: z.boolean(),
  provisional: z.boolean(),
  status: z.enum(["pending", "uploaded", "errored"]),
  "upload-url": z.string(),
});

// Type
export type ConfigurationVersion = z.infer<
  typeof ConfigurationVersionAttributesSchema
> & {
  id: string;
};

// Serializer
export const serializeConfigurationVersion: EntitySerializer<ConfigurationVersion> =
{
  getId: (cv) => cv.id,
  serialize: (cv) => ({
    attributes: {
      "auto-queue-runs": cv["auto-queue-runs"],
      speculative: cv.speculative,
      provisional: cv.provisional,
      status: cv.status,
      "upload-url": cv["upload-url"],
    },
  }),
};

// Deserializer
export const deserializeConfigurationVersion = createDeserializer({
  type: "configuration-versions",
  cardinality: "one",
  attributesSchema: ConfigurationVersionAttributesSchema,
});
