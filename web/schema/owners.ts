import { z } from "zod";

export const ownerSchema= z.object({
  name: z.string().min(1, {
    message: "Name should be at least 1 character"
  }),
  address: z.string().nonempty({
    message: "Address should not be empty"
  }),
	numberOfMembersInFamily: z.coerce.number().int().nonnegative({
    message: "Number should not be negative"
  }),
  braceletId: z.string()
});
