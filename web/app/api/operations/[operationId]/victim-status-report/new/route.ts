import { createVictimStatusReport } from "@/server/db/victimStatusReports"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  {
    name: string,
    age: int, 
    status: VictimStatus,
    notes: string
  }
}

*/
export async function POST(req: Request, { params }: {params: {operationId: string, victimStatusReportId: string}}) {
  try {
    const { operationId } = await params
    const { name, age, status, notes } = await req.json()

    const createdVictimStatusReport = await createVictimStatusReport({victimStatusReport: {
      operationsMissionId: operationId,
      name,
      age,
      status,
      notes,
      victimStatusReportId: 0
    }})

    return NextResponse.json({
      message: "Successfully created victim status report",
      createdVictimStatusReport
    })
  } catch (error) {
    console.log(error)
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