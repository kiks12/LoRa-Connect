import { updateOperation } from "@/server/db/operations"
import { createMultipleVictimStatusReports } from "@/server/db/victimStatusReports"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { VictimStatusReport } from "@prisma/client"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{

 missionId        String    @unique()
  createAt         DateTime  @default(now())
  dateTime         DateTime  @default(now())
  distance         Float
  eta              Float
  timeOfArrival    DateTime?
  timeOfCompletion DateTime?

  usersUserId     Int
  user            Users           @relation(fields: [usersUserId], references: [userId])
  userBraceletId  String
  status          OperationStatus
  urgency         RescueUrgency
  numberOfRescuee Int

  teamsTeamId    Int?
  Teams          Teams? @relation(fields: [teamsTeamId], references: [teamId])
  teamBraceletId String

  evacuationCenter   String?
  VictimStatusReport  VictimStatusReport[] [
    {
      name: string,
      age: int, 
      status: VictimStatus, notes: string
    }
  ]
}

*/
export async function PUT(req: Request) {
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

    const updatedOperation = await updateOperation({
      operation: {
        missionId: missionId,
        createAt: new Date(),
        dateTime: new Date(),
        distance: distance,
        eta: eta,
        timeOfArrival: null,
        timeOfCompletion: null,
        teamsTeamId: teamId,
        teamBraceletId: teamBraceletId,
        usersUserId: userId,
        userBraceletId: userBraceletId,
        numberOfRescuee: numberOfRescuee,
        evacuationCenter: "",
        status: status,
        urgency: urgency,
      }
    })

    if (victimStatusReport) {
      const victimStatusReportList = victimStatusReport as VictimStatusReport[]
      await createMultipleVictimStatusReports({operationId: updatedOperation.missionId, victimStatusReports: victimStatusReportList})
    }

    return NextResponse.json({
      message: "Successfully created operation",
      updatedOperation
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

export function POST() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}
