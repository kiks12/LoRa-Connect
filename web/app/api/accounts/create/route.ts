
import { createAccount, getAdminAccounts } from "@/server/db/accounts";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue } from "@/utils/api";
import { AccountType } from "@prisma/client";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const account = await createAccount({accountId: "", email, password, type: AccountType.ADMIN})
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

export async function GET() {
  return methodNotAllowed({})
}

export async function DELETE() {
  return methodNotAllowed({})
}

export async function PUT() {
  return methodNotAllowed({})
}

export async function PATCH() {
  return methodNotAllowed({})
}