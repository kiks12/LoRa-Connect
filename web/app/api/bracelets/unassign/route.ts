import { setBraceletRescuerId, setBraceletUserId } from "@/server/db/bracelets"
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue, syntaxErrorReturnValue, typeErrorReturnValue } from "@/utils/api"
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { NextResponse } from "next/server"

/*

SAMPLE BODY
{
  braceletId: string,
  type: "USER" | "RESCUER"
}

*/
export async function PATCH(req: Request) {
  try {
    const { braceletId, type }: { braceletId: string, type: string } = await req.json()
    if (type === "USER") {
      await setBraceletUserId({braceletId, userId: null})
    } else if (type === "RESCUER") {
      await setBraceletRescuerId({braceletId, rescuerId: null})
    } else {
      return NextResponse.json({
        message: "Device type not indicated"
      }, {
        status: 400
      })
    }

    return NextResponse.json({
      message: "Device successfully unassigned"
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
