
import { getVictimStatusReport } from "@/server/db/victimStatusReports";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue } from "@/utils/api";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: {params: {operationId: string, victimStatusReportId: string}}) {
  try {
    const { operationId, victimStatusReportId } = params

    const victimStatusReport = await getVictimStatusReport({victimStatusReportId: parseInt(victimStatusReportId)})

    return NextResponse.json({
      operationId,
      victimStatusReportId,
      victimStatusReport
    })
  } catch (error) {
    if (error instanceof PrismaClientInitializationError)
      return prismaClientInitializationErrorReturnValue(error)
    if (error instanceof PrismaClientValidationError)
      return prismaClientValidationErrorReturnValue(error)
    return internalServerErrorReturnValue(error)
  }
}

export function POST() {
  return methodNotAllowed({})
}

export function PUT() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}

export function PATCH() {
  return methodNotAllowed({})
}

