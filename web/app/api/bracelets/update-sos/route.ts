import { updateBraceletSos } from "@/server/db/bracelets"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue, typeErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"

/*

SAMPLE BODY
{
  braceletId: string,
  latitude: number,
  longitude: number,
  urgency: number, 
  sos: boolean,
}

*/
export async function PATCH(req: Request) {
  try {
    const {braceletId, latitude, longitude, urgency, sos}: {
      braceletId: string, 
      latitude: number, 
      longitude: number
      urgency: number,
      sos: boolean
    }= await req.json()
    await updateBraceletSos({
      braceletId, 
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
      urgency: urgency,
      sos
    })

    return NextResponse.json({
      message: "Update Bracelet Sos"
    })
  } catch (error) {
    console.error(error)
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

export async function POST() {
  return methodNotAllowed({})
}

export async function DELETE() {
  return methodNotAllowed({})
}

export async function PUT() {
  return methodNotAllowed({})
}

export async function GET() {
  return methodNotAllowed({})
}
