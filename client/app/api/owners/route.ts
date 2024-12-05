import { getOwnersLatest } from "@/server/db/owners";
import { NextResponse } from "next/server";

export async function GET() {
  const owners = await getOwnersLatest()
  return NextResponse.json({
    owners
  })
}