import { client } from "@/prisma/client"
import { EVACUATION_CENTERS_TAG } from "@/utils/tags"
import { EvacuationCenters } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getLatestEvacuationCenters() {
  return await client.evacuationCenters.findMany()
}

export const getEvacuationCenters = unstable_cache(async () => {
  return await client.evacuationCenters.findMany()
}, [], {tags: [EVACUATION_CENTERS_TAG]})

export async function createEvacuationCenter({evacuationCenter: {latitude, longitude, capacity, name}}: {evacuationCenter: EvacuationCenters}) {
  return await client.evacuationCenters.create({
    data: {
      capacity, 
      latitude,
      longitude,
      name, 
    },
  })
}

export async function updateEvacuationCenter({evacuationCenter: {capacity, evacuationId, latitude, longitude, name}}: {evacuationCenter: EvacuationCenters}) {
  return await client.evacuationCenters.update({
    where: {
      evacuationId: evacuationId,
    },
    data: {
      capacity: capacity,
      latitude: latitude, 
      longitude: longitude,
      name: name
    }
  })
}

export async function deleteEvacuationCenter({evacuationId}: {evacuationId: number}) {
  return await client.evacuationCenters.delete({
    where: {
      evacuationId
    }
  })
}