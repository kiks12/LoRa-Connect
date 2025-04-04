import { client } from "@/prisma/client"
import { USERS_TAG } from "@/utils/tags"
import { Users } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getUsersLatest() {
  return await client.users.findMany({
    include: {
      bracelet: true
    }
  })
}

export const getUsers = unstable_cache(async () => {
  return await client.users.findMany({
    include: {
      bracelet: true,
    }
  })
}, [USERS_TAG], {tags: [USERS_TAG]})

export async function getUsersWithoutDevice() {
  return await client.users.findMany({
    where: {
      bracelet: null
    }
  })
}

export async function createUser({...data}: Users) {
  return await client.users.create({
    data: {
      givenName: data.givenName,
      middleName: data.middleName,
      lastName: data.lastName,
      suffix: data.suffix,
      numberOfMembersInFamily: data.numberOfMembersInFamily,
      address: data.address,
    },
  })
}

export async function updateUser({...data}: Users) {
  return await client.users.update({
    where: {
      userId: data.userId,
    },
    data: {
      givenName: data.givenName,
      middleName: data.middleName,
      lastName: data.lastName,
      suffix: data.suffix,
      numberOfMembersInFamily: data.numberOfMembersInFamily,
      address: data.address
    }
  })
}

export async function deleteUser(userId: number) {
  return await client.users.delete({
    where: {
      userId: userId,
    },
  })
}