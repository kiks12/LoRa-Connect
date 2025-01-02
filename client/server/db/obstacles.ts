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

export async function deleteObstacle({obstacleId}: {obstacleId: number}) {
  return await client.obstacle.delete({
    where: {
      obstacleId: obstacleId
    }
  })
}

export async function updateObstacle({obstacleId, ...rest}: {obstacleId: number, name: string, type: string, latitude: number, longitude: number}) {
  return await client.obstacle.update({
    where: {
      obstacleId: obstacleId
    },
    data: {
      ...rest 
    }
  })
}