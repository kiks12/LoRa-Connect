import { createObstacle } from "@/server/db/obstacles"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"

/*

SAMPLE BODY
{
  name: string, 
  type: string,
  latitude: number,
  longitude: number, 
}

*/
export async function POST(req: Request) {
  try {
    const {name, type, latitude, longitude} = await req.json()
    const createdObstacle = await createObstacle({
      name,
      type,
      latitude,
      longitude,
    })

    return NextResponse.json({
      createdObstacle
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

export async function DELETE() {
  return methodNotAllowed({})
}