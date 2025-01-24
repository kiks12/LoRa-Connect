
import { getOperationsFromLastDays } from "@/server/db/operations";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue } from "@/utils/api";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = req.url
    const { searchParams } = new URL(url)
    const lastDays = searchParams.get("lastDays")

    if (lastDays === null) return NextResponse.json({
      error: "lastDays query is required",
    }, {
      status: 400
    })

    const operations : {date: string, count: number}[]= await getOperationsFromLastDays(parseInt(lastDays.toString()))

    return NextResponse.json({
      operations
    })
  } catch (error) {
    console.error(error)
    if (error instanceof PrismaClientInitializationError)
      return prismaClientInitializationErrorReturnValue(error)
    if (error instanceof PrismaClientValidationError)
      return prismaClientValidationErrorReturnValue(error)
    return internalServerErrorReturnValue(error)
  }
}

export function POST() {
  return methodNotAllowed({})
}

export function PUT() {
  return methodNotAllowed({})
}

export function DELETE() {
  return methodNotAllowed({})
}

export function PATCH() {
  return methodNotAllowed({})
}

