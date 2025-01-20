import { PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

type ApiMethods = "GET" | "POST" | "DELETE" | "PUT" | "PATCH"

export function methodNotAllowed({allowedMethods = []}: {allowedMethods?: ApiMethods[]}) {
  return NextResponse.json({
    error: "Method Not Allowed",
    allowedMethods: allowedMethods.length > 0 ? allowedMethods : null
  }, {
    status: 405
  })
}

export function prismaClientInitializationErrorReturnValue(error: PrismaClientInitializationError) {
  return NextResponse.json({
    message: error.message,
    name: error.name,
    cause: error.cause,
    stack: error.stack,
    clientVersion: error.clientVersion,
    retryable: error.retryable,
    errorCode: error.errorCode
  }, {
    status: 503
  })
}

export function prismaClientValidationErrorReturnValue(error: PrismaClientValidationError) {
  return NextResponse.json({
    message: error.message,
    name: error.name,
    cause: error.cause,
    stack: error.stack,
    clientVersion: error.clientVersion,
  }, {
    status: 400
  })
}

export function syntaxErrorReturnValue(error: SyntaxError) {
  return NextResponse.json({
    message: error.message,
    name: error.name,
    cause: error.cause,
    stack: error.stack,
  }, {
    status: 400 
  })
}

export function typeErrorReturnValue(error: TypeError) {
  return NextResponse.json({
    message: error.message,
    name: error.name,
    cause: error.cause,
    stack: error.stack,
  }, {
    status: 400 
  })
}

export function internalServerErrorReturnValue(error: unknown) {
  return NextResponse.json({
    error
  }, {
    status: 500
  })
}