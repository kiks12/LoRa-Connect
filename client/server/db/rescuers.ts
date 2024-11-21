import { client } from "@/prisma/client"

export async function getRescuers() {
  return await client.rescuers.findMany()
}

export async function getRescuersWithoutBracelets() {
  return await client.rescuers.findMany({
    where: {
      bracelet: null,
    }
  })
}