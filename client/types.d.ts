import { Prisma } from "@prisma/client";

export type OwnerWithBracelet = Prisma.OwnersGetPayload<{
  include: {
    bracelet: true
  }
}>

export type RescuerWithBracelet = Prisma.RescuersGetPayload<{
  include: {
    bracelet: true
  }
}>