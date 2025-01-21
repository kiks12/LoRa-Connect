import { syncVictimStatusReports } from "@/server/db/victimStatusReports"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue, typeErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  newVictimStatusReports: [
    {
      victimStatusReportId: int,
      name: string,
      age: int, 
      status: VictimStatus,
      notes: string,
      operationsMissionId: int
    }
  ],
  existingVictimStatusReports: [
    {
      victimStatusReportId: int,
      name: string,
      age: int, 
      status: VictimStatus,
      notes: string,
      operationsMissionId: int
    }
  ],
}

*/
export async function POST(req: Request) {
  try {
    const { newVictimStatusReports, existingVictimStatusReports } = await req.json()

    const result = await syncVictimStatusReports({newVictimStatusReports, existingVictimStatusReports})

    return NextResponse.json({
      message: "Successfully synced victim status report",
      result
    })
  } catch (error) {
    console.log(error)
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