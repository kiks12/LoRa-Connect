import { z } from "zod";

export const ownerSchema = z.object({
  givenName: z.string()
    .nonempty({ message: "Given Name should not be empty" })
    .regex(/^[A-Za-z\s]+$/, { message: "Given Name should only contain letters" }),
  middleName: z.string()
    .regex(/^[A-Za-z\s]*$/, { message: "Middle Name should only contain letters" }) ,// Allows empty but only letters if filled
  suffix: z.string()
    .regex(/^[A-Za-z\s]*$/, { message: "Suffix should only contain letters" }), // Allows optional suffix like "Jr" or "III"
  lastName: z.string()
    .nonempty({ message: "Last Name should not be empty" })
    .regex(/^[A-Za-z\s]+$/, { message: "Last Name should only contain letters" }),
  address: z.string()
    .nonempty({ message: "Address should not be empty" }),
  numberOfMembersInFamily: z.coerce.number()
    .int()
    .min(1)
    .nonnegative({ message: "Number should not be negative" }),
  braceletId: z.string()
});
