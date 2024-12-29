import { client } from "@/prisma/client";
import { Obstacle } from "@prisma/client";

export async function getLatestObstacles() {
  return await client.obstacle.findMany()
}

export async function createObstacle({name, latitude, longitude, type}: {name: string, latitude: number, longitude: number, type: string}) {
  return await client.obstacle.create({
    data: {
      name,
      latitude,
      longitude,
      type
    }
  })
}