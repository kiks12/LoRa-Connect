import { createOperation } from "@/server/db/operations"
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

      timeOfArrival,
      timeOfCompletion,
      evacuationCenter,

      usersUserId, 
      userBraceletId,  
      status, 
      urgency, 
      numberOfRescuee, 

      teamsTeamId, 
      teamBraceletId, 

      victimStatusReport
    } = await req.json()

    const createdOperation = await createOperation({
      operation: {
        missionId: missionId,
        createAt: new Date(),
        dateTime: new Date(),
        distance: distance ?? null,
        eta: eta ?? null,
        timeOfArrival: timeOfArrival ?? null,
        timeOfCompletion: timeOfCompletion ?? null,
        teamsTeamId: teamsTeamId,
        teamBraceletId: teamBraceletId,
        usersUserId: usersUserId,
        userBraceletId: userBraceletId,
        numberOfRescuee: numberOfRescuee,
        evacuationCenter: evacuationCenter,
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