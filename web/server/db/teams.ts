import { client } from "@/prisma/client"
import { TeamWithRescuer } from "@/types"
import { TEAMS_TAG } from "@/utils/tags"
import { unstable_cache } from "next/cache"

export const getCachedTeams = unstable_cache(async () => {
  return await client.teams.findMany({
    include: {
      rescuers: true
    }
  })
}, [TEAMS_TAG], {tags: [TEAMS_TAG]})

export async function getTeams() {
  return await client.teams.findMany({
    include: {
      rescuers: true
    }
  })
}

export async function createTeam({data}: {data: TeamWithRescuer}) {
  const newTeam = await client.teams.create({
    data: {}
  })

  const rescuersData = data.rescuers.map(async (rescuer) => {
    client.rescuers.update({
      where: {
        rescuerId: rescuer.rescuerId
      },
      data: {
        teamsTeamId: newTeam.teamId
      }
    })
  })

  return await Promise.all(rescuersData)
}

export async function updateTeam({data, originalTeam}: {data: TeamWithRescuer, originalTeam: TeamWithRescuer}) {
  const toRemove = originalTeam.rescuers.filter((existing) => {
    return !data.rescuers.some((newData) => newData.rescuerId === existing.rescuerId)
  })

  const toAdd = data.rescuers.filter((rescuer) => {
    return rescuer.teamsTeamId === null
  })

  const result = await client.$transaction([
    ...toRemove.map((rescuer) => {
      return client.rescuers.update({
        where: {
          rescuerId: rescuer.rescuerId
        },
        data: {
          teamsTeamId: null
        }
      })
    }),
    ...toAdd.map((rescuer) => {
      return client.rescuers.update({
        where: {
          rescuerId: rescuer.rescuerId,
        },
        data: {
          teamsTeamId: data.teamId
        }
      })
    })
  ])

  return result
}

export async function deleteTeam({teamId}: {teamId: number}) {
  return await client.teams.delete({
    where: {
      teamId: teamId
    }
  })
}