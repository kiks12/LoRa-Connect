import { z } from "zod";

export const evacuationCenterSchema= z.object({
  name: z.string().min(1, {
    message: "Name should be at least 1 character"
  }),
  capacity: z.coerce.number().nonnegative({
    message: "Capacity should not be negative"
  }),
  longitude: z.coerce.number(),
  latitude: z.coerce.number(),
});


