import { getAccount } from "@/server/db/accounts";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue } from "@/utils/api";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: {params: Promise<{accountId: string}>}) {
  try {
    const { accountId } = await params
    const account = await getAccount(accountId);

    return NextResponse.json({
      account
    })
  } catch (error) {
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

