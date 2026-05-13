import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
export const OrganizationAttributesSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  "external-id": z.string().optional(),
});

// Type
export type Organization = z.infer<typeof OrganizationAttributesSchema> & {
  id: string;
};

// Serializer
export const serializeOrganization: EntitySerializer<Organization> = {
  getId: (org) => org.id,
  serialize: (org) => ({
    attributes: {
      name: org.name,
      email: org.email,
      "external-id": org["external-id"],
    },
  }),
};

// Deserializer
export const deserializeOrganization = createDeserializer({
  type: "organizations",
  cardinality: "one",
  attributesSchema: OrganizationAttributesSchema,
});
