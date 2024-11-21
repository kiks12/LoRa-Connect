import { getRescuersWithoutBracelets } from "@/server/db/rescuers";
import { NextResponse } from "next/server";

export async function GET() {
  const rescuers = await getRescuersWithoutBracelets()

  return NextResponse.json({
    rescuers
  })
}