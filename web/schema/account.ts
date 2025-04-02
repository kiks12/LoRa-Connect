import { z } from "zod";

export const accountSchema = z.object({
  email: z.string().nonempty({
    message: "Email should not be empty"
  }).email({
    message: "Invalid email format"
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine((value) => /[a-z]/.test(value), {
      message: "Password must contain at least one lowercase letter"
    })
    .refine((value) => /[A-Z]/.test(value), {
      message: "Password must contain at least one uppercase letter"
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least one number"
    })
    .refine((value) => /[@$!%*?&^#]/.test(value), {
      message: "Password must contain at least one special character (@$!%*?&^#)"
    })
});
