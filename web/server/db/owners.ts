import { client } from "@/prisma/client"
import { OWNERS_TAG } from "@/utils/tags"
import { Owners } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getOwnersLatest() {
  return await client.owners.findMany({
    include: {
      bracelet: true
    }
  })
}

export const getOwners = unstable_cache(async () => {
  return await client.owners.findMany({
    include: {
      bracelet: true,
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
      address: data.address,
    },
  })
}

export async function updateOwner({...data}: Owners) {
  return await client.owners.update({
    where: {
      ownerId: data.ownerId,
    },
    data: {
      name: data.name,
      numberOfMembersInFamily: data.numberOfMembersInFamily,
      address: data.address
    }
  })
}

export async function deleteOwner(ownerId: number) {
  return await client.owners.delete({
    where: {
      ownerId: ownerId,
    },
  })
}