import { client } from "@/prisma/client"
import { Owners } from "@prisma/client"

export async function getOwners(){
  return await client.owners.findMany({
    include: {
      bracelet: true
    }
  })
}

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