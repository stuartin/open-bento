import { z } from "zod";
import { ORPCOutput } from "../../lib/common.schema";

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Ping ---

export const PingOutput = ORPCOutput({
  status: z.literal(204),
  body: z.undefined()
});