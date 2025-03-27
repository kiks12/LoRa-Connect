import { deleteVictimStatusReport } from "@/server/db/victimStatusReports";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue, typeErrorReturnValue } from "@/utils/api";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: {params: Promise<{operationId: string, victimStatusReportId: string}>}) {
  try {
    const { operationId, victimStatusReportId } = await params

    const deletedVictimStatusReport = await deleteVictimStatusReport({victimStatusReportId: parseInt(victimStatusReportId)})

    return NextResponse.json({
      operationId,
      victimStatusReportId,
      deletedVictimStatusReport
    })
  } catch (error) {
    if (error instanceof SyntaxError)
      return syntaxErrorReturnValue(error)
    if (error instanceof TypeError)
      return typeErrorReturnValue(error)
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

export function GET() {
  return methodNotAllowed({})
}

export function PATCH() {
  return methodNotAllowed({})
}

