
import { getTeams } from "@/server/db/teams";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue } from "@/utils/api";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teams = await getTeams()
    return NextResponse.json({
      teams
    })
  } catch (error) {
    if (error instanceof PrismaClientInitializationError)
      return prismaClientInitializationErrorReturnValue(error)
    if (error instanceof PrismaClientValidationError)
      return prismaClientValidationErrorReturnValue(error)
    return internalServerErrorReturnValue(error)   
  }
}

export async function POST() {
  return methodNotAllowed({})
}

export async function PATCH() {
  return methodNotAllowed({})
}

export async function PUT() {
  return methodNotAllowed({})
}

export async function DELETE() {
  return methodNotAllowed({})
}