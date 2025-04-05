import { z } from "zod";

export const braceletSchema = z.object({
  braceletId: z.string()
    .min(4, { message: "Device ID should be 4 characters" })
    .max(4, { message: "Device ID should be 4 characters" })
    .regex(/^\d+$/, { message: "Device ID should contain only numbers" }),
  macAddress: z.string()
    .nonempty({ message: "MAC Address should not be empty" })
    .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
      message: "MAC Address must be in format 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E"
    }),
  name: z.string().nonempty({
    message: "Device name should not be empty"
  }),
  type: z.string()
});
