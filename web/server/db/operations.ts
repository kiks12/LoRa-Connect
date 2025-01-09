import { client } from "@/prisma/client"
import { OPERATIONS_TAG } from "@/utils/tags"
import { Operations } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getLatestOperations() {
  return await client.operations.findMany() 
}

export const getOperationsCached = unstable_cache(async () => {
  return await client.operations.findMany({
    include: {
      evacuationCenter: true,
      owner: true,
      rescuer: true,
    }
  })
}, [OPERATIONS_TAG], {tags: [OPERATIONS_TAG]})

export async function createOperation({operation}: {operation: Operations}) {
  return await client.operations.create({
    data: {
      rescuersRescuerId: operation.rescuersRescuerId,
      ownersOwnerId: operation.ownersOwnerId,
      evacuationCentersEvacuationId: operation.evacuationCentersEvacuationId,
      numberOfRescuee: operation.numberOfRescuee,
      status: operation.status,
      urgency: operation.urgency,
      createAt: operation.createAt,
      dateTime: operation.dateTime
    } 
  })
}

export async function updateOperation({operation}: {operation: Operations}) {
  return await client.operations.update({
    where: {
      missionId: operation.missionId
    },
    data: {
      dateTime: operation.dateTime,
      evacuationCentersEvacuationId: operation.evacuationCentersEvacuationId,
      numberOfRescuee: operation.numberOfRescuee,
      ownersOwnerId: operation.ownersOwnerId,
      status: operation.status,
      urgency: operation.urgency,
      rescuersRescuerId: operation.rescuersRescuerId,
    } 
  })
}

export async function deleteOperation({operationId}: {operationId: number}) {
  return await client.operations.delete({
    where: {
      missionId: operationId
    }
  }) 
}