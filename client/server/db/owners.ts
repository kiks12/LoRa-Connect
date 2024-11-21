import { client } from "@/prisma/client"
import { Owners } from "@prisma/client"

export async function getOwners(){
  return await client.owners.findMany()
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
