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
      user: true,
      rescuer: true,
    }
  })
}

export async function createBracelet({bracelet}: {bracelet: Bracelets}) {
  return await client.bracelets.create({
    data: bracelet
  })
}

export async function setBraceletUserId({braceletId, userId}: {braceletId: string, userId: number | null}) {
  return await client.bracelets.update({
    where: {
      braceletId,
    },
    data: {
      ownerId: userId,
    }
  })
}

export async function setBraceletRescuerId({braceletId, rescuerId}: {braceletId: string, rescuerId: number | null}) {
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

export async function updateBraceletLocation({braceletId, latitude, longitude, urgency}: {braceletId: string, latitude: number, longitude: number, urgency: number}) {
  const bracelet = await getBracelet({ braceletId })  
  if (bracelet === null) return
  return await client.bracelets.update({
    where: {
      braceletId: bracelet.braceletId,
    },
    data: {
      latitude,
      longitude,
      urgency,
    }
  })
}

export async function updateBraceletSos({braceletId, latitude, longitude, urgency, sos}: {braceletId: string, latitude: number, longitude: number, urgency: number, sos: boolean,}) {
  const bracelet = await getBracelet({ braceletId })  
  if (bracelet === null) return
  return await client.bracelets.update({
    where: {
      braceletId: bracelet.braceletId,
    },
    data: {
      latitude,
      longitude,
      urgency,
      sos: sos
    }
  })
}
