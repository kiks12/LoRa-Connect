import { client } from "@/prisma/client"
import { RESCUERS_TAG } from "@/utils/tags"
import { Rescuers } from "@prisma/client"
import { unstable_cache } from "next/cache"

export async function getRescuersLatest() {
  return await client.rescuers.findMany({
    include: {
      bracelet: true,
      Teams: true,
    }
  })
}

export async function getRescuersWithoutTeam() {
  return await client.rescuers.findMany({
    where: {
      teamsTeamId: null
    },
    include: {
      bracelet: true
    }
  })
}

export const getRescuers = unstable_cache(async () => {
  return await client.rescuers.findMany({
    include: {
      bracelet: true,
      Teams: true,
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

export async function createRescuer(rescuer: Rescuers) {
  return await client.rescuers.create({
    data: {
      givenName: rescuer.givenName,
      middleName: rescuer.middleName,
      lastName: rescuer.lastName,
      suffix: rescuer.suffix
    }
  })
}

export async function updateRescuer({rescuer}: {rescuer: Rescuers}) {
  return await client.rescuers.update({
    where: {
      rescuerId: rescuer.rescuerId,
    },
    data: {
      givenName: rescuer.givenName,
      middleName: rescuer.middleName,
      lastName: rescuer.lastName,
      suffix: rescuer.suffix
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