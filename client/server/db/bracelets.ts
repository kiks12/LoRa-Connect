import { client } from "@/prisma/client"
import { Bracelets } from "@prisma/client"

export async function getBracelets() {
  return await client.bracelets.findMany()
}

export async function getAvailableBracelets() {
  return await client.bracelets.findMany({
    where: {
      AND: [
        {ownerId: null},
        {rescuerId: null}
      ]
    },
    select: {
      braceletId: true
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
      ownerId
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

export async function deleteBracelet({bracelet}: {bracelet: Bracelets}) {
  return await client.bracelets.delete({
    where: {
      braceletId: bracelet.braceletId
    }
  })
}