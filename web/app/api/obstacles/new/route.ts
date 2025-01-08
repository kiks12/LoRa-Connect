import { createObstacle } from "@/server/db/obstacles"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const {name, type, latitude, longitude} = await req.json()
  const createdObstacle = await createObstacle({
    name,
    type,
    latitude,
    longitude,
  })

  return NextResponse.json({
    createdObstacle
  })
}