import { createOperation } from "@/server/db/operations"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
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
  evacuationCenterId: number
}

*/
export async function POST(req: Request) {
  try {
    const {rescuerId, ownerId, status, urgency, numberOfRescuee, evacuationCenterId} = await req.json()

    const createdOperation = await createOperation({
      operation: {
        createAt: new Date(),
        dateTime: new Date(),
        rescuersRescuerId: rescuerId,
        ownersOwnerId: ownerId,
        evacuationCentersEvacuationId: evacuationCenterId,
        numberOfRescuee: numberOfRescuee,
        status: status,
        urgency: urgency,
        missionId: 0
      }
    })

    return NextResponse.json({
      message: "Successfully created operation",
      createdOperation
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

export function PUT() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}