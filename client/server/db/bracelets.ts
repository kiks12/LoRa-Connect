import { client } from "@/prisma/client"
import { Bracelets } from "@prisma/client"

export async function getBracelets() {
  return await client.bracelets.findMany()
}

export async function createBracelet({bracelet}: {bracelet: Bracelets}) {
  return await client.bracelets.create({
    data: bracelet
  })
}

export async function updateBracelet({bracelet}: {bracelet: Bracelets}) {
  return await client.bracelets.update({
    data: bracelet,
    where: {
      braceletId: bracelet.braceletId
    }
  })
}

export async function deleteBracelet({bracelet}: {bracelet: Bracelets}) {
  return await client.bracelets.delete({
    where: {
      braceletId: bracelet.braceletId
    }
  })
}