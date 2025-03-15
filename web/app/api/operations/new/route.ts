import { createOperation } from "@/server/db/operations"
import { createMultipleVictimStatusReports } from "@/server/db/victimStatusReports"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { VictimStatusReport } from "@prisma/client"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  missionId: string,
  distance: number,
  eta: number,

  userId: number, 
  userBraceletId: string,
  status: OperationStatus,
  urgency: RescueUrgency,
  numberOfRescuee: number, 

  teamId: number,
  teamBraceletId: string,

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
    const { 
      missionId,
      distance, 
      eta, 

      userId, 
      userBraceletId,  
      status, 
      urgency, 
      numberOfRescuee, 

      teamId, 
      teamBraceletId, 

      victimStatusReport
    } = await req.json()

    const createdOperation = await createOperation({
      operation: {
        missionId: missionId,
        createAt: new Date(),
        dateTime: new Date(),
        distance: distance,
        eta: eta,
        finalTime: null,
        teamsTeamId: teamId,
        teamBraceletId: teamBraceletId,
        usersUserId: userId,
        userBraceletId: userBraceletId,
        numberOfRescuee: numberOfRescuee,
        status: status,
        urgency: urgency,
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