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