import { client } from "@/prisma/client"

export const getRescuers = async () => {
  return await client.rescuers.findMany()
}