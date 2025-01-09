import { getLatestOperations } from "@/server/db/operations";
import { methodNotAllowed } from "@/utils/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const operations = await getLatestOperations()

    return NextResponse.json({
      operations
    })
  } catch (error) {
    return NextResponse.json({
      error
    }, {
      status: 500
    })
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

