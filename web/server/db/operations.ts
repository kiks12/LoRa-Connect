import { client } from "@/prisma/client"
import { OPERATIONS_TAG } from "@/utils/tags"
import { Operations } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getLatestOperations() {
  return await client.operations.findMany({
    include: {
      evacuationCenter: true,
      owner: true,
      rescuer: true,
      VictimStatusReport: true,
      _count: true
    }
  }) 
}

export async function getOperationsFromLastDays(days: number) : Promise<{date: string, count: number}[]> {
  const lastDay = Date.now() - days * 24 * 60 * 60 * 1000; // Calculate the date range
  const startDate = new Date(lastDay);
  const endDate = new Date();
  // Convert startDate to ISO format
  const isoStartDate = startDate.toISOString();

  // Fetch grouped operations from the database
  const results = await client.$queryRaw<
    { date: string; count: bigint }[]
  >`
    SELECT
      DATE(createAt) AS date, -- Extract the date part only
      COUNT(*) AS count
    FROM
      operations
    WHERE
      createAt >= ${isoStartDate} -- Filter records within the date range
    GROUP BY
      DATE(createAt) -- Group by the extracted date
    ORDER BY
      DATE(createAt) ASC; -- Sort by the extracted date
  `;

  // Convert database result to a Map for easy lookup
  const resultMap = new Map(
    results.map((result) => [new Date(result.date).toISOString().split("T")[0], Number(result.count)]) // Convert BigInt to Number
  );

  // Generate a complete range of dates
  const completeDateRange = [];
  for (
    let current = new Date(startDate);
    current <= endDate;
    current.setDate(current.getDate() + 1)
  ) {
    completeDateRange.push(new Date(current).toISOString().split("T")[0]); // Extract only the date part
  }``

  // Merge the results with the complete date range, filling missing dates with count: 0
  const filledResults = completeDateRange.map((date) => ({
    date,
    count: resultMap.get(date) || 0, // Use 0 if the date is missing in the results
  }));

  return filledResults;
}

export const getOperationsCached = unstable_cache(async () => {
  return await client.operations.findMany({
    include: {
      evacuationCenter: true,
      owner: true,
      rescuer: true,
      VictimStatusReport: true,
      _count: true
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