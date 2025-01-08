import { getLatestEvacuationCenters } from "@/server/db/evacuationCenters";
import { NextResponse } from "next/server";

export async function GET() {
  const evacuationCenters = await getLatestEvacuationCenters();

  return NextResponse.json({
    evacuationCenters
  })
}