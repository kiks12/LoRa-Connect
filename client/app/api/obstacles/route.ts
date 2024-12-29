import { getLatestObstacles } from "@/server/db/obstacles";
import { NextResponse } from "next/server";

export async function GET() {
  const obstacles = await getLatestObstacles();

  return NextResponse.json({
    obstacles
  })
}