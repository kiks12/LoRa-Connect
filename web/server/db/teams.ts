import { client } from "@/prisma/client"
import { TeamWithRescuer } from "@/types"
import { TEAMS_TAG } from "@/utils/tags"
import { unstable_cache } from "next/cache"

export const getCachedTeams = unstable_cache(async () => {
  return await client.teams.findMany({
    include: {
      rescuers: {
        include: {
          bracelet: true
        }
      } 
    }
  })
}, [TEAMS_TAG], {tags: [TEAMS_TAG]})

export async function getTeams() {
  return await client.teams.findMany({
    include: {
      rescuers: {
        include: {
          bracelet: true
        }
      } 
    }
  })
}

export async function getTeam({teamId}: {teamId: number}): Promise<TeamWithRescuer | null> {
  return await client.teams.findFirst({
    where: {
      teamId: teamId
    },
    include: {
      rescuers: {
        include: {
          bracelet: true
        }
      }
    }
  })
}

export async function createTeam({data}: {data: TeamWithRescuer}) {
  const newTeam = await client.teams.create({
    data: {
      name: data.name
    }
  })

  const rescuersData = data.rescuers.map(async (rescuer) => {
    await client.rescuers.update({
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

export async function updateTeam({newTeam , existingTeam}: {newTeam: TeamWithRescuer, existingTeam: TeamWithRescuer}) {
  const toRemove = existingTeam.rescuers.filter((existing) => {
    return !newTeam.rescuers.some((newData) => newData.rescuerId === existing.rescuerId)
  })

  const toAdd = newTeam.rescuers.filter((rescuer) => {
    return rescuer.teamsTeamId === null
  })

  const result = await client.$transaction([
    client.teams.update({
      where: {
        teamId: newTeam.teamId
      }, 
      data: {
        name: newTeam.name
      }
    }),
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
          teamsTeamId: newTeam.teamId
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