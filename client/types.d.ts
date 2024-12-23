import { Prisma } from "@prisma/client";

export type OwnerWithBracelet = Prisma.OwnersGetPayload<{
  include: {
    bracelet: true
  }
}>

export type BraceletWithOwnerRescuer = Prisma.BraceletsGetPayload<{
  include: {
    owner: true,
    rescuer: true
  }
}>

export type RescuerWithBracelet = Prisma.RescuersGetPayload<{
  include: {
    bracelet: true
  }
}>

export type LocationDataFromLoRa = {
  latitude: number, 
  longitude: number,
  braceletId: string,
  rescuer: boolean
}