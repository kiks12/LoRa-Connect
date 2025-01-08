import { EvacuationCenters, Prisma } from "@prisma/client";

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

type StatusIdentifier = {
  showing: boolean,
}

export type ObstacleWithStatusIdentifier = Obstacle & StatusIdentifier

export type EvacuationCenterWithStatusIdentifier = EvacuationCenters & StatusIdentifier 

export type OwnerWithStatusIdentifier = OwnerWithBracelet & StatusIdentifier

export type RescuerWithStatusIdentifier = RescuerWithBracelet & StatusIdentifier