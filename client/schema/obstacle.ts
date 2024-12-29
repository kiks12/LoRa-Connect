import { z } from "zod";

export const obstacleSchema = z.object({
	name: z.string(),
  type: z.string(),
  longitude: z.coerce.number(),
  latitude: z.coerce.number()
});


