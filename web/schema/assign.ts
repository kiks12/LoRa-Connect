import { z } from "zod";

export const assignSchema = z.object({
  braceletId: z.string().nonempty({
    message: "Bracelet ID should not be empty"
  }),
  braceletName: z.string().nonempty({
    message: "Bracelet name should not be empty"
  }),
  ownerId: z.coerce.number().nonnegative({
    message: "Owner ID should not be negative"
  }),
  ownerName: z.string().nonempty({
    message: "Owner name should not be empty"
  }),
  isRescuer: z.boolean()
})