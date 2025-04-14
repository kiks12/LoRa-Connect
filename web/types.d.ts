import { EvacuationCenters, Prisma, Obstacle } from "@prisma/client";

export type UserWithBracelet = Prisma.UsersGetPayload<{
  include: {
    bracelet: true
  }
}>

export type BraceletWithOwnerRescuer = Prisma.BraceletsGetPayload<{
  include: {
    user: true,
    rescuer: true
  }
}>

export type RescuerWithBracelet = Prisma.RescuersGetPayload<{
  include: {
    bracelet: true,
    Teams: true,
  }
}>

export type OperationsWithPayload = Prisma.OperationsGetPayload<{
  include: {
    evacuationCenter: true,
    user: {
      include: {
        bracelet: true
      }
    },
    Teams: {
      include: {
        rescuers: {
          include: {
            bracelet: true
          }
        }
      }
    },
    VictimStatusReport: true,
    _count: true
  }
}>

export type LocationDataFromPy = {
  latitude: number,
  longitude: number,
  braceletId: string,
}

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
  ownerBraceletId: string,
  ownerId: number,
  ownerName: string,
  evacuationCenterId: number,
  evacuationCenterName: string,
  time: number, 
  distance: number,
  coordinates: number[][],
  message: string,
}

export type UserWithStatusIdentifier = UserWithBracelet & StatusIdentifier

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
    details: {
      average_speed: number[]
    }
    legs: [],
    snapped_waypoints: {
      type: string,
      coordinates: number[][]
    }
  }[]
}

export type TeamWithRescuer = Prisma.TeamsGetPayload<{
  include: {
    rescuers: {
      include: {
        bracelet: true
      }
    },
  }
}>

export type TeamWithStatusIdentifier = TeamWithRescuer & StatusIdentifier

export type TeamAssignmentCost = {
  userId: number, 
  teamId: number, 
  urgency: number,
  coordinates: number[][]
  distance: number, 
  time: number,
}

export type MissionWithCost = {
  packetId: string,
  missionId: string;

  userId: number;
  userLat: number;
  userLong: number;
  user: UserWithStatusIdentifier;
  userBraceletId: string;
  numberOfRescuee: number,
  status: string,
  urgency: number,
  
  teamId: number;
  Teams: TeamWithStatusIdentifier;
  teamBraceletId: string;
  distance: number | undefined;
  time: number | undefined;
  coordinates: number[][] | undefined;
}

type AssignedMission = {
  userId: number;
  teamId: number;
  coordinates: number[][];
  distance: number;
  time: number;
  rescuerAvailableAt: number; // Tracks when the rescuer is available for the next task
};
