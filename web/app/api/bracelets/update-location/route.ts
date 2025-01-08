import { updateBraceletLocation } from "@/server/db/bracelets"
import { NextResponse } from "next/server"


export async function PATCH(req: Request) {
  const {braceletId, latitude, longitude} = await req.json()
  await updateBraceletLocation({braceletId, latitude, longitude})

  return NextResponse.json({
    message: "Update Bracelet Location"
  })
}