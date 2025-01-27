import { z } from "zod";

export const braceletSchema = z.object({
  braceletId: z.string().min(8, {
    message: "Bracelet ID should be at least 8 characters"
  }),
	name: z.string().min(5, {
		message: "Name should be at least 5 characters",
	}),
  type: z.string()
});

