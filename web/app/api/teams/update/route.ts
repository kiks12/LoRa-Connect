

import { updateTeam } from "@/server/db/teams"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue, typeErrorReturnValue } from "@/utils/api"
import { TEAMS_TAG } from "@/utils/tags"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"


/*

SAMPLE BODY
{
  existingTeam: TeamWithRescuers, 
  newTeam: TeamWithRescuers
}

*/
export async function PUT(req: Request) {
  try {
    const{existingTeam, newTeam} = await req.json()
    const team = await updateTeam({newTeam, existingTeam})

    revalidateTag(TEAMS_TAG)

    return NextResponse.json({
      message: "Successfully updated team",
      team
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

export function POST() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}