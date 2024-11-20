import { client } from "@/prisma/client"

export const getOwners = async () => {
  return await client.owners.findMany()
}