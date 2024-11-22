import { z } from "zod";

export const rescuerSchema= z.object({
  name: z.string().min(1, {
    message: "Name should be at least 1 character"
  }),
  braceletId: z.string()
});

