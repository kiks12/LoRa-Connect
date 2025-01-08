import { getRescuersLatest } from "@/server/db/rescuers";
import { NextResponse } from "next/server";

export async function GET() {
  const rescuers = await getRescuersLatest()
  return NextResponse.json({
    rescuers
  })
}