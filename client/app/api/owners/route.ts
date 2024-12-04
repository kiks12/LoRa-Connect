import { getOwners } from "@/server/db/owners";
import { NextResponse } from "next/server";

export async function GET() {
  const owners = await getOwners()
  return NextResponse.json({
    owners
  })
}