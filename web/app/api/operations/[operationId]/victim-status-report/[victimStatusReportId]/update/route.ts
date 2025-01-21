
import { updateVictimStatusReport } from "@/server/db/victimStatusReports"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  {
    victimStatusReportId: number,
    operationsMissionId: number,
    name: string,
    age: number, 
    status: VictimStatus,
    notes: string
  }
}

*/
export async function PUT(req: Request) {
  try {
    const { victimStatusReportId, operationsMissionId, name, age, status, notes } = await req.json()

    const updatedVictimStatusReport = await updateVictimStatusReport({victimStatusReport: {
      victimStatusReportId: victimStatusReportId,
      operationsMissionId: operationsMissionId,
      name,
      age,
      status,
      notes
    }})

    return NextResponse.json({
      message: "Successfully updated victim status report",
      updatedVictimStatusReport
    })
  } catch (error) {
    if (error instanceof SyntaxError)
      return syntaxErrorReturnValue(error)
    if (error instanceof PrismaClientInitializationError)
      return prismaClientInitializationErrorReturnValue(error)
    if (error instanceof PrismaClientValidationError)
      return prismaClientValidationErrorReturnValue(error)
    return internalServerErrorReturnValue(error)
  }
}

export function GET() {
  return methodNotAllowed({})
}

export function PATCH() {
  return methodNotAllowed({})
}

export function POST() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}