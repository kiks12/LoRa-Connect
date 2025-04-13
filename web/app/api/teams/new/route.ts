
import { createTeam } from "@/server/db/teams"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientKnownErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { TEAMS_TAG } from "@/utils/tags"
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  teamId: number, 
  name: string,
  createdAt: datetime,
  rescuers: Rescuers[]
}

*/
export async function POST(req: Request) {
  try {
    const { rescuers, name } = await req.json()

    const team = await createTeam({
      data: {
        name: name,
        teamId: 0,
        rescuers: rescuers,
        createdAt: new Date()
      }
    })
    revalidateTag(TEAMS_TAG)

    return NextResponse.json({
      message: "Successfully created new team",
      team
    })
  } catch (error) {
    console.error(error)
    if (error instanceof SyntaxError)
      return syntaxErrorReturnValue(error)
    if (error instanceof PrismaClientKnownRequestError)
      return prismaClientKnownErrorReturnValue(error)
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