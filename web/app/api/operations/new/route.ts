import { createOperation } from "@/server/db/operations"
import { methodNotAllowed } from "@/utils/api"
import { PrismaClientValidationError } from "@prisma/client/runtime/library"
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
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json({
        cause: error.cause,
        clientVersion: error.clientVersion,
        stack: error.stack,
        message: error.message,
        name: error.name
      }, {
        status: 400
      })
    }

    return NextResponse.json({
      error
    }, {
      status: 500
    })
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