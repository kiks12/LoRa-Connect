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