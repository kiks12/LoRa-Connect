import { deleteObstacle } from "@/server/db/obstacles"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  const { obstacleId } = await req.json()
  const obstacle = await deleteObstacle({obstacleId})

  return NextResponse.json({
    obstacle
  })
}