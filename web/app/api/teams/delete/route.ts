import { deleteTeam } from "@/server/db/teams"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { TEAMS_TAG } from "@/utils/tags"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  try {
    const { teamId } = await req.json()
    const team = await deleteTeam({teamId})

    revalidateTag(TEAMS_TAG)

    return NextResponse.json({
      message: "Successfully deleted team",
      team
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

export async function GET() {
  return methodNotAllowed({})
}

export async function PATCH() {
  return methodNotAllowed({})
}

export async function PUT() {
  return methodNotAllowed({})
}

export async function POST() {
  return methodNotAllowed({})
}