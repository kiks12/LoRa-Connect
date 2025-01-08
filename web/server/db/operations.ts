import { client } from "@/prisma/client"

export const getOperations = () => {
  return client.operations.findMany() 
}