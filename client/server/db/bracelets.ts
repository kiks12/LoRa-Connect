import { client } from "@/prisma/client"
import { BRACELETS_TAG } from "@/utils/tags"
import { Bracelets } from "@prisma/client"
import { unstable_cache } from "next/cache"

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