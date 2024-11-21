import { client } from "@/prisma/client"
import { OWNERS_TAG } from "@/utils/tags"
import { Owners } from "@prisma/client"
import { unstable_cache } from "next/cache"

export const getOwners = unstable_cache(async () => {
  return await client.owners.findMany({
    include: {
      bracelet: true
    }
  })
}, [OWNERS_TAG], {tags: [OWNERS_TAG]})

export async function getOwnersWithoutBracelet() {
  return await client.owners.findMany({
    where: {
      bracelet: null
    }
  })
}

export async function createOwner({...data}: Owners) {
  return await client.owners.create({
    data: {
      name: data.name,
      numberOfMembersInFamily: data.numberOfMembersInFamily,
    },
  })
}

export async function updateOwner(owner: Owners) {
  return await client.owners.update({
    where: {
      ownerId: owner.ownerId,
    },
    data: {
      name: owner.name,
      numberOfMembersInFamily: owner.numberOfMembersInFamily
    }
  })
}