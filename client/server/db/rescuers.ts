import { client } from "@/prisma/client"
import { RESCUERS_TAG } from "@/utils/tags"
import { Rescuers } from "@prisma/client"
import { unstable_cache } from "next/cache"

export const getRescuers = unstable_cache(async () => {
  return await client.rescuers.findMany({
    include: {
      bracelet: true
    }
  }
  )
}, [RESCUERS_TAG], {tags: [RESCUERS_TAG]})

export async function getRescuersWithoutBracelets() {
  return await client.rescuers.findMany({
    where: {
      bracelet: null,
    }
  })
}

export async function createRescuer({name}: Rescuers) {
  return await client.rescuers.create({
    data: {
      name: name,
    }
  })
}

export async function updateRescuer({rescuer}: {rescuer: Rescuers}) {
  return await client.rescuers.update({
    where: {
      rescuerId: rescuer.rescuerId,
    },
    data: {
      name: rescuer.name
    }
  })
}

export async function deleteRescuer({rescuerId}: {rescuerId: number}) {
  return await client.rescuers.delete({
    where: {
      rescuerId
    }
  })
}