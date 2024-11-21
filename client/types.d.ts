import { Prisma } from "@prisma/client";

export type OwnerWithBracelet = Prisma.OwnersGetPayload<{
  include: {
    bracelet: true
  }
}>