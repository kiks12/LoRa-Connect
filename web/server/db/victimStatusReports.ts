import { client } from "@/prisma/client";
import { VictimStatusReport } from "@prisma/client";

export async function getVictimStatusReport({victimStatusReportId}: {victimStatusReportId: number}) {
  return await client.victimStatusReport.findFirst({
    where: {
      victimStatusReportId
    }
  })
}

export async function getVictimStatusReports({operationId}: {operationId: number}) {
  return await client.victimStatusReport.findMany({
    where: {
      operationsMissionId: operationId
    }
  })
}

export async function createMultipleVictimStatusReports({victimStatusReports, operationId}: {
  operationId: number,
  victimStatusReports: VictimStatusReport[]
}) {
  const mappedData = victimStatusReports.map((victimStatusReport) => ({...victimStatusReport, operationsMissionId: operationId}))

  return await client.victimStatusReport.createMany({
    data: mappedData
  })
}

export async function createVictimStatusReport({victimStatusReport}: {victimStatusReport: VictimStatusReport}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {victimStatusReportId, ...data} = victimStatusReport
  return await client.victimStatusReport.create({
    data: data
  })
}

export async function deleteVictimStatusReport({victimStatusReportId}: {victimStatusReportId: number}) {
  return await client.victimStatusReport.delete({
    where: {
      victimStatusReportId
    }
  })
}

export async function updateVictimStatusReport({victimStatusReport}: {victimStatusReport: VictimStatusReport}) {
  const { victimStatusReportId, ...data } = victimStatusReport

  return await client.victimStatusReport.update({
    data: data,
    where: {
      victimStatusReportId: victimStatusReportId
    }
  })
}

export async function syncVictimStatusReports({newVictimStatusReports, existingVictimStatusReports}: {newVictimStatusReports: VictimStatusReport[], existingVictimStatusReports: VictimStatusReport[]}) {

  const recordsToDelete = existingVictimStatusReports.filter(
    (existing) =>
      !newVictimStatusReports.some(
        (updated) => updated.victimStatusReportId === existing.victimStatusReportId
      )
  );

  const recordsToUpdate = newVictimStatusReports.filter((updated) =>
    existingVictimStatusReports.some(
      (existing) =>
        existing.victimStatusReportId === updated.victimStatusReportId &&
        (existing.name !== updated.name ||
          existing.age !== updated.age ||
          existing.status !== updated.status ||
          existing.notes !== updated.notes)
    )
  );

  const recordsToCreate = newVictimStatusReports.filter(
    (updated) => updated.victimStatusReportId === 0
  );

  const result = await client.$transaction([
    client.victimStatusReport.deleteMany({
      where: {
        victimStatusReportId: { in: recordsToDelete.map((r) => r.victimStatusReportId) },
      },
    }),
    ...recordsToUpdate.map(({victimStatusReportId, ...data}) => 
      client.victimStatusReport.update({
        where: { victimStatusReportId: victimStatusReportId },
        data: data
      })
    ),
    client.victimStatusReport.createMany({
      data: recordsToCreate.map((record) => ({
        name: record.name,
        age: record.age,
        status: record.status,
        notes: record.notes,
        operationsMissionId: record.operationsMissionId
      })),
    }),

  ])

  return result
}