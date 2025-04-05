import { z } from "zod";

export const obstacleSchema = z.object({
	name: z.string().nonempty({
    message: "Name should not be empty"
  }),
  type: z.string().nonempty({
    message: "Type should not be empty"
  }),
  customType: z.string(),
  longitude: z.coerce.number(),
  latitude: z.coerce.number()
});


