import { updateObstacle } from "@/server/db/obstacles"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"

/*

SAMPLE BODY
{
  obstacleId: number,
  name: string, 
  type: string,
  latitude: number,
  longitude: number, 
}

*/
export async function PUT(req: Request) {
  try {
    const {obstacleId, name, type, latitude, longitude} = await req.json()
    const updatedObstacle = await updateObstacle({
      name,
      type,
      latitude,
      longitude,
      obstacleId, 
    })

    return NextResponse.json({
      updatedObstacle
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

export async function POST() {
  return methodNotAllowed({})
}

export async function PATCH() {
  return methodNotAllowed({})
}

export async function GET() {
  return methodNotAllowed({})
}

export async function DELETE() {
  return methodNotAllowed({})
}