import { updateObstacle } from "@/server/db/obstacles"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  const {obstacleId, name, type, latitude, longitude} = await req.json()
  const updatedObstacle = await updateObstacle({
    name,
    type,
    latitude,
    longitude,
    obstacleId, 
  })

  return NextResponse.json({
    updatedObstacle
  })
}