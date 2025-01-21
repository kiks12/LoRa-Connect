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

export type OperationsWithPayload = Prisma.OperationsGetPayload<{
  include: {
    evacuationCenter: true,
    owner: true,
    rescuer: true,
    VictimStatusReport: true,
    _count: true
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

export type EvacuationInstruction = {
  ownerId: number,
  ownerName: string,
  evacuationCenterId: number,
  evacuationCenterName: string,
  time: number, 
  distance: number,
  coordinates: number[][]
}

export type OwnerWithStatusIdentifier = OwnerWithBracelet & StatusIdentifier

export type RescuerWithStatusIdentifier = RescuerWithBracelet & StatusIdentifier

export type GraphHopperAPIResult = {
  hints: {
    "visited_nodes.sum": number,
    "visited_nodes.average": number,
  },
  info: {
    copyrights: string[],
    took: number,
    road_data_timestamp: DateTime,
  },
  paths: {
    distance: number,
    weight: number,
    time: number, 
    transfers: number, 
    points_encoded: boolean,
    bbox: number[],
    points: {
      type: string,
      coordinates: number[][]
    },
    instructions: {
      distance: number,
      heading: number, 
      sign: number,
      time: number,
      interval: number[],
      text: string,
      street_name: string,
    }[],
    legs: [],
    snapped_waypoints: {
      type: string,
      coordinates: number[][]
    }
  }[]
}