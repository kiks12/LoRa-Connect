import { createOperation } from "@/server/db/operations"
import { createMultipleVictimStatusReports } from "@/server/db/victimStatusReports"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { VictimStatusReport } from "@prisma/client"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  rescuerId: number,
  ownerId: number, 
  status: OperationStatus,
  urgency: RescueUrgency,
  numberOfRescuee: number, 
  evacuationCenterId: number,
  victimStatusReport: VictimStatusReport[] [
    {
      name: string,
      age: int, 
      status: VictimStatus,
      notes: string
    }
  ]
}

*/
export async function POST(req: Request) {
  try {
    const { rescuerId, ownerId, status, urgency, numberOfRescuee, evacuationCenterId, victimStatusReport } = await req.json()

    const createdOperation = await createOperation({
      operation: {
        createAt: new Date(),
        dateTime: new Date(),
        rescuersRescuerId: rescuerId,
        usersUserId: ownerId,
        evacuationCentersEvacuationId: evacuationCenterId,
        numberOfRescuee: numberOfRescuee,
        status: status,
        urgency: urgency,
        missionId: 0
      }
    })

    if (victimStatusReport) {
      const victimStatusReportList = victimStatusReport as VictimStatusReport[]
      await createMultipleVictimStatusReports({operationId: createdOperation.missionId, victimStatusReports: victimStatusReportList})
    }

    return NextResponse.json({
      message: "Successfully created operation",
      createdOperation
    })
  } catch (error) {
    console.error(error)
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

export function PUT() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}