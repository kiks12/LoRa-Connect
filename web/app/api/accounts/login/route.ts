
import { getAccountWithEmail } from "@/server/db/accounts";
import { internalServerErrorReturnValue, methodNotAllowed, prismaClientInitializationErrorReturnValue, prismaClientValidationErrorReturnValue } from "@/utils/api";
import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { compare } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const account = await getAccountWithEmail(email)
    if (account === null || account === undefined) return NextResponse.json({
      message: "Account not found"
    }, { status: 400 })

    const passwordMatched = await compare(password, account.password)

    if (!passwordMatched) return NextResponse.json({
      message: "Incorrect password"
    }, { status: 400 })

    return NextResponse.json({
      message: "Successfully Logged in",
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