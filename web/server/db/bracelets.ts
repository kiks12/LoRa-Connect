import { client } from "../../prisma/client"
import { BraceletWithOwnerRescuer } from "@/types"
import { BRACELETS_TAG } from "../../utils/tags"
import { Bracelets } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getLatestBracelets() {
  return await client.bracelets.findMany()
}

export const getBracelets = unstable_cache(async () => {
  return await client.bracelets.findMany()
}, [BRACELETS_TAG], { tags: [BRACELETS_TAG]})

export async function getAvailableBracelets() {
  return await client.bracelets.findMany({
    where: {
      AND: [
        {ownerId: null},
        {rescuerId: null}
      ]
    },
  })
}

export async function getBracelet({braceletId}: {braceletId: string}): Promise<BraceletWithOwnerRescuer | null> {
  return await client.bracelets.findFirst({
    where: {
      braceletId
    },
    include: {
      owner: true,
      rescuer: true,
    }
  })
}

export async function createBracelet({bracelet}: {bracelet: Bracelets}) {
  return await client.bracelets.create({
    data: bracelet
  })
}

export async function setBraceletOwnerId({braceletId, ownerId}: {braceletId: string, ownerId: number}) {
  return await client.bracelets.update({
    where: {
      braceletId,
    },
    data: {
      ownerId,
    }
  })
}

export async function setBraceletRescuerId({braceletId, rescuerId}: {braceletId: string, rescuerId: number}) {
  return await client.bracelets.update({
    where: {
      braceletId,
    },
    data: {
      rescuerId,
    }
  })
}

export async function updateBracelet({braceletId, bracelet}: {braceletId: string, bracelet: Bracelets}) {
  return await client.bracelets.update({
    data: {
      name: bracelet.name,
      braceletId: bracelet.braceletId,
      type: bracelet.type,
    },
    where: {
      braceletId
    }
  })
}

export async function deleteBracelet({braceletId}: {braceletId: string}) {
  return await client.bracelets.delete({
    where: {
      braceletId: braceletId
    }
  })
}

export async function updateBraceletLocation({braceletId, latitude, longitude}: {braceletId: string, latitude: number, longitude: number}) {
  const bracelet = await getBracelet({braceletId})  
  if (bracelet === null) return
  if (bracelet.ownerId && !bracelet.rescuerId) {
    await client.owners.update({
      where: {
        ownerId: bracelet.ownerId,
      },
      data: {
        latitude,
        longitude
      }
    })
  }

  if (!bracelet.ownerId && bracelet.rescuerId) {
    await client.rescuers.update({
      where: {
        rescuerId: bracelet.rescuerId,
      },
      data: {
        latitude,
        longitude
      }
    })
  }
}