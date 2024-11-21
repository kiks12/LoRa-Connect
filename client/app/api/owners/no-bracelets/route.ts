import { getOwnersWithoutBracelet } from "@/server/db/owners";
import { NextResponse } from "next/server";

export async function GET() {
  const owners = await getOwnersWithoutBracelet()

  return NextResponse.json({
    owners
  })
}