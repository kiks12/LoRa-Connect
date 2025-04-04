import { z } from "zod";

export const braceletSchema = z.object({
  braceletId: z.string()
    .min(4, { message: "Device ID should be 4 characters" })
    .max(4, { message: "Device ID should be 4 characters" })
    .regex(/^\d+$/, { message: "Device ID should contain only numbers" }), // Ensure only numbers
  name: z.string().nonempty({
    message: "Device name should not be empty"
  }),
  type: z.string()
});
