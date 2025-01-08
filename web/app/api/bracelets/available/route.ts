import { getAvailableBracelets } from "@/server/db/bracelets";
import { NextResponse } from "next/server";

export async function GET() {
  const bracelets = await getAvailableBracelets()

  return NextResponse.json({
    bracelets 
  })
}